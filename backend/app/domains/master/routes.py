from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.domains.master import models, schemas

router = APIRouter(
    prefix="/master",
    tags=["Master Data (Product & Vendor)"]
)

# --- MANUFACTURER ENDPOINTS ---
@router.post("/manufacturers/", response_model=schemas.ManufacturerOut)
def create_manufacturer(manufacturer: schemas.ManufacturerCreate, db: Session = Depends(get_db)):
    db_manufacturer = models.Manufacturer(**manufacturer.dict())
    db.add(db_manufacturer)
    db.commit()
    db.refresh(db_manufacturer)
    return db_manufacturer

@router.get("/manufacturers/", response_model=List[schemas.ManufacturerOut])
def read_manufacturers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Manufacturer).offset(skip).limit(limit).all()

# --- PRODUCT ENDPOINTS ---
@router.post("/products/", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    # Check if manufacturer exists
    manuf = db.query(models.Manufacturer).filter(models.Manufacturer.id == product.manufacturer_id).first()
    if not manuf:
        raise HTTPException(status_code=404, detail="Manufacturer not found")
    
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/products/", response_model=List[schemas.ProductOut])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()