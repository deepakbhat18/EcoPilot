import React, { useState } from "react";
import { useAI } from "../../hooks/useAI";
import { aiService } from "../../services/aiService";
import type { AdvisorResponse, CarbonPlannerItem, ComplianceActionItem, GoalItem } from "../../services/aiService";
import { Button } from "../../components/Button";
import { showToast } from "../../components/Toast";
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Brain,
  MessageSquare,
  Copy,
  Download,
  RotateCcw,
  Target,
  Flame,
  Scale,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from "lucide-react";

// Simple custom Markdown to HTML helper to keep layout premium without external marked packages
const renderMarkdown = (text: string) => {
  if (!text) return "";
  let html = text;
  // Replace headers
  html = html.replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-foreground mt-3 mb-1">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 class="text-md font-bold text-foreground mt-4 mb-2">$1</h3>');
  html = html.replace(/^# (.*$)/gim, '<h2 class="text-lg font-bold text-foreground mt-5 mb-3">$1</h2>');
  // Replace bold
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong class="font-bold text-foreground">$1</strong>');
  // Replace bullets
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground">$1</li>');
  // Replace newlines
  html = html.split("\n").join("<br />");
  return <div dangerouslySetInnerHTML={{ __html: html }} className="text-xs leading-relaxed text-muted-foreground" />;
};

// Custom Typing effect component for that AI Premium Wow factor
const TypingEffect: React.FC<{ text: string; speed?: number }> = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  React.useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return renderMarkdown(displayedText || text);
};

