import re
from datetime import datetime
from typing import Literal

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

Rol = Literal["user", "admin"]


class UserCreate(SQLModel):
    """Lo que manda el cliente al registrarse."""

    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username", "full_name", mode="before")
    @classmethod
    def quitar_espacios(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

    @field_validator("username")
    @classmethod
    def username_valido(cls, v: str) -> str:
        if not re.fullmatch(r"[a-zA-Z0-9_.-]+", v):
            raise ValueError("Solo letras, números y los símbolos _ . - (sin espacios)")
        return v


class UserPublic(SQLModel):
    """Lo que sale del servidor: NUNCA hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: Rol
    disabled: bool
    created_at: datetime