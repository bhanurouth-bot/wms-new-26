from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    location_code = Column(String, unique=True) # e.g., MUM-01
    
    bins = relationship("Bin", back_populates="warehouse")

class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    bin_code = Column(String, unique=True, index=True) # e.g., A-01-01
    is_cold_storage = Column(Boolean, default=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    
    warehouse = relationship("Warehouse", back_populates="bins")
    stocks = relationship("Stock", back_populates="bin")

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_number = Column(String, index=True) # Not unique globally, but unique per product usually
    product_id = Column(Integer, ForeignKey("products.id")) # Links to Master Data
    
    expiry_date = Column(Date, nullable=False)
    mfg_date = Column(Date, nullable=True)
    mrp = Column(Float, default=0.0)
    purchase_rate = Column(Float, default=0.0)
    
    # We link to Product from Master Domain (Cross-Domain logic happens in SQL via FK)
    # Note: We don't define relationship("Product") here to avoid circular imports easily, 
    # but we will rely on the ID.

class Stock(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"))
    bin_id = Column(Integer, ForeignKey("bins.id"))
    quantity = Column(Integer, default=0)
    
    # NEW FIELD
    is_quarantined = Column(Boolean, default=False) 
    quarantine_reason = Column(String, nullable=True) # e.g., "Temp Excursion: 12°C"

    bin = relationship("Bin", back_populates="stocks")
    batch = relationship("Batch")