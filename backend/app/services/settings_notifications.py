from sqlalchemy.orm import Session
from backend.app.models.settings_notifications import Setting, Notification
from typing import Dict, List, Optional

class SettingService:
    def __init__(self, db: Session):
        self.db = db

    def get_setting(self, key: str, default: str = "") -> str:
        s = self.db.query(Setting).filter(Setting.key == key).first()
        if not s:
            return default
        return s.value

    def get_setting_bool(self, key: str, default: bool = True) -> bool:
        val = self.get_setting(key, str(default))
        return val.lower() in ("true", "1", "yes")

    def set_setting(self, key: str, value: str) -> Setting:
        s = self.db.query(Setting).filter(Setting.key == key).first()
        if not s:
            s = Setting(key=key, value=value)
            self.db.add(s)
        else:
            s.value = value
        self.db.commit()
        self.db.refresh(s)
        return s

    def get_all_settings(self) -> Dict[str, str]:
        settings = self.db.query(Setting).all()
        return {s.key: s.value for s in settings}

class NotificationService:
    def __init__(self, db: Session):
        self.db = db

    def send_notification(self, user_id: int, title: str, message: str, n_type: str) -> Notification:
        notif = Notification(user_id=user_id, title=title, message=message, type=n_type, is_read=False)
        self.db.add(notif)
        self.db.commit()
        self.db.refresh(notif)
        return notif

    def get_user_notifications(self, user_id: int, limit: int = 20) -> List[Notification]:
        return self.db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit).all()

    def mark_as_read(self, id: int) -> Optional[Notification]:
        notif = self.db.query(Notification).filter(Notification.id == id).first()
        if notif:
            notif.is_read = True
            self.db.commit()
            self.db.refresh(notif)
        return notif
