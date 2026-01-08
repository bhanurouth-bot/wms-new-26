import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Try to get the Cloud Database URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# 2. If no cloud URL, fallback to local SQLite
if not SQLALCHEMY_DATABASE_URL:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./pharma_core.db"
    connect_args = {"check_same_thread": False} # SQLite specific
else:
    # Fix for Render: They use 'postgres://' but SQLAlchemy needs 'postgresql://'
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
    connect_args = {} # Postgres doesn't need arguments

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()