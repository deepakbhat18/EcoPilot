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
from backend.app.models.policy import Policy
from backend.app.models.badge import Badge
from backend.app.models.reward import Reward
from backend.app.security.hashing import hash_password

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_social_gov.db"
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
        id=1,
        first_name="Admin",
        last_name="User",
        email="admin_sg@ecopilot.com",
        password=hashed_pwd,
        role_id=1,
        is_active=True
    )
    db.add(user)

    dept = Department(id=1, name="HR Dept", code="HR-01", head="Alice", employee_count=5, status="active")
    db.add(dept)

    badge = Badge(id=1, name="Eco Warrior", description="Eco Warrior", icon="shield", unlock_rule="xp >= 100", status="active")
    db.add(badge)

    reward = Reward(id=1, name="Tree Planting Certificate", description="Certified", points_required=50, stock=10, status="active")
    db.add(reward)

    policy = Policy(id=1, title="Net Zero Travel Policy", description="Travel rules", effective_date=datetime.date.today(), status="active")
    db.add(policy)

    db.commit()
    db.close()
    yield

@pytest.fixture(scope="module")
def auth_headers():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin_sg@ecopilot.com", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_social_workflow(auth_headers):
    act_payload = {
        "name": "Community Planting Drive",
        "description": "Planting trees",
        "points_multiplier": 15,
        "start_date": datetime.datetime.utcnow().isoformat(),
        "end_date": (datetime.datetime.utcnow() + datetime.timedelta(days=1)).isoformat(),
        "evidence_required": True,
        "status": "active"
    }
    act_res = client.post("/api/v1/social/activities", json=act_payload, headers=auth_headers)
    assert act_res.status_code == 201
    act_id = act_res.json()["id"]

    set_evidence_res = client.post("/api/v1/config/settings", json={"key": "evidence_required", "value": "true"}, headers=auth_headers)
    assert set_evidence_res.status_code == 200

    part_payload = {
        "csr_activity_id": act_id,
        "hours_spent": 8.0,
        "evidence_url": "http://evidence.com/file.png"
    }
    part_res = client.post("/api/v1/social/participations", json=part_payload, headers=auth_headers)
    assert part_res.status_code == 201
    part_id = part_res.json()["id"]

    approve_res = client.put(f"/api/v1/social/participations/{part_id}/approve?status=approved", headers=auth_headers)
    assert approve_res.status_code == 200
    assert approve_res.json()["points_earned"] == 120

    me_res = client.get("/api/v1/users/me", headers=auth_headers)
    assert me_res.status_code == 200
    assert me_res.json()["xp_points"] == 120
    assert me_res.json()["points_balance"] == 120

    notifs_res = client.get("/api/v1/config/notifications", headers=auth_headers)
    assert notifs_res.status_code == 200
    notifs = notifs_res.json()
    assert len(notifs) >= 2

def test_governance_workflow(auth_headers):
    ack_res = client.post("/api/v1/governance/policies/1/acknowledge", headers=auth_headers)
    assert ack_res.status_code == 200

    audit_payload = {
        "title": "Q3 Green Office Audit",
        "scope": "HQ Operations",
        "findings": "All green",
        "status": "final",
        "audit_date": datetime.datetime.utcnow().isoformat()
    }
    audit_res = client.post("/api/v1/governance/audits", json=audit_payload, headers=auth_headers)
    assert audit_res.status_code == 201

    issue_payload = {
        "title": "HVAC filter replacement overdue",
        "description": "Needs action",
        "owner_id": 1,
        "due_date": (datetime.datetime.utcnow() - datetime.timedelta(days=1)).isoformat(),
        "status": "open",
        "severity": "high"
    }
    issue_res = client.post("/api/v1/governance/compliance-issues", json=issue_payload, headers=auth_headers)
    assert issue_res.status_code == 201
    issue_id = issue_res.json()["id"]

    reminders_res = client.post("/api/v1/governance/compliance-issues/trigger-reminders", headers=auth_headers)
    assert reminders_res.status_code == 200

    gov_dash_res = client.get("/api/v1/governance/dashboard", headers=auth_headers)
    assert gov_dash_res.status_code == 200
    assert gov_dash_res.json()["overdue_issues"] == 1

def test_gamification_workflow(auth_headers):
    chall_payload = {
        "title": "Zero Print Week",
        "description": "No printing challenge",
        "xp_reward": 150,
        "start_date": datetime.datetime.utcnow().isoformat(),
        "end_date": (datetime.datetime.utcnow() + datetime.timedelta(days=7)).isoformat(),
        "status": "active"
    }
    chall_res = client.post("/api/v1/gamification/challenges", json=chall_payload, headers=auth_headers)
    assert chall_res.status_code == 201
    chall_id = chall_res.json()["id"]

    part_res = client.post(f"/api/v1/gamification/challenges/{chall_id}/participate", headers=auth_headers)
    assert part_res.status_code == 200

    progress_res = client.put(f"/api/v1/gamification/challenges/{chall_id}/progress?progress=100.0", headers=auth_headers)
    assert progress_res.status_code == 200
    assert progress_res.json()["status"] == "completed"

    redeem_res = client.post("/api/v1/gamification/rewards/1/redeem", headers=auth_headers)
    assert redeem_res.status_code == 200

    leaderboard_res = client.get("/api/v1/gamification/leaderboard", headers=auth_headers)
    assert leaderboard_res.status_code == 200
    assert len(leaderboard_res.json()) >= 1
