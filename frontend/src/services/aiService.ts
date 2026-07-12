import { api } from "./api";

export interface AdvisorResponse {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priority_actions: string[];
  risk_level: string;
  confidence_score: number;
}

export interface ExecutiveSummaryResponse {
  summary: string;
}

export interface NLQueryResponse {
  answer: string;
}

export interface GoalItem {
  title: string;
  metric: string;
  target: string;
  timeline: string;
  impact: string;
}

export interface GoalResponse {
  goals: GoalItem[];
}

export interface CarbonPlannerItem {
  title: string;
  description: string;
  estimated_savings: number;
  business_impact: string;
}

export interface CarbonPlannerResponse {
  plans: CarbonPlannerItem[];
}

export interface ComplianceActionItem {
  action: string;
  owner: string;
  priority: string;
}

export interface ComplianceAnalyzerResponse {
  risk_score: number;
  high_risk_areas: string[];
  recommended_actions: ComplianceActionItem[];
}

export interface ReportExplainerResponse {
  summary: string;
  risks: string[];
  insights: string[];
  recommendations: string[];
}

export interface WhatIfRequest {
  emissions_change: number;
  csr_change: number;
  compliance_change: number;
  goal_completion_change: number;
}

export interface WhatIfResponse {
  new_esg: number;
  new_env: number;
  new_soc: number;
  new_gov: number;
  business_impact: string;
}

export const aiService = {
  getESGAdvisor: async (): Promise<AdvisorResponse> => {
    const response = await api.post<AdvisorResponse>("/ai/advisor");
    return response.data;
  },

  getExecutiveSummary: async (): Promise<ExecutiveSummaryResponse> => {
    const response = await api.post<ExecutiveSummaryResponse>("/ai/summary");
    return response.data;
  },

  askEcoPilot: async (question: string): Promise<NLQueryResponse> => {
    const response = await api.post<NLQueryResponse>("/ai/query", { question });
    return response.data;
  },

  generateSMARTGoals: async (
    industry: string,
    companySize: string,
    currentScore: number
  ): Promise<GoalResponse> => {
    const response = await api.post<GoalResponse>("/ai/goals", {
      industry,
      company_size: companySize,
      current_score: currentScore,
    });
    return response.data;
  },

  planCarbonReduction: async (): Promise<CarbonPlannerResponse> => {
    const response = await api.post<CarbonPlannerResponse>("/ai/carbon-planner");
    return response.data;
  },

  analyzeComplianceRisks: async (): Promise<ComplianceAnalyzerResponse> => {
    const response = await api.post<ComplianceAnalyzerResponse>("/ai/compliance-analyzer");
    return response.data;
  },

  explainReport: async (reportDetails: string): Promise<ReportExplainerResponse> => {
    const response = await api.post<ReportExplainerResponse>("/ai/report-explainer", {
      report_details: reportDetails,
    });
    return response.data;
  },

  simulateWhatIf: async (payload: WhatIfRequest): Promise<WhatIfResponse> => {
    const response = await api.post<WhatIfResponse>("/ai/simulator", payload);
    return response.data;
  },
};
