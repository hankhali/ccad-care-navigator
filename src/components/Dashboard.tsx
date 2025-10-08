import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Clock, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

type Patient = {
  id: string;
  severity: "emergency" | "urgent" | "routine";
  symptom: string;
  waitMinutes: number; // store minutes
  priority: number;
};

const seedQueue: Patient[] = [
  { id: "P-001", severity: "emergency", symptom: "Chest Pain", waitMinutes: 0, priority: 1 },
  { id: "P-002", severity: "urgent", symptom: "High Fever", waitMinutes: 15, priority: 2 },
  { id: "P-003", severity: "routine", symptom: "Mild Cough", waitMinutes: 45, priority: 3 },
  { id: "P-004", severity: "urgent", symptom: "Ankle Injury", waitMinutes: 30, priority: 2 },
];

const symptoms = [
  "Chest Pain",
  "High Fever",
  "Mild Cough",
  "Ankle Injury",
  "Abdominal Pain",
  "Shortness of Breath",
  "Headache",
  "Sprained Wrist",
];

function fmtWait(minutes: number) {
  if (minutes <= 0) return "Immediate";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h}h ${minutes % 60}m`;
}

export const Dashboard = () => {
  const [queue, setQueue] = useState<Patient[]>(() => seedQueue.map((p) => ({ ...p })));
  const [isRunning, setIsRunning] = useState(true);
  const [intervalSec, setIntervalSec] = useState(5);
  const [replayMode, setReplayMode] = useState(false);
  const [scenario, setScenario] = useState<string | null>(null);
  const scenarioRef = useRef<number>(0);
  const tickRef = useRef<number | null>(null);

  // Derived metrics
  const activePatients = queue.length;
  const avgWait = useMemo(() => {
    if (!queue.length) return "0m";
    const avg = Math.round(queue.reduce((s, p) => s + p.waitMinutes, 0) / queue.length);
    return fmtWait(avg);
  }, [queue]);

  useEffect(() => {
    if (!isRunning) return;

    if (replayMode && scenario) {
      // deterministic scenario playback
      const timeline = scenarios[scenario];
      let idx = scenarioRef.current || 0;
      tickRef.current = window.setInterval(() => {
        const event = timeline[idx];
        if (event) {
          setQueue((prev) => {
            const next = prev.map((p) => ({ ...p, waitMinutes: p.waitMinutes + Math.round(intervalSec / 2) }));
            if (event.type === 'add') {
              next.unshift({ ...event.patient });
            } else if (event.type === 'remove') {
              const i = next.findIndex((p) => p.id === event.patientId);
              if (i >= 0) next.splice(i, 1);
            }
            if (next.length > 12) next.splice(12);
            return next;
          });
        }
        idx += 1;
        scenarioRef.current = idx;
        if (idx >= timeline.length) {
          // stop at end of scenario
          setIsRunning(false);
        }
      }, intervalSec * 1000);
    } else {
      tickRef.current = window.setInterval(() => {
        setQueue((prev) => {
          // increment waits by 1 minute (for demo speed, increase faster)
          const next = prev.map((p) => ({ ...p, waitMinutes: p.waitMinutes + Math.round(intervalSec / 2) }));

          // occasionally add a new patient
          if (Math.random() < 0.3) {
            const id = `P-${String(Math.floor(Math.random() * 900) + 100)}`;
            const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
            const severityRoll = Math.random();
            const severity: Patient["severity"] = severityRoll < 0.12 ? "emergency" : severityRoll < 0.5 ? "urgent" : "routine";
            const priority = severity === "emergency" ? 1 : severity === "urgent" ? 2 : 3;
            next.unshift({ id, severity, symptom, waitMinutes: Math.round(Math.random() * 5), priority });
          }

          // occasionally remove a patient (served)
          if (Math.random() < 0.25 && next.length > 0) {
            next.splice(Math.floor(Math.random() * next.length), 1);
          }

          // limit queue size for demo
          if (next.length > 12) next.splice(12);

          return next;
        });
      }, intervalSec * 1000);
    }

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [isRunning, intervalSec]);

  // Simple deterministic scenarios
  const scenarios: Record<string, Array<any>> = {
    smallSpike: [
      { type: 'add', patient: { id: 'S-201', severity: 'urgent', symptom: 'Shortness of Breath', waitMinutes: 0, priority: 2 } },
      { type: 'add', patient: { id: 'S-202', severity: 'urgent', symptom: 'Abdominal Pain', waitMinutes: 1, priority: 2 } },
      { type: 'add', patient: { id: 'S-203', severity: 'routine', symptom: 'Headache', waitMinutes: 2, priority: 3 } },
      { type: 'remove', patientId: 'P-001' },
      { type: 'add', patient: { id: 'S-204', severity: 'emergency', symptom: 'Severe Bleeding', waitMinutes: 0, priority: 1 } },
    ],
    steadyFlow: [
      { type: 'add', patient: { id: 'F-301', severity: 'routine', symptom: 'Sprained Wrist', waitMinutes: 0, priority: 3 } },
      { type: 'remove', patientId: 'P-002' },
      { type: 'add', patient: { id: 'F-302', severity: 'urgent', symptom: 'High Fever', waitMinutes: 0, priority: 2 } },
      { type: 'remove', patientId: 'P-003' },
      { type: 'add', patient: { id: 'F-303', severity: 'routine', symptom: 'Cough', waitMinutes: 0, priority: 3 } },
    ]
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold">Real-Time Staff Dashboard</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">Intelligent patient flow management for healthcare professionals</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Update interval</label>
            <select value={String(intervalSec)} onChange={(e) => setIntervalSec(Number(e.target.value))} className="border px-2 py-1 rounded">
              <option value={2}>2s</option>
              <option value={5}>5s</option>
              <option value={10}>10s</option>
            </select>

            <label className="text-sm text-muted-foreground">Replay</label>
            <select value={scenario ?? ""} onChange={(e) => setScenario(e.target.value || null)} className="border px-2 py-1 rounded">
              <option value="">Live (random)</option>
              <option value="smallSpike">Scenario: Small Spike</option>
              <option value="steadyFlow">Scenario: Steady Flow</option>
            </select>

            <button onClick={() => { setReplayMode(Boolean(scenario)); setIsRunning(true); scenarioRef.current = 0; }} className="ml-2 px-3 py-2 rounded bg-primary text-white">
              Play
            </button>
            <button onClick={() => setIsRunning((s) => !s)} className="ml-2 px-3 py-2 rounded border">
              {isRunning ? "Pause" : "Resume"}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Patients</p>
                  <p className="text-3xl font-bold">{activePatients}</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Wait Time</p>
                  <p className="text-3xl font-bold">{avgWait}</p>
                </div>
                <Clock className="w-8 h-8 text-info" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ER Capacity</p>
                  <p className="text-3xl font-bold">68%</p>
                </div>
                <Activity className="w-8 h-8 text-urgent" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Efficiency</p>
                  <p className="text-3xl font-bold">+34%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-routine" />
              </div>
            </Card>
          </div>

          {/* Patient Queue */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Patient Queue</h3>
              <Badge variant="secondary">Live Updates</Badge>
            </div>
            <div className="space-y-3">
              {queue.map((patient, index) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        patient.severity === "emergency" ? "bg-emergency animate-pulse" :
                        patient.severity === "urgent" ? "bg-urgent" :
                        "bg-routine"
                      }`} />
                      <span className="font-mono font-semibold">{patient.id}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{patient.symptom}</p>
                      <p className="text-sm text-muted-foreground">AI Triage Complete</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={
                        patient.severity === "emergency" ? "destructive" :
                        patient.severity === "urgent" ? "default" :
                        "secondary"
                      }
                    >
                      Priority {patient.priority}
                    </Badge>
                    <div className="text-right min-w-24">
                      <p className="font-semibold">{fmtWait(patient.waitMinutes)}</p>
                      <p className="text-xs text-muted-foreground">Est. Wait</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Insights */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-6 bg-routine/10 border-routine/20">
              <div className="space-y-2">
                <Activity className="w-6 h-6 text-routine" />
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Redirected from ER Today</p>
              </div>
            </Card>
            <Card className="p-6 bg-primary/10 border-primary/20">
              <div className="space-y-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <p className="text-2xl font-bold">AED 8,400</p>
                <p className="text-sm text-muted-foreground">Saved Today</p>
              </div>
            </Card>
            <Card className="p-6 bg-urgent/10 border-urgent/20">
              <div className="space-y-2">
                <Clock className="w-6 h-6 text-urgent" />
                <p className="text-2xl font-bold">94%</p>
                <p className="text-sm text-muted-foreground">On-Time Performance</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
