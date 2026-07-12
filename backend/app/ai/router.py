import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.department import Department
from backend.app.models.carbon_transaction import CarbonTransaction
from backend.app.models.social import CSRParticipation, TrainingCompletion
from backend.app.models.governance import Audit, ComplianceIssue
from backend.app.models.environmental_goal import EnvironmentalGoal
from backend.app.ai.service import ai_service
from backend.app.ai.schemas import (
    AdvisorResponse,
    ExecutiveSummaryResponse,
    NLQueryRequest,
    NLQueryResponse,
    GoalRequest,
    GoalResponse,
    CarbonPlannerResponse,
    ComplianceAnalyzerResponse,
    ReportExplainerRequest,
    ReportExplainerResponse,
    WhatIfRequest,
    WhatIfResponse
)

router = APIRouter()

def calculate_base_scores(db: Session):
    # Total carbon emissions
    total_emission = db.query(func.sum(CarbonTransaction.calculated_carbon))\
        .filter(CarbonTransaction.status == "approved")\
        .filter(CarbonTransaction.is_deleted == False)\
        .scalar() or 0.0

    # Total environmental goals and completions
    total_goals = db.query(func.count(EnvironmentalGoal.id))\
        .filter(EnvironmentalGoal.is_deleted == False)\
        .scalar() or 0
    completed_goals = db.query(func.count(EnvironmentalGoal.id))\
        .filter(EnvironmentalGoal.status == "completed")\
        .filter(EnvironmentalGoal.is_deleted == False)\
        .scalar() or 0
    goal_completion_pct = (completed_goals / total_goals * 100.0) if total_goals > 0 else 0.0

    # CSR Volunteering Hours and training completions
    total_hours = db.query(func.sum(CSRParticipation.hours_spent))\
        .filter(CSRParticipation.status == "approved")\
        .scalar() or 0.0
    total_completions = db.query(func.count(TrainingCompletion.id)).scalar() or 0

    # Governance: Compliance issues and Audits
    open_issues = db.query(func.count(ComplianceIssue.id))\
        .filter(ComplianceIssue.is_deleted == False, ComplianceIssue.status == "open")\
        .scalar() or 0
    
    now = datetime.datetime.utcnow()
    overdue_issues = db.query(func.count(ComplianceIssue.id)).filter(
        ComplianceIssue.is_deleted == False,
        ComplianceIssue.status == "open",
        ComplianceIssue.due_date < now
    ).scalar() or 0

    # ESG Score formulas
    env_score = max(0, min(100, int(85 - (total_emission / 100.0) + (goal_completion_pct * 0.15))))
    soc_score = max(0, min(100, int(70 + (total_hours / 10.0) + (total_completions * 2.0))))
    gov_score = max(0, min(100, int(95 - (open_issues * 5) - (overdue_issues * 10))))
    esg_score = int((env_score + soc_score + gov_score) / 3.0)

    return {
        "esg": esg_score,
        "env": env_score,
        "soc": soc_score,
        "gov": gov_score,
        "total_emission": total_emission,
        "goal_completion_pct": goal_completion_pct,
        "total_hours": total_hours,
        "total_completions": total_completions,
        "open_issues": open_issues,
        "overdue_issues": overdue_issues
    }

@router.post("/advisor", response_model=AdvisorResponse)
async def get_esg_advisor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scores = calculate_base_scores(db)

    # Fetch Department Rankings
    dept_emissions = db.query(
        Department.name,
        func.sum(CarbonTransaction.calculated_carbon)
    ).join(CarbonTransaction, CarbonTransaction.department_id == Department.id)\
     .filter(CarbonTransaction.status == "approved")\
     .filter(CarbonTransaction.is_deleted == False)\
     .group_by(Department.name)\
     .all()
    
    rankings_str = ", ".join([f"{name}: {float(total)} kg" for name, total in dept_emissions]) or "No rankings available."

    # Fetch Goals list
    goals_list = db.query(EnvironmentalGoal).filter(EnvironmentalGoal.is_deleted == False).limit(5).all()
    goals_str = ", ".join([f"Goal: {g.title} ({g.status})" for g in goals_list]) or "No goals set."

    # Call AI Service
    render_args = {
        "environmental_score": scores["env"],
        "social_score": scores["soc"],
        "governance_score": scores["gov"],
        "carbon_emissions": scores["total_emission"],
        "goals": goals_str,
        "csr": f"{scores['total_hours']} hours from volunteering",
        "compliance": f"{scores['open_issues']} open ({scores['overdue_issues']} overdue)",
        "rankings": rankings_str
    }

    ai_data = await ai_service.generate_completion(
        prompt_name="advisor.txt",
        render_args=render_args,
        parse_json=True
    )
    return ai_data

