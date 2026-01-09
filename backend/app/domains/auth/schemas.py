from pydantic import BaseModel, EmailStr
from typing import Optional

# What we send to Token Endpoint
class Token(BaseModel):
    access_token: str
    token_type: str

# What the token contains
class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Creating a new user (Admin only usually)
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "PICKER"

# What we return to frontend (NEVER return password!)
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

# Login Request
class UserLogin(BaseModel):
    email: EmailStr
    password: str