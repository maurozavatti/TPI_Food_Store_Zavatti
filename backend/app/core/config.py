from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración leída del archivo .env (o de variables de entorno).

    Los secretos NO tienen valor por defecto: si faltan, la app no arranca (fail-fast).
    SecretStr evita que aparezcan en logs o en un print(settings): se muestran como '**********'.
    """

    DATABASE_URL: SecretStr  # incluye la contraseña de la base
    SECRET_KEY: SecretStr = Field(min_length=32)  # firma de los JWT
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    COOKIE_SECURE: bool = False  # en producción (HTTPS): True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()