import re
from datetime import datetime
from typing import Literal

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel

Rol = Literal["user", "admin"]


# ---------- Entrada ----------
class UserCreate(SQLModel):
    """Lo que manda el cliente al registrarse (incluye la contraseña en texto plano)."""

    username: str = Field(min_length=3, max_length=50, schema_extra={"examples": ["maria"]})
    full_name: str = Field(min_length=1, max_length=100, schema_extra={"examples": ["María Gómez"]})
    email: EmailStr = Field(schema_extra={"examples": ["maria@mail.com"]})  # RN-09: email válido
    password: str = Field(min_length=8, max_length=72, schema_extra={"examples": ["Maria1234!"]})  # RN-09

    @field_validator("username", "full_name", mode="before")
    @classmethod
    def quitar_espacios(cls, v: str) -> str:
        return v.strip() if isinstance(v, str) else v

    @field_validator("username")
    @classmethod
    def username_valido(cls, v: str) -> str:
        if not re.fullmatch(r"[a-zA-Z0-9_.-]+", v):
            raise ValueError("Solo letras, números y los símbolos _ . -  (sin espacios)")
        return v

    @field_validator("password")
    @classmethod
    def maximo_72_bytes(cls, v: str) -> str:
        # bcrypt solo usa los primeros 72 BYTES (una "ñ" o una "á" ocupan 2 bytes en UTF-8)
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return v


# ---------- Salida ----------
class UserPublic(SQLModel):
    """Lo que sale del servidor: SIN hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: Rol
    disabled: bool
    created_at: datetime


class MensajeResponse(SQLModel):
    mensaje: str