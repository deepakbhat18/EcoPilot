from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config.settings import settings
from backend.app.core.logging import setup_logging
from backend.app.exceptions.handlers import register_exception_handlers
from backend.app.api.health import router as health_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.users import router as users_router


setup_logging()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.TAGLINE,
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
)


if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


register_exception_handlers(app)


app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["Users"])
