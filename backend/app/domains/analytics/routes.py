from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.domains.inventory import models as inv_models
from app.domains.sales import models as sales_models
from app.domains.master.models import Product

router = APIRouter(
    prefix="/analytics",
    tags=["AI & Analytics"]
)

@router.get("/insights/")
def get_insights(db: Session = Depends(get_db)):
    insights = []

    # 1. Fetch all Products
    products = db.query(Product).all()

    for p in products:
        # A. Calculate Total Current Stock
        total_stock = db.query(func.sum(inv_models.Stock.quantity))\
            .join(inv_models.Batch)\
            .filter(inv_models.Batch.product_id == p.id)\
            .scalar() or 0
        
        # B. Calculate Total Sales (Lifetime)
        # In a real app, we would limit this to "Last 30 Days"
        total_sold = db.query(func.sum(sales_models.SalesOrderItem.quantity))\
            .filter(sales_models.SalesOrderItem.product_id == p.id)\
            .scalar() or 0

        # C. Predict Burn Rate
        # Simplification: We assume 'total_sold' happened over a set period (e.g., 30 days) 
        # to calculate a daily velocity.
        estimated_daily_demand = total_sold / 30 if total_sold > 0 else 0
        
        # D. Generate Insights
        
        # Insight 1: Low Stock / Stockout Risk
        if estimated_daily_demand > 0:
            days_left = total_stock / estimated_daily_demand
            if days_left < 7:
                insights.append({
                    "type": "CRITICAL",
                    "title": "Stockout Risk",
                    "message": f"{p.name} will run out in {int(days_left)} days.",
                    "metric": f"{total_stock} Units left"
                })
        elif total_stock < 50: 
            # Fallback if no sales history but low absolute number
            insights.append({
                "type": "WARNING",
                "title": "Low Inventory",
                "message": f"{p.name} is below safety stock levels.",
                "metric": f"{total_stock} Units"
            })

        # Insight 2: Dead Stock (High Stock, Zero Sales)
        if total_stock > 500 and total_sold == 0:
            insights.append({
                "type": "INFO",
                "title": "Dead Stock",
                "message": f"{p.name} is not moving. Consider a discount.",
                "metric": "Overstocked"
            })

    return insights