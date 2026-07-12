from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from backend.app.exceptions.exceptions import EcoPilotException
from backend.app.config.settings import settings
import logging

logger = logging.getLogger("ecopilot")

def register_exception_handlers(app: FastAPI) -> None:

    @app.exception_handler(EcoPilotException)
    async def ecopilot_exception_handler(request: Request, exc: EcoPilotException) -> JSONResponse:
        logger.warning(f"EcoPilotException: {exc.message} (status: {exc.status_code})")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.__class__.__name__,
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def request_validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.warning(f"Request validation failed: {exc.errors()}")
        formatted_errors = []
        for error in exc.errors():
            formatted_errors.append({
                "field": ".".join(map(str, error["loc"])),
                "message": error["msg"],
                "type": error["type"]
            })
        return JSONResponse(
            status_code=422,
            content={
                "success": False,
                "error": {
                    "code": "ValidationError",
                    "message": "Input validation failed.",
                    "details": formatted_errors
                }
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        error_details = str(exc) if settings.ENVIRONMENT != "production" else None
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "code": "InternalServerError",
                    "message": "An unexpected error occurred. Please contact systems administrator.",
                    "details": error_details
                }
            }
        )
