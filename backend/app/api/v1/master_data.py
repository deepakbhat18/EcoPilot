from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List, Generic, TypeVar
from backend.app.database.session import get_db
from backend.app.dependencies.auth import get_current_user
from backend.app.models.user import User

from backend.app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentOut
from backend.app.schemas.category import CategoryCreate, CategoryUpdate, CategoryOut
from backend.app.schemas.emission_factor import EmissionFactorCreate, EmissionFactorUpdate, EmissionFactorOut
from backend.app.schemas.product_esg_profile import ProductESGProfileCreate, ProductESGProfileUpdate, ProductESGProfileOut
from backend.app.schemas.environmental_goal import EnvironmentalGoalCreate, EnvironmentalGoalUpdate, EnvironmentalGoalOut
from backend.app.schemas.policy import PolicyCreate, PolicyUpdate, PolicyOut
from backend.app.schemas.badge import BadgeCreate, BadgeUpdate, BadgeOut
from backend.app.schemas.reward import RewardCreate, RewardUpdate, RewardOut

from backend.app.services.department import DepartmentService
from backend.app.services.category import CategoryService
from backend.app.services.emission_factor import EmissionFactorService
from backend.app.services.product_esg_profile import ProductESGProfileService
from backend.app.services.environmental_goal import EnvironmentalGoalService
from backend.app.services.policy import PolicyService
from backend.app.services.badge import BadgeService
from backend.app.services.reward import RewardService

from pydantic import BaseModel

T = TypeVar("T")

class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int

router = APIRouter()


