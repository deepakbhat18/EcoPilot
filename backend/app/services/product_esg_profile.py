from sqlalchemy.orm import Session
from typing import Optional, List, Tuple
from backend.app.repositories.product_esg_profile import ProductESGProfileRepository
from backend.app.repositories.category import CategoryRepository
from backend.app.repositories.emission_factor import EmissionFactorRepository
from backend.app.models.product_esg_profile import ProductESGProfile
from backend.app.schemas.product_esg_profile import ProductESGProfileCreate, ProductESGProfileUpdate
from backend.app.exceptions.exceptions import AppValidationError, NotFoundException

class ProductESGProfileService:
    def __init__(self, db: Session):
        self.repo = ProductESGProfileRepository(db)
        self.category_repo = CategoryRepository(db)
        self.factor_repo = EmissionFactorRepository(db)

    def get_by_id(self, id: int) -> ProductESGProfile:
        profile = self.repo.get_by_id(id)
        if not profile:
            raise NotFoundException("Product ESG Profile not found.")
        return profile

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ProductESGProfile]:
        return self.repo.get_all(skip, limit)

    def search_and_filter(
        self,
        search_query: Optional[str] = None,
        category_id: Optional[int] = None,
        carbon_rating: Optional[str] = None,
        sort_by: Optional[str] = None,
        sort_desc: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[ProductESGProfile], int]:
        filters = {}
        if category_id:
            filters["category_id"] = category_id
        if carbon_rating:
            filters["carbon_rating"] = carbon_rating
        search_fields = ["product_name", "carbon_rating", "description"]
        return self.repo.query_advanced(
            search_query=search_query,
            search_fields=search_fields,
            filters=filters,
            sort_by=sort_by,
            sort_desc=sort_desc,
            skip=skip,
            limit=limit
        )

    def create(self, obj_in: ProductESGProfileCreate) -> ProductESGProfile:
        existing, _ = self.repo.query_advanced(filters={"product_name": obj_in.product_name})
        if existing:
            raise AppValidationError(f"Product ESG Profile with name '{obj_in.product_name}' already exists.")
        category = self.category_repo.get_by_id(obj_in.category_id)
        if not category:
            raise AppValidationError("Category does not exist.")
        factor = self.factor_repo.get_by_id(obj_in.emission_factor_id)
        if not factor:
            raise AppValidationError("Emission Factor does not exist.")
        return self.repo.create(obj_in)

    def update(self, id: int, obj_in: ProductESGProfileUpdate) -> ProductESGProfile:
        profile = self.get_by_id(id)
        if obj_in.product_name and obj_in.product_name != profile.product_name:
            existing, _ = self.repo.query_advanced(filters={"product_name": obj_in.product_name})
            if existing:
                raise AppValidationError(f"Product ESG Profile with name '{obj_in.product_name}' already exists.")
        if obj_in.category_id:
            category = self.category_repo.get_by_id(obj_in.category_id)
            if not category:
                raise AppValidationError("Category does not exist.")
        if obj_in.emission_factor_id:
            factor = self.factor_repo.get_by_id(obj_in.emission_factor_id)
            if not factor:
                raise AppValidationError("Emission Factor does not exist.")
        return self.repo.update(profile, obj_in)

    def delete(self, id: int) -> ProductESGProfile:
        profile = self.get_by_id(id)
        return self.repo.delete(id)
