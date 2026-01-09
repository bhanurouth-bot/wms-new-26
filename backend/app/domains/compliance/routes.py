from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks # <--- Import BackgroundTasks
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.domains.inventory import models as inv_models
from app.domains.sales import models as sales_models
from app.domains.master.models import Product
from app.domains.auth.dependencies import require_manager # Recall is a Manager action
from app.domains.auth.models import User
from app.core.email_utils import schedule_recall_notifications # <--- Import our new tool

router = APIRouter(
    prefix="/compliance",
    tags=["Compliance & Traceability"]
)

@router.get("/trace/{batch_number}")
def trace_batch(batch_number: str, db: Session = Depends(get_db)):
    # 1. Find the Batch ID and Basic Info
    batch = db.query(inv_models.Batch).filter(inv_models.Batch.batch_number == batch_number).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    product = db.query(Product).filter(Product.id == batch.product_id).first()

    # 2. Find Current Location (Where is it NOW?)
    current_stock = db.query(inv_models.Stock, inv_models.Bin)\
        .join(inv_models.Bin, inv_models.Stock.bin_id == inv_models.Bin.id)\
        .filter(inv_models.Stock.batch_id == batch.id).all()
    
    locations = []
    for stock, bin_loc in current_stock:
        if stock.quantity > 0:
            locations.append({
                "bin": bin_loc.bin_code,
                "qty": stock.quantity,
                "status": "In Stock"
            })

    # 3. Find Sales History (Who bought it?)
    # Note: We query SalesOrderItem where allocated_batch_id matches
    sales = db.query(sales_models.SalesOrderItem, sales_models.SalesOrder)\
        .join(sales_models.SalesOrder, sales_models.SalesOrderItem.order_id == sales_models.SalesOrder.id)\
        .filter(sales_models.SalesOrderItem.allocated_batch_id == batch.id).all()
        
    sales_history = []
    for item, order in sales:
        sales_history.append({
            "order_id": order.id,
            "customer": order.customer_name,
            "date": order.created_at,
            "qty_sold": item.quantity
        })

    return {
        "batch_info": {
            "batch_number": batch.batch_number,
            "product": product.name,
            "expiry": batch.expiry_date,
            "mfg": batch.mfg_date
        },
        "current_locations": locations,
        "sales_trail": sales_history
    }


@router.post("/recall/{batch_number}")
def initiate_recall(
    batch_number: str, 
    background_tasks: BackgroundTasks, # <--- Magically injected by FastAPI
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)
):
    # 1. Find the Batch
    batch = db.query(inv_models.Batch).filter(inv_models.Batch.batch_number == batch_number).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    
    product = db.query(Product).filter(Product.id == batch.product_id).first()

    # 2. Find everyone who bought it (The Trace)
    sales = db.query(sales_models.SalesOrder)\
        .join(sales_models.SalesOrderItem)\
        .filter(sales_models.SalesOrderItem.allocated_batch_id == batch.id).all()
    
    # Extract unique emails (assuming Customer Name is email for this MVP, or you add an email field)
    # For MVP, let's assume 'customer_name' might be an email, or we default to a test email.
    recipients = []
    for sale in sales:
        if "@" in sale.customer_name:
            recipients.append(sale.customer_name)
    
    if not recipients:
        # Fallback for demo: Send to the admin/current user
        recipients = [current_user.email]

    # 3. Schedule the "Heavy" Task
    # This function returns instantly. The email sends LATER.
    schedule_recall_notifications(background_tasks, batch.batch_number, product.name, recipients)

    # 4. Return success immediately
    return {
        "status": "Recall Initiated",
        "message": f"Alerts are being sent to {len(recipients)} affected customers in the background.",
        "affected_customers": len(recipients)
    }