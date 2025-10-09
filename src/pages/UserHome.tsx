import { useEffect, useState } from "react";
// AppLayout is provided by the parent `Dashboard` route; do not wrap here to avoid duplicate layout
import { getTriageHistory, TriageEntry, pushTriage, getAppointments, saveAppointment, getUaeUser, setUaeUser, getCaregivers, addCaregiver, predictRiskFromTriage, getRecommendationsFor, analyzeRepeatER, getProgression, pushProgression, autoBookAppointment, verifyInsuranceAsync, getMedicalRecords, saveMedicalRecord, getMedications, checkAllergies, getNotifications } from "@/lib/utils";
import { toast } from '@/components/ui/use-toast'
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TriageForm from "@/components/TriageForm";
import BookingModal from "@/components/BookingModal";
import ERWait from "@/components/ERWait";

export default function UserHome() {
  const [history, setHistory] = useState<TriageEntry[]>([]);
  const [uae, setUae] = useState<any>(null);
  const [showTriage, setShowTriage] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>(getCaregivers());
  const [newCgName, setNewCgName] = useState('');
  const [lastRisk, setLastRisk] = useState<{ riskScore: number; label: string } | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [erAnalytics, setErAnalytics] = useState<{ erCount: number; recentERIds: string[] } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<any[]>(getMedicalRecords());
  const [medications, setMedications] = useState<any[]>(getMedications());
  const [allergyList, setAllergyList] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>(getNotifications());
  const navigate = useNavigate();

  useEffect(() => {
  setHistory(getTriageHistory());
  setUae(getUaeUser());
  function onTriage() { setHistory(getTriageHistory()) }
  function onAppt() { setAppointments(getAppointments()); setNotifications(getNotifications()) }
  window.addEventListener('triage:created', onTriage)
  window.addEventListener('appointment:created', onAppt)
  // also notify caregivers: simple mock — call set to refresh
  function onNotify() { setCaregivers(getCaregivers()); setNotifications(getNotifications()) }
  window.addEventListener('triage:created', onNotify)
    function onOpen() { setShowTriage(true) }
    window.addEventListener('open:triage', onOpen as any)
  setAppointments(getAppointments())
  setErAnalytics(analyzeRepeatER())
    function onNotif() { setNotifications(getNotifications()) }
    window.addEventListener('notification:created', onNotif as any)
    return () => {
      window.removeEventListener('triage:created', onTriage as any)
  window.removeEventListener('appointment:created', onAppt)
      window.removeEventListener('open:triage', onOpen as any)
  window.removeEventListener('triage:created', onNotify)
      window.removeEventListener('notification:created', onNotif as any)
    }
  }, []);

  function handleStart() {
    // Create a quick mock triage entry for demo purposes
    const entry = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      summary: "Demo: Chest discomfort and shortness of breath",
      result: "ER" as const,
      confidence: 92,
      raw: {},
    };
    pushTriage(entry);
    setHistory(getTriageHistory());
    // compute predictions & recs
    const risk = predictRiskFromTriage(entry as any);
    setLastRisk(risk);
    setRecommendations(getRecommendationsFor(entry as any));
    setErAnalytics(analyzeRepeatER());
    alert('Demo triage saved — check Last Triage');
  }

  async function handleVerifyInsurance() {
    const u = getUaeUser();
    if (!u?.emiratesId) return alert('No Emirates ID on file — verify via UAE Pass first');
    setVerifying(true);
    const res = await verifyInsuranceAsync(u.emiratesId);
    setVerifying(false);
    toast({ title: `Insurance: ${res.provider}`, description: `${res.status}` })
  }

  function handleAutoBook() {
    const a = autoBookAppointment(['General Practice']);
    setAppointments(getAppointments());
    toast({ title: 'Auto-booked', description: `${a.specialty} at ${new Date(a.time).toLocaleString()}` })
  }

  function handleAddMedical(note: string) {
    const r = { id: String(Date.now()), date: new Date().toISOString(), note };
    saveMedicalRecord(r as any);
    setMedicalRecords(getMedicalRecords());
    toast({ title: 'Medical note saved' })
  }

  function runAllergyChecks() {
    const list = getMedications();
    const conflicts = list.filter(m => checkAllergies(m, allergyList));
    if (conflicts.length) toast({ title: 'Allergy conflicts', description: conflicts.map(c => c.name).join(', ') }); else toast({ title: 'Allergy check', description: 'No conflicts found' });
  }

  // download medical records JSON
  function downloadMedicalRecords() {
    const data = JSON.stringify(getMedicalRecords(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'medical-records.json'; a.click(); URL.revokeObjectURL(url);
    toast({ title: 'Download started', description: 'Medical records JSON' });
  }

  function handleUAE() {
    const mock = { name: "Demo User", emiratesId: "784-1987-1234567-1", verifiedAt: new Date().toISOString() };
    setUae(mock);
    setUaeUser(mock);
    window.location.reload();
  }

  return (
    <>
      <section className="py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome{uae?.name ? `, ${uae.name}` : ''}</h1>
              <p className="text-sm text-muted-foreground">Start a symptom check or view your recent triage results</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowTriage(true)}>Start Symptom Check</Button>
              <Button variant="outline" onClick={handleUAE}>{uae ? 'UAE Pass verified' : 'UAE Pass (Demo verify)'}</Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-card rounded border">
              <h3 className="text-lg font-semibold">Last Triage</h3>
              {history.length === 0 && <p className="text-sm text-muted-foreground mt-2">No triage found. Start the symptom checker.</p>}
              {history.length > 0 && (
                <div className="mt-2">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-medium">{history[0].result} — {history[0].summary}</div>
                    <div className="text-xs text-muted-foreground">{new Date(history[0].timestamp).toLocaleString()} • Confidence {history[0].confidence}%</div>
                  </div>
                  <div className="mt-3">
                    {lastRisk && (
                      <div className="p-2 rounded bg-yellow-50 border">Predicted risk: <strong>{lastRisk.riskScore}</strong> ({lastRisk.label})</div>
                    )}
                    {recommendations.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-medium">Recommendations</h4>
                        <ul className="list-disc ml-5 text-sm">
                          {recommendations.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-muted-foreground">ML hints: {JSON.stringify({})}</div>
                  </div>
                </div>
              )}
            </div>

            {erAnalytics && (
              <div className="p-4 bg-card rounded border">
                <h3 className="text-lg font-semibold">Analytics</h3>
                <div className="mt-2 text-sm">Repeat ER visits: <strong>{erAnalytics.erCount}</strong></div>
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-card rounded border">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
                <div className="mt-3 flex flex-col gap-2">
                  <Button onClick={() => navigate('/dashboard')}>View Dashboard</Button>
                  <Button variant="outline" onClick={handleStart}>Run Symptom Check</Button>
                  <Button variant="ghost" onClick={() => setShowBooking(true)}>Book Demo Appointment</Button>
                </div>
              </div>

              <ERWait />
            </div>
          </div>

          <div className="p-4 bg-card rounded border">
            <h3 className="text-lg font-semibold">Triage History</h3>
            <div className="mt-2 space-y-2">
              {history.length === 0 && <div className="text-sm text-muted-foreground">No history yet</div>}
              {history.map((h) => (
                <div key={h.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{h.result} • {h.summary}</div>
                    <div className="text-xs text-muted-foreground">{new Date(h.timestamp).toLocaleString()} • Confidence {h.confidence}%</div>
                  </div>
                  <div>
                    <Button variant="outline" onClick={() => { const entry = { id: String(Date.now()), timestamp: new Date().toISOString(), summary: h.summary, result: h.result, confidence: h.confidence, raw: h.raw }; pushTriage(entry); setHistory(getTriageHistory()); alert('Re-run saved'); }}>Re-run</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-card rounded border">
            <h3 className="text-lg font-semibold">Caregivers</h3>
            <div className="mt-2">
              <div className="flex gap-2">
                <input value={newCgName} onChange={(e) => setNewCgName(e.target.value)} placeholder="Caregiver name" className="p-2 border rounded flex-1" />
                <Button onClick={() => { if (!newCgName.trim()) return; const c = { id: String(Date.now()), name: newCgName.trim() }; addCaregiver(c); setCaregivers(getCaregivers()); setNewCgName(''); }}>Add</Button>
              </div>
              <div className="mt-3 space-y-2">
                {caregivers.length === 0 && <div className="text-sm text-muted-foreground">No caregivers added</div>}
                {caregivers.map((c) => (
                  <div key={c.id} className="p-2 border rounded flex items-center justify-between">
                    <div>{c.name} {c.relation ? `• ${c.relation}` : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-card rounded border">
            <h3 className="text-lg font-semibold">Appointments</h3>
            <div className="mt-2 space-y-2">
              {appointments.length === 0 && <div className="text-sm text-muted-foreground">No upcoming appointments</div>}
              {appointments.map((a) => (
                <div key={a.id} className="p-2 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.specialty} • {new Date(a.time).toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{a.location ?? 'Demo Clinic'} • {a.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-card rounded border">
            <h3 className="text-lg font-semibold">Notifications</h3>
            <div className="mt-2 space-y-2">
              {notifications.length === 0 && <div className="text-sm text-muted-foreground">No notifications</div>}
              {notifications.map((n) => (
                <div key={n.id} className="p-2 border rounded">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{n.message}</div>
                  <div className="text-xs text-muted-foreground">{new Date(n.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {showTriage && <TriageForm onClose={() => setShowTriage(false)} />}
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} onBooked={() => { /* could notify */ }} />}
    </>
  );
}
