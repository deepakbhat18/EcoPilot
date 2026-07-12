from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config.settings import settings
from backend.app.core.logging import setup_logging
from backend.app.exceptions.handlers import register_exception_handlers
from backend.app.api.health import router as health_router
from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.users import router as users_router
from backend.app.database.session import engine, Base, SessionLocal
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.security.hashing import hash_password

setup_logging()

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        roles_count = db.query(Role).count()
        if roles_count == 0:
            admin_role = Role(name="Admin", description="System Administrator", permissions=["read:all", "write:all", "delete:all"])
            esg_manager_role = Role(name="ESG Manager", description="Corporate ESG Manager", permissions=["read:all", "write:environmental", "write:social", "write:governance"])
            dept_manager_role = Role(name="Department Manager", description="Departmental Manager", permissions=["read:all", "write:social"])
            employee_role = Role(name="Employee", description="Corporate Employee", permissions=["read:all"])
            auditor_role = Role(name="Auditor", description="Third-party ESG Auditor", permissions=["read:all"])

            db.add_all([admin_role, esg_manager_role, dept_manager_role, employee_role, auditor_role])
            db.commit()

        default_user = db.query(User).filter(User.email == "analyst@ecopilot.com").first()
        if not default_user:
            admin_role = db.query(Role).filter(Role.name == "Admin").first()
            if admin_role:
                hashed_pwd = hash_password("password123")
                new_user = User(
                    first_name="Senior ESG",
                    last_name="Analyst",
                    email="analyst@ecopilot.com",
                    password=hashed_pwd,
                    role_id=admin_role.id,
                    is_active=True,
                    status="active"
                )
                db.add(new_user)
                db.commit()
    finally:
        db.close()

seed_db()

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

from backend.app.api.v1.master_data import router as master_data_router
app.include_router(master_data_router, prefix=settings.API_V1_STR, tags=["Master Data"])
