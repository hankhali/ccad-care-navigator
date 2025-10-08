import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Clock, TrendingUp } from "lucide-react";

const queueData = [
  { id: "P-001", severity: "emergency", symptom: "Chest Pain", wait: "Immediate", priority: 1 },
  { id: "P-002", severity: "urgent", symptom: "High Fever", wait: "15 min", priority: 2 },
  { id: "P-003", severity: "routine", symptom: "Mild Cough", wait: "45 min", priority: 3 },
  { id: "P-004", severity: "urgent", symptom: "Ankle Injury", wait: "30 min", priority: 2 },
];

export const Dashboard = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Real-Time Staff Dashboard
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intelligent patient flow management for healthcare professionals
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Patients</p>
                  <p className="text-3xl font-bold">47</p>
                </div>
                <Users className="w-8 h-8 text-primary" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Avg Wait Time</p>
                  <p className="text-3xl font-bold">23m</p>
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
              {queueData.map((patient, index) => (
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
                      <p className="font-semibold">{patient.wait}</p>
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
