"""Errores de negocio. El service los lanza sin saber nada de HTTP;
main.py los traduce a respuestas HTTP con el mismo formato que FastAPI: {"detail": "..."}.
"""


class DomainError(Exception):
    status_code = 400

    def __init__(self, detail: str):
        super().__init__(detail)
        self.detail = detail

class BadRequestError(DomainError):  #Cuenta de usuario desactivada
    status_code = 400

class UnauthorizedError(DomainError):  #Credenciales incorrectas en el login
    status_code = 401

class NotFoundError(DomainError):     #Usuario o pedido inexistente
    status_code = 404


class ConflictError(DomainError):      #Username o email repetido; un admin que intenta desactivarse a sí mismo 
    status_code = 409


class BusinessRuleError(DomainError):  #(ya existía)
    status_code = 422