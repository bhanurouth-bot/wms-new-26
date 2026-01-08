from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.domains.inventory import models, schemas
from app.domains.master.models import Product  # <--- CRITICAL IMPORT

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory & WMS"]
)

# --- STANDARD WMS ROUTES ---

@router.post("/warehouses/")
def create_warehouse(wh: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    db_wh = models.Warehouse(**wh.dict())
    db.add(db_wh)
    db.commit()
    db.refresh(db_wh)
    return db_wh

@router.post("/bins/")
def create_bin(bin_data: schemas.BinCreate, db: Session = Depends(get_db)):
    db_bin = models.Bin(**bin_data.dict())
    db.add(db_bin)
    db.commit()
    db.refresh(db_bin)
    return db_bin

@router.post("/inbound/receive/")
def receive_stock(tx: schemas.InboundTransaction, db: Session = Depends(get_db)):
    # 1. Validate Product
    product = db.query(Product).filter(Product.id == tx.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product ID not found")

    # 2. Validate Bin
    target_bin = db.query(models.Bin).filter(models.Bin.bin_code == tx.target_bin_code).first()
    if not target_bin:
        raise HTTPException(status_code=404, detail=f"Bin {tx.target_bin_code} not found")

    # 3. Check/Create Batch
    batch = db.query(models.Batch).filter(
        models.Batch.batch_number == tx.batch_number,
        models.Batch.product_id == tx.product_id
    ).first()

    if not batch:
        batch = models.Batch(
            batch_number=tx.batch_number,
            product_id=tx.product_id,
            expiry_date=tx.expiry_date,
            mfg_date=tx.mfg_date,
            mrp=tx.mrp
        )
        db.add(batch)
        db.commit()
        db.refresh(batch)

    # 4. Add Stock
    stock_record = db.query(models.Stock).filter(
        models.Stock.batch_id == batch.id,
        models.Stock.bin_id == target_bin.id
    ).first()

    if stock_record:
        stock_record.quantity += tx.quantity
        # Reset quarantine on new receipt? Usually no, but for MVP we assume new stock is clean.
        # stock_record.is_quarantined = False 
    else:
        stock_record = models.Stock(
            batch_id=batch.id,
            bin_id=target_bin.id,
            quantity=tx.quantity
        )
        db.add(stock_record)
    
    db.commit()
    return {"status": "Stock Received", "new_quantity": stock_record.quantity, "bin": target_bin.bin_code}

# --- IOT & SENSOR ROUTES (NEW) ---

@router.post("/iot/telemetry/")
def receive_telemetry(data: schemas.TelemetryData, db: Session = Depends(get_db)):
    # 1. Find the Bin
    bin_obj = db.query(models.Bin).filter(models.Bin.bin_code == data.bin_code).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")

    # 2. Get all stock in this bin
    stocks = db.query(models.Stock).filter(models.Stock.bin_id == bin_obj.id).all()
    
    impacted_batches = []

    for stock in stocks:
        # Get Product limits
        product = db.query(Product).filter(Product.id == stock.batch.product_id).first()
        
        # Cold Chain Check
        if product.requires_cold_chain:
            max_temp = product.max_temp if product.max_temp else 8.0 # Default 8°C
            
            if data.temperature > max_temp:
                # VIOLATION! Lock the stock.
                stock.is_quarantined = True
                stock.quarantine_reason = f"Temp Spike: {data.temperature}°C (Limit: {max_temp}°C)"
                impacted_batches.append(stock.batch.batch_number)
    
    db.commit()

    if impacted_batches:
        return {"status": "ALERT", "action": "QUARANTINED", "batches": impacted_batches}
    else:
        return {"status": "NOMINAL", "action": "NONE"}

# --- DASHBOARD ROUTES ---

@router.get("/stock/live/", response_model=List[schemas.StockView])
def get_live_stock(db: Session = Depends(get_db)):
    results = []
    
    # Query now includes is_quarantined
    data = db.query(
        Product.name, 
        Product.sku_code, 
        models.Batch.batch_number, 
        models.Batch.expiry_date,
        models.Bin.bin_code, 
        models.Bin.is_cold_storage,
        models.Stock.quantity,
        models.Stock.is_quarantined # <--- Fetch this
    ).join(models.Batch, models.Batch.product_id == Product.id)\
     .join(models.Stock, models.Stock.batch_id == models.Batch.id)\
     .join(models.Bin, models.Stock.bin_id == models.Bin.id)\
     .filter(models.Stock.quantity > 0).all()

    for row in data:
        results.append({
            "product_name": row[0],
            "sku": row[1],
            "batch_number": row[2],
            "expiry_date": row[3],
            "bin_code": row[4],
            "is_cold_chain": row[5],
            "quantity": row[6],
            "is_quarantined": row[7] # <--- Map this
        })
    
    return results