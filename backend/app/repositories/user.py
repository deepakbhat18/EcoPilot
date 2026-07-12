from typing import Optional, Any
from backend.app.repositories.base import BaseRepository

class UserRepository(BaseRepository):

    def get_by_email(self, email: str) -> Optional[Any]:

        pass
