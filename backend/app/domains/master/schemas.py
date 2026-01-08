from pydantic import BaseModel
from typing import Optional, List

# --- Manufacturer Schemas ---
class ManufacturerBase(BaseModel):
    name: str
    address: Optional[str] = None
    license_number: Optional[str] = None

class ManufacturerCreate(ManufacturerBase):
    pass

class ManufacturerOut(ManufacturerBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    sku_code: str
    name: str
    composition: Optional[str] = None
    base_uom: str = "STRIP"
    requires_cold_chain: bool = False
    min_temp: Optional[float] = None
    max_temp: Optional[float] = None
    hsn_code: Optional[str] = None
    schedule_type: Optional[str] = None
    manufacturer_id: int

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    manufacturer: Optional[ManufacturerOut] # Nested JSON response

    class Config:
        from_attributes = True