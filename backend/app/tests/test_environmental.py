import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

from backend.app.main import app
from backend.app.database.session import Base, get_db
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.category import Category
from backend.app.models.emission_factor import EmissionFactor
from backend.app.models.environmental_goal import EnvironmentalGoal
from backend.app.security.hashing import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_env.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    admin_role = Role(id=1, name="Admin", description="Admin", permissions=["read:all", "write:all"])
    db.add(admin_role)
    db.commit()
    hashed_pwd = hash_password("password123")
    user = User(
        first_name="Admin",
        last_name="User",
        email="admin_env@ecopilot.com",
        password=hashed_pwd,
        role_id=1,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.close()
    yield
    app.dependency_overrides.pop(get_db, None)

@pytest.fixture(scope="module")
def auth_headers():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin_env@ecopilot.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_environmental_workflow(auth_headers):
    dept_payload = {"name": "Logistics Dept", "code": "LOG-01", "head": "John Smith", "employee_count": 8, "status": "active"}
    dept_res = client.post("/api/v1/departments", json=dept_payload, headers=auth_headers)
    assert dept_res.status_code == 201
    dept_id = dept_res.json()["id"]

    cat_payload = {"name": "Fuel Category", "type": "environmental", "description": "Fleet fuel", "status": "active"}
    cat_res = client.post("/api/v1/categories", json=cat_payload, headers=auth_headers)
    assert cat_res.status_code == 201
    cat_id = cat_res.json()["id"]

    factor_payload = {"name": "Diesel Factor", "source": "EPA 2024", "category_id": cat_id, "factor": 2.68, "unit": "kg CO2/liter", "status": "active"}
    factor_res = client.post("/api/v1/emission-factors", json=factor_payload, headers=auth_headers)
    assert factor_res.status_code == 201
    factor_id = factor_res.json()["id"]

    goal_payload = {
        "title": "Reduce Fleet Fuel Emission",
        "department_id": dept_id,
        "target": 500.0,
        "current_progress": 0.0,
        "deadline": str(datetime.date.today() + datetime.timedelta(days=100)),
        "status": "active"
    }
    goal_res = client.post("/api/v1/environmental-goals", json=goal_payload, headers=auth_headers)
    assert goal_res.status_code == 201
    goal_id = goal_res.json()["id"]

    tx_payload = {
        "department_id": dept_id,
        "emission_factor_id": factor_id,
        "quantity": 100.0,
        "source": "Fleet Diesel Fillup",
        "reference": "TXN-99882",
        "transaction_date": datetime.datetime.utcnow().isoformat(),
        "status": "approved",
        "notes": "Weekly refuel"
    }
    tx_res = client.post("/api/v1/environmental/transactions", json=tx_payload, headers=auth_headers)
    assert tx_res.status_code == 201
    tx_id = tx_res.json()["id"]
    assert tx_res.json()["calculated_carbon"] == 268.0

    goal_check = client.get(f"/api/v1/environmental-goals/{goal_id}", headers=auth_headers)
    assert goal_check.status_code == 200
    assert goal_check.json()["current_progress"] == 268.0
    assert goal_check.json()["status"] == "active"

    tx_update_payload = {"quantity": 200.0}
    tx_update_res = client.put(f"/api/v1/environmental/transactions/{tx_id}", json=tx_update_payload, headers=auth_headers)
    assert tx_update_res.status_code == 200
    assert tx_update_res.json()["calculated_carbon"] == 536.0

    goal_check_2 = client.get(f"/api/v1/environmental-goals/{goal_id}", headers=auth_headers)
    assert goal_check_2.status_code == 200
    assert goal_check_2.json()["current_progress"] == 500.0
    assert goal_check_2.json()["status"] == "completed"

    dash_res = client.get("/api/v1/environmental/dashboard", headers=auth_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_emission"] == 536.0
    assert dash_data["highest_emission_department"]["name"] == "Logistics Dept"
    assert dash_data["highest_emission_department"]["value"] == 536.0

    tracking_res = client.get(f"/api/v1/environmental/tracking/department/{dept_id}", headers=auth_headers)
    assert tracking_res.status_code == 200
    assert tracking_res.json()["total_carbon"] == 536.0

    delete_res = client.delete(f"/api/v1/environmental/transactions/{tx_id}", headers=auth_headers)
    assert delete_res.status_code == 200

    dash_res_after = client.get("/api/v1/environmental/dashboard", headers=auth_headers)
    assert dash_res_after.json()["total_emission"] == 0.0
