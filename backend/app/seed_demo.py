import sys
import os
import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database.session import SessionLocal, engine, Base
from backend.app.models.role import Role
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.category import Category
from backend.app.models.emission_factor import EmissionFactor
from backend.app.models.environmental_goal import EnvironmentalGoal
from backend.app.models.carbon_transaction import CarbonTransaction
from backend.app.models.social import CSRActivity, CSRParticipation, Training, TrainingCompletion, DiversityMetric
from backend.app.models.governance import Audit, ComplianceIssue
from backend.app.models.policy import Policy
from backend.app.models.gamification import Challenge
from backend.app.models.badge import Badge
from backend.app.models.reward import Reward
from backend.app.security.hashing import hash_password
from sqlalchemy import func

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Roles (if empty)
        roles = {
            "Admin": "System Administrator",
            "ESG Manager": "Corporate ESG Manager",
            "Department Manager": "Departmental Manager",
            "Employee": "Corporate Employee",
            "Auditor": "Third-party ESG Auditor"
        }
        db_roles = {}
        for role_name, desc in roles.items():
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                permissions = ["read:all", "write:all", "delete:all"] if role_name == "Admin" else ["read:all"]
                role = Role(name=role_name, description=desc, permissions=permissions)
                db.add(role)
                db.commit()
                db.refresh(role)
            db_roles[role_name] = role

        # 2. Seed Departments
        depts_data = [
            ("Operations & Logistics", "OPS", "Sarah Jenkins", 120, "Global supply chain, fleet operations, and shipping logistics"),
            ("Research & Development", "RD", "Dr. David Vance", 85, "Sustainable product design and engineering innovations"),
            ("Corporate Marketing & Sales", "MKT", "Elena Rostova", 65, "Brand outreach, communications, and client management"),
            ("Human Resources & Administration", "HR", "James Vance", 40, "Talent acquisition, employee wellness, and corporate office administration"),
            ("Finance & Legal Counsel", "FIN", "Marcus Sterling", 25, "Corporate reporting, legal audits, and sustainability finance")
        ]
        db_depts = []
        for name, code, head, count, desc in depts_data:
            dept = db.query(Department).filter(Department.name == name).first()
            if not dept:
                dept = Department(name=name, code=code, head=head, employee_count=count, description=desc)
                db.add(dept)
                db.commit()
                db.refresh(dept)
            db_depts.append(dept)

        # 3. Seed Users
        users_data = [
            ("analyst@ecopilot.com", "Senior ESG", "Analyst", "Admin", db_depts[4].id),
            ("manager@ecopilot.com", "Helena", "Sass", "ESG Manager", db_depts[1].id),
            ("dept@ecopilot.com", "Sarah", "Jenkins", "Department Manager", db_depts[0].id),
            ("employee@ecopilot.com", "Jack", "Greenwood", "Employee", db_depts[2].id),
            ("auditor@ecopilot.com", "Arthur", "Pendelton", "Auditor", db_depts[3].id)
        ]
        for email, f_name, l_name, r_name, d_id in users_data:
            usr = db.query(User).filter(User.email == email).first()
            if not usr:
                pwd_hash = hash_password("password123")
                usr = User(
                    first_name=f_name,
                    last_name=l_name,
                    email=email,
                    password=pwd_hash,
                    role_id=db_roles[r_name].id,
                    department_id=d_id,
                    is_active=True,
                    status="active",
                    xp_points=1200 if email == "employee@ecopilot.com" else 150,
                    points_balance=800 if email == "employee@ecopilot.com" else 100
                )
                db.add(usr)
                db.commit()

        # 4. Seed Categories
        cats = [
            ("Direct Emissions (Scope 1)", "Scope 1", "Fuel combustion, company vehicles, and fugitive emissions"),
            ("Indirect Emissions (Scope 2)", "Scope 2", "Purchased electricity, steam, heating and cooling for operations"),
            ("Value Chain Emissions (Scope 3)", "Scope 3", "Purchased goods, business travel, waste disposal, and logistics")
        ]
        db_cats = []
        for name, type_val, desc in cats:
            cat = db.query(Category).filter(Category.name == name).first()
            if not cat:
                cat = Category(name=name, type=type_val, description=desc)
                db.add(cat)
                db.commit()
                db.refresh(cat)
            db_cats.append(cat)

        # 5. Seed Emission Factors
        factors = [
            ("Fleet Diesel", "EPA 2026", db_cats[0].id, 2.68, "L", "Scope 1 fleet combustion factors"),
            ("Natural Gas Heating", "DEFRA 2025", db_cats[0].id, 2.03, "m3", "Scope 1 stationary heating"),
            ("Purchased Grid Electricity", "IEA 2026", db_cats[1].id, 0.42, "kWh", "Scope 2 location-based grid factors"),
            ("Commercial Jet Business Flight", "DEFRA 2025", db_cats[2].id, 0.18, "km", "Scope 3 passenger travel emissions")
        ]
        db_factors = []
        for name, src, cat_id, val, unit, desc in factors:
            factor = db.query(EmissionFactor).filter(EmissionFactor.name == name).first()
            if not factor:
                factor = EmissionFactor(name=name, source=src, category_id=cat_id, factor=val, unit=unit, description=desc)
                db.add(factor)
                db.commit()
                db.refresh(factor)
            db_factors.append(factor)

        # 6. Seed Carbon Transactions
        today = datetime.date.today()
        txs = [
            (db_depts[0].id, db_factors[0].id, 1200.0, "Scope 1 fleet logs", "REF-001", today - datetime.timedelta(days=90)),
            (db_depts[0].id, db_factors[2].id, 8500.0, "HQ Electricity usage", "REF-002", today - datetime.timedelta(days=75)),
            (db_depts[1].id, db_factors[2].id, 4500.0, "R&D Lab Grid logs", "REF-003", today - datetime.timedelta(days=60)),
            (db_depts[2].id, db_factors[3].id, 12000.0, "Executive Flight tickets", "REF-004", today - datetime.timedelta(days=45)),
            (db_depts[3].id, db_factors[2].id, 3200.0, "Admin office utility", "REF-005", today - datetime.timedelta(days=30)),
            (db_depts[4].id, db_factors[2].id, 2200.0, "Finance Suite electric", "REF-006", today - datetime.timedelta(days=15)),
            (db_depts[0].id, db_factors[0].id, 1450.0, "Fleet refuel", "REF-007", today - datetime.timedelta(days=5)),
            (db_depts[1].id, db_factors[1].id, 800.0, "R&D lab furnace heating", "REF-008", today)
        ]
        for d_id, f_id, qty, src, ref, date in txs:
            factor_val = db.query(EmissionFactor).filter(EmissionFactor.id == f_id).first().factor
            tx = db.query(CarbonTransaction).filter(CarbonTransaction.reference == ref).first()
            if not tx:
                tx = CarbonTransaction(
                    department_id=d_id,
                    emission_factor_id=f_id,
                    quantity=qty,
                    calculated_carbon=qty * factor_val,
                    source=src,
                    reference=ref,
                    transaction_date=date,
                    status="approved"
                )
                db.add(tx)
                db.commit()

        # 7. Seed Environmental Goals
        goals = [
            ("Operations Net-Zero Target", db_depts[0].id, 10000.0, today + datetime.timedelta(days=180)),
            ("R&D Electricity Minimization", db_depts[1].id, 5000.0, today + datetime.timedelta(days=120)),
            ("Executive Travel Reduction Goal", db_depts[2].id, 20000.0, today + datetime.timedelta(days=240))
        ]
        for title, d_id, target, deadline in goals:
            g = db.query(EnvironmentalGoal).filter(EnvironmentalGoal.title == title).first()
            if not g:
                total_carbon = db.query(func.sum(CarbonTransaction.calculated_carbon))\
                    .filter(CarbonTransaction.department_id == d_id)\
                    .filter(CarbonTransaction.status == "approved")\
                    .filter(CarbonTransaction.is_deleted == False)\
                    .scalar() or 0.0
                g = EnvironmentalGoal(
                    title=title,
                    department_id=d_id,
                    target=target,
                    current_progress=min(total_carbon, target),
                    deadline=deadline,
                    status="completed" if total_carbon >= target else "active"
                )
                db.add(g)
                db.commit()

        # 8. Seed CSR Activities
        csr_activities = [
            ("Community Tree Planting Initiative", "Help plant trees in local areas to restore the community ecosystem", 15.0, today - datetime.timedelta(days=10), today + datetime.timedelta(days=30), True, "active"),
            ("Corporate Electronic Waste recycling Drive", "Bring and recycle old company computers, cables, and phones", 10.0, today - datetime.timedelta(days=5), today + datetime.timedelta(days=15), False, "active"),
            ("Solar Panel Assembly Volunteering", "Assist local school with assembly of small scale green solar panels", 25.0, today, today + datetime.timedelta(days=45), True, "active")
        ]
        for name, desc, mult, s_date, e_date, ev_req, status in csr_activities:
            act = db.query(CSRActivity).filter(CSRActivity.name == name).first()
            if not act:
                act = CSRActivity(
                    name=name,
                    description=desc,
                    points_multiplier=mult,
                    start_date=s_date,
                    end_date=e_date,
                    evidence_required=ev_req,
                    status=status
                )
                db.add(act)
                db.commit()

        # 9. Seed Trainings
        trainings = [
            ("Introduction to Corporate ESG Standards", "Core training regarding corporate carbon policies and benchmarks.", db_depts[3].id, 3.0, "active"),
            ("Scope 1, 2 & 3 Emission Factors Calculations", "Detailed breakdown of greenhouse gas calculation metrics.", db_depts[1].id, 5.0, "active")
        ]
        for title, desc, d_id, duration, status in trainings:
            tr = db.query(Training).filter(Training.title == title).first()
            if not tr:
                tr = Training(title=title, description=desc, department_id=d_id, duration_hours=duration, status=status)
                db.add(tr)
                db.commit()

        # 10. Seed Diversity Metrics
        metrics = [
            (db_depts[0].id, "Gender Parity Ratio", 48.2),
            (db_depts[1].id, "Underrepresented Minorities", 32.5),
            (db_depts[2].id, "Gender Parity Ratio", 52.0),
            (db_depts[3].id, "Underrepresented Minorities", 42.1)
        ]
        for d_id, m_name, val in metrics:
            dm = db.query(DiversityMetric).filter(DiversityMetric.department_id == d_id, DiversityMetric.metric_name == m_name).first()
            if not dm:
                dm = DiversityMetric(department_id=d_id, metric_name=m_name, value=val)
                db.add(dm)
                db.commit()

        # 11. Seed Policies
        policies = [
            ("Environmental & Climate Protection Charter", "Our commitment to decrease total carbon output by 50% by 2030.", "active"),
            ("Corporate Ethical Behavior and Code of Conduct", "Comprehensive anti-corruption guidelines, client protections, and fair audit policies.", "active"),
            ("Workplace Diversity and Non-Discrimination Directive", "HR charter for maintaining equality in recruitment, pay scale, and promotions.", "active")
        ]
        for title, desc, status in policies:
            pol = db.query(Policy).filter(Policy.title == title).first()
            if not pol:
                pol = Policy(title=title, description=desc, effective_date=today, status=status)
                db.add(pol)
                db.commit()

        # 12. Seed Audits
        audits = [
            ("Greenhouse Gas Emissions Inventory Audit", "Independent audit of Scope 1, 2 and 3 emissions for SEC compliance.", "Scope 1, 2, 3 verification", "Clean opinion. No major tracking errors noted.", "approved", today - datetime.timedelta(days=60)),
            ("Supplier Diversity & CSR Alignment Check", "Evaluation of sustainable purchasing behaviors among global vendors.", "Supplier chain auditing", "Recommend expansion of local vendor base.", "pending", today)
        ]
        for title, scope, findings, feedback, status, date in audits:
            aud = db.query(Audit).filter(Audit.title == title).first()
            if not aud:
                aud = Audit(
                    title=title,
                    auditor_id=1, # Admin user ID
                    scope=scope,
                    findings=findings,
                    status=status,
                    audit_date=date
                )
                db.add(aud)
                db.commit()

        # 13. Seed Compliance Issues
        compliance_issues = [
            ("HQ Logistics Scope 3 reporting delay", "Operations has not finalized third-party logistics emission logs for Q1.", 1, today + datetime.timedelta(days=14), "open", "Medium"),
            ("Overdue SEC corporate diversity review", "HR needs to submit final diversity audits. Due date has passed.", 1, today - datetime.timedelta(days=3), "open", "High")
        ]
        for title, desc, owner_id, due, status, severity in compliance_issues:
            iss = db.query(ComplianceIssue).filter(ComplianceIssue.title == title).first()
            if not iss:
                iss = ComplianceIssue(
                    title=title,
                    description=desc,
                    owner_id=owner_id,
                    due_date=due,
                    status=status,
                    severity=severity
                )
                db.add(iss)
                db.commit()

        # 14. Seed Challenges
        challenges = [
            ("Zero-Waste Week Champion", "Commit to producing zero plastic trash for one whole week", 100.0, "active"),
            ("Bike / Walk to Work Month", "Use zero-emission commute styles for at least 15 working days", 250.0, "active"),
            ("Green Office Idea Proposal", "Submit an innovative proposal for improving energy efficiency at HQ", 500.0, "active")
        ]
        for title, desc, xp, status in challenges:
            ch = db.query(Challenge).filter(Challenge.title == title).first()
            if not ch:
                now_dt = datetime.datetime.utcnow()
                ch = Challenge(
                    title=title,
                    description=desc,
                    xp_reward=int(xp),
                    status=status,
                    start_date=now_dt,
                    end_date=now_dt + datetime.timedelta(days=30)
                )
                db.add(ch)
                db.commit()

        # 15. Seed Badges
        badges = [
            ("Carbon Saver", "Logged first carbon offset transaction", "badge_carbon.png", "log_carbon"),
            ("Social Advocate", "Participated in 3 or more CSR initiatives", "badge_social.png", "csr_count"),
            ("Compliance Officer", "Completed SEC and ethical standard policy trainings", "badge_gov.png", "training_complete")
        ]
        for name, desc, img, rule in badges:
            bg = db.query(Badge).filter(Badge.name == name).first()
            if not bg:
                bg = Badge(name=name, description=desc, icon=img, unlock_rule=rule)
                db.add(bg)
                db.commit()

        # 16. Seed Rewards
        rewards = [
            ("Organic Deskside Plant", "A custom office desk plant that purifies your workspace air.", 150, 10),
            ("EcoPilot Branded Bamboo Mug", "Premium reusable bamboo travel coffee mug.", 300, 5),
            ("Volunteer Day Paid Leave", "One fully paid day of corporate leave dedicated to CSR activities.", 1200, 2)
        ]
        for name, desc, cost, qty in rewards:
            rew = db.query(Reward).filter(Reward.name == name).first()
            if not rew:
                rew = Reward(name=name, description=desc, points_required=cost, stock=qty)
                db.add(rew)
                db.commit()

        print("EcoPilot demo data successfully seeded!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