@router.post("/summary", response_model=ExecutiveSummaryResponse)
async def get_executive_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scores = calculate_base_scores(db)

    csr_summary = f"Total volunteering hours completed is {scores['total_hours']} hours with {scores['total_completions']} ESG training courses completed by employees."
    compliance_summary = f"Currently managing {scores['open_issues']} open compliance items, with {scores['overdue_issues']} overdue compliance tickets requiring immediate intervention."

    render_args = {
        "environmental_score": scores["env"],
        "social_score": scores["soc"],
        "governance_score": scores["gov"],
        "carbon_emissions": scores["total_emission"],
        "csr_summary": csr_summary,
        "compliance_summary": compliance_summary
    }

    ai_summary_text = await ai_service.generate_completion(
        prompt_name="summary.txt",
        render_args=render_args,
        parse_json=False
    )
    return {"summary": ai_summary_text}

@router.post("/query", response_model=NLQueryResponse)
async def ask_ecopilot(
    payload: NLQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    question = payload.question.lower()

    # Intent analysis and Context retrieval
    if "emits the most carbon" in question or "highest emission" in question or "most carbon" in question or "polluting" in question:
        dept_emissions = db.query(Department.name, func.sum(CarbonTransaction.calculated_carbon))\
            .join(CarbonTransaction)\
            .filter(CarbonTransaction.status == "approved", CarbonTransaction.is_deleted == False)\
            .group_by(Department.name)\
            .order_by(func.sum(CarbonTransaction.calculated_carbon).desc())\
            .first()
        db_context = f"Department with highest emissions: {dept_emissions[0]} with {float(dept_emissions[1])} kg of carbon." if dept_emissions else "No carbon transaction data found."

    elif "overdue" in question or "compliance issue" in question:
        now = datetime.datetime.utcnow()
        overdue = db.query(ComplianceIssue).filter(
            ComplianceIssue.is_deleted == False,
            ComplianceIssue.status == "open",
            ComplianceIssue.due_date < now
        ).all()
        db_context = "Overdue compliance issues:\n" + "\n".join([f"- {i.title} (Severity: {i.severity}, Due: {i.due_date.date()})" for i in overdue]) if overdue else "No overdue compliance issues."

    elif "highest xp" in question or "most xp" in question or "leaderboard" in question or "highest points" in question:
        top_user = db.query(User).filter(User.is_active == True, User.is_deleted == False).order_by(User.xp_points.desc()).first()
        db_context = f"User with highest XP: {top_user.first_name} {top_user.last_name} ({top_user.email}) with {top_user.xp_points} XP." if top_user else "No active users found on leaderboard."

    elif "csr" in question or "volunteering" in question or "participation" in question:
        dept_csr = db.query(Department.name, func.sum(CSRParticipation.hours_spent))\
            .select_from(CSRParticipation)\
            .join(User, User.id == CSRParticipation.user_id)\
            .join(Department, Department.id == User.department_id)\
            .filter(CSRParticipation.status == "approved")\
            .group_by(Department.name)\
            .all()
        db_context = "CSR participation hours by department:\n" + "\n".join([f"- {d[0]}: {d[1]} hours" for d in dept_csr]) if dept_csr else "No CSR volunteering hours recorded."

    else:
        # Generic context overview
        total_emissions = db.query(func.sum(CarbonTransaction.calculated_carbon)).filter(CarbonTransaction.status == "approved", CarbonTransaction.is_deleted == False).scalar() or 0.0
        open_issues = db.query(func.count(ComplianceIssue.id)).filter(ComplianceIssue.status == "open", ComplianceIssue.is_deleted == False).scalar() or 0
        top_user = db.query(User).order_by(User.xp_points.desc()).first()
        db_context = f"General ESG Platform Statistics:\n- Total Emissions: {total_emissions} kg\n- Open Compliance Issues: {open_issues}\n- Top User: {top_user.first_name if top_user else 'N/A'} ({top_user.xp_points if top_user else 0} XP)."

    render_args = {
        "user_question": payload.question,
        "db_context": db_context
    }

    ai_answer = await ai_service.generate_completion(
        prompt_name="query.txt",
        render_args=render_args,
        parse_json=False
    )
    return {"answer": ai_answer}

@router.post("/goals", response_model=GoalResponse)
async def generate_smart_goals(
    payload: GoalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scores = calculate_base_scores(db)

    render_args = {
        "industry": payload.industry,
        "company_size": payload.company_size,
        "current_score": payload.current_score,
        "env_score": scores["env"],
        "soc_score": scores["soc"],
        "gov_score": scores["gov"]
    }

    goals_data = await ai_service.generate_completion(
        prompt_name="goals.txt",
        render_args=render_args,
        parse_json=True
    )
    return goals_data

@router.post("/carbon-planner", response_model=CarbonPlannerResponse)
async def plan_carbon_reduction(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch recent transactions
    transactions = db.query(CarbonTransaction)\
        .filter(CarbonTransaction.is_deleted == False)\
        .order_by(CarbonTransaction.transaction_date.desc())\
        .limit(10)\
        .all()
    
    logs_str = "\n".join([f"- {tx.transaction_date.date()}: {tx.calculated_carbon} kg calculated carbon from source '{tx.source}'" for tx in transactions]) or "No recent carbon transactions."

    # Fetch Department Breakdown
    dept_emissions = db.query(
        Department.name,
        func.sum(CarbonTransaction.calculated_carbon)
    ).join(CarbonTransaction, CarbonTransaction.department_id == Department.id)\
     .filter(CarbonTransaction.status == "approved")\
     .filter(CarbonTransaction.is_deleted == False)\
     .group_by(Department.name)\
     .all()
    
    breakdown_str = "\n".join([f"- {name}: {float(total)} kg carbon emissions" for name, total in dept_emissions]) or "No department breakdowns."

    render_args = {
        "carbon_logs": logs_str,
        "department_breakdown": breakdown_str
    }

    plan_data = await ai_service.generate_completion(
        prompt_name="carbon.txt",
        render_args=render_args,
        parse_json=True
    )
    return plan_data

@router.post("/compliance-analyzer", response_model=ComplianceAnalyzerResponse)
async def analyze_compliance_risks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch active Audits
    audits = db.query(Audit).filter(Audit.is_deleted == False).limit(5).all()
    audits_str = "\n".join([f"- Audit '{a.title}': Status={a.status}, Scope={a.scope}" for a in audits]) or "No audits registered."

    # Fetch Compliance issues
    issues = db.query(ComplianceIssue).filter(ComplianceIssue.is_deleted == False).limit(10).all()
    issues_str = "\n".join([f"- Issue '{i.title}': Status={i.status}, Severity={i.severity}, Due={i.due_date.date()}" for i in issues]) or "No compliance issues found."

    render_args = {
        "audits": audits_str,
        "compliance_issues": issues_str
    }

    compliance_data = await ai_service.generate_completion(
        prompt_name="compliance.txt",
        render_args=render_args,
        parse_json=True
    )
    return compliance_data

@router.post("/report-explainer", response_model=ReportExplainerResponse)
async def explain_report(
    payload: ReportExplainerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    render_args = {
        "report_details": payload.report_details
    }

    report_explanation = await ai_service.generate_completion(
        prompt_name="report.txt",
        render_args=render_args,
        parse_json=True
    )
    return report_explanation

@router.post("/simulator", response_model=WhatIfResponse)
async def simulate_what_if(
    payload: WhatIfRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scores = calculate_base_scores(db)

    render_args = {
        "emissions_change": payload.emissions_change,
        "csr_change": payload.csr_change,
        "compliance_change": payload.compliance_change,
        "goal_completion_change": payload.goal_completion_change,
        "base_esg": scores["esg"],
        "base_env": scores["env"],
        "base_soc": scores["soc"],
        "base_gov": scores["gov"]
    }

    simulation_data = await ai_service.generate_completion(
        prompt_name="simulator.txt",
        render_args=render_args,
        parse_json=True
    )
    return simulation_data
