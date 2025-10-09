export type TriageEntry = {
  id: string;
  timestamp: string;
  summary: string;
  result: "ER" | "Urgent" | "Clinic" | "Home";
  confidence: number;
  raw?: any;
};

export type Appointment = {
  id: string;
  specialty: string;
  time: string;
  location?: string;
  status?: "confirmed" | "pending" | "cancelled";
  queuePosition?: number;
  genderPreference?: "any" | "male" | "female";
};

const safeParse = (k: string) => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(k) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function getTriageHistory(): TriageEntry[] {
  return safeParse("triageHistory") || [];
}

export function pushTriage(entry: TriageEntry) {
  const cur = getTriageHistory();
  cur.unshift(entry);
  try {
    localStorage.setItem("triageHistory", JSON.stringify(cur.slice(0, 50)));
  } catch {}
}

export function clearTriageHistory() {
  try { localStorage.removeItem("triageHistory"); } catch {}
}

export function getAppointments(): Appointment[] {
  return safeParse("appointments") || [];
}

export function saveAppointment(a: Appointment) {
  const cur = getAppointments();
  cur.unshift(a);
  try { localStorage.setItem("appointments", JSON.stringify(cur.slice(0, 50))); } catch {}
}

export function getUaeUser() {
  return safeParse("uaeUser");
}

export function setUaeUser(obj: any) {
  try { localStorage.setItem("uaeUser", JSON.stringify(obj)); } catch {}
}

// Mock insurance verification. Returns a small object with provider and status
export function verifyInsurance(nationalId: string): { provider: string; status: 'verified' | 'unverified' } {
  // naive deterministic hash: last digit -> pick provider
  const last = Number(String(nationalId || '').slice(-1)) || 0;
  const provider = last % 2 === 0 ? 'THIQA' : 'Daman';
  const status = last % 5 === 0 ? 'unverified' : 'verified';
  const res = { provider, status } as const;
  try { localStorage.setItem('insurance_verification', JSON.stringify(res)); } catch {}
  return res;
}

// Async mock for real-time eligibility check (returns a promise)
export function verifyInsuranceAsync(nationalId: string): Promise<{ provider: string; status: 'verified' | 'unverified'; details?: string }> {
  return new Promise((res) => {
    setTimeout(() => {
      const base = verifyInsurance(nationalId);
      res({ provider: base.provider, status: base.status, details: `Mock eligibility check for ${nationalId}` });
    }, 600);
  });
}

// Auto-booking: pick earliest 'time' (now + random delta) and create appointment
export function autoBookAppointment(preferredSpecialties: string[] = ['General Practice']): Appointment {
  const specialty = preferredSpecialties[0] || 'General Practice';
  const when = new Date(Date.now() + (Math.floor(Math.random() * 5) + 1) * 3600 * 1000).toISOString();
  const a: Appointment = { id: String(Date.now()), specialty, time: when, location: 'Auto Clinic', status: 'confirmed', queuePosition: 1 };
  saveAppointment(a);
  return a;
}

// Medical records (mocked) - small CRUD
export type MedicalRecord = { id: string; date: string; note: string; type?: string };
export function getMedicalRecords(): MedicalRecord[] { return safeParse('medical_records') || [] }
export function saveMedicalRecord(r: MedicalRecord) { const cur = getMedicalRecords(); cur.unshift(r); try { localStorage.setItem('medical_records', JSON.stringify(cur.slice(0,200))) } catch {} }

// Pharmacy helpers
export type Medication = { id: string; name: string; dose?: string; allergies?: string[] };
export function getMedications(): Medication[] { return safeParse('medications') || [{ id: 'm1', name: 'Paracetamol', dose: '500mg', allergies: [] }] }
export function checkAllergies(med: Medication, allergies: string[] = []): boolean { return (med.allergies || []).some(a => allergies.includes(a)) }

export type Caregiver = { id: string; name: string; phone?: string; relation?: string };
export function getCaregivers(): Caregiver[] { return safeParse('caregivers') || [] }
export function addCaregiver(c: Caregiver) { const cur = getCaregivers(); cur.unshift(c); try { localStorage.setItem('caregivers', JSON.stringify(cur.slice(0,50))) } catch {} }

