from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional, List, Tuple, Dict, Any
import datetime
from backend.app.repositories.carbon_transaction import CarbonTransactionRepository
from backend.app.repositories.department import DepartmentRepository
from backend.app.repositories.emission_factor import EmissionFactorRepository
from backend.app.models.carbon_transaction import CarbonTransaction
from backend.app.models.department import Department
from backend.app.models.emission_factor import EmissionFactor
from backend.app.models.environmental_goal import EnvironmentalGoal
from backend.app.schemas.carbon_transaction import CarbonTransactionCreate, CarbonTransactionUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class CarbonTransactionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CarbonTransactionRepository(db)
        self.dept_repo = DepartmentRepository(db)
        self.factor_repo = EmissionFactorRepository(db)

    def get_by_id(self, id: int) -> CarbonTransaction:
        tx = self.repo.get_by_id(id)
        if not tx:
            raise NotFoundException("Carbon Transaction not found.")
        return tx

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        department_id: Optional[int] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[CarbonTransaction], int]:
        filters = {}
        if department_id:
            filters["department_id"] = department_id
        if status:
            filters["status"] = status
        search_fields = ["source", "reference", "notes"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: CarbonTransactionCreate) -> CarbonTransaction:
        dept = self.dept_repo.get_by_id(obj_in.department_id)
        if not dept:
            raise AppValidationError("Department does not exist.")
        factor_obj = self.factor_repo.get_by_id(obj_in.emission_factor_id)
        if not factor_obj:
            raise AppValidationError("Emission Factor does not exist.")

        calculated_carbon = obj_in.quantity * factor_obj.factor

        db_obj = CarbonTransaction(
            department_id=obj_in.department_id,
            emission_factor_id=obj_in.emission_factor_id,
            quantity=obj_in.quantity,
            calculated_carbon=calculated_carbon,
            source=obj_in.source,
            reference=obj_in.reference,
            transaction_date=obj_in.transaction_date,
            status=obj_in.status,
            notes=obj_in.notes
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)

        self.recalculate_department_goals(obj_in.department_id)
        return db_obj

    def update(self, id: int, obj_in: CarbonTransactionUpdate) -> CarbonTransaction:
        tx = self.get_by_id(id)

        if obj_in.department_id is not None:
            dept = self.dept_repo.get_by_id(obj_in.department_id)
            if not dept:
                raise AppValidationError("Department does not exist.")
            tx.department_id = obj_in.department_id

        if obj_in.emission_factor_id is not None:
            factor_obj = self.factor_repo.get_by_id(obj_in.emission_factor_id)
            if not factor_obj:
                raise AppValidationError("Emission Factor does not exist.")
            tx.emission_factor_id = obj_in.emission_factor_id

        if obj_in.quantity is not None:
            tx.quantity = obj_in.quantity

        factor_val = tx.emission_factor.factor
        tx.calculated_carbon = tx.quantity * factor_val

        if obj_in.source is not None:
            tx.source = obj_in.source
        if obj_in.reference is not None:
            tx.reference = obj_in.reference
        if obj_in.transaction_date is not None:
            tx.transaction_date = obj_in.transaction_date
        if obj_in.status is not None:
            tx.status = obj_in.status
        if obj_in.notes is not None:
            tx.notes = obj_in.notes

        self.db.add(tx)
        self.db.commit()
        self.db.refresh(tx)

        self.recalculate_department_goals(tx.department_id)
        return tx

    def delete(self, id: int) -> CarbonTransaction:
        tx = self.get_by_id(id)
        tx.is_deleted = True
        self.db.add(tx)
        self.db.commit()
        self.recalculate_department_goals(tx.department_id)
        return tx

    def recalculate_department_goals(self, department_id: int):
        total_carbon = self.db.query(func.sum(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.department_id == department_id)\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .scalar() or 0.0

        goals = self.db.query(EnvironmentalGoal)\
            .filter(EnvironmentalGoal.department_id == department_id)\
            .filter(EnvironmentalGoal.is_deleted == False)\
            .all()

        for goal in goals:
            goal.current_progress = min(total_carbon, goal.target)
            if goal.current_progress >= goal.target:
                goal.status = "completed"
            else:
                goal.status = "active"
            self.db.add(goal)
        self.db.commit()

    def get_department_carbon_tracking(self, department_id: int) -> Dict[str, Any]:
        dept = self.dept_repo.get_by_id(department_id)
        if not dept:
            raise NotFoundException("Department not found.")

        total_corporate = self.db.query(func.sum(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .scalar() or 0.0

        total_dept = self.db.query(func.sum(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.department_id == department_id)\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .scalar() or 0.0

        now = datetime.datetime.utcnow()
        monthly_dept = self.db.query(func.sum(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.department_id == department_id)\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .filter(extract('month', CarbonTransaction.transaction_date) == now.month)\
            .filter(extract('year', CarbonTransaction.transaction_date) == now.year)\
            .scalar() or 0.0

        yearly_dept = self.db.query(func.sum(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.department_id == department_id)\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .filter(extract('year', CarbonTransaction.transaction_date) == now.year)\
            .scalar() or 0.0

        avg_dept = self.db.query(func.avg(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.department_id == department_id)\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .scalar() or 0.0

        contribution = (total_dept / total_corporate * 100.0) if total_corporate > 0 else 0.0

        return {
            "department_id": department_id,
            "department_name": dept.name,
            "total_carbon": total_dept,
            "monthly_carbon": monthly_dept,
            "yearly_carbon": yearly_dept,
            "average_carbon": avg_dept,
            "contribution_percentage": contribution
        }

    def get_dashboard_data(self) -> Dict[str, Any]:
        total_emission = self.db.query(func.sum(CarbonTransaction.calculated_carbon))\
            .filter(CarbonTransaction.status == "approved")\
            .filter(CarbonTransaction.is_deleted == False)\
            .scalar() or 0.0

        dept_emissions = self.db.query(
            Department.id,
            Department.name,
            func.sum(CarbonTransaction.calculated_carbon).label("total")
        ).join(CarbonTransaction, CarbonTransaction.department_id == Department.id)\
         .filter(CarbonTransaction.status == "approved")\
         .filter(CarbonTransaction.is_deleted == False)\
         .group_by(Department.id, Department.name)\
         .all()

        highest_dept = {"name": "N/A", "value": 0.0}
        lowest_dept = {"name": "N/A", "value": 0.0}
        top_polluting = []

        if dept_emissions:
            sorted_depts = sorted(dept_emissions, key=lambda x: x.total, reverse=True)
            highest_dept = {"name": sorted_depts[0].name, "value": sorted_depts[0].total}
            lowest_dept = {"name": sorted_depts[-1].name, "value": sorted_depts[-1].total}
            top_polluting = [{"department_id": d.id, "name": d.name, "value": d.total} for d in sorted_depts[:5]]

        total_goals = self.db.query(func.count(EnvironmentalGoal.id))\
            .filter(EnvironmentalGoal.is_deleted == False)\
            .scalar() or 0
        completed_goals = self.db.query(func.count(EnvironmentalGoal.id))\
            .filter(EnvironmentalGoal.status == "completed")\
            .filter(EnvironmentalGoal.is_deleted == False)\
            .scalar() or 0

        goal_completion_pct = (completed_goals / total_goals * 100.0) if total_goals > 0 else 0.0

        now = datetime.datetime.utcnow()
        monthly_trends = self.db.query(
            extract('month', CarbonTransaction.transaction_date).label("month"),
            func.sum(CarbonTransaction.calculated_carbon).label("total")
        ).filter(CarbonTransaction.status == "approved")\
         .filter(CarbonTransaction.is_deleted == False)\
         .filter(extract('year', CarbonTransaction.transaction_date) == now.year)\
         .group_by("month")\
         .order_by("month")\
         .all()

        months_map = {1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun", 7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"}
        line_chart_data = [{"name": months_map[int(m.month)], "value": m.total} for m in monthly_trends]

        pie_chart_data = []
        cat_emissions = self.db.query(
            EmissionFactor.name,
            func.sum(CarbonTransaction.calculated_carbon).label("total")
        ).join(CarbonTransaction, CarbonTransaction.emission_factor_id == EmissionFactor.id)\
         .filter(CarbonTransaction.status == "approved")\
         .filter(CarbonTransaction.is_deleted == False)\
         .group_by(EmissionFactor.name)\
         .all()

        for c in cat_emissions:
            pie_chart_data.append({"name": c.name, "value": c.total})

        recent_txs_entities = self.db.query(CarbonTransaction)\
            .filter(CarbonTransaction.is_deleted == False)\
            .order_by(CarbonTransaction.transaction_date.desc())\
            .limit(5)\
            .all()

        recent_transactions = []
        for tx in recent_txs_entities:
            recent_transactions.append({
                "id": tx.id,
                "department": tx.department.name if tx.department else "N/A",
                "emission_factor": tx.emission_factor.name if tx.emission_factor else "N/A",
                "quantity": tx.quantity,
                "calculated_carbon": tx.calculated_carbon,
                "transaction_date": tx.transaction_date.strftime("%Y-%m-%d"),
                "status": tx.status
            })

        insights = []
        if total_emission > 1000.0:
            insights.append("Carbon footprint exceeds standard thresholds. Consider optimizing Scope 2 grid electricity.")
        else:
            insights.append("Carbon emissions are currently within standard ranges. Great work maintaining green targets!")

        if highest_dept["value"] > 0:
            insights.append(f"Department '{highest_dept['name']}' represents the largest emission source. Focused carbon-offset policies are recommended.")

        return {
            "total_emission": total_emission,
            "highest_emission_department": highest_dept,
            "lowest_emission_department": lowest_dept,
            "goal_completion_percentage": goal_completion_pct,
            "bar_chart": [{"name": d.name, "value": d.total} for d in dept_emissions],
            "line_chart": line_chart_data,
            "pie_chart": pie_chart_data,
            "recent_transactions": recent_transactions,
            "top_polluting_departments": top_polluting,
            "insights": insights
        }
