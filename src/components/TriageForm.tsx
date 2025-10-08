import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pushTriage } from "@/lib/utils";

interface TriageFormProps {
  onClose?: () => void;
}

export default function TriageForm({ onClose }: TriageFormProps) {
  const [step, setStep] = useState(1);
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState(2);
  const [hasBleeding, setHasBleeding] = useState(false);
  const [hasBreath, setHasBreath] = useState(false);
  const [nausea, setNausea] = useState(false);

  function classifyEntry(data: { symptoms: string; severity: number; hasBleeding: boolean; hasBreath: boolean; duration: string }) {
    // deterministic scoring
    let score = data.severity * 2;
    if (data.hasBleeding) score += 4;
    if (data.hasBreath) score += 5;
    if (data.symptoms.toLowerCase().includes('chest')) score += 6;
    if (data.symptoms.toLowerCase().includes('fever')) score += 2;
    if (data.duration && data.duration.match(/\d+/)) score += Math.min(3, parseInt(data.duration.match(/\d+/)![0], 10) > 3 ? 3 : 0);

    if (score >= 12) return { result: 'ER' as const, confidence: 90 };
    if (score >= 8) return { result: 'Urgent' as const, confidence: 78 };
    if (score >= 4) return { result: 'Clinic' as const, confidence: 68 };
    return { result: 'Home' as const, confidence: 55 };
  }

  function handleSubmit() {
    const data = { symptoms, severity, hasBleeding, hasBreath, duration };
    const classified = classifyEntry(data);
    const entry = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      summary: symptoms.slice(0, 140) || 'Symptom check',
      result: classified.result,
      confidence: classified.confidence,
      raw: data,
    };
    pushTriage(entry as any);
    try { window.dispatchEvent(new CustomEvent('triage:created', { detail: entry })); } catch {}
    if (onClose) onClose();
    // use small in-UI notice instead of alert in production; for now keep simple
    alert(`Triage: ${entry.result} — Confidence ${entry.confidence}%`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="bg-card p-6 rounded shadow-lg z-10 w-[520px]">
        <h3 className="text-lg font-semibold">Symptom Assessment</h3>

        {step === 1 && (
          <div className="mt-4">
            <label className="text-sm">Describe your main symptom</label>
            <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} className="w-full mt-2 p-2 border rounded" rows={3} placeholder="E.g., chest pain, fever, cough" />
            <div className="mt-4 flex justify-end gap-2">
              <Button onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <label className="text-sm">Duration (days)</label>
            <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full mt-2 p-2 border rounded" placeholder="e.g., 2" />
            <label className="text-sm mt-3 block">Severity (1-5)</label>
            <input type="range" min={1} max={5} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="w-full mt-2" />
            <div className="mt-3 flex gap-3">
              <label className="flex items-center gap-2"><input type="checkbox" checked={hasBreath} onChange={(e) => setHasBreath(e.target.checked)} /> Shortness of breath</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={hasBleeding} onChange={(e) => setHasBleeding(e.target.checked)} /> Active bleeding</label>
            </div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <h4 className="font-medium">Review & Submit</h4>
            <div className="mt-2 text-sm text-muted-foreground">Symptoms: {symptoms || '—'}</div>
            <div className="mt-1 text-sm text-muted-foreground">Duration: {duration || '—'}</div>
            <div className="mt-1 text-sm text-muted-foreground">Severity: {severity}</div>
            <div className="mt-1 text-sm text-muted-foreground">Shortness of breath: {hasBreath ? 'Yes' : 'No'}</div>
            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmit}>Submit Assessment</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
