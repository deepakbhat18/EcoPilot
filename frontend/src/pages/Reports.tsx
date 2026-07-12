import React, { useState } from "react";
import { TableWrapper } from "../components/TableWrapper";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import { FileText, Plus, Download, ShieldCheck } from "lucide-react";
import { showToast } from "../components/Toast";

export const Reports: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState("");
  const [category, setCategory] = useState("environmental");
  const [format, setFormat] = useState("pdf");

  const reportsHeaders = ["Document Title", "ESG Category", "Export Format", "Author Role", "Generation Date", "Download"];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle) return;
    
    
    setModalOpen(false);
    showToast(`Generating report "${reportTitle}"...`, "info");
    setTimeout(() => {
      showToast(`Report "${reportTitle}" generated successfully.`, "success");
      setReportTitle("");
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compliance Reports Manager</h1>
          <p className="text-sm text-muted-foreground/80">
            Generate and export verified ESG reporting formats for auditing agencies, boards, and public relations.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 self-start md:self-auto">
          <Plus size={16} /> New Report
        </Button>
      </div>

      {}
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Archived Compliance Exports</h2>
        <TableWrapper headers={reportsHeaders}>
          <tr>
            <td className="p-4 font-medium flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Annual Sustainability Assessment FY25
            </td>
            <td className="p-4"><span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">Environmental</span></td>
            <td className="p-4 font-bold text-xs">PDF Document</td>
            <td className="p-4">Senior ESG Consultant</td>
            <td className="p-4">2026-01-20</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary">
                <Download size={12} /> Download
              </Button>
            </td>
          </tr>
          <tr>
            <td className="p-4 font-medium flex items-center gap-2">
              <FileText size={16} className="text-primary" />
              Board Governance and Pay Equity Report
            </td>
            <td className="p-4"><span className="text-xs bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">Governance</span></td>
            <td className="p-4 font-bold text-xs">CSV Data Sheet</td>
            <td className="p-4">Lead Compliance Officer</td>
            <td className="p-4">2026-06-30</td>
            <td className="p-4">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-primary">
                <Download size={12} /> Download
              </Button>
            </td>
          </tr>
        </TableWrapper>
      </div>

      {}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Configure New ESG Export">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <Input 
            label="Report Title" 
            placeholder="e.g. Q2 Facility Carbon Inventory" 
            value={reportTitle} 
            onChange={(e) => setReportTitle(e.target.value)}
            required
          />
          <Select 
            label="ESG Domain Scope" 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "environmental", label: "Environmental (Carbon/Energy/Water)" },
              { value: "social", label: "Social (Workforce/Labor/Community)" },
              { value: "governance", label: "Governance (Board/SEC/Policies)" },
            ]} 
          />
          <Select 
            label="Export Format" 
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            options={[
              { value: "pdf", label: "Structured PDF Document" },
              { value: "csv", label: "Raw Tabular CSV Sheet" },
              { value: "json", label: "Machine-readable JSON feed" },
            ]} 
          />
          <div className="flex justify-end gap-2.5 mt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Plus size={14} /> Start Export
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
