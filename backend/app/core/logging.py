import logging
import sys
from backend.app.config.settings import settings

def setup_logging() -> None:

    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    logging.basicConfig(
        level=log_level,
        format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )


    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

logger = logging.getLogger("ecopilot")
