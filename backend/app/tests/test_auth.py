import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import jwt
import datetime

from backend.app.main import app
from backend.app.database.session import Base, get_db
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.security.hashing import hash_password
from backend.app.security.jwt import create_access_token
from backend.app.config.settings import settings

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    admin_role = Role(id=1, name="Admin", description="Admin", permissions=["read:all", "write:all", "delete:all"])
    employee_role = Role(id=2, name="Employee", description="Employee", permissions=["read:all"])
    db.add_all([admin_role, employee_role])
    db.commit()

    hashed_pwd = hash_password("password123")
    user1 = User(
        first_name="Admin",
        last_name="User",
        email="admin@ecopilot.com",
        password=hashed_pwd,
        role_id=1,
        is_active=True
    )
    user2 = User(
        first_name="Emp",
        last_name="User",
        email="emp@ecopilot.com",
        password=hashed_pwd,
        role_id=2,
        is_active=True
    )
    db.add_all([user1, user2])
    db.commit()
    db.close()
    yield
    app.dependency_overrides.pop(get_db, None)

client = TestClient(app)

def test_login_success():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@ecopilot.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_login_invalid_email():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@ecopilot.com", "password": "password123"}
    )
    assert response.status_code == 401
    assert "error" in response.json()
    assert "message" in response.json()["error"]

def test_login_wrong_password():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@ecopilot.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_expired_token():
    expire = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    to_encode = {"exp": expire, "sub": "1", "type": "access"}
    expired_token = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

    headers = {"Authorization": f"Bearer {expired_token}"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401
    assert "Authentication token has expired" in response.json()["error"]["message"]

def test_unauthorized_access():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_role_restrictions():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "emp@ecopilot.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/v1/users/1", headers=headers)
    assert response.status_code == 403
    assert "Access forbidden" in response.json()["error"]["message"]
