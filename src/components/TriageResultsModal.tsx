import { X, AlertTriangle, Clock, Target, CheckCircle, Calendar, Phone } from "lucide-react";
import "./TriageResultsModal.css";

interface TriageResult {
  recommendation: string;
  confidence: number;
  urgencyLevel: string;
  estimatedWaitTime: string;
  reasoning: string[];
  nextSteps: string[];
  redFlags: string[];
  followUpRecommended: boolean;
}

interface TriageResultsModalProps {
  result: TriageResult;
  onClose: () => void;
  onNewAssessment: () => void;
}

export default function TriageResultsModal({ result, onClose, onNewAssessment }: TriageResultsModalProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#10b981';
      case 'low': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'er': return '🚨';
      case 'urgent_care': return '⚡';
      case 'clinic': return '🏥';
      case 'telehealth': return '📹';
      case 'self_care': return '🏠';
      default: return '🏥';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case 'er': return '#ef4444';
      case 'urgent_care': return '#f59e0b';
      case 'clinic': return '#10b981';
      case 'telehealth': return '#3b82f6';
      case 'self_care': return '#6b7280';
      default: return '#10b981';
    }
  };

  return (
    <div className="triage-results-overlay">
      <div className="triage-results-modal">
        {/* Header */}
        <div className="results-header">
          <div className="results-header-content">
            <div className="header-icon">
              <CheckCircle size={24} />
            </div>
            <div className="header-text">
              <h2>Assessment Complete</h2>
              <p>AI-powered health recommendation</p>
            </div>
          </div>
          <button onClick={onClose} className="close-results-btn">
            <X size={20} />
          </button>
        </div>

        {/* Main Recommendation */}
        <div className="main-recommendation">
          <div className="recommendation-card" style={{ borderColor: getRecommendationColor(result.recommendation) }}>
            <div className="recommendation-icon" style={{ backgroundColor: getRecommendationColor(result.recommendation) }}>
              {getRecommendationIcon(result.recommendation)}
            </div>
            <div className="recommendation-content">
              <div className="recommendation-title">
                {result.recommendation.replace('_', ' ')}
              </div>
              <div className="recommendation-subtitle">
                Recommended care level for your symptoms
              </div>
            </div>
            <div className="confidence-display">
              <div className="confidence-number">{result.confidence}%</div>
              <div className="confidence-label">Confidence</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="metrics-row">
          <div className="metric-item">
            <div className="metric-icon urgency" style={{ backgroundColor: getUrgencyColor(result.urgencyLevel) }}>
              <AlertTriangle size={16} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Urgency</div>
              <div className="metric-value">{result.urgencyLevel}</div>
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon wait-time">
              <Clock size={16} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Estimated Wait</div>
              <div className="metric-value">{result.estimatedWaitTime}</div>
            </div>
          </div>
        </div>

        {/* Red Flags Alert */}
        {result.redFlags.length > 0 && (
          <div className="red-flags-section">
            <div className="red-flags-header">
              <AlertTriangle size={18} />
              <span>Important Alerts</span>
            </div>
            <div className="red-flags-list">
              {result.redFlags.map((flag, index) => (
                <div key={index} className="red-flag-item">
                  <div className="red-flag-bullet">!</div>
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assessment Details */}
        <div className="assessment-details">
          {/* Key Findings */}
          {result.reasoning.length > 0 && (
            <div className="details-section">
              <div className="details-header">
                <Target size={16} />
                <span>Key Findings</span>
              </div>
              <div className="details-list">
                {result.reasoning.slice(0, 3).map((reason, index) => (
                  <div key={index} className="details-item">
                    <div className="details-bullet">•</div>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {result.nextSteps.length > 0 && (
            <div className="details-section">
              <div className="details-header">
                <CheckCircle size={16} />
                <span>Recommended Next Steps</span>
              </div>
              <div className="details-list">
                {result.nextSteps.slice(0, 3).map((step, index) => (
                  <div key={index} className="details-item">
                    <div className="details-bullet">•</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Actions */}
        {result.urgencyLevel === 'Critical' && (
          <div className="emergency-actions">
            <div className="emergency-header">
              <Phone size={16} />
              <span>Emergency Actions</span>
            </div>
            <div className="emergency-buttons">
              <button className="emergency-btn call-999">
                <Phone size={16} />
                Call 999
              </button>
              <button className="emergency-btn find-er">
                <Target size={16} />
                Find Nearest ER
              </button>
            </div>
          </div>
        )}

        {/* Follow-up Notice */}
        {result.followUpRecommended && (
          <div className="followup-notice">
            <Calendar size={16} />
            <span>Follow-up recommended within 1 week</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions">
          <button onClick={onNewAssessment} className="secondary-action-btn">
            New Assessment
          </button>
          <button onClick={onClose} className="primary-action-btn">
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
