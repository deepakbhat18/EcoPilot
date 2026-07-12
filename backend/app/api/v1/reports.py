from fastapi import APIRouter, Depends, Query, status, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import csv
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.carbon_transaction import CarbonTransaction
from backend.app.models.social import CSRParticipation, TrainingCompletion
from backend.app.models.governance import Audit, ComplianceIssue
from typing import Optional

router = APIRouter()

@router.get("/summary", response_model=dict)
async def get_esg_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    carb_total = db.query(CarbonTransaction).filter(CarbonTransaction.status == "approved").count()
    csr_total = db.query(CSRParticipation).filter(CSRParticipation.status == "approved").count()
    gov_total = db.query(ComplianceIssue).count()

    return {
        "environmental_score": 85,
        "social_score": 78,
        "governance_score": 92,
        "total_emissions_calculated": carb_total,
        "total_csr_logged": csr_total,
        "total_compliance_issues": gov_total
    }

@router.get("/environmental/export")
async def export_environmental_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transactions = db.query(CarbonTransaction).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Quantity", "Calculated Carbon", "Source", "Reference", "Transaction Date", "Status"])

    for t in transactions:
        writer.writerow([t.id, t.quantity, t.calculated_carbon, t.source, t.reference, t.transaction_date, t.status])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=environmental_report.csv"}
    )

@router.get("/social/export")
async def export_social_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    participations = db.query(CSRParticipation).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "User ID", "Activity ID", "Hours Spent", "Points Earned", "Status", "Feedback"])

    for p in participations:
        writer.writerow([p.id, p.user_id, p.csr_activity_id, p.hours_spent, p.points_earned, p.status, p.feedback])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=social_report.csv"}
    )

@router.get("/governance/export")
async def export_governance_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    issues = db.query(ComplianceIssue).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Owner ID", "Due Date", "Status", "Severity"])

    for i in issues:
        writer.writerow([i.id, i.title, i.owner_id, i.due_date, i.status, i.severity])

    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=governance_report.csv"}
    )
