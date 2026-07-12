from sqlalchemy.orm import Session
from typing import Optional, Any
from backend.app.repositories.user import UserRepository

class UserService:

    def __init__(self, db: Session):

        self.user_repo = UserRepository(model=None, db=db)

    def get_profile(self, user_id: int) -> Optional[Any]:

        return self.user_repo.get_by_id(user_id)
