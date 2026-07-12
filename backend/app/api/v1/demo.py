import datetime
import random
from fastapi import APIRouter, Depends, status, HTTPException
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
from backend.app.models.environmental_goal import EnvironmentalGoal
from backend.app.models.settings_notifications import Notification
from backend.app.security.hashing import hash_password

router = APIRouter()

@router.post("/seed", status_code=status.HTTP_200_OK)
async def seed_demo_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Clear previous transactional, governance, social, gamification, and target data
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
    db.query(EnvironmentalGoal).delete()
    db.query(Policy).delete()
    
    # Delete non-admin / non-primary users to avoid duplicate email constraint failures
    db.query(User).filter(User.email != current_user.email, User.email != "analyst@ecopilot.com").delete()
    
    # Delete departments
    db.query(Department).delete()
    db.commit()

    # 1. Seed 10 Departments
    depts_data = [
        {"id": 1, "name": "Manufacturing & Assembly", "code": "MFG-01", "description": "High-intensity manufacturing, product assembly, and packaging"},
        {"id": 2, "name": "Human Resources & Talent", "code": "HR-02", "description": "Talent acquisition, corporate culture, training, and welfare"},
        {"id": 3, "name": "Finance & Accounting", "code": "FIN-03", "description": "Capital allocation, auditing, tax filing, and ESG financial reports"},
        {"id": 4, "name": "IT & Systems Infrastructure", "code": "IT-04", "description": "Global server networks, cloud systems, devices, and software engineering"},
        {"id": 5, "name": "Operations & Logistics", "code": "OPS-05", "description": "Supply chain warehousing, global logistics, and shipping fleets"},
        {"id": 6, "name": "Legal & Corporate Governance", "code": "LGL-06", "description": "Regulatory audit compliance, legal risk oversight, and standard filings"},
        {"id": 7, "name": "Marketing & Communications", "code": "MKT-07", "description": "Outreach campaigns, branding, corporate disclosures, and sustainability events"},
        {"id": 8, "name": "Sales & Client Management", "code": "SLS-08", "description": "Commercial outreach, client portfolio management, and customer relations"},
        {"id": 9, "name": "Research & Development", "code": "RD-09", "description": "Sustainable material science, product research, and green design labs"},
        {"id": 10, "name": "Procurement & Sourcing", "code": "PRC-10", "description": "Vendor management, supply contract vetting, and resource acquisition"}
    ]
    
    depts = []
    for d in depts_data:
        new_d = Department(
            id=d["id"], 
            name=d["name"], 
            code=d["code"], 
            description=d["description"], 
            status="active"
        )
        db.add(new_d)
        depts.append(new_d)
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

    # Align current user
    current_user.xp_points = 3250
    current_user.points_balance = 1600
    current_user.department_id = 1  # Manufacturing
    db.add(current_user)
    db.commit()

    # 3. Seed 50 Employees (distributed across the 10 departments)
    first_names = [
        "Marcus", "Aiko", "Hans", "Sarah", "Elena", "Alex", "Chloe", "Devon", "Emily", "Fahad",
        "Grace", "Hiroshi", "Isabella", "Javier", "Kiara", "Liam", "Mei", "Nathan", "Olivia", "Priya",
        "Quentin", "Rachel", "Samir", "Tanya", "Ulysses", "Valerie", "Wyatt", "Ximena", "Yusuf", "Zoe",
        "Amara", "Blake", "Cassandra", "Dimitri", "Evelyn", "Felix", "Gemma", "Hugo", "Iris", "Julian",
        "Kai", "Lana", "Mateo", "Nadia", "Oliver", "Penelope", "Ryder", "Sophia", "Tristan", "Uma"
    ]
    last_names = [
        "Vance", "Sato", "Mueller", "Jenkins", "Rostova", "Chen", "Dupont", "Patel", "Silva", "Al-Farsi",
        "Kim", "Tanaka", "Rossi", "Gomez", "Nkosi", "O'Connor", "Wong", "Novak", "Muller", "Sharma",
        "Lefevre", "Sokolov", "Nair", "Petrov", "Esposito", "Costa", "Olsen", "Romero", "Demir", "Santos",
        "Diallo", "Sinclair", "Sterling", "Kovacs", "Hansen", "Moreau", "Ricci", "Hasegawa", "Morales", "Peters",
        "Abadi", "Lindqvist", "Ortega", "Popov", "Fisher", "Preston", "Vargas", "Zanetti", "Yilmaz", "Alves"
    ]
    
    password_hash = hash_password("password123")
    employees = []
    
    # Ensure role IDs exist
    dept_mgr_role_id = role_map["department manager"]
    employee_role_id = role_map["employee"]
    
    for i in range(50):
        fname = first_names[i % len(first_names)]
        lname = last_names[i % len(last_names)]
        email = f"{fname.lower()}.{lname.lower()}@ecopilot.internal"
        
        # Distribute across departments 1 to 10
        dept_id = (i % 10) + 1
        
        # Decide role (1 Manager per department, others are normal employees)
        role_id = dept_mgr_role_id if i < 10 else employee_role_id
        
        # High starting XP for IT staff to lead sustainability challenges
        base_xp = 1800 + random.randint(100, 900) if dept_id == 4 else 400 + random.randint(50, 600)
        base_balance = base_xp // 2
        
        new_emp = User(
            first_name=fname,
            last_name=lname,
            email=email,
            password=password_hash,
            role_id=role_id,
            department_id=dept_id,
            xp_points=base_xp,
            points_balance=base_balance,
            status="active",
            is_active=True
        )
        db.add(new_emp)
        employees.append(new_emp)
        
    db.commit()

    # Get a merged list of all users for activity assignments
    all_users = [current_user] + employees

    # 4. Seed Scope Categories & Emission Factors
    categories_data = [
        {"name": "Scope 1 (Direct)", "type": "environmental", "description": "Direct greenhouse gas emissions from sources owned or controlled by the organization."},
        {"name": "Scope 2 (Indirect)", "type": "environmental", "description": "Indirect greenhouse gas emissions from the generation of purchased electricity, heating, or cooling."},
        {"name": "Scope 3 (Indirect)", "type": "environmental", "description": "Other indirect emissions in the value chain, both upstream and downstream."}
    ]
    categories_map = {}
    for c in categories_data:
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

    factors_data = [
        {"name": "Electricity Grid Scope 2", "category": "Scope 2 (Indirect)", "factor": 0.47, "unit": "kWh"},
        {"name": "Commercial Aviation Scope 3", "category": "Scope 3 (Indirect)", "factor": 0.18, "unit": "km"},
        {"name": "Diesel Stationary Generator Scope 1", "category": "Scope 1 (Direct)", "factor": 2.68, "unit": "liters"},
        {"name": "Natural Gas Boiler Scope 1", "category": "Scope 1 (Direct)", "factor": 2.05, "unit": "cubic meters"}
    ]
    factors_map = {}
    for f in factors_data:
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
        factors_map[f["name"]] = (existing.id, f["factor"])

    # 5. Seed 200 Carbon Transactions spread over the last 12 months
    # Real trend: Manufacturing (dept_id=1) must have the highest emissions
    now = datetime.datetime.utcnow()
    transactions_count = 200
    
    for i in range(transactions_count):
        # Evenly spread over 12 months (360 days)
        day_offset = int((i / transactions_count) * 360)
        tx_date = now - datetime.timedelta(days=day_offset)
        
        # Pick department
        # Give Manufacturing (1) a higher share of transactions (e.g. 30%)
        if random.random() < 0.30:
            dept_id = 1
        else:
            dept_id = random.randint(2, 10)
            
        # Select factor
        factor_name = random.choice(list(factors_map.keys()))
        fid, factor_value = factors_map[factor_name]
        
        # Quantity calculation: Manufacturing outputs 10x more than other departments
        if dept_id == 1:
            qty = random.uniform(5000.0, 25000.0)
        else:
            qty = random.uniform(100.0, 1500.0)
            
        calc_carbon = qty * factor_value
        
        tx = CarbonTransaction(
            department_id=dept_id,
            emission_factor_id=fid,
            quantity=float(qty),
            calculated_carbon=float(calc_carbon),
            source="Automated IoT Sensors" if dept_id == 1 else "Corporate Accounting Import",
            reference=f"TX-{tx_date.year}-{tx_date.month:02d}-{i:03d}",
            transaction_date=tx_date,
            status="approved",
            notes=f"ESG ledger entry for {factor_name} compiled on timeline logs."
        )
        db.add(tx)
    db.commit()

    # 6. Seed 25 CSR Activities
    csr_titles = [
        "Local Reforestation Initiative", "Urban Beach Cleanup", "Electronic Recycling Drive", 
        "Solar Panel Installation Volunteering", "Community Green Garden Setup", "Zero Waste Workshop Hosting",
        "Public Park Restoration", "Energy Saving Awareness Seminars", "Sustainably Sourced Food Fair",
        "Corporate Bicycle Ride Drive", "Organic Farming Volunteering", "Eco-Design Material Fair Support",
        "Corporate Eco-Mentoring Program", "School Environmental Lectures", "River Cleanup Campaign",
        "Wildlife Habitat Restoration", "Green Building Painting Project", "LED Light Bulb Retrofitting Community Drive",
        "Composting Program Setup", "Corporate Carbon Offsetting Drive", "Water Preservation Workshop",
        "Sponsoring Sustainable Tech Hackathons", "Corporate Thrift and Clothing Swap", "Plastic Waste Sorting Drive",
        "Building Recycled Material Benches"
    ]
    
    activities = []
    for idx, name in enumerate(csr_titles):
        new_act = CSRActivity(
            name=name,
            description=f"Seeded CSR action for corporate volunteerism: {name}.",
            points_multiplier=random.randint(10, 20),
            start_date=now - datetime.timedelta(days=random.randint(10, 200)),
            end_date=now + datetime.timedelta(days=random.randint(5, 30)),
            evidence_required=random.choice([True, False]),
            status="active"
        )
        db.add(new_act)
        db.commit()
        db.refresh(new_act)
        activities.append(new_act)

    # Seed CSR Participations
    # Real trend: HR (dept_id=2) has the highest CSR participation (register them for almost all activities)
    for u in all_users:
        if u.department_id == 2: # HR
            # Register for 15-20 activities
            reg_activities = random.sample(activities, k=random.randint(15, 20))
        else:
            # Register for 1-3 activities
            reg_activities = random.sample(activities, k=random.randint(1, 3))
            
        for act in reg_activities:
            hours = random.uniform(3.0, 12.0)
            points = int(hours * act.points_multiplier)
            
            p = CSRParticipation(
                user_id=u.id,
                csr_activity_id=act.id,
                hours_spent=float(hours),
                points_earned=points,
                evidence_url="http://ecopilot-assets.internal/evidence/proof.jpg" if act.evidence_required else None,
                status="approved",
                approved_by=current_user.id,
                approved_at=now - datetime.timedelta(days=1),
                feedback="Excellent volunteering contribution!"
            )
            db.add(p)
    db.commit()

    # 7. Seed 20 Gamification Challenges
    challenge_names = [
        "Zero Printer Paper Week", "Green Commuting Challenge", "HVAC Smart Savings Hackathon", 
        "Plastic-Free Canteen Month", "Stairs Over Elevator Challenge", "BYOB (Bring Your Own Bottle)", 
        "Power-Down Friday", "Zero Food Waste Challenge", "Sustainable Packaging Sprint", 
        "Office Plant Planting Campaign", "Smart Printing Challenge", "Vegetarian Lunch Challenge", 
        "Audit Completion Race", "Light Bulb Switch Marathon", "Thermostat Optimization Race", 
        "Supply Chain Sourcing Audit Challenge", "Green Logistics Optimization Sprint", 
        "Eco-friendly Workspace Design Competition", "Energy Star Device Inventory Challenge", 
        "EcoPilot Master Certification Quiz"
    ]
    
    challenges = []
    for idx, name in enumerate(challenge_names):
        new_ch = Challenge(
            title=name,
            description=f"Seeded corporate sustainability challenge: {name}.",
            xp_reward=random.randint(200, 600),
            start_date=now - datetime.timedelta(days=random.randint(2, 20)),
            end_date=now + datetime.timedelta(days=random.randint(5, 30)),
            status="active"
        )
        db.add(new_ch)
        db.commit()
        db.refresh(new_ch)
        challenges.append(new_ch)

    # Seed Challenge Participations
    # Real trend: IT (dept_id=4) must lead sustainability challenges
    for u in all_users:
        if u.department_id == 4: # IT
            # Participate in almost all, with progress 85-100%
            part_challenges = random.sample(challenges, k=random.randint(15, 20))
            for ch in part_challenges:
                cp = ChallengeParticipation(
                    user_id=u.id,
                    challenge_id=ch.id,
                    progress=float(random.randint(85, 100)),
                    status="completed" if random.random() > 0.3 else "active"
                )
                db.add(cp)
        else:
            # Participate in 3-8 challenges, with progress 10-60%
            part_challenges = random.sample(challenges, k=random.randint(3, 8))
            for ch in part_challenges:
                cp = ChallengeParticipation(
                    user_id=u.id,
                    challenge_id=ch.id,
                    progress=float(random.randint(10, 60)),
                    status="active"
                )
                db.add(cp)
    db.commit()

    # 8. Seed 15 Audits spread over the last 12 months
    audit_titles = [
        "Scope 1 Direct Emission Validation", "Scope 2 Power Meter Verification", 
        "Annual Carbon Disclosure Audit 2025", "Q2 Supply Chain Audit",
        "HVAC Energy Consumption Assessment", "Social Diversity Auditing Report",
        "Water Preservation Conformity Assessment", "Office Solid Waste Recycling Audit",
        "IT Green Grid Power Audits", "Corporate Fleet Scope 1 Assessment",
        "Community Outreach & CSR Audit", "Scope 3 Commercial Logistics Audit",
        "Regulatory ESG Disclosures Alignment", "Green Building Design Verification",
        "Vendor Procurement Code Audit"
    ]
    for idx, title in enumerate(audit_titles):
        day_offset = int((idx / len(audit_titles)) * 360)
        audit_date = now - datetime.timedelta(days=day_offset)
        new_au = Audit(
            title=title,
            auditor_id=current_user.id,
            scope=f"Full review of targets and certification alignment for {title}.",
            findings="All operations found in conformity. Recommending quarterly automated logs.",
            status="completed" if idx % 3 != 0 else "approved",
            audit_date=audit_date
        )
        db.add(new_au)
    db.commit()

    # 9. Seed 25 Compliance Issues
    # Real trend: Finance (dept_id=3) should contain a few overdue/open issues
    compliance_titles = [
        "Finance Dept Travel Offset Disclosure Overdue", "Finance Audit Metric Deviation Log", 
        "Tokyo Facility Generator Fuel Mismatch", "Berlin Factory Certificate Verification Overdue", 
        "HQ Office Air Conditioning Filter Recalibration", "Scope 2 Utility Meter Calibration Mismatch", 
        "Procurement Vendor Code Verification Delays", "R&D Lab Bio-degradable Policy Mismatch", 
        "Marketing Disclosures Form 10-K Alignment Delay", "Logistics Shipping Log Verification Overdue",
        "Operations Water Waste Index Out of Bounds", "Factory Battery Storage Safety Certificate Renewal",
        "Server Power Efficiency Compliance Mismatch", "CSR Activity Evidence Mismatch",
        "Audit Log Verification Missing Signature", "Scope 3 Supplier Shipping Certificates Overdue",
        "IT Device Recycling Log Discrepancies", "HQ Building Carbon Intensity Audit Pending",
        "Underrepresented Groups Metric Mismatch", "Finance Vendor Carbon Pricing Discrepancy",
        "Manufacturing Facility Boiler Emissions Exceeded", "HR Employee Health Certification Missing",
        "Supply Chain Scope 3 Warranty Verification Overdue", "Finance Procurement Audits Discrepancy",
        "Operations Logistics Carrier Verification Delay"
    ]
    
    for idx, title in enumerate(compliance_titles):
        # Create a few overdue issues specifically for Finance (dept_id=3)
        # We assign them to current_user, but we can set description/notes indicating department.
        is_finance_overdue = (idx in [0, 1, 19, 23])
        
        due_date = now - datetime.timedelta(days=random.randint(15, 60)) if is_finance_overdue else now + datetime.timedelta(days=random.randint(10, 60))
        status_val = "open" if (is_finance_overdue or random.random() > 0.5) else "resolved"
        
        new_co = ComplianceIssue(
            title=title,
            description=f"Compliance checkup failed or requires updates: {title} in the Finance department." if is_finance_overdue else f"ESG regulatory verification item: {title}.",
            owner_id=current_user.id,
            due_date=due_date,
            status=status_val,
            severity="high" if is_finance_overdue else random.choice(["low", "medium", "high"])
        )
        db.add(new_co)
    db.commit()

    # 10. Seed 15 Policies & Policy Acknowledgements
    policy_titles = [
        "Responsible Business Travel Directive", "Single-Use Plastic Ban Policy", 
        "Green Supply Chain Procurement Mandate", "Server Room Power Optimization Policy", 
        "Hybrid Working Commute Reduction Policy", "Water Preservation Guidelines", 
        "Waste Diversion & Recycling Mandate", "ESG Vendor Code of Conduct", 
        "Social Diversity & Inclusivity Guidelines", "Sustainable Device Life Cycle Directive", 
        "Renewable Energy Sourcing Policy", "Corporate Carbon Neutrality Target Plan", 
        "Green Building Standard Policy", "Community Volunteering Benefit Plan", 
        "Digital Documentation & Zero Paper Policy"
    ]
    
    policies = []
    for title in policy_titles:
        new_p = Policy(
            title=title,
            description=f"SaaS Governance Guidelines for {title}. Outlines corporate ESG alignment criteria.",
            effective_date=(now - datetime.timedelta(days=random.randint(100, 300))).date(),
            status="active"
        )
        db.add(new_p)
        db.commit()
        db.refresh(new_p)
        policies.append(new_p)

    # Policy Acknowledgements (~100 entries)
    for _ in range(100):
        pa = PolicyAcknowledgement(
            user_id=random.choice(all_users).id,
            policy_id=random.choice(policies).id,
            acknowledged_at=now - datetime.timedelta(days=random.randint(1, 90))
        )
        db.add(pa)
    db.commit()

    # 11. Seed 40 Notifications
    notification_templates = [
        {"title": "ESG Compliance Audit Complete", "msg": "Audit reports resolved with compliance alignment.", "type": "audit"},
        {"title": "New Volunteering Event Live", "msg": "Community Tree Planting Day starts soon. Reserve your spot!", "type": "csr"},
        {"title": "High Severity Compliance Alert", "msg": "Finance department audit metric deviation requires immediate attention.", "type": "governance"},
        {"title": "Challenge Accomplished!", "msg": "Congratulations, you successfully completed the Zero Paper Sprint challenge!", "type": "gamification"},
        {"title": "Badge Unlocked!", "msg": "You unlocked the Carbon Champion achievement badge!", "type": "gamification"}
    ]
    for i in range(40):
        t = notification_templates[i % len(notification_templates)]
        new_nf = Notification(
            user_id=random.choice(all_users).id,
            title=f"{t['title']} #{i}",
            message=t['msg'],
            type=t['type'],
            is_read=random.choice([True, False])
        )
        db.add(new_nf)
    db.commit()

    # 12. Diversity Metrics
    for d in depts:
        dm1 = DiversityMetric(department_id=d.id, metric_name="Gender Diversity (Female %)", value=float(random.randint(35, 55)))
        dm2 = DiversityMetric(department_id=d.id, metric_name="Underrepresented Groups %", value=float(random.randint(15, 30)))
        db.add(dm1)
        db.add(dm2)
    db.commit()

    # 13. Environmental Goals
    goals_data = [
        {"title": "Reduce Total Carbon Footprint", "target": 50000.0, "current": 38400.0},
        {"title": "Increase CSR Hours", "target": 1200.0, "current": 980.0},
        {"title": "Complete Scope 3 Supplier Audits", "target": 10.0, "current": 8.0},
        {"title": "Train Workforce on Zero Waste", "target": 100.0, "current": 82.5}
    ]
    for gd in goals_data:
        g = EnvironmentalGoal(
            title=gd["title"],
            target=gd["target"],
            current_progress=gd["current"],
            deadline=(now + datetime.timedelta(days=120)).date(),
            status="active"
        )
        db.add(g)
    db.commit()

    # 14. Badges & Rewards
    badges_data = [
        {"name": "Carbon Champion", "desc": "Unlocked by completing over 5 approved carbon transaction logs.", "icon": "carbon_champion.png", "rule": "carbon_count >= 5"},
        {"name": "Green Citizen", "desc": "Earned for participating in coastal or tree planting initiatives.", "icon": "green_citizen.png", "rule": "csr_participated >= 2"},
        {"name": "Audit Master", "desc": "Awarded for resolving active governance or compliance tasks.", "icon": "audit_master.png", "rule": "resolved_compliance >= 1"}
    ]
    badges_seeded = []
    for bg in badges_data:
        existing = db.query(Badge).filter(Badge.name == bg["name"]).first()
        if not existing:
            existing = Badge(name=bg["name"], description=bg["desc"], icon=bg["icon"], unlock_rule=bg["rule"], status="active")
            db.add(existing)
            db.commit()
            db.refresh(existing)
        badges_seeded.append(existing)

    # Award badges to a few users
    for u in all_users[:10]:
        ub = UserBadge(user_id=u.id, badge_id=badges_seeded[0].id, unlocked_at=now)
        db.add(ub)
    db.commit()

    rewards_data = [
        {"name": "Organic Cotton Corporate Hoodie", "desc": "Cozy, sustainably sourced hoodies with the EcoPilot logo.", "points": 500, "stock": 25},
        {"name": "Premium Reusable Glass Water Bottle", "desc": "Keep drinks hot or cold. Made from recycled tempered glass.", "points": 300, "stock": 40},
        {"name": "Forest Conservation Tree Donation", "desc": "We will plant 5 trees on behalf of your achievement.", "points": 200, "stock": 100}
    ]
    for rw in rewards_data:
        existing = db.query(Reward).filter(Reward.name == rw["name"]).first()
        if not existing:
            existing = Reward(name=rw["name"], description=rw["desc"], points_required=rw["points"], stock=rw["stock"], status="active")
            db.add(existing)
    db.commit()

    return {"message": "Demo mode successfully loaded! Interactive dashboard, carbon trends, leaderboard players, and regulatory notifications seeded."}
