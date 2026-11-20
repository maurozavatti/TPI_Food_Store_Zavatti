from datetime import datetime, timezone


def utc_now() -> datetime:
    """Fecha y hora actual en UTC (para los campos de auditoría)."""
    return datetime.now(timezone.utc)