from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.sales import models as sales_models, schemas
from app.domains.inventory import models as inv_models # Accessing Inventory Domain
from app.domains.inventory.models import Batch # Explicit import for joining

router = APIRouter(
    prefix="/sales",
    tags=["Sales & Allocation"]
)

@router.post("/orders/", response_model=schemas.OrderOut)
def create_sales_order(order: schemas.SalesOrderCreate, db: Session = Depends(get_db)):
    # 1. Create the Order Header
    total = sum(item.quantity * item.unit_price for item in order.items)
    db_order = sales_models.SalesOrder(
        customer_name=order.customer_name,
        total_amount=total,
        status="PENDING"
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # 2. Process Items & Run FEFO Logic
    for item in order.items:
        # FEFO ALGORITHM: Find stock for this product, sorted by expiry date
        available_stock = (
            db.query(inv_models.Stock)
            .join(inv_models.Batch)
            .filter(inv_models.Batch.product_id == item.product_id)
            .filter(inv_models.Stock.quantity > 0)
            .order_by(inv_models.Batch.expiry_date.asc()) # <--- THIS IS FEFO
            .all()
        )

        qty_needed = item.quantity
        allocated_batch_id = None
        
        # Simple Allocation: Just take from the first available batch (Simplification for MVP)
        # In production, we would split lines across multiple batches if needed.
        if not available_stock:
            raise HTTPException(status_code=400, detail=f"Out of Stock for Product ID {item.product_id}")
            
        # Grab the best batch (first one because we sorted by expiry)
        best_stock = available_stock[0]
        
        if best_stock.quantity < qty_needed:
             raise HTTPException(status_code=400, detail=f"Not enough stock in Batch {best_stock.batch.batch_number}")

        # DEDUCT STOCK (Real-time update)
        best_stock.quantity -= qty_needed
        allocated_batch_id = best_stock.batch_id

        # Create Order Line
        db_item = sales_models.SalesOrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_price=item.unit_price,
            allocated_batch_id=allocated_batch_id
        )
        db.add(db_item)

    # 3. Finalize
    db_order.status = "ALLOCATED"
    db.commit()
    return db_order