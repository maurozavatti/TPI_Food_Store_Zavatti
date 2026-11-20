from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# ---------------------------------------------------------
# Contraseñas: hash bcrypt (lento a propósito y con sal aleatoria)
# ---------------------------------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hash de una contraseña cualquiera: se usa para que el login tarde lo mismo
# exista o no el usuario (no revela qué usuarios existen por el tiempo de respuesta)
_HASH_FALSO = pwd_context.hash("contraseña-de-relleno")


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: Optional[str]) -> bool:
    if hashed is None:
        pwd_context.verify(plain, _HASH_FALSO)
        return False
    return pwd_context.verify(plain, hashed)


# ---------------------------------------------------------
# JWT: token FIRMADO (no cifrado) con vencimiento
# ---------------------------------------------------------
def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"type": "access", "exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY.get_secret_value(), algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict[str, Any]]:
    """Devuelve el payload si la firma, el vencimiento y el tipo son válidos; si no, None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY.get_secret_value(), algorithms=[settings.ALGORITHM])
    except JWTError:  # firma inválida, token vencido o mal formado
        return None
    if payload.get("type") != "access":
        return None
    return payload