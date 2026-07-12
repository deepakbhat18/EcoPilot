from backend.app.database.session import Base, engine
from backend.app.models import *

Base.metadata.reflect(bind=engine)
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Database schema successfully recreated!")
