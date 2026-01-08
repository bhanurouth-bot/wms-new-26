from pydantic import BaseModel
from typing import List, Optional

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class SalesOrderCreate(BaseModel):
    customer_name: str
    items: List[OrderItemCreate]

class OrderOut(BaseModel):
    id: int
    status: str
    total_amount: float
    
    class Config:
        from_attributes = True