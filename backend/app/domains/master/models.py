from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Manufacturer(Base):
    __tablename__ = "manufacturers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    address = Column(String, nullable=True)
    license_number = Column(String, nullable=True)  # Drug License No.
    is_active = Column(Boolean, default=True)
    
    products = relationship("Product", back_populates="manufacturer")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku_code = Column(String, unique=True, index=True)  # E.g., PARA-500-TAB
    name = Column(String, index=True)                   # E.g., Dolo 650
    composition = Column(String, nullable=True)         # E.g., Paracetamol 650mg
    
    # Relationships
    manufacturer_id = Column(Integer, ForeignKey("manufacturers.id"))
    manufacturer = relationship("Manufacturer", back_populates="products")

    # WMS & Logistics Fields
    base_uom = Column(String, default="STRIP")          # STRIP, BOTTLE, VIAL
    requires_cold_chain = Column(Boolean, default=False)
    min_temp = Column(Float, nullable=True)             # e.g., 2.0
    max_temp = Column(Float, nullable=True)             # e.g., 8.0
    
    # Regulatory & ERP
    hsn_code = Column(String, nullable=True)            # GST Tax Code
    schedule_type = Column(String, nullable=True)       # H, H1, G, X (Narcotics)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())