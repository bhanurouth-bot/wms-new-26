from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# --- CONFIGURATION ---
# FOR NOW: We use SQLite so you can run this immediately without installing Postgres.
# LATER: We will change this string to connect to a real PostgreSQL server.
SQLALCHEMY_DATABASE_URL = "sqlite:///./pharma_core.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/pharma_core"

# connect_args is needed only for SQLite
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get DB session in every request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()