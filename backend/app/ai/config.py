from backend.app.config.settings import settings

class AIConfig:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.model = settings.OPENROUTER_MODEL
        self.base_url = settings.OPENROUTER_BASE_URL.rstrip('/')
        self.temperature = settings.OPENROUTER_TEMPERATURE
        self.max_tokens = settings.OPENROUTER_MAX_TOKENS
        self.timeout = settings.OPENROUTER_TIMEOUT

ai_config = AIConfig()
