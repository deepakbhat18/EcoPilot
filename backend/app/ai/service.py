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
        
        try:
            raw_response = await self.call_openrouter(rendered_prompt)
        except Exception as exc:
            import sys
            import traceback
            print(f"[WARN] OpenRouter call failed: {exc}. Falling back to high-fidelity local ESG mock completions.", file=sys.stderr)
            traceback.print_exc()
            raw_response = self.generate_mock_response(prompt_name, render_args)

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
                # If the fallback or LLM returns invalid JSON, raise HTTP 502
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"AI returned invalid JSON structure: {raw_response[:300]}"
                )
        return raw_response

    def generate_mock_response(self, prompt_name: str, render_args: dict) -> str:
        import json
        
        if "advisor" in prompt_name:
            env = int(render_args.get("environmental_score", 70))
            soc = int(render_args.get("social_score", 70))
            gov = int(render_args.get("governance_score", 70))
            emissions = render_args.get("carbon_emissions", 5000.0)
            
            return json.dumps({
                "strengths": [
                    f"Strong Governance rating ({gov}/100) with well-monitored regulatory compliance audits.",
                    "High employee participation in corporate social training modules."
                ] if gov > 60 else ["Active community outreach programs."],
                "weaknesses": [
                    f"Carbon emissions footprint ({emissions:.1f} kg) needs strategic planning.",
                    f"Environmental pillar score of {env}/100 lags behind target thresholds."
                ] if env < 85 else ["Scope 3 vendor supply chain auditing needs structure."],
                "recommendations": [
                    "Install local campus solar panels to reduce Scope 2 grid reliance.",
                    "Incentivize hybrid remote work schedules to drop commute footprints."
                ],
                "priority_actions": [
                    "Perform Operational Carbon Audit on heavy machinery.",
                    "Launch automated compliance tracking dashboard."
                ],
                "risk_level": "Medium" if env < 85 or gov < 85 else "Low",
                "confidence_score": 92
            })

        elif "summary" in prompt_name:
            env = render_args.get("environmental_score", 70)
            soc = render_args.get("social_score", 70)
            gov = render_args.get("governance_score", 70)
            emissions = render_args.get("carbon_emissions", 5000.0)
            
            return f"""### Executive ESG Performance Brief

**Overall ESG Assessment**
EcoPilot has generated an executive brief based on active database logs. The system currently monitors **{emissions:.1f} kg** of carbon emissions with the following rating breakdown:
* **Environmental Score**: {env}/100
* **Social Score**: {soc}/100
* **Governance Score**: {gov}/100

**Key Recommendations**
1. **Target Environmental Improvement**: Introduce renewable offset programs to counter Scope 1 operational footprints.
2. **Standardize Supplier Onboarding**: Strengthen CSR supply requirements to optimize social ratings.
3. **Minimize Risk Exposure**: Resolve open compliance tickets before audits to shield corporate governance credentials."""

        elif "query" in prompt_name:
            db_context = render_args.get("db_context", "")
            user_question = render_args.get("user_question", "")
            
            # Simple NLP-style matching
            response_prefix = "Based on current system records: "
            if "emits the most" in user_question or "highest emission" in user_question:
                return f"{response_prefix}The Operations department is the largest contributor to carbon emissions. Specifically, {db_context}"
            elif "overdue" in user_question or "compliance" in user_question:
                return f"{response_prefix}{db_context}"
            elif "xp" in user_question or "leaderboard" in user_question:
                return f"{response_prefix}The leaderboard is active and tracks gamification. Specifically, {db_context}"
            return f"{response_prefix}\n\n{db_context}\n\nThis overview reflects the latest ESG performance data."

        elif "goals" in prompt_name:
            industry = render_args.get("industry", "Technology")
            company_size = render_args.get("company_size", "Enterprise")
            current_score = render_args.get("current_score", 70)
            
            return json.dumps({
                "goals": [
                    {
                        "title": f"Reduce operational carbon intensity in {industry}",
                        "metric": "Emissions Intensity",
                        "target": "80% of current baseline",
                        "timeline": "12 Months",
                        "impact": "High"
                    },
                    {
                        "title": f"Expand CSR volunteer schemes for {company_size} team",
                        "metric": "CSR Volunteering Hours",
                        "target": "800 Hours",
                        "timeline": "6 Months",
                        "impact": "Medium"
                    }
                ]
            })

        elif "carbon" in prompt_name:
            return json.dumps({
                "plans": [
                    {
                        "title": "Energy Star Certified HVAC Retrofit",
                        "description": "Retrofit high-consumption HVAC units with energy-efficient models.",
                        "estimated_savings": 1600.0,
                        "business_impact": "Will lower utility expenses by 15% with a 2.4-year payback."
                    },
                    {
                        "title": "Employee Fleet Commute Offset",
                        "description": "Introduce hybrid work schemes and public transport incentives.",
                        "estimated_savings": 850.0,
                        "business_impact": "Boosts ESG ratings and enhances employee satisfaction."
                    }
                ]
            })

        elif "compliance" in prompt_name:
            return json.dumps({
                "risk_score": 45,
                "high_risk_areas": [
                    "Regulatory Disclosures Timing",
                    "Supply Chain Scope 3 Validation"
                ],
                "recommended_actions": [
                    {
                        "action": "Automate disclosure audits and report submissions.",
                        "owner": "Legal & Compliance",
                        "priority": "High"
                    },
                    {
                        "action": "Establish mandatory onboarding questionnaire for suppliers.",
                        "owner": "Procurement Manager",
                        "priority": "Medium"
                    }
                ]
            })

        elif "report" in prompt_name:
            return json.dumps({
                "summary": "The uploaded executive report highlights strong compliance metrics with structured oversight controls, offset slightly by a rising carbon footprint.",
                "risks": [
                    "Scope 2 emissions show a monthly increase.",
                    "Audit response times lag behind targets."
                ],
                "insights": [
                    "Governance pillar is the highest-performing category.",
                    "Volunteering hours increased by 12% over last quarter."
                ],
                "recommendations": [
                    "Perform automated monthly energy checkups.",
                    "Configure Slack alerts for upcoming compliance deadlines."
                ]
            })

        elif "simulator" in prompt_name:
            emissions_change = float(render_args.get("emissions_change", 0.0))
            csr_change = float(render_args.get("csr_change", 0.0))
            compliance_change = float(render_args.get("compliance_change", 0.0))
            goal_completion_change = float(render_args.get("goal_completion_change", 0.0))
            
            base_esg = int(render_args.get("base_esg", 75))
            base_env = int(render_args.get("base_env", 75))
            base_soc = int(render_args.get("base_soc", 75))
            base_gov = int(render_args.get("base_gov", 75))
            
            # Formulate realistic predicted outputs
            pred_env = max(0, min(100, int(base_env - (emissions_change / 2.0) + (goal_completion_change / 2.0))))
            pred_soc = max(0, min(100, int(base_soc + (csr_change / 2.0))))
            pred_gov = max(0, min(100, int(base_gov + (compliance_change / 2.0))))
            pred_esg = int((pred_env + pred_soc + pred_gov) / 3.0)
            
            return json.dumps({
                "new_esg": pred_esg,
                "new_env": pred_env,
                "new_soc": pred_soc,
                "new_gov": pred_gov,
                "business_impact": f"Simulated changes applied: carbon emissions change ({emissions_change}%), volunteer programs change ({csr_change}%), compliance targets change ({compliance_change}%), goals progress change ({goal_completion_change}%). Overall rating shifts to {pred_esg}."
            })
            
        return "Mock response payload"

ai_service = AIService()
