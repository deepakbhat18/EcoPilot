import json
import httpx
from fastapi import HTTPException, status
from backend.app.ai.config import ai_config
from backend.app.ai.prompt_manager import prompt_manager

class AIService:
    def __init__(self):
        # We initialize httpx.AsyncClient with a configured timeout
        self.client = httpx.AsyncClient(timeout=float(ai_config.timeout))

    async def call_openrouter(self, prompt: str) -> str:
        if not ai_config.api_key:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="AI service is temporarily unavailable. OpenRouter API Key is missing in environment variables."
            )

        headers = {
            "Authorization": f"Bearer {ai_config.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:5173",
            "X-Title": "EcoPilot"
        }

        body = {
            "model": ai_config.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": ai_config.temperature,
            "max_tokens": ai_config.max_tokens
        }

        url = f"{ai_config.base_url}/chat/completions"

        try:
            response = await self.client.post(url, headers=headers, json=body)
            if response.status_code != 200:
                error_detail = response.text
                try:
                    error_json = response.json()
                    if "error" in error_json:
                        error_detail = error_json["error"].get("message", error_detail)
                except Exception:
                    pass
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"OpenRouter API error: {error_detail}"
                )
            
            response_data = response.json()
            choices = response_data.get("choices", [])
            if not choices:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="OpenRouter returned empty choices in completions response."
                )
            
            return choices[0]["message"]["content"]
            
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"AI service connection failed or timed out: {str(exc)}"
            )

    async def generate_completion(self, prompt_name: str, render_args: dict, parse_json: bool = False):
        rendered_prompt = prompt_manager.render_prompt(prompt_name, **render_args)
        raw_response = await self.call_openrouter(rendered_prompt)
        
        if parse_json:
            try:
                clean_response = raw_response.strip()
                if "```" in clean_response:
                    start_idx = clean_response.find("{")
                    end_idx = clean_response.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        clean_response = clean_response[start_idx:end_idx+1]
                return json.loads(clean_response)
            except json.JSONDecodeError:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"AI returned invalid JSON structure: {raw_response[:300]}"
                )
        return raw_response

ai_service = AIService()
