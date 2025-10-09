import { useState, useEffect } from "react";
import { Shield, FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Upload, Download } from "lucide-react";
import "./InsuranceClaims.css";

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  serviceDate: string;
  provider: string;
  serviceType: string;
  totalAmount: number;
  coveredAmount: number;
  deductible: number;
  copay: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'paid';
  submittedDate: string;
  lastUpdated: string;
  description: string;
  documents: string[];
}

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber: string;
  memberID: string;
  planType: string;
  deductibleTotal: number;
  deductibleMet: number;
  outOfPocketMax: number;
  outOfPocketMet: number;
}

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [insuranceInfo, setInsuranceInfo] = useState<InsuranceInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'claims' | 'coverage'>('claims');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadClaims();
    loadInsuranceInfo();
  }, []);

  const loadClaims = () => {
    const stored = JSON.parse(localStorage.getItem('insuranceClaims') || '[]');
    if (stored.length === 0) {
      const sampleClaims: InsuranceClaim[] = [
        {
          id: '1',
          claimNumber: 'CLM-2025-001234',
          serviceDate: '2025-09-15',
          provider: 'Cleveland Clinic',
          serviceType: 'Office Visit',
          totalAmount: 250,
          coveredAmount: 200,
          deductible: 0,
          copay: 25,
          status: 'paid',
          submittedDate: '2025-09-16',
          lastUpdated: '2025-09-20',
          description: 'Annual physical examination',
          documents: ['receipt.pdf', 'summary.pdf']
        },
        {
          id: '2',
          claimNumber: 'CLM-2025-001235',
          serviceDate: '2025-10-01',
          provider: 'Dubai Hospital',
          serviceType: 'Laboratory Tests',
          totalAmount: 180,
          coveredAmount: 144,
          deductible: 36,
          copay: 0,
          status: 'processing',
          submittedDate: '2025-10-02',
          lastUpdated: '2025-10-05',
          description: 'Blood work and cholesterol screening',
          documents: ['lab_results.pdf']
        },
        {
          id: '3',
          claimNumber: 'CLM-2025-001236',
          serviceDate: '2025-10-08',
          provider: 'Aster Clinic',
          serviceType: 'Specialist Consultation',
          totalAmount: 400,
          coveredAmount: 320,
          deductible: 80,
          copay: 50,
          status: 'submitted',
          submittedDate: '2025-10-09',
          lastUpdated: '2025-10-09',
          description: 'Cardiology consultation',
          documents: []
        }
      ];
      localStorage.setItem('insuranceClaims', JSON.stringify(sampleClaims));
      setClaims(sampleClaims);
    } else {
      setClaims(stored);
    }
  };

  const loadInsuranceInfo = () => {
    const stored = JSON.parse(localStorage.getItem('insuranceInfo') || 'null');
    if (!stored) {
      const sampleInfo: InsuranceInfo = {
        provider: 'Dubai Health Insurance',
        policyNumber: 'POL-2025-789456',
        groupNumber: 'GRP-CC-001',
        memberID: 'MEM-123456789',
        planType: 'Premium Health Plan',
        deductibleTotal: 1000,
        deductibleMet: 116,
        outOfPocketMax: 5000,
        outOfPocketMet: 191
      };
      localStorage.setItem('insuranceInfo', JSON.stringify(sampleInfo));
      setInsuranceInfo(sampleInfo);
    } else {
      setInsuranceInfo(stored);
    }
  };

  const getStatusColor = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'submitted': return '#6b7280';
      case 'processing': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'denied': return '#ef4444';
      case 'paid': return '#059669';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'processing': return 'Processing';
      case 'approved': return 'Approved';
      case 'denied': return 'Denied';
      case 'paid': return 'Paid';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: InsuranceClaim['status']) => {
    switch (status) {
      case 'submitted': return <Clock size={14} />;
      case 'processing': return <Clock size={14} />;
      case 'approved': return <CheckCircle size={14} />;
      case 'denied': return <AlertTriangle size={14} />;
      case 'paid': return <CheckCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredClaims = filterStatus === 'all' 
    ? claims 
    : claims.filter(claim => claim.status === filterStatus);

  const totalClaimsAmount = claims.reduce((sum, claim) => sum + claim.totalAmount, 0);
  const totalCoveredAmount = claims.reduce((sum, claim) => sum + claim.coveredAmount, 0);
  const pendingClaims = claims.filter(c => c.status === 'submitted' || c.status === 'processing').length;

  const uploadDocument = (claimId: string) => {
    // Simulate document upload
    const updated = claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, documents: [...claim.documents, `document_${Date.now()}.pdf`] }
        : claim
    );
    setClaims(updated);
    localStorage.setItem('insuranceClaims', JSON.stringify(updated));
    alert('Document uploaded successfully!');
  };

  const downloadDocument = (claimId: string, documentName: string) => {
    // Simulate document download
    alert(`Downloading ${documentName}...`);
  };

  return (
    <div className="insurance-container">
      <div className="insurance-header">
        <div className="insurance-title">
          <Shield size={20} />
          <h3>Insurance & Claims</h3>
        </div>
        <div className="insurance-summary">
          <div className="summary-item">
            <span className="summary-label">Pending Claims</span>
            <span className="summary-value">{pendingClaims}</span>
          </div>
        </div>
      </div>

      <div className="insurance-tabs">
        <button 
          onClick={() => setActiveTab('claims')}
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
        >
          Claims ({claims.length})
        </button>
        <button 
          onClick={() => setActiveTab('coverage')}
          className={`tab-btn ${activeTab === 'coverage' ? 'active' : ''}`}
        >
          Coverage Details
        </button>
      </div>

      <div className="insurance-content">
        {activeTab === 'claims' ? (
          <div className="claims-section">
            {/* Claims Overview */}
            <div className="claims-overview">
              <div className="overview-card">
                <div className="overview-icon">💰</div>
                <div className="overview-info">
                  <div className="overview-value">{formatCurrency(totalClaimsAmount)}</div>
                  <div className="overview-label">Total Claims</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">✅</div>
                <div className="overview-info">
                  <div className="overview-value">{formatCurrency(totalCoveredAmount)}</div>
                  <div className="overview-label">Covered Amount</div>
                </div>
              </div>
              <div className="overview-card">
                <div className="overview-icon">⏳</div>
                <div className="overview-info">
                  <div className="overview-value">{pendingClaims}</div>
                  <div className="overview-label">Pending Claims</div>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="claims-filter">
              <label>Filter by status:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Claims</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="denied">Denied</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Claims List */}
            <div className="claims-list">
              {filteredClaims.map((claim) => (
                <div key={claim.id} className="claim-item">
                  <div className="claim-header">
                    <div className="claim-main-info">
                      <div className="claim-number">{claim.claimNumber}</div>
                      <div className="claim-provider">{claim.provider} • {claim.serviceType}</div>
                      <div className="claim-description">{claim.description}</div>
                    </div>
                    <div className="claim-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(claim.status) }}
                      >
                        {getStatusIcon(claim.status)}
                        {getStatusLabel(claim.status)}
                      </span>
                    </div>
                  </div>

                  <div className="claim-details">
                    <div className="claim-dates">
                      <div className="date-item">
                        <span className="date-label">Service Date:</span>
                        <span>{formatDate(claim.serviceDate)}</span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Submitted:</span>
                        <span>{formatDate(claim.submittedDate)}</span>
                      </div>
                      <div className="date-item">
                        <span className="date-label">Last Updated:</span>
                        <span>{formatDate(claim.lastUpdated)}</span>
                      </div>
                    </div>

                    <div className="claim-amounts">
                      <div className="amount-item">
                        <span className="amount-label">Total Amount:</span>
                        <span className="amount-value">{formatCurrency(claim.totalAmount)}</span>
                      </div>
                      <div className="amount-item">
                        <span className="amount-label">Covered:</span>
                        <span className="amount-value covered">{formatCurrency(claim.coveredAmount)}</span>
                      </div>
                      <div className="amount-item">
                        <span className="amount-label">Deductible:</span>
                        <span className="amount-value">{formatCurrency(claim.deductible)}</span>
                      </div>
                      <div className="amount-item">
                        <span className="amount-label">Copay:</span>
                        <span className="amount-value">{formatCurrency(claim.copay)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="claim-documents">
                    <div className="documents-header">
                      <span>Documents ({claim.documents.length})</span>
                      <button 
                        onClick={() => uploadDocument(claim.id)}
                        className="upload-btn"
                      >
                        <Upload size={14} />
                        Upload
                      </button>
                    </div>
                    {claim.documents.length > 0 && (
                      <div className="documents-list">
                        {claim.documents.map((doc, index) => (
                          <div key={index} className="document-item">
                            <FileText size={14} />
                            <span>{doc}</span>
                            <button 
                              onClick={() => downloadDocument(claim.id, doc)}
                              className="download-btn"
                            >
                              <Download size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="coverage-section">
            {insuranceInfo && (
              <>
                {/* Insurance Card */}
                <div className="insurance-card">
                  <div className="card-header">
                    <div className="provider-name">{insuranceInfo.provider}</div>
                    <div className="plan-type">{insuranceInfo.planType}</div>
                  </div>
                  <div className="card-body">
                    <div className="card-row">
                      <div className="card-field">
                        <span className="field-label">Member ID:</span>
                        <span className="field-value">{insuranceInfo.memberID}</span>
                      </div>
                      <div className="card-field">
                        <span className="field-label">Policy Number:</span>
                        <span className="field-value">{insuranceInfo.policyNumber}</span>
                      </div>
                    </div>
                    <div className="card-row">
                      <div className="card-field">
                        <span className="field-label">Group Number:</span>
                        <span className="field-value">{insuranceInfo.groupNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div className="coverage-details">
                  <h4>Coverage Summary</h4>
                  
                  <div className="coverage-progress">
                    <div className="progress-item">
                      <div className="progress-header">
                        <span>Annual Deductible</span>
                        <span>{formatCurrency(insuranceInfo.deductibleMet)} / {formatCurrency(insuranceInfo.deductibleTotal)}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill deductible"
                          style={{ width: `${(insuranceInfo.deductibleMet / insuranceInfo.deductibleTotal) * 100}%` }}
                        />
                      </div>
                      <div className="progress-remaining">
                        {formatCurrency(insuranceInfo.deductibleTotal - insuranceInfo.deductibleMet)} remaining
                      </div>
                    </div>

                    <div className="progress-item">
                      <div className="progress-header">
                        <span>Out-of-Pocket Maximum</span>
                        <span>{formatCurrency(insuranceInfo.outOfPocketMet)} / {formatCurrency(insuranceInfo.outOfPocketMax)}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill out-of-pocket"
                          style={{ width: `${(insuranceInfo.outOfPocketMet / insuranceInfo.outOfPocketMax) * 100}%` }}
                        />
                      </div>
                      <div className="progress-remaining">
                        {formatCurrency(insuranceInfo.outOfPocketMax - insuranceInfo.outOfPocketMet)} remaining
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
