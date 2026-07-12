from sqlalchemy.orm import Session
from backend.app.repositories.base import BaseRepository
from backend.app.models.settings_notifications import Setting, Notification

class SettingRepository(BaseRepository[Setting]):
    def __init__(self, db: Session):
        super().__init__(Setting, db)

class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db: Session):
        super().__init__(Notification, db)
