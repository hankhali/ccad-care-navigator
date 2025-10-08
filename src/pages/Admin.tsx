import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Dashboard as DashboardComponent } from "@/components/Dashboard";

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  // Role bypass for static mode: if role is admin, allow access without Supabase session
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  useEffect(() => {
    console.log("Admin mount, role=", role);
    if (role === "admin") {
      // set a fake user for the layout
      const fake = { id: "admin" } as unknown as User;
      console.log("Admin: setting fake user", fake);
      setUser(fake);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      else navigate("/auth");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setUser(session.user);
      else navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    if (role === "admin") {
      localStorage.removeItem("role");
      navigate("/auth");
      return;
    }

    await supabase.auth.signOut();
    navigate("/auth");
  };

  // Stateful mock queue and audit log for admin interactions
  type Patient = {
    id: string;
    code: string;
    category: string;
    note: string;
    triage: string;
    timeMinutes: number;
    priority: number; // 1..3
  };

  const [queue, setQueue] = useState<Patient[]>(() => [
    { id: "1", code: "P-101", category: "Emergency", note: "Chest Pain — AI Triage: ER", triage: "ER", timeMinutes: 0, priority: 1 },
    { id: "2", code: "P-102", category: "Urgent", note: "High Fever — AI Triage: Urgent Care", triage: "Urgent Care", timeMinutes: 12, priority: 2 },
    { id: "3", code: "P-103", category: "Routine", note: "Mild Cough — AI Triage: Clinic", triage: "Clinic", timeMinutes: 40, priority: 3 },
  ]);

  const [auditLog, setAuditLog] = useState<string[]>([]);

  function pushAudit(entry: string) {
    const ts = new Date().toLocaleTimeString();
    setAuditLog((s) => [`[${ts}] ${entry}`, ...s].slice(0, 50));
  }

  function handleMarkSeen(id: string) {
    setQueue((q) => {
      const item = q.find((p) => p.id === id);
      if (item) pushAudit(`Marked seen: ${item.code} (${item.note})`);
      return q.filter((p) => p.id !== id);
    });
  }

  function handleOverridePriority(id: string) {
    setQueue((q) => {
      const next = q.map((p) => {
        if (p.id !== id) return p;
        const newPriority = p.priority === 3 ? 1 : p.priority + 1;
        pushAudit(`Overrode priority for ${p.code}: ${p.priority} → ${newPriority}`);
        return { ...p, priority: newPriority };
      });
      // simple re-sort: priority asc, then timeMinutes asc
      return [...next].sort((a, b) => a.priority - b.priority || a.timeMinutes - b.timeMinutes);
    });
  }

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading admin...</div>
          <div className="text-sm text-muted-foreground">Checking session and permissions</div>
        </div>
      </div>
    );

  return (
    <AppLayout userName={user.email ?? user.id} onSignOut={handleSignOut}>
      <section className="py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Console</h1>
              <p className="text-sm text-muted-foreground">Administrative controls and system overview</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded border shadow-sm">
              <h3 className="text-lg font-semibold">System Health</h3>
              <p className="text-muted-foreground mt-2">All services nominal</p>
            </div>
            <div className="p-4 bg-card rounded border shadow-sm">
              <h3 className="text-lg font-semibold">Active Sessions</h3>
              <p className="text-muted-foreground mt-2">42 active</p>
            </div>
            <div className="p-4 bg-card rounded border shadow-sm">
              <h3 className="text-lg font-semibold">Pending Alerts</h3>
              <p className="text-muted-foreground mt-2">0 critical</p>
            </div>
          </div>

          {/* Staff Dashboard MVP mock */}
          <div className="p-6 bg-card rounded border">
            <h3 className="text-lg font-semibold">Staff Dashboard (MVP)</h3>
            <p className="text-sm text-muted-foreground mt-2">Real-time patient queue management · Pre-filled triage · Predictive surge alerts · Resource recommendations</p>

            {/* Mock patient queue (stateful) */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Live Queue (mock)</h4>
                <div className="text-sm text-muted-foreground">{queue.length} waiting</div>
              </div>
              <div className="mt-2 space-y-3">
                {queue.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded shadow-sm border">
                    <div>
                      <div className="text-sm font-mono font-semibold">{p.code} • {p.category}</div>
                      <div className="text-sm">{p.note}</div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm font-semibold">{p.timeMinutes}m</div>
                        <div className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${p.priority===1? 'bg-red-100 text-red-700' : p.priority===2 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>Priority {p.priority}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-xs rounded border bg-white hover:bg-gray-50" onClick={() => handleOverridePriority(p.id)}>Override Priority</button>
                        <button className="px-3 py-1 text-xs rounded bg-green-50 text-green-700 border" onClick={() => handleMarkSeen(p.id)}>Mark Seen</button>
                      </div>
                    </div>
                  </div>
                ))}
                {queue.length === 0 && <div className="text-sm text-muted-foreground p-3">No patients waiting</div>}
              </div>
            </div>

            {/* Predictive surge alerts (mock) */}
            <div className="mt-6">
              <h4 className="font-semibold">Predictive Surge Alerts</h4>
              <div className="mt-2 space-y-2">
                <div className="p-3 bg-primary/5 border rounded">
                  <div className="text-sm">Expected pediatric surge in 2 hours</div>
                  <div className="text-xs text-muted-foreground">Forecast: +18% visits</div>
                </div>
                <div className="p-3 bg-primary/5 border rounded">
                  <div className="text-sm">Seasonal respiratory uptick predicted tomorrow morning</div>
                  <div className="text-xs text-muted-foreground">Confidence: High</div>
                </div>
              </div>
            </div>

            {/* Resource allocation recommendations (mock) */}
            <div className="mt-6">
              <h4 className="font-semibold">Resource Allocation Recommendations</h4>
              <div className="mt-2 grid md:grid-cols-3 gap-3">
                <div className="p-3 bg-card rounded border">
                  <div className="text-sm font-medium">ER Nurses</div>
                  <div className="text-xs text-muted-foreground">Recommend +2 staff for next 3 hours</div>
                </div>
                <div className="p-3 bg-card rounded border">
                  <div className="text-sm font-medium">Triage Rooms</div>
                  <div className="text-xs text-muted-foreground">Open 1 additional triage room</div>
                </div>
                <div className="p-3 bg-card rounded border">
                  <div className="text-sm font-medium">Ambulance Transport</div>
                  <div className="text-xs text-muted-foreground">Standby expected to increase by 10%</div>
                </div>
              </div>
            </div>

            {/* Audit log */}
            <div className="mt-6">
              <h4 className="font-semibold">Audit Log</h4>
              <div className="mt-2 max-h-48 overflow-auto bg-white border rounded p-2 text-xs font-mono">
                {auditLog.length === 0 && <div className="text-muted-foreground">No actions yet</div>}
                {auditLog.map((a, i) => (
                  <div key={i} className="py-1 border-b last:border-b-0">{a}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}

