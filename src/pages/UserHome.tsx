import { useEffect, useState } from "react";
// AppLayout is provided by the parent `Dashboard` route; do not wrap here to avoid duplicate layout
import { getTriageHistory, TriageEntry, pushTriage, getAppointments, saveAppointment, getUaeUser, setUaeUser, getCaregivers, addCaregiver, predictRiskFromTriage, getRecommendationsFor, analyzeRepeatER, getProgression, pushProgression } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TriageForm from "@/components/TriageForm";
import EnhancedTriageForm from "@/components/EnhancedTriageForm";
import FollowUpReminders from "@/components/FollowUpReminders";
import WearableSync from "@/components/WearableSync";
import PharmacyIntegration from "@/components/PharmacyIntegration";
import InsuranceClaims from "@/components/InsuranceClaims";
import Telehealth from "@/components/Telehealth";
import SmartNotifications from "@/components/SmartNotifications";
import BottomNavigation from "@/components/BottomNavigation";
import BookingModal from "@/components/BookingModal";
import ERWait from "@/components/ERWait";
import "./UserHome.css";

export default function UserHome() {
  const [history, setHistory] = useState<TriageEntry[]>([]);
  const [uae, setUae] = useState<any>(null);
  const [showTriage, setShowTriage] = useState(false);
  const [showEnhancedTriage, setShowEnhancedTriage] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>(getCaregivers());
  const [newCgName, setNewCgName] = useState('');
  const [lastRisk, setLastRisk] = useState<{ riskScore: number; label: string } | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [erAnalytics, setErAnalytics] = useState<{ erCount: number; recentERIds: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const getSeverityColor = (severity: number) => {
    const colors = [
      "#10b981", "#22c55e", "#84cc16", "#eab308", "#f59e0b",
      "#f97316", "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"
    ];
    return colors[severity - 1] || "#6b7280";
  };

  useEffect(() => {
  setHistory(getTriageHistory());
  setUae(getUaeUser());
    function onTriage() { setHistory(getTriageHistory()) }
    function onAppt() { /* could refresh appts if shown */ }
    window.addEventListener('triage:created', onTriage as any)
    window.addEventListener('appointment:created', onAppt as any)
  // also notify caregivers: simple mock — call set to refresh
  function onNotify() { setCaregivers(getCaregivers()) }
  window.addEventListener('triage:created', onNotify as any)
    function onOpen() { setShowTriage(true) }
    window.addEventListener('open:triage', onOpen as any)
  setAppointments(getAppointments())
  setErAnalytics(analyzeRepeatER())
    return () => {
      window.removeEventListener('triage:created', onTriage as any)
      window.removeEventListener('appointment:created', onAppt as any)
      window.removeEventListener('open:triage', onOpen as any)
      window.removeEventListener('triage:created', onNotify as any)
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

  function handleUAE() {
    const mock = { name: "Demo User", emiratesId: "784-1987-1234567-1", verifiedAt: new Date().toISOString() };
    setUae(mock);
    setUaeUser(mock);
    window.location.reload();
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'history':
        return renderHistoryContent();
      case 'health':
        return <WearableSync />;
      case 'care':
        return renderCareContent();
      case 'notifications':
        return <SmartNotifications />;
      case 'pharmacy':
        return <PharmacyIntegration />;
      case 'telehealth':
        return <Telehealth />;
      case 'insurance':
        return <InsuranceClaims />;
      default:
        return renderHomeContent();
    }
  };

  const renderHomeContent = () => (
    <>
      {/* Hero Section - Problem Statement Focus */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">ER Quick</h1>
          <p className="hero-subtitle">
            Get instant health recommendations and know where to seek care
          </p>
        </div>
      </div>

      {/* Main Symptom Checker CTA */}
      <div className="symptom-checker-section">
        <div className="checker-card">
          <div className="checker-icon">🏥</div>
          <h2>Start Your Health Assessment</h2>
          <p>Get instant, AI-powered recommendations for your symptoms</p>
          <button 
            className="primary-cta-btn" 
            onClick={() => setShowEnhancedTriage(true)}
          >
            Begin Symptom Check
          </button>
        </div>
      </div>

      {/* Current ER Status */}
      <div className="er-status-section">
        <div className="er-status-card">
          <div className="er-status-header">
            <h3>Current ER Status</h3>
            <div className="status-indicator busy">Busy</div>
          </div>
          <div className="er-metrics">
            <div className="metric">
              <span className="metric-value">14 min</span>
              <span className="metric-label">Current Wait Time</span>
            </div>
            <div className="metric">
              <span className="metric-value">23</span>
              <span className="metric-label">Patients Waiting</span>
            </div>
            <div className="metric">
              <span className="metric-value">7</span>
              <span className="metric-label">Available Beds</span>
            </div>
          </div>
          <div className="er-recommendation">
            💡 Consider urgent care or telehealth for non-emergency symptoms
          </div>
        </div>
      </div>

      {/* Last Assessment Results */}
      {history.length > 0 && (
        <div className="last-assessment-section">
          <div className="assessment-card">
            <div className="assessment-header">
              <h3>Your Last Assessment</h3>
              <div className="assessment-date">
                {new Date(history[0].timestamp).toLocaleDateString()}
              </div>
            </div>
            <div className="assessment-result">
              <div className="result-recommendation">
                <span className="result-type">{history[0].result.replace('_', ' ')}</span>
                {(history[0] as any).urgencyLevel && (
                  <span className="urgency-badge" style={{
                    backgroundColor: 
                      (history[0] as any).urgencyLevel === 'Critical' ? '#ef4444' :
                      (history[0] as any).urgencyLevel === 'High' ? '#f59e0b' :
                      (history[0] as any).urgencyLevel === 'Medium' ? '#10b981' : '#6b7280'
                  }}>
                    {(history[0] as any).urgencyLevel}
                  </span>
                )}
              </div>
              <div className="result-summary">{history[0].summary}</div>
              <div className="result-confidence">
                Confidence: {history[0].confidence}%
              </div>
            </div>
            <button 
              className="secondary-btn"
              onClick={() => setShowEnhancedTriage(true)}
            >
              New Assessment
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="how-it-works-section">
        <h3>How Our AI Triage Works</h3>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Describe Symptoms</h4>
              <p>Tell us about your symptoms, pain level, and duration</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>AI Analysis</h4>
              <p>Our AI analyzes your symptoms using medical algorithms</p>
            </div>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Get Recommendation</h4>
              <p>Receive personalized care recommendations and next steps</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderHistoryContent = () => (
    <div className="tab-content">
      <h2 className="tab-title">Triage History</h2>
      <FollowUpReminders />
      <div className="history-section" style={{marginTop: '20px'}}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Assessment History</h2>
          </div>
          {history.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div>No history yet</div>
            </div>
          )}
          {history.map((h) => (
            <div key={h.id} className="history-item">
              <div className="history-content">
                <div className="history-title">
                  {h.result} • {h.summary}
                  {(h as any).severity && (
                    <span className="severity-badge" style={{backgroundColor: getSeverityColor((h as any).severity)}}>
                      {(h as any).severity}/10
                    </span>
                  )}
                </div>
                <div className="history-meta">
                  {new Date(h.timestamp).toLocaleString()} • Confidence {h.confidence}%
                  {(h as any).hasPhotos && <span className="feature-badge">📷</span>}
                  {(h as any).hasVoiceNote && <span className="feature-badge">🎤</span>}
                  {(h as any).followUpDate && <span className="feature-badge">📅</span>}
                </div>
              </div>
              <button className="history-action" onClick={() => { 
                const entry = { id: String(Date.now()), timestamp: new Date().toISOString(), summary: h.summary, result: h.result, confidence: h.confidence, raw: h.raw }; 
                pushTriage(entry); 
                setHistory(getTriageHistory()); 
                alert('Re-run saved'); 
              }}>Re-run</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCareContent = () => (
    <div className="tab-content">
      <h2 className="tab-title">Healthcare Services</h2>
      <div className="care-grid">
        <div className="care-item" onClick={() => setActiveTab('telehealth')}>
          <div className="care-icon">📹</div>
          <h3>Telehealth</h3>
          <p>Video consultations with doctors</p>
        </div>
        <div className="care-item" onClick={() => setActiveTab('pharmacy')}>
          <div className="care-icon">💊</div>
          <h3>Pharmacy</h3>
          <p>Prescription management</p>
        </div>
        <div className="care-item" onClick={() => setShowBooking(true)}>
          <div className="care-icon">📅</div>
          <h3>Appointments</h3>
          <p>Schedule medical visits</p>
        </div>
        <div className="care-item" onClick={() => setActiveTab('insurance')}>
          <div className="care-icon">🛡️</div>
          <h3>Insurance</h3>
          <p>Claims and coverage</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="user-dashboard has-bottom-nav">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-content">
            <div className="header-left">
              <span className="header-title">ER Quick</span>
            </div>
            <div className="header-right">
              <button onClick={() => navigate('/admin')} className="admin-btn">
                Admin
              </button>
            </div>
          </div>
        </header>
        
        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>
      
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      {showTriage && <TriageForm onClose={() => setShowTriage(false)} />}
      {showEnhancedTriage && <EnhancedTriageForm onClose={() => setShowEnhancedTriage(false)} />}
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} onBooked={() => { /* could notify */ }} />}
    </>
  );
}
