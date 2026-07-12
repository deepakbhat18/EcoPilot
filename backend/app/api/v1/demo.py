import datetime
import random
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.role import Role
from backend.app.models.department import Department
from backend.app.models.category import Category
from backend.app.models.emission_factor import EmissionFactor
from backend.app.models.carbon_transaction import CarbonTransaction
from backend.app.models.social import CSRActivity, CSRParticipation, Training, TrainingCompletion, DiversityMetric
from backend.app.models.governance import Audit, ComplianceIssue, PolicyAcknowledgement
from backend.app.models.policy import Policy
from backend.app.models.gamification import Challenge, ChallengeParticipation, RewardRedemption, UserBadge
from backend.app.models.badge import Badge
from backend.app.models.reward import Reward
from backend.app.models.settings_notifications import Notification
from backend.app.security.hashing import hash_password

router = APIRouter()

@router.post("/seed", status_code=status.HTTP_200_OK)
async def seed_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Clear previous transactional and participation data (do not clear roles/users if they are active, just update/reset them)
    db.query(CarbonTransaction).delete()
    db.query(CSRParticipation).delete()
    db.query(CSRActivity).delete()
    db.query(TrainingCompletion).delete()
    db.query(Training).delete()
    db.query(Audit).delete()
    db.query(ComplianceIssue).delete()
    db.query(ChallengeParticipation).delete()
    db.query(Challenge).delete()
    db.query(RewardRedemption).delete()
    db.query(UserBadge).delete()
    db.query(Notification).delete()
    db.query(PolicyAcknowledgement).delete()
    db.query(DiversityMetric).delete()
    db.commit()

    # 1. Departments
    depts = [
        {"id": 1, "name": "HQ London", "code": "HQ-LDN", "description": "Global corporate headquarters"},
        {"id": 2, "name": "San Francisco Hub", "code": "SF-HUB", "description": "Tech and design innovation center"},
        {"id": 3, "name": "Tokyo Operations", "code": "TOK-OPS", "description": "APAC region operations & logistics"},
        {"id": 4, "name": "Berlin Factory", "code": "BER-FAC", "description": "Smart assembly and battery manufacturing"},
        {"id": 5, "name": "Sydney Logistics", "code": "SYD-LOG", "description": "Oceania distribution and warehousing"}
    ]
    for d in depts:
        existing = db.query(Department).filter(Department.id == d["id"]).first()
        if not existing:
            new_d = Department(
                id=d["id"], 
                name=d["name"], 
                code=d["code"], 
                description=d["description"], 
                status="active"
            )
            db.add(new_d)
    db.commit()

    # 2. Roles
    roles = ["Admin", "ESG Manager", "Department Manager", "Employee", "Auditor"]
    role_map = {}
    for r in roles:
        existing = db.query(Role).filter(Role.name == r).first()
        if not existing:
            existing = Role(name=r, description=f"{r} Role", permissions=["read:all"])
            db.add(existing)
            db.commit()
            db.refresh(existing)
        role_map[r.lower()] = existing.id

    # Ensure current user has high XP
    current_user.xp_points = 2450
    current_user.points_balance = 1200
    current_user.department_id = 1
    db.add(current_user)

    # 3. Seed other users for a realistic Leaderboard
    password_hash = hash_password("password123")
    demo_users = [
        {"first_name": "Marcus", "last_name": "Vance", "email": "marcus.sf@ecopilot.com", "role": "department manager", "dept_id": 2, "xp": 1850, "balance": 900},
        {"first_name": "Aiko", "last_name": "Sato", "email": "aiko.tokyo@ecopilot.com", "role": "esg manager", "dept_id": 3, "xp": 2100, "balance": 1100},
        {"first_name": "Hans", "last_name": "Mueller", "email": "hans.berlin@ecopilot.com", "role": "employee", "dept_id": 4, "xp": 950, "balance": 400},
        {"first_name": "Sarah", "last_name": "Jenkins", "email": "sarah.sydney@ecopilot.com", "role": "employee", "dept_id": 5, "xp": 1400, "balance": 650},
        {"first_name": "Elena", "last_name": "Rostova", "email": "elena.audits@ecopilot.com", "role": "auditor", "dept_id": 1, "xp": 300, "balance": 150}
    ]
    users_seeded = []
    for u in demo_users:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            new_u = User(
                first_name=u["first_name"],
                last_name=u["last_name"],
                email=u["email"],
                password=password_hash,
                role_id=role_map[u["role"]],
                department_id=u["dept_id"],
                xp_points=u["xp"],
                points_balance=u["balance"],
                status="active",
                is_active=True
            )
            db.add(new_u)
            db.commit()
            db.refresh(new_u)
            users_seeded.append(new_u)
        else:
            existing.xp_points = u["xp"]
            existing.points_balance = u["balance"]
            existing.department_id = u["dept_id"]
            db.add(existing)
            users_seeded.append(existing)
    db.commit()

    # 3.5. Categories (Scope 1, 2, 3)
    categories = [
        {"name": "Scope 1 (Direct)", "type": "environmental", "description": "Direct greenhouse gas emissions from sources owned or controlled by the organization."},
        {"name": "Scope 2 (Indirect)", "type": "environmental", "description": "Indirect greenhouse gas emissions from the generation of purchased electricity, heating, or cooling."},
        {"name": "Scope 3 (Indirect)", "type": "environmental", "description": "Other indirect emissions in the value chain, both upstream and downstream."}
    ]
    categories_map = {}
    for c in categories:
        existing_cat = db.query(Category).filter(Category.name == c["name"]).first()
        if not existing_cat:
            existing_cat = Category(
                name=c["name"],
                type=c["type"],
                description=c["description"],
                status="active"
            )
            db.add(existing_cat)
            db.commit()
            db.refresh(existing_cat)
        categories_map[c["name"]] = existing_cat.id

    # 4. Master Data: Emission Factors
    factors = [
        {"name": "Electricity Grid Scope 2", "category": "Scope 2 (Indirect)", "factor": 0.47, "unit": "kWh"},
        {"name": "Commercial Aviation Scope 3", "category": "Scope 3 (Indirect)", "factor": 0.18, "unit": "km"},
        {"name": "Diesel Stationary Generator Scope 1", "category": "Scope 1 (Direct)", "factor": 2.68, "unit": "liters"},
        {"name": "Natural Gas Boiler Scope 1", "category": "Scope 1 (Direct)", "factor": 2.05, "unit": "cubic meters"}
    ]
    factors_map = {}
    for f in factors:
        existing = db.query(EmissionFactor).filter(EmissionFactor.name == f["name"]).first()
        if not existing:
            cat_id = categories_map[f["category"]]
            existing = EmissionFactor(
                name=f["name"],
                category_id=cat_id,
                source="EPA GHG Emissions Factors Hub",
                factor=f["factor"],
                unit=f["unit"],
                status="active"
            )
            db.add(existing)
            db.commit()
            db.refresh(existing)
        factors_map[f["name"]] = existing.id

    # 5. Carbon Transactions (Timeline of last 12 months)
    now = datetime.datetime.utcnow()
    for month_offset in range(11, -1, -1):
        tx_date = now - datetime.timedelta(days=month_offset * 30 + random.randint(0, 10))
        # Add 3 transactions per month for different departments
        for dept_id in [1, 2, 3, 4]:
            qty = random.randint(100, 3000)
            if dept_id == 1:
                factor_name = "Electricity Grid Scope 2"
            elif dept_id == 2:
                factor_name = "Commercial Aviation Scope 3"
            elif dept_id == 3:
                factor_name = "Natural Gas Boiler Scope 1"
            else:
                factor_name = "Diesel Stationary Generator Scope 1"
            
            fid = factors_map[factor_name]
            calc_val = qty * factors[list(factors_map.keys()).index(factor_name)]["factor"]
            
            tx = CarbonTransaction(
                department_id=dept_id,
                emission_factor_id=fid,
                quantity=float(qty),
                calculated_carbon=float(calc_val),
                source=f"Automated Utility Metering Q{random.randint(1,4)}",
                reference=f"REF-{tx_date.year}-{month_offset}-{dept_id}",
                transaction_date=tx_date,
                status="approved",
                notes=f"Periodic ESG compliance log seeded dynamically for {tx_date.strftime('%B %Y')} timeline data."
            )
            db.add(tx)
    db.commit()

    # 6. CSR Activities
    activities = [
        {"name": "Global Tree Planting Day 2026", "desc": "Urban reforestation initiative to offset corporate scope 3 emissions.", "mult": 15, "evidence": True},
        {"name": "Coastal Ocean Cleanup", "desc": "Volunteering to recover plastic from marine habitats.", "mult": 12, "evidence": True},
        {"name": "E-Waste Recycling Campaign", "desc": "Safe recycling drive for corporate laptops, batteries, and screens.", "mult": 10, "evidence": False}
    ]
    act_seeded = []
    for act in activities:
        new_act = CSRActivity(
            name=act["name"],
            description=act["desc"],
            points_multiplier=act["mult"],
            start_date=now - datetime.timedelta(days=15),
            end_date=now + datetime.timedelta(days=15),
            evidence_required=act["evidence"],
            status="active"
        )
        db.add(new_act)
        db.commit()
        db.refresh(new_act)
        act_seeded.append(new_act)

    # CSR Participations
    all_users = [current_user] + users_seeded
    for idx, u in enumerate(all_users):
        hours = random.randint(3, 10)
        act = act_seeded[idx % len(act_seeded)]
        p = CSRParticipation(
            user_id=u.id,
            csr_activity_id=act.id,
            hours_spent=float(hours),
            points_earned=int(hours * act.points_multiplier),
            evidence_url="http://ecopilot-assets.internal/evidence/proof.jpg" if act.evidence_required else None,
            status="approved" if idx % 2 == 0 else "pending",
            approved_by=current_user.id if idx % 2 == 0 else None,
            approved_at=now if idx % 2 == 0 else None,
            feedback="Excellent volunteering contribution!" if idx % 2 == 0 else None
        )
        db.add(p)
    db.commit()

    # 7. Trainings & Completions
    trainings = [
        {"title": "ESG Governance Frameworks & SEC Alignments", "hours": 2.5},
        {"title": "Scope 3 Supply Chain Emission Accounting", "hours": 4.0},
        {"title": "Zero Waste Workplace & Circular Economies", "hours": 1.5}
    ]
    train_seeded = []
    for tr in trainings:
        new_tr = Training(
            title=tr["title"],
            description=f"Seeded training material for ESG certification of {tr['title']}.",
            duration_hours=tr["hours"],
            status="active"
        )
        db.add(new_tr)
        db.commit()
        db.refresh(new_tr)
        train_seeded.append(new_tr)

    for idx, u in enumerate(all_users):
        tr = train_seeded[idx % len(train_seeded)]
        tc = TrainingCompletion(
            user_id=u.id,
            training_id=tr.id,
            completed_at=now - datetime.timedelta(days=random.randint(1, 30)),
            score=float(random.randint(85, 100)),
            status="completed"
        )
        db.add(tc)
    db.commit()

    # 8. Diversity Metrics
    for dept_id in [1, 2, 3, 4, 5]:
        dm1 = DiversityMetric(department_id=dept_id, metric_name="Gender Diversity (Female %)", value=float(random.randint(35, 55)))
        dm2 = DiversityMetric(department_id=dept_id, metric_name="Underrepresented Groups %", value=float(random.randint(15, 30)))
        db.add(dm1)
        db.add(dm2)
    db.commit()

    # 9. Governance: Audits & Compliance Issues
    audits = [
        {"title": "Annual Carbon Disclosure Audit 2025", "scope": "Scope 1 and 2 electricity & boilers verification", "findings": "Full conformity verified. 4 departments within 5% of direct metering indexes.", "status": "completed"},
        {"title": "Q2 Supply Chain Compliance Audit", "scope": "Scope 3 distributor shipping logs inspection", "findings": "Some shipping invoices missing exact carbon coefficients. Recommendations submitted.", "status": "approved"}
    ]
    for au in audits:
        new_au = Audit(
            title=au["title"],
            auditor_id=current_user.id,
            scope=au["scope"],
            findings=au["findings"],
            status=au["status"],
            audit_date=now - datetime.timedelta(days=20)
        )
        db.add(new_au)
    db.commit()

    compliance = [
        {"title": "Tokyo Facility Generator Fuel Metering Mismatch", "desc": "The local utility billing showed a 12% divergence from manual generator logs.", "status": "open", "sev": "high"},
        {"title": "Berlin Factory Supply Chain Certificate Overdue", "desc": "Renewable energy warranty document needs re-upload for Q2 verification.", "status": "open", "sev": "medium"},
        {"title": "HQ Office Air Conditioning Filter Recalibration", "desc": "HVAC system filter certificates confirmed matching standards.", "status": "resolved", "sev": "low"}
    ]
    for co in compliance:
        new_co = ComplianceIssue(
            title=co["title"],
            description=co["desc"],
            owner_id=current_user.id,
            due_date=now + datetime.timedelta(days=random.randint(5, 30)),
            status=co["status"],
            severity=co["sev"]
        )
        db.add(new_co)
    db.commit()

    # 10. Gamification Challenges
    challenges = [
        {"title": "Zero Printer Paper Sprint", "desc": "Avoid physical paper printing across the office for 14 calendar days.", "xp": 250},
        {"title": "Car-free Commute Month", "desc": "Use public transit, bicycle, or walk to work. Earn points per verified green commute.", "xp": 500},
        {"title": "Energy Offset Hackathon", "desc": "Build energy reduction scripts to toggle unused server groups off.", "xp": 400}
    ]
    for ch in challenges:
        new_ch = Challenge(
            title=ch["title"],
            description=ch["desc"],
            xp_reward=ch["xp"],
            start_date=now - datetime.timedelta(days=5),
            end_date=now + datetime.timedelta(days=25),
            status="active"
        )
        db.add(new_ch)
        db.commit()
        db.refresh(new_ch)
        # Register participations
        for u in all_users:
            cp = ChallengeParticipation(
                user_id=u.id,
                challenge_id=new_ch.id,
                progress=float(random.randint(20, 80)),
                status="active"
            )
            db.add(cp)
    db.commit()

    # 11. Badges & Rewards
    badges = [
        {"name": "Carbon Champion", "desc": "Unlocked by completing over 5 approved carbon transaction logs.", "icon": "carbon_champion.png", "rule": "carbon_count >= 5"},
        {"name": "Green Citizen", "desc": "Earned for participating in coastal or tree planting initiatives.", "icon": "green_citizen.png", "rule": "csr_participated >= 2"},
        {"name": "Audit Master", "desc": "Awarded for resolving active governance or compliance tasks.", "icon": "audit_master.png", "rule": "resolved_compliance >= 1"}
    ]
    badges_seeded = []
    for bg in badges:
        existing = db.query(Badge).filter(Badge.name == bg["name"]).first()
        if not existing:
            existing = Badge(name=bg["name"], description=bg["desc"], icon=bg["icon"], unlock_rule=bg["rule"], status="active")
            db.add(existing)
            db.commit()
            db.refresh(existing)
        badges_seeded.append(existing)

    # Award first badge to current user
    if badges_seeded:
        ub = UserBadge(user_id=current_user.id, badge_id=badges_seeded[0].id, unlocked_at=now)
        db.add(ub)
    db.commit()

    rewards = [
        {"name": "Organic Cotton Corporate Hoodie", "desc": "Cozy, sustainably sourced hoodies with the EcoPilot logo.", "points": 500, "stock": 25},
        {"name": "Premium Reusable Glass Water Bottle", "desc": "Keep drinks hot or cold. Made from recycled tempered glass.", "points": 300, "stock": 40},
        {"name": "Forest Conservation Tree Donation", "desc": "We will plant 5 trees on behalf of your achievement.", "points": 200, "stock": 100}
    ]
    for rw in rewards:
        existing = db.query(Reward).filter(Reward.name == rw["name"]).first()
        if not existing:
            existing = Reward(name=rw["name"], description=rw["desc"], points_required=rw["points"], stock=rw["stock"], status="active")
            db.add(existing)
    db.commit()

    # 12. Notifications
    notifs = [
        {"title": "ESG Compliance Audit Complete", "msg": "Annual Carbon Disclosure Audit 2025 reports resolved with 100% SEC compliance alignment.", "type": "audit"},
        {"title": "New Volunteering Event Live", "msg": "Community Tree Planting Day 2026 starts in 5 days. Reserve your spot!", "type": "csr"},
        {"title": "High Severity Compliance Alert", "msg": "Tokyo Facility Generator Fuel Metering Mismatch requires immediate attention.", "type": "governance"}
    ]
    for nf in notifs:
        new_nf = Notification(
            user_id=current_user.id,
            title=nf["title"],
            message=nf["msg"],
            type=nf["type"],
            is_read=False
        )
        db.add(new_nf)
    db.commit()

    return {"message": "Demo mode successfully loaded! Interactive dashboard, carbon trends, leaderboard players, and regulatory notifications seeded."}