// SMS fallback: store a record of SMS messages to send when offline
export function sendSmsFallback(phone: string, message: string) {
  try {
    const raw = safeParse('sms_outbox') || [];
    raw.unshift({ id: String(Date.now()), phone, message, ts: new Date().toISOString() });
    localStorage.setItem('sms_outbox', JSON.stringify(raw.slice(0, 200)));
  } catch {}
}

// Notifications (mock)
export type Notification = { id: string; ts: string; to: string; title: string; message: string; read?: boolean };
export function getNotifications(): Notification[] { return safeParse('notifications') || [] }
export function pushNotification(n: Notification) { try { const cur = getNotifications(); cur.unshift(n); localStorage.setItem('notifications', JSON.stringify(cur.slice(0,200))); } catch {} }

// notify all caregivers about an event
export function notifyCaregiversForEvent(eventType: 'triage'|'appointment', detail: any) {
  const caregivers = getCaregivers();
  caregivers.forEach((c) => {
    const n: Notification = { id: String(Date.now()) + ':' + c.id, ts: new Date().toISOString(), to: c.id, title: `Notification: ${eventType}`, message: `${detail.result || detail.specialty || ''} — ${detail.summary || detail.time || ''}`, read: false };
    pushNotification(n);
  });
  // also create a notification for the current user (frontend demo)
  try {
    const userNotif: Notification = { id: String(Date.now()) + ':user', ts: new Date().toISOString(), to: 'user', title: `Notification: ${eventType}`, message: `${detail.result || detail.specialty || ''} — ${detail.summary || detail.time || ''}`, read: false };
    pushNotification(userNotif);
  } catch {}
  try { window.dispatchEvent(new CustomEvent('notification:created')) } catch {}
}

// --- Frontend-only mock AI helpers (placeholders for real ML integration) ---

// Predict a simple risk score (0-100) from a triage entry using deterministic heuristics
export function predictRiskFromTriage(entry: TriageEntry): { riskScore: number; label: 'low'|'medium'|'high' } {
  let score = entry.confidence || 50;
  if (entry.result === 'ER') score = Math.max(score, 85);
  if (entry.result === 'Urgent') score = Math.max(score, 70);
  // factor keywords
  const s = (entry.summary || '').toLowerCase();
  if (s.includes('chest') || s.includes('shortness')) score += 10;
  if (s.includes('fever')) score += 4;
  score = Math.min(100, Math.round(score));
  const label = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low';
  return { riskScore: score, label };
}

// Track symptom progression: append small records keyed by triage summary (crudely)
export function pushProgression(summaryKey: string, note: { ts?: string; note: string }) {
  try {
    const key = `progression:${summaryKey}`;
    const cur = safeParse(key) || [];
    cur.unshift({ ts: note.ts || new Date().toISOString(), note: note.note });
    localStorage.setItem(key, JSON.stringify(cur.slice(0, 200)));
  } catch {}
}

export function getProgression(summaryKey: string) {
  try { return safeParse(`progression:${summaryKey}`) || [] } catch { return [] }
}

// Analyze repeat ER visitors: count how many triages mapped to ER in the stored history
export function analyzeRepeatER(): { erCount: number; recentERIds: string[] } {
  const hist = getTriageHistory();
  const ers = hist.filter((h) => h.result === 'ER');
  return { erCount: ers.length, recentERIds: ers.slice(0, 5).map((e) => e.id) };
}

// Simple rule-based personalized recommendations based on triage entry
export function getRecommendationsFor(entry: TriageEntry) {
  const txt = (entry.summary || '').toLowerCase();
  const recs: string[] = [];
  if (entry.result === 'ER' || txt.includes('chest') || txt.includes('shortness')) {
    recs.push('Seek immediate care: go to the nearest Emergency Department or call emergency services.');
  }
  if (txt.includes('fever')) recs.push('Stay hydrated and monitor temperature. If fever > 39°C or worsening, seek care.');
  if (entry.result === 'Clinic') recs.push('Book a clinic appointment — bring any recent test results and a list of medications.');
  if (entry.result === 'Home') recs.push('Rest, stay hydrated, and follow symptom guidance. Use telehealth if symptoms worsen.');
  if (recs.length === 0) recs.push('Monitor symptoms and contact your provider if they worsen.');
  return recs;
}

// Placeholder: returns a small object indicating where to send telemetry for a real ML service
export function getMLIntegrationHints() {
  return { endpoint: '/api/ml/triage-predict', note: 'Frontend-only demo — implement backend ML service to replace these heuristics.' };
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
