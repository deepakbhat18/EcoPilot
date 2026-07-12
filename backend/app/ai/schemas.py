from pydantic import BaseModel, Field
from typing import List, Optional

class AdvisorResponse(BaseModel):
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    priority_actions: List[str]
    risk_level: str
    confidence_score: int

class ExecutiveSummaryResponse(BaseModel):
    summary: str

class NLQueryRequest(BaseModel):
    question: str

class NLQueryResponse(BaseModel):
    answer: str

class GoalRequest(BaseModel):
    industry: str
    company_size: str
    current_score: float

class GoalItem(BaseModel):
    title: str
    metric: str
    target: str
    timeline: str
    impact: str

class GoalResponse(BaseModel):
    goals: List[GoalItem]

class CarbonPlannerItem(BaseModel):
    title: str
    description: str
    estimated_savings: float
    business_impact: str

class CarbonPlannerResponse(BaseModel):
    plans: List[CarbonPlannerItem]

class ComplianceActionItem(BaseModel):
    action: str
    owner: str
    priority: str

class ComplianceAnalyzerResponse(BaseModel):
    risk_score: int
    high_risk_areas: List[str]
    recommended_actions: List[ComplianceActionItem]

class ReportExplainerRequest(BaseModel):
    report_details: str

class ReportExplainerResponse(BaseModel):
    summary: str
    risks: List[str]
    insights: List[str]
    recommendations: List[str]

class WhatIfRequest(BaseModel):
    emissions_change: float = Field(..., description="Percentage change in carbon emissions (e.g. -20 for 20% reduction)")
    csr_change: float = Field(..., description="Percentage change in CSR volunteering hours (e.g. 15 for 15% increase)")
    compliance_change: float = Field(..., description="Percentage change in resolved compliance issues (e.g. 50 for 50% more resolved)")
    goal_completion_change: float = Field(..., description="Percentage change in goal completion rate (e.g. 10 for 10% progress)")

class WhatIfResponse(BaseModel):
    new_esg: int
    new_env: int
    new_soc: int
    new_gov: int
    business_impact: str
