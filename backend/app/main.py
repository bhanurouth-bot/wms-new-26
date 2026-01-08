from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # <--- IMPORT THIS
from app.core.database import engine
from app.domains.master import models as master_models, routes as master_routes
from app.domains.inventory import models as inv_models, routes as inv_routes
from app.domains.sales import models as sales_models, routes as sales_routes
from app.domains.compliance import routes as compliance_routes # <--- Import
from app.domains.analytics import routes as analytics_routes


# Database Init
master_models.Base.metadata.create_all(bind=engine)
inv_models.Base.metadata.create_all(bind=engine)
sales_models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Unified Pharma ERP-WMS", version="0.1.0")

# --- CORS CONFIGURATION (NEW) ---
origins = [
    "http://localhost:5173",  # Vite (React) default port
    "http://localhost:3000",  # Standard React port
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],
)
# --------------------------------

app.include_router(master_routes.router)
app.include_router(inv_routes.router)
app.include_router(sales_routes.router)
app.include_router(compliance_routes.router)
app.include_router(analytics_routes.router)


@app.get("/")
def health_check():
    return {"system": "Pharma Core", "status": "Ready for Frontend"}