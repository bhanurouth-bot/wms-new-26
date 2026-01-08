from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    ALLOCATED = "ALLOCATED" # Stock is reserved
    DISPATCHED = "DISPATCHED"

class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String)
    status = Column(String, default=OrderStatus.PENDING)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("SalesOrderItem", back_populates="order")

class SalesOrderItem(Base):
    __tablename__ = "sales_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"))
    product_id = Column(Integer) # Linking to Master Data by ID
    quantity = Column(Integer)
    unit_price = Column(Float)
    
    # This field is crucial: It tells us WHICH batch was allocated
    allocated_batch_id = Column(Integer, nullable=True) 
    
    order = relationship("SalesOrder", back_populates="items")