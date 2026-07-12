import os

class PromptManager:
    def __init__(self):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.prompts_dir = os.path.join(current_dir, "prompts")

    def load_prompt(self, filename: str) -> str:
        clean_name = os.path.basename(filename)
        if not clean_name.endswith(".txt"):
            clean_name += ".txt"
            
        filepath = os.path.join(self.prompts_dir, clean_name)
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Prompt template '{clean_name}' not found at {filepath}")
            
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()

    def render_prompt(self, filename: str, **kwargs) -> str:
        template = self.load_prompt(filename)
        try:
            return template.format(**kwargs)
        except KeyError as e:
            raise ValueError(f"Missing required argument '{e.args[0]}' for prompt template '{filename}'")

prompt_manager = PromptManager()
