from pydantic import BaseModel
from typing import Optional, List
from datetime import date

# --- Warehouse/Bin ---
class BinCreate(BaseModel):
    bin_code: str
    is_cold_storage: bool = False
    warehouse_id: int

class WarehouseCreate(BaseModel):
    name: str
    location_code: str

# --- Stock Operations ---
class InboundTransaction(BaseModel):
    """
    Data required when goods arrive at the dock.
    We create the Batch info AND place it in a Bin.
    """
    product_id: int
    batch_number: str
    expiry_date: date
    mfg_date: Optional[date] = None
    mrp: float
    quantity: int
    target_bin_code: str # Operator scans the bin code

class StockOut(BaseModel):
    id: int
    batch_number: str
    bin_code: str
    quantity: int
    product_id: int

    class Config:
        from_attributes = True

class TelemetryData(BaseModel):
    bin_code: str
    temperature: float

# --- UPDATED STOCK VIEW ---
class StockView(BaseModel):
    product_name: str
    sku: str
    batch_number: str
    expiry_date: date
    bin_code: str
    quantity: int
    is_cold_chain: bool
    is_quarantined: bool # <--- NEW FIELD

    class Config:
        from_attributes = True