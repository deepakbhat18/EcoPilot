import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import datetime

from backend.app.main import app
from backend.app.database.session import Base, get_db
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.security.hashing import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_md.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
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
        email="admin_md@ecopilot.com",
        password=hashed_pwd,
        role_id=1,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.close()
    yield

@pytest.fixture(scope="module")
def auth_headers():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin_md@ecopilot.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_departments_crud(auth_headers):
    payload = {
        "name": "Sustainability Dept",
        "code": "SUS-01",
        "head": "Dr. Sarah",
        "employee_count": 12,
        "status": "active",
        "description": "ESG and Carbon monitoring team"
    }
    response = client.post("/api/v1/departments", json=payload, headers=auth_headers)
    assert response.status_code == 201
    dept_id = response.json()["id"]
    assert response.json()["name"] == "Sustainability Dept"

    response = client.post("/api/v1/departments", json=payload, headers=auth_headers)
    assert response.status_code == 422
    assert "already exists" in response.json()["error"]["message"]

    response = client.get(f"/api/v1/departments/{dept_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["code"] == "SUS-01"

    update_payload = {"name": "Sustainability & ESG Dept", "code": "SUS-01-V2"}
    response = client.put(f"/api/v1/departments/{dept_id}", json=update_payload, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "Sustainability & ESG Dept"

    response = client.get("/api/v1/departments", params={"search": "Sustainability"}, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert data["items"][0]["id"] == dept_id

    response = client.delete(f"/api/v1/departments/{dept_id}", headers=auth_headers)
    assert response.status_code == 200

    response = client.get(f"/api/v1/departments/{dept_id}", headers=auth_headers)
    assert response.status_code == 404

def test_categories_crud(auth_headers):
    payload = {
        "name": "Scope 1 Emissions",
        "type": "environmental",
        "description": "Direct carbon emissions",
        "status": "active"
    }
    response = client.post("/api/v1/categories", json=payload, headers=auth_headers)
    assert response.status_code == 201
    cat_id = response.json()["id"]

    response = client.get(f"/api/v1/categories/{cat_id}", headers=auth_headers)
    assert response.status_code == 200

    response = client.get("/api/v1/categories", headers=auth_headers)
    assert response.json()["total"] >= 1

    update_payload = {"name": "Scope 1 Direct"}
    response = client.put(f"/api/v1/categories/{cat_id}", json=update_payload, headers=auth_headers)
    assert response.status_code == 200

    response = client.delete(f"/api/v1/categories/{cat_id}", headers=auth_headers)
    assert response.status_code == 200

def test_emission_factors_crud(auth_headers):
    cat_payload = {"name": "Electricity Grid", "type": "environmental", "description": "Scope 2 power", "status": "active"}
    cat_res = client.post("/api/v1/categories", json=cat_payload, headers=auth_headers)
    cat_id = cat_res.json()["id"]

    factor_payload = {
        "name": "US Grid Factor",
        "source": "EPA 2023",
        "category_id": cat_id,
        "factor": 0.385,
        "unit": "kg CO2/kWh",
        "status": "active",
        "description": "Standard US regional power factor"
    }
    response = client.post("/api/v1/emission-factors", json=factor_payload, headers=auth_headers)
    assert response.status_code == 201
    factor_id = response.json()["id"]

    invalid_payload = factor_payload.copy()
    invalid_payload["category_id"] = 99999
    invalid_payload["name"] = "Different Factor Name"
    response = client.post("/api/v1/emission-factors", json=invalid_payload, headers=auth_headers)
    assert response.status_code == 422
    assert "Category does not exist" in response.json()["error"]["message"]

    response = client.get(f"/api/v1/emission-factors/{factor_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["category"]["id"] == cat_id

    response = client.delete(f"/api/v1/emission-factors/{factor_id}", headers=auth_headers)
    assert response.status_code == 200

def test_product_esg_profiles_crud(auth_headers):
    cat_payload = {"name": "Products Category", "type": "environmental", "description": "Products category", "status": "active"}
    cat_res = client.post("/api/v1/categories", json=cat_payload, headers=auth_headers)
    cat_id = cat_res.json()["id"]

    factor_payload = {
        "name": "Grid Factor V2",
        "source": "EPA 2024",
        "category_id": cat_id,
        "factor": 0.4,
        "unit": "kg CO2/kWh",
        "status": "active",
        "description": "Standard US regional power factor"
    }
    factor_res = client.post("/api/v1/emission-factors", json=factor_payload, headers=auth_headers)
    factor_id = factor_res.json()["id"]

    profile_payload = {
        "product_name": "Eco Charger Pro",
        "category_id": cat_id,
        "emission_factor_id": factor_id,
        "carbon_rating": "A+",
        "description": "Next-gen solar charger"
    }
    response = client.post("/api/v1/product-esg-profiles", json=profile_payload, headers=auth_headers)
    assert response.status_code == 201
    profile_id = response.json()["id"]

    response = client.get(f"/api/v1/product-esg-profiles/{profile_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["category"]["name"] == "Products Category"

    response = client.delete(f"/api/v1/product-esg-profiles/{profile_id}", headers=auth_headers)
    assert response.status_code == 200

def test_environmental_goals_crud(auth_headers):
    dept_payload = {
        "name": "Energy Dept",
        "code": "ENG-01",
        "head": "Dr. Sarah",
        "employee_count": 5,
        "status": "active",
        "description": "Energy team"
    }
    dept_res = client.post("/api/v1/departments", json=dept_payload, headers=auth_headers)
    dept_id = dept_res.json()["id"]

    goal_payload = {
        "title": "Reduce Grid Power Usage",
        "department_id": dept_id,
        "target": 25.0,
        "current_progress": 5.2,
        "deadline": str(datetime.date.today() + datetime.timedelta(days=365)),
        "status": "active"
    }
    response = client.post("/api/v1/environmental-goals", json=goal_payload, headers=auth_headers)
    assert response.status_code == 201
    goal_id = response.json()["id"]

    response = client.get(f"/api/v1/environmental-goals/{goal_id}", headers=auth_headers)
    assert response.status_code == 200

    response = client.delete(f"/api/v1/environmental-goals/{goal_id}", headers=auth_headers)
    assert response.status_code == 200

def test_policies_crud(auth_headers):
    payload = {
        "title": "Zero Single Use Plastics",
        "description": "Banning single use plastic in all regional corporate headquarters",
        "effective_date": str(datetime.date.today()),
        "status": "active"
    }
    response = client.post("/api/v1/policies", json=payload, headers=auth_headers)
    assert response.status_code == 201
    policy_id = response.json()["id"]

    response = client.get(f"/api/v1/policies/{policy_id}", headers=auth_headers)
    assert response.status_code == 200

    response = client.delete(f"/api/v1/policies/{policy_id}", headers=auth_headers)
    assert response.status_code == 200

def test_badges_crud(auth_headers):
    payload = {
        "name": "Carbon Commando",
        "description": "Achieve 50% carbon reduction in a single quarter",
        "icon": "leaf",
        "unlock_rule": "esg_score >= 80",
        "status": "active"
    }
    response = client.post("/api/v1/badges", json=payload, headers=auth_headers)
    assert response.status_code == 201
    badge_id = response.json()["id"]

    response = client.get(f"/api/v1/badges/{badge_id}", headers=auth_headers)
    assert response.status_code == 200

    response = client.delete(f"/api/v1/badges/{badge_id}", headers=auth_headers)
    assert response.status_code == 200

def test_rewards_crud(auth_headers):
    payload = {
        "name": "Solar Powered Backpack",
        "description": "Premium backpack equipped with integrated flexible solar cells",
        "points_required": 1200,
        "stock": 50,
        "status": "active"
    }
    response = client.post("/api/v1/rewards", json=payload, headers=auth_headers)
    assert response.status_code == 201
    reward_id = response.json()["id"]

    response = client.get(f"/api/v1/rewards/{reward_id}", headers=auth_headers)
    assert response.status_code == 200

    response = client.delete(f"/api/v1/rewards/{reward_id}", headers=auth_headers)
    assert response.status_code == 200