@router.get("/departments", response_model=PaginatedResponse[DepartmentOut])
async def get_departments(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    items, total = service.search_and_filter(search, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/departments/{id}", response_model=DepartmentOut)
async def get_department_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    return service.get_by_id(id)

@router.post("/departments", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    return service.create(payload)

@router.put("/departments/{id}", response_model=DepartmentOut)
async def update_department(
    id: int,
    payload: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    return service.update(id, payload)

@router.delete("/departments/{id}", response_model=DepartmentOut)
async def delete_department(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = DepartmentService(db)
    return service.delete(id)



@router.get("/categories", response_model=PaginatedResponse[CategoryOut])
async def get_categories(
    search: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(db)
    items, total = service.search_and_filter(search, type, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/categories/{id}", response_model=CategoryOut)
async def get_category_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(db)
    return service.get_by_id(id)

@router.post("/categories", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(db)
    return service.create(payload)

@router.put("/categories/{id}", response_model=CategoryOut)
async def update_category(
    id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(db)
    return service.update(id, payload)

@router.delete("/categories/{id}", response_model=CategoryOut)
async def delete_category(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = CategoryService(db)
    return service.delete(id)



@router.get("/emission-factors", response_model=PaginatedResponse[EmissionFactorOut])
async def get_emission_factors(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmissionFactorService(db)
    items, total = service.search_and_filter(search, category_id, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/emission-factors/{id}", response_model=EmissionFactorOut)
async def get_emission_factor_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmissionFactorService(db)
    return service.get_by_id(id)

@router.post("/emission-factors", response_model=EmissionFactorOut, status_code=status.HTTP_201_CREATED)
async def create_emission_factor(
    payload: EmissionFactorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmissionFactorService(db)
    return service.create(payload)

@router.put("/emission-factors/{id}", response_model=EmissionFactorOut)
async def update_emission_factor(
    id: int,
    payload: EmissionFactorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmissionFactorService(db)
    return service.update(id, payload)

@router.delete("/emission-factors/{id}", response_model=EmissionFactorOut)
async def delete_emission_factor(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EmissionFactorService(db)
    return service.delete(id)



@router.get("/product-esg-profiles", response_model=PaginatedResponse[ProductESGProfileOut])
async def get_product_esg_profiles(
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    carbon_rating: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductESGProfileService(db)
    items, total = service.search_and_filter(search, category_id, carbon_rating, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/product-esg-profiles/{id}", response_model=ProductESGProfileOut)
async def get_product_esg_profile_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductESGProfileService(db)
    return service.get_by_id(id)

@router.post("/product-esg-profiles", response_model=ProductESGProfileOut, status_code=status.HTTP_201_CREATED)
async def create_product_esg_profile(
    payload: ProductESGProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductESGProfileService(db)
    return service.create(payload)

@router.put("/product-esg-profiles/{id}", response_model=ProductESGProfileOut)
async def update_product_esg_profile(
    id: int,
    payload: ProductESGProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductESGProfileService(db)
    return service.update(id, payload)

@router.delete("/product-esg-profiles/{id}", response_model=ProductESGProfileOut)
async def delete_product_esg_profile(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = ProductESGProfileService(db)
    return service.delete(id)



@router.get("/environmental-goals", response_model=PaginatedResponse[EnvironmentalGoalOut])
async def get_environmental_goals(
    search: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EnvironmentalGoalService(db)
    items, total = service.search_and_filter(search, department_id, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/environmental-goals/{id}", response_model=EnvironmentalGoalOut)
async def get_environmental_goal_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EnvironmentalGoalService(db)
    return service.get_by_id(id)

@router.post("/environmental-goals", response_model=EnvironmentalGoalOut, status_code=status.HTTP_201_CREATED)
async def create_environmental_goal(
    payload: EnvironmentalGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EnvironmentalGoalService(db)
    return service.create(payload)

@router.put("/environmental-goals/{id}", response_model=EnvironmentalGoalOut)
async def update_environmental_goal(
    id: int,
    payload: EnvironmentalGoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EnvironmentalGoalService(db)
    return service.update(id, payload)

@router.delete("/environmental-goals/{id}", response_model=EnvironmentalGoalOut)
async def delete_environmental_goal(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = EnvironmentalGoalService(db)
    return service.delete(id)



@router.get("/policies", response_model=PaginatedResponse[PolicyOut])
async def get_policies(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PolicyService(db)
    items, total = service.search_and_filter(search, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/policies/{id}", response_model=PolicyOut)
async def get_policy_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PolicyService(db)
    return service.get_by_id(id)

@router.post("/policies", response_model=PolicyOut, status_code=status.HTTP_201_CREATED)
async def create_policy(
    payload: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PolicyService(db)
    return service.create(payload)

@router.put("/policies/{id}", response_model=PolicyOut)
async def update_policy(
    id: int,
    payload: PolicyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PolicyService(db)
    return service.update(id, payload)

@router.delete("/policies/{id}", response_model=PolicyOut)
async def delete_policy(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = PolicyService(db)
    return service.delete(id)



@router.get("/badges", response_model=PaginatedResponse[BadgeOut])
async def get_badges(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BadgeService(db)
    items, total = service.search_and_filter(search, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/badges/{id}", response_model=BadgeOut)
async def get_badge_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BadgeService(db)
    return service.get_by_id(id)

@router.post("/badges", response_model=BadgeOut, status_code=status.HTTP_201_CREATED)
async def create_badge(
    payload: BadgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BadgeService(db)
    return service.create(payload)

@router.put("/badges/{id}", response_model=BadgeOut)
async def update_badge(
    id: int,
    payload: BadgeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BadgeService(db)
    return service.update(id, payload)

@router.delete("/badges/{id}", response_model=BadgeOut)
async def delete_badge(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = BadgeService(db)
    return service.delete(id)



@router.get("/rewards", response_model=PaginatedResponse[RewardOut])
async def get_rewards(
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_desc: bool = Query(False),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    items, total = service.search_and_filter(search, status, sort_by, sort_desc, skip, limit)
    return PaginatedResponse(items=items, total=total)

@router.get("/rewards/{id}", response_model=RewardOut)
async def get_badge_by_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    return service.get_by_id(id)

@router.post("/rewards", response_model=RewardOut, status_code=status.HTTP_201_CREATED)
async def create_reward(
    payload: RewardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    return service.create(payload)

@router.put("/rewards/{id}", response_model=RewardOut)
async def update_reward(
    id: int,
    payload: RewardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    return service.update(id, payload)

@router.delete("/rewards/{id}", response_model=RewardOut)
async def delete_reward(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    service = RewardService(db)
    return service.delete(id)
