from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.repositories.user import UserRepository
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserUpdate
from backend.app.security.hashing import hash_password

class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.user_repo.get_by_id(user_id)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.user_repo.get_by_email(email)

    def list_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.user_repo.get_all(skip=skip, limit=limit)

    def create_user(self, user_in: UserCreate) -> User:
        user_data = user_in.model_dump()
        user_data["password"] = hash_password(user_data["password"])
        return self.user_repo.create(user_data)

    def update_user(self, user_id: int, user_in: UserUpdate) -> Optional[User]:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            return None
        return self.user_repo.update(user, user_in)

    def delete_user(self, user_id: int) -> Optional[User]:
        return self.user_repo.delete(user_id)