export const AIInsights: React.FC = () => {
  const { loading, error, execute } = useAI();
  const [activeTab, setActiveTab] = useState<"advisor" | "query" | "planner" | "goals" | "simulator">("advisor");

  // Feature states
  const [advisorData, setAdvisorData] = useState<AdvisorResponse | null>(null);
  const [execSummary, setExecSummary] = useState<string | null>(null);
  
  // NL Query States
  const [queryInput, setQueryInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: "user" | "assistant"; text: string }>>([
    { role: "assistant", text: "Hello! Ask me anything about EcoPilot's carbon emissions, department ranks, or compliance issues." }
  ]);

  // Carbon Planner & Compliance Risk
  const [carbonPlans, setCarbonPlans] = useState<CarbonPlannerItem[]>([]);
  const [complianceRisk, setComplianceRisk] = useState<{
    risk_score: number;
    high_risk_areas: string[];
    recommended_actions: ComplianceActionItem[];
  } | null>(null);

  // Goal Generator states
  const [goalParams, setGoalParams] = useState({ industry: "Technology", companySize: "Medium (100-500)", currentScore: 78 });
  const [generatedGoals, setGeneratedGoals] = useState<GoalItem[]>([]);

  // What-If Simulator states
  const [simParams, setSimParams] = useState({
    emissions_change: -20,
    csr_change: 15,
    compliance_change: 40,
    goal_completion_change: 25
  });
  const [simResult, setSimResult] = useState<{
    new_esg: number;
    new_env: number;
    new_soc: number;
    new_gov: number;
    business_impact: string;
  } | null>(null);

  // Action: ESG Advisor
  const runESGAdvisor = async () => {
    const data = await execute("advisor", () => aiService.getESGAdvisor());
    if (data) {
      setAdvisorData(data);
      showToast("ESG Performance Analysis generated!", "success");
    }
  };

  // Action: Executive Summary
  const runExecutiveSummary = async () => {
    const data = await execute("summary", () => aiService.getExecutiveSummary());
    if (data) {
      setExecSummary(data.summary);
      showToast("CEO Executive Summary compiled!", "success");
    }
  };

  // Action: Natural Language Query
  const sendNLQuery = async (questionText?: string) => {
    const textToSend = questionText || queryInput;
    if (!textToSend.trim()) return;

    // Add user message
    setChatHistory((prev) => [...prev, { role: "user", text: textToSend }]);
    setQueryInput("");

    const response = await execute("query", () => aiService.askEcoPilot(textToSend));
    if (response) {
      setChatHistory((prev) => [...prev, { role: "assistant", text: response.answer }]);
    }
  };

  // Action: Carbon Planner
  const runCarbonPlanner = async () => {
    const response = await execute("planner", () => aiService.planCarbonReduction());
    if (response) {
      setCarbonPlans(response.plans);
      showToast("Carbon reduction strategies customized!", "success");
    }
  };

  // Action: Compliance Risk
  const runComplianceRisk = async () => {
    const response = await execute("compliance", () => aiService.analyzeComplianceRisks());
    if (response) {
      setComplianceRisk(response);
      showToast("Compliance risk diagnostic completed!", "success");
    }
  };

  // Action: Goal Generator
  const runGoalGenerator = async () => {
    const response = await execute("goals", () =>
      aiService.generateSMARTGoals(goalParams.industry, goalParams.companySize, goalParams.currentScore)
    );
    if (response) {
      setGeneratedGoals(response.goals);
      showToast("SMART Goals generated successfully!", "success");
    }
  };

  // Action: What-If Simulator
  const runWhatIfSimulator = async () => {
    const response = await execute("simulator", () => aiService.simulateWhatIf(simParams));
    if (response) {
      setSimResult(response);
      showToast("Scenario analysis predicted!", "success");
    }
  };

  // General utility
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  const handleDownloadTxt = (filename: string, text: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    element.remove();
    showToast("Downloaded report as TXT!", "success");
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <Cpu size={28} className="text-violet-500 animate-pulse" />
            AI ESG Copilot Insights
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Leverage OpenRouter LLM engines to perform predictive scenario simulation, automate CEO disclosures, and diagnose regulatory compliance gaps.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-px">
        {[
          { id: "advisor", label: "ESG Advisor & Exec Report", icon: <Brain size={16} /> },
          { id: "query", label: "Ask EcoPilot (NLP)", icon: <MessageSquare size={16} /> },
          { id: "planner", label: "Planner & Risk Analyzer", icon: <ShieldAlert size={16} /> },
          { id: "goals", label: "SMART Goal Generator", icon: <Target size={16} /> },
          { id: "simulator", label: "What-If Simulator", icon: <TrendingUp size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === tab.id
                ? "text-primary border-primary bg-primary/5"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB Content */}
      <div className="min-h-[500px]">
        {/* Tab 1: ESG Advisor & Exec Report */}
        {activeTab === "advisor" && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 animate-fadeIn">
            {/* Control card */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-card flex flex-col gap-5 h-fit shadow-sm">
              <div>
                <h3 className="text-md font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-500" />
                  Advisor Console
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Click below to compile standard ESG audits and synthesize board executive summary memos.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={runESGAdvisor}
                  isLoading={loading["advisor"]}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-lg transition-all font-bold text-white"
                >
                  Analyze ESG Performance
                </Button>
                <Button
                  onClick={runExecutiveSummary}
                  isLoading={loading["summary"]}
                  variant="outline"
                  className="w-full font-semibold border-violet-500/20 text-violet-600 dark:text-violet-400 hover:bg-violet-500/5"
                >
                  Generate Executive Summary
                </Button>
              </div>

              {error["advisor"] && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive flex flex-col gap-2">
                  <span>{error["advisor"]}</span>
                  <Button size="sm" variant="outline" onClick={runESGAdvisor} className="w-fit text-xs px-2.5 py-1">
                    <RotateCcw size={12} className="mr-1" /> Retry
                  </Button>
                </div>
              )}
            </div>

            {/* Display panel */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Advisor outputs */}
              {advisorData && (
                <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                        <Brain size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">AI ESG Advisory Audit</h4>
                        <span className="text-[10px] text-muted-foreground">Confidence Indicator: {advisorData.confidence_score}%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(JSON.stringify(advisorData, null, 2))}
                        className="p-2"
                      >
                        <Copy size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadTxt("esg_advisory_report.json", JSON.stringify(advisorData, null, 2))}
                        className="p-2"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>

                  {/* Confidence Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                      <span>Model confidence rating</span>
                      <span>{advisorData.confidence_score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${advisorData.confidence_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Risk & Indicators */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/40 rounded-xl border border-border/60">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Regulatory Risk Assessment</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            advisorData.risk_level.toLowerCase().includes("high")
                              ? "bg-red-500 animate-ping"
                              : advisorData.risk_level.toLowerCase().includes("medium")
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <strong className="text-sm font-extrabold text-foreground">{advisorData.risk_level}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                      <h5 className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 size={14} /> Identified Strengths
                      </h5>
                      <ul className="text-xs text-muted-foreground flex flex-col gap-1.5 list-disc pl-4">
                        {advisorData.strengths.map((s, idx) => <li key={idx}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <h5 className="text-xs font-bold text-red-600 flex items-center gap-1.5 mb-2">
                        <AlertTriangle size={14} /> Improvement Areas
                      </h5>
                      <ul className="text-xs text-muted-foreground flex flex-col gap-1.5 list-disc pl-4">
                        {advisorData.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="flex flex-col gap-2">
                    <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lightbulb className="text-amber-500" size={14} /> Actionable Strategy Roadmap
                    </h5>
                    <div className="flex flex-col gap-2.5 border-l-2 border-violet-500/25 pl-4 mt-2">
                      {advisorData.recommendations.map((r, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <span className="h-5 w-5 bg-violet-500/10 text-violet-500 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <p className="text-xs text-muted-foreground leading-normal mt-0.5">{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority Actions */}
                  <div className="flex flex-col gap-2 mt-2">
                    <h5 className="text-xs font-bold text-foreground">Immediate Priority Targets</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {advisorData.priority_actions.map((act, idx) => (
                        <div key={idx} className="flex gap-2.5 items-center p-3 bg-muted/20 border border-border/80 rounded-xl">
                          <ArrowRight size={14} className="text-violet-500" />
                          <span className="text-xs text-muted-foreground font-medium">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CEO Summary Output */}
              {execSummary && (
                <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                        <Sparkles size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">CEO ESG Performance Memo</h4>
                        <span className="text-[10px] text-muted-foreground">Synthesized executive brief</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleCopy(execSummary)} className="p-2">
                        <Copy size={14} />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDownloadTxt("ceo_esg_summary.txt", execSummary)} className="p-2">
                        <Download size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-4 border border-border rounded-xl">
                    <TypingEffect text={execSummary} />
                  </div>
                </div>
              )}

              {!advisorData && !execSummary && (
                <div className="h-full border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-card/20">
                  <Brain size={42} className="text-muted-foreground/30 mb-3" />
                  <h4 className="text-sm font-bold text-foreground">Awaiting Advisory Request</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Select a service task in the control console to trigger generative ESG assessments.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Ask EcoPilot (NLP Query) */}
        {activeTab === "query" && (
          <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-6 shadow-sm animate-fadeIn">
            <div>
              <h3 className="text-md font-bold text-foreground">Natural Language DB Query</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Ask EcoPilot a question about platform records in plain English. The backend will parse the SQL context and safely summarize answers.
              </p>
            </div>

            {/* Suggestions */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Suggested Questions</span>
              <div className="flex flex-wrap gap-2">
                {[
                  "Which department emits the most carbon?",
                  "Show overdue compliance issues.",
                  "Who earned the highest XP on the leaderboard?",
                  "Show CSR participation hours by department."
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => sendNLQuery(q)}
                    className="text-xs bg-secondary hover:bg-primary/10 hover:text-primary transition-all px-3 py-1.5 rounded-full text-muted-foreground border border-border/40 font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Screen */}
            <div className="border border-border/80 rounded-xl bg-muted/10 p-4 flex flex-col gap-4 max-h-[350px] overflow-y-auto">
              {chatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 max-w-[80%] ${
                    chat.role === "user" ? "self-end items-end" : "self-start items-start"
                  }`}
                >
                  <span className="text-[9px] text-muted-foreground uppercase font-semibold">
                    {chat.role === "user" ? "You" : "EcoPilot Copilot"}
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-normal ${
                      chat.role === "user"
                        ? "bg-primary text-primary-foreground font-semibold rounded-tr-none"
                        : "bg-card text-muted-foreground border border-border rounded-tl-none"
                    }`}
                  >
                    {chat.role === "assistant" && idx === chatHistory.length - 1 ? (
                      <TypingEffect text={chat.text} speed={5} />
                    ) : (
                      renderMarkdown(chat.text)
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex gap-2">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendNLQuery()}
                placeholder="Ask a question (e.g. Which department has highest Scope 2 emissions?)..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:border-primary"
              />
              <Button
                onClick={() => sendNLQuery()}
                isLoading={loading["query"]}
                className="bg-primary text-primary-foreground font-bold px-6"
              >
                Ask Copilot
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Planner & Risk Analyzer */}
        {activeTab === "planner" && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 animate-fadeIn">
            {/* Control console */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-card flex flex-col gap-5 h-fit shadow-sm">
              <div>
                <h3 className="text-md font-bold text-foreground">Diagnostic Tools</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Analyze ledger carbon logs or audit files to suggest reductions and identify governance liabilities.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={runCarbonPlanner}
                  isLoading={loading["planner"]}
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:shadow-lg transition-all font-bold text-white"
                >
                  Draft Carbon Reduction Plan
                </Button>
                <Button
                  onClick={runComplianceRisk}
                  isLoading={loading["compliance"]}
                  variant="outline"
                  className="w-full font-semibold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5"
                >
                  Analyze Compliance Risks
                </Button>
              </div>
            </div>

            {/* Results Console */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Planner Plans */}
              {carbonPlans.length > 0 && (
                <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/40 pb-3">
                    <Flame size={16} className="text-emerald-500" />
                    Carbon Offset & Abatement Strategies
                  </h4>

                  <div className="flex flex-col gap-3">
                    {carbonPlans.map((plan, idx) => (
                      <div key={idx} className="p-4 border border-border rounded-xl bg-muted/20 hover:border-emerald-500/25 transition-all">
                        <div className="flex justify-between items-start">
                          <h5 className="font-bold text-xs text-foreground">{plan.title}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                            -{plan.estimated_savings.toLocaleString()} kg CO2
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-normal">{plan.description}</p>
                        <div className="mt-2 text-[10px] text-muted-foreground flex gap-1.5 items-center">
                          <span className="font-bold uppercase text-primary text-[9px]">Business Impact:</span>
                          <span>{plan.business_impact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance risk */}
              {complianceRisk && (
                <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-5 shadow-sm">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/40 pb-3">
                    <Scale size={16} className="text-indigo-500" />
                    Corporate Governance & Compliance Assessment
                  </h4>

                  {/* Score circle */}
                  <div className="flex items-center gap-6">
                    <div className="relative h-20 w-20 flex items-center justify-center rounded-full border-4 border-secondary border-t-indigo-500">
                      <strong className="text-xl font-black text-foreground">{complianceRisk.risk_score}</strong>
                      <span className="absolute -bottom-2 text-[8px] bg-secondary border border-border px-1.5 py-0.5 rounded-full font-bold uppercase">Risk</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Severity Level</span>
                      <strong className={`text-sm ${complianceRisk.risk_score > 60 ? "text-red-500" : complianceRisk.risk_score > 30 ? "text-amber-500" : "text-emerald-500"}`}>
                        {complianceRisk.risk_score > 60 ? "HIGH LIABILITY RISK" : complianceRisk.risk_score > 30 ? "MODERATE LIABILITY RISK" : "MINIMAL LIABILITY RISK"}
                      </strong>
                    </div>
                  </div>

                  {/* High Risk Areas */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Immediate Threats Identified</span>
                    <div className="flex flex-col gap-2">
                      {complianceRisk.high_risk_areas.map((area, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-xs text-muted-foreground bg-red-500/5 border border-red-500/10 p-2.5 rounded-lg">
                          <AlertTriangle size={14} className="text-red-500 shrink-0" />
                          <span>{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Timeline */}
                  <div className="flex flex-col gap-2 mt-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Corrective Roadmap Timeline</span>
                    <div className="relative pl-6 border-l border-border/80 flex flex-col gap-4 mt-2">
                      {complianceRisk.recommended_actions.map((act, idx) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-[30px] top-1 h-4 w-4 bg-card border-2 border-indigo-500 rounded-full flex items-center justify-center text-[8px] font-bold text-indigo-500">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col gap-1">
                            <h5 className="font-bold text-xs text-foreground">{act.action}</h5>
                            <div className="flex gap-3 text-[10px] text-muted-foreground">
                              <span>Owner: <strong>{act.owner}</strong></span>
                              <span>Priority: <strong>{act.priority}</strong></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!carbonPlans.length && !complianceRisk && (
                <div className="h-full border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-card/20">
                  <ShieldAlert size={42} className="text-muted-foreground/30 mb-3" />
                  <h4 className="text-sm font-bold text-foreground">Diagnostic Hub Idle</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Select a carbon reduction or compliance risk analysis tool to calculate ESG strategy logs.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: SMART Goal Generator */}
        {activeTab === "goals" && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 animate-fadeIn">
            {/* Form */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm h-fit">
              <div>
                <h3 className="text-md font-bold text-foreground">Define Corporate Scope</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Specify parameters to generate tailored ESG objectives aligned with industry standard guidelines.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold">Industry Sector</label>
                  <select
                    value={goalParams.industry}
                    onChange={(e) => setGoalParams({ ...goalParams, industry: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {["Technology", "Manufacturing", "Energy", "Logistics", "Financial Services", "Retail"].map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold">Company Size</label>
                  <select
                    value={goalParams.companySize}
                    onChange={(e) => setGoalParams({ ...goalParams, companySize: e.target.value })}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary"
                  >
                    {["Small (1-100 employees)", "Medium (100-500)", "Enterprise (500+)"].map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold">Current Overall Score</label>
                  <input
                    type="number"
                    value={goalParams.currentScore}
                    onChange={(e) => setGoalParams({ ...goalParams, currentScore: Number(e.target.value) })}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <Button
                onClick={runGoalGenerator}
                isLoading={loading["goals"]}
                className="w-full bg-primary text-primary-foreground font-bold"
              >
                Generate SMART Goals
              </Button>
            </div>

            {/* Display list */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {generatedGoals.length > 0 ? (
                <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-4 shadow-sm">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5 border-b border-border/40 pb-3">
                    <Target size={16} className="text-violet-500" />
                    AI-Driven SMART ESG Milestones
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {generatedGoals.map((g, idx) => (
                      <div key={idx} className="p-4 border border-border bg-muted/20 rounded-xl hover:border-violet-500/20 transition-all flex flex-col justify-between gap-3">
                        <div>
                          <h5 className="font-bold text-xs text-foreground leading-normal">{g.title}</h5>
                          <div className="text-[10px] text-muted-foreground flex flex-col gap-0.5 mt-2">
                            <span>Metric: <strong>{g.metric}</strong></span>
                            <span>Target: <strong>{g.target}</strong></span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-border/40 pt-2.5">
                          <span>Timeline: <strong>{g.timeline}</strong></span>
                          <span className="font-bold bg-violet-500/10 text-violet-600 px-2 py-0.5 rounded-full">
                            {g.impact}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-card/20">
                  <Target size={42} className="text-muted-foreground/30 mb-3" />
                  <h4 className="text-sm font-bold text-foreground">No Goals Active</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Fill the console specifications to compile target benchmarks.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: What-If Simulator */}
        {activeTab === "simulator" && (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-12 animate-fadeIn">
            {/* Control Sliders */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-card flex flex-col gap-5 shadow-sm h-fit">
              <div>
                <h3 className="text-md font-bold text-foreground">Simulation Model</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust metrics variables to predict their impacts on consolidated pillar ratings.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                    <span>Carbon Emissions Reduction</span>
                    <span>{simParams.emissions_change}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="0"
                    value={simParams.emissions_change}
                    onChange={(e) => setSimParams({ ...simParams, emissions_change: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                    <span>CSR hours increase</span>
                    <span>+{simParams.csr_change}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simParams.csr_change}
                    onChange={(e) => setSimParams({ ...simParams, csr_change: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                    <span>Resolved compliance changes</span>
                    <span>+{simParams.compliance_change}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simParams.compliance_change}
                    onChange={(e) => setSimParams({ ...simParams, compliance_change: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                    <span>Goals progress increment</span>
                    <span>+{simParams.goal_completion_change}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={simParams.goal_completion_change}
                    onChange={(e) => setSimParams({ ...simParams, goal_completion_change: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-secondary rounded-lg"
                  />
                </div>
              </div>

              <Button
                onClick={runWhatIfSimulator}
                isLoading={loading["simulator"]}
                className="w-full bg-gradient-to-tr from-violet-600 to-indigo-600 hover:shadow-lg text-white font-bold"
              >
                Run Predictive Simulator
              </Button>
            </div>

            {/* Simulated Outputs */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {simResult ? (
                <div className="p-6 rounded-2xl border border-border bg-card flex flex-col gap-6 shadow-sm">
                  <h4 className="font-bold text-sm text-foreground border-b border-border/40 pb-3">
                    Simulated Rating Outcome Prediction
                  </h4>

                  {/* Grid cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Overall ESG", val: simResult.new_esg, color: "text-violet-500 bg-violet-500/5 border-violet-500/20" },
                      { label: "Environmental", val: simResult.new_env, color: "text-emerald-500 bg-emerald-500/5 border-emerald-500/20" },
                      { label: "Social Score", val: simResult.new_soc, color: "text-indigo-500 bg-indigo-500/5 border-indigo-500/20" },
                      { label: "Governance Score", val: simResult.new_gov, color: "text-amber-500 bg-amber-500/5 border-amber-500/20" }
                    ].map((item, idx) => (
                      <div key={idx} className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center ${item.color}`}>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">{item.label}</span>
                        <strong className="text-3xl font-black mt-2">{item.val}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Impact statement */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Simulated Strategic Value</span>
                    <div className="p-4 border border-border rounded-xl bg-muted/40 text-xs text-muted-foreground leading-normal">
                      <TypingEffect text={simResult.business_impact} speed={5} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full border border-dashed border-border/80 rounded-2xl flex flex-col items-center justify-center p-12 text-center bg-card/20">
                  <TrendingUp size={42} className="text-muted-foreground/30 mb-3" />
                  <h4 className="text-sm font-bold text-foreground">Simulator Awaiting Scenario</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mt-1">
                    Select variable increments in the simulation console to output predicted compliance ratings.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
