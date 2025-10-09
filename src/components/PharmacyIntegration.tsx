import { useState, useEffect } from "react";
import { Pill, MapPin, Clock, Bell, CheckCircle, AlertCircle, Phone, Navigation } from "lucide-react";
import "./PharmacyIntegration.css";

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  quantity: number;
  refillsLeft: number;
  prescribedBy: string;
  pharmacy: string;
  status: 'active' | 'ready_for_pickup' | 'picked_up' | 'expired';
  lastFilled: string;
  nextRefill?: string;
  instructions: string;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  distance: string;
  isPreferred: boolean;
}

export default function PharmacyIntegration() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'pharmacies'>('prescriptions');

  useEffect(() => {
    loadPrescriptions();
    loadPharmacies();
    loadNotifications();
    
    // Check for refill reminders
    const interval = setInterval(checkRefillReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadPrescriptions = () => {
    const stored = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    if (stored.length === 0) {
      // Generate sample data
      const samplePrescriptions: Prescription[] = [
        {
          id: '1',
          medication: 'Lisinopril 10mg',
          dosage: 'Once daily',
          quantity: 30,
          refillsLeft: 2,
          prescribedBy: 'Dr. Smith',
          pharmacy: 'CVS Pharmacy',
          status: 'active',
          lastFilled: '2025-09-09',
          nextRefill: '2025-10-09',
          instructions: 'Take with food'
        },
        {
          id: '2',
          medication: 'Metformin 500mg',
          dosage: 'Twice daily',
          quantity: 60,
          refillsLeft: 1,
          prescribedBy: 'Dr. Johnson',
          pharmacy: 'Walgreens',
          status: 'ready_for_pickup',
          lastFilled: '2025-08-15',
          instructions: 'Take with meals'
        }
      ];
      localStorage.setItem('prescriptions', JSON.stringify(samplePrescriptions));
      setPrescriptions(samplePrescriptions);
    } else {
      setPrescriptions(stored);
    }
  };

  const loadPharmacies = () => {
    const stored = JSON.parse(localStorage.getItem('pharmacies') || '[]');
    if (stored.length === 0) {
      const samplePharmacies: Pharmacy[] = [
        {
          id: '1',
          name: 'CVS Pharmacy',
          address: '123 Main St, Dubai, UAE',
          phone: '+971-4-123-4567',
          hours: '8:00 AM - 10:00 PM',
          distance: '0.5 km',
          isPreferred: true
        },
        {
          id: '2',
          name: 'Walgreens',
          address: '456 Sheikh Zayed Rd, Dubai, UAE',
          phone: '+971-4-234-5678',
          hours: '24 Hours',
          distance: '1.2 km',
          isPreferred: false
        },
        {
          id: '3',
          name: 'Aster Pharmacy',
          address: '789 Al Wasl Rd, Dubai, UAE',
          phone: '+971-4-345-6789',
          hours: '7:00 AM - 11:00 PM',
          distance: '2.1 km',
          isPreferred: false
        }
      ];
      localStorage.setItem('pharmacies', JSON.stringify(samplePharmacies));
      setPharmacies(samplePharmacies);
    } else {
      setPharmacies(stored);
    }
  };

  const loadNotifications = () => {
    const stored = JSON.parse(localStorage.getItem('pharmacyNotifications') || '[]');
    setNotifications(stored);
  };

  const checkRefillReminders = () => {
    const today = new Date();
    const reminders: any[] = [];

    prescriptions.forEach(prescription => {
      if (prescription.nextRefill) {
        const refillDate = new Date(prescription.nextRefill);
        const daysUntilRefill = Math.ceil((refillDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilRefill <= 3 && daysUntilRefill >= 0) {
          reminders.push({
            id: `refill-${prescription.id}`,
            type: 'refill_reminder',
            medication: prescription.medication,
            daysUntilRefill,
            pharmacy: prescription.pharmacy
          });
        }
      }
    });

    if (reminders.length > 0) {
      const existing = JSON.parse(localStorage.getItem('pharmacyNotifications') || '[]');
      const updated = [...existing, ...reminders.filter(r => !existing.some((e: any) => e.id === r.id))];
      localStorage.setItem('pharmacyNotifications', JSON.stringify(updated));
      setNotifications(updated);
    }
  };

  const requestRefill = (prescriptionId: string) => {
    const updated = prescriptions.map(p => 
      p.id === prescriptionId 
        ? { ...p, status: 'ready_for_pickup' as const, lastFilled: new Date().toISOString().split('T')[0] }
        : p
    );
    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));
    
    // Add notification
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (prescription) {
      const newNotification = {
        id: `pickup-${prescriptionId}`,
        type: 'ready_for_pickup',
        medication: prescription.medication,
        pharmacy: prescription.pharmacy,
        timestamp: new Date().toISOString()
      };
      
      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
      localStorage.setItem('pharmacyNotifications', JSON.stringify(updatedNotifications));
      
      alert(`Refill requested for ${prescription.medication}. You'll be notified when it's ready for pickup.`);
    }
  };

  const markAsPickedUp = (prescriptionId: string) => {
    const updated = prescriptions.map(p => 
      p.id === prescriptionId 
        ? { 
            ...p, 
            status: 'active' as const, 
            refillsLeft: p.refillsLeft - 1,
            nextRefill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }
        : p
    );
    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));
    
    // Remove pickup notification
    const updatedNotifications = notifications.filter(n => n.id !== `pickup-${prescriptionId}`);
    setNotifications(updatedNotifications);
    localStorage.setItem('pharmacyNotifications', JSON.stringify(updatedNotifications));
  };

  const setPreferredPharmacy = (pharmacyId: string) => {
    const updated = pharmacies.map(p => ({ ...p, isPreferred: p.id === pharmacyId }));
    setPharmacies(updated);
    localStorage.setItem('pharmacies', JSON.stringify(updated));
  };

  const getStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'ready_for_pickup': return '#f59e0b';
      case 'picked_up': return '#6b7280';
      case 'expired': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: Prescription['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'picked_up': return 'Picked Up';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const readyForPickup = prescriptions.filter(p => p.status === 'ready_for_pickup');
  const activeNotifications = notifications.filter(n => n.type === 'ready_for_pickup' || n.type === 'refill_reminder');

  return (
    <div className="pharmacy-container">
      <div className="pharmacy-header">
        <div className="pharmacy-title">
          <Pill size={20} />
          <h3>Pharmacy & Prescriptions</h3>
        </div>
        {activeNotifications.length > 0 && (
          <div className="notification-badge">
            <Bell size={16} />
            <span>{activeNotifications.length}</span>
          </div>
        )}
      </div>

      {/* Notifications */}
      {activeNotifications.length > 0 && (
        <div className="notifications-section">
          {activeNotifications.map((notification) => (
            <div key={notification.id} className={`notification-item ${notification.type}`}>
              <div className="notification-icon">
                {notification.type === 'ready_for_pickup' ? <CheckCircle size={16} /> : <Clock size={16} />}
              </div>
              <div className="notification-content">
                {notification.type === 'ready_for_pickup' ? (
                  <span><strong>{notification.medication}</strong> is ready for pickup at {notification.pharmacy}</span>
                ) : (
                  <span><strong>{notification.medication}</strong> refill due in {notification.daysUntilRefill} days</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pharmacy-tabs">
        <button 
          onClick={() => setActiveTab('prescriptions')}
          className={`tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
        >
          Prescriptions ({prescriptions.length})
        </button>
        <button 
          onClick={() => setActiveTab('pharmacies')}
          className={`tab-btn ${activeTab === 'pharmacies' ? 'active' : ''}`}
        >
          Pharmacies ({pharmacies.length})
        </button>
      </div>

      <div className="pharmacy-content">
        {activeTab === 'prescriptions' ? (
          <div className="prescriptions-section">
            {readyForPickup.length > 0 && (
              <div className="ready-pickup-section">
                <h4>Ready for Pickup</h4>
                <div className="prescriptions-list">
                  {readyForPickup.map((prescription) => (
                    <div key={prescription.id} className="prescription-item ready">
                      <div className="prescription-main">
                        <div className="prescription-info">
                          <div className="medication-name">{prescription.medication}</div>
                          <div className="prescription-details">
                            {prescription.dosage} • {prescription.quantity} tablets • {prescription.pharmacy}
                          </div>
                          <div className="prescription-meta">
                            Prescribed by {prescription.prescribedBy} • {prescription.refillsLeft} refills left
                          </div>
                        </div>
                        <div className="prescription-status">
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(prescription.status) }}
                          >
                            {getStatusLabel(prescription.status)}
                          </span>
                        </div>
                      </div>
                      <div className="prescription-actions">
                        <button 
                          onClick={() => markAsPickedUp(prescription.id)}
                          className="pickup-btn"
                        >
                          Mark as Picked Up
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="all-prescriptions-section">
              <h4>All Prescriptions</h4>
              <div className="prescriptions-list">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="prescription-item">
                    <div className="prescription-main">
                      <div className="prescription-info">
                        <div className="medication-name">{prescription.medication}</div>
                        <div className="prescription-details">
                          {prescription.dosage} • {prescription.quantity} tablets • {prescription.pharmacy}
                        </div>
                        <div className="prescription-meta">
                          Prescribed by {prescription.prescribedBy} • {prescription.refillsLeft} refills left
                          {prescription.nextRefill && (
                            <span> • Next refill: {formatDate(prescription.nextRefill)}</span>
                          )}
                        </div>
                        <div className="prescription-instructions">
                          Instructions: {prescription.instructions}
                        </div>
                      </div>
                      <div className="prescription-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(prescription.status) }}
                        >
                          {getStatusLabel(prescription.status)}
                        </span>
                      </div>
                    </div>
                    {prescription.status === 'active' && prescription.refillsLeft > 0 && (
                      <div className="prescription-actions">
                        <button 
                          onClick={() => requestRefill(prescription.id)}
                          className="refill-btn"
                        >
                          Request Refill
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="pharmacies-section">
            <div className="pharmacies-list">
              {pharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className={`pharmacy-item ${pharmacy.isPreferred ? 'preferred' : ''}`}>
                  <div className="pharmacy-info">
                    <div className="pharmacy-name">
                      {pharmacy.name}
                      {pharmacy.isPreferred && <span className="preferred-badge">Preferred</span>}
                    </div>
                    <div className="pharmacy-details">
                      <div className="pharmacy-address">
                        <MapPin size={14} />
                        <span>{pharmacy.address}</span>
                        <span className="distance">({pharmacy.distance})</span>
                      </div>
                      <div className="pharmacy-contact">
                        <Phone size={14} />
                        <span>{pharmacy.phone}</span>
                      </div>
                      <div className="pharmacy-hours">
                        <Clock size={14} />
                        <span>{pharmacy.hours}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pharmacy-actions">
                    {!pharmacy.isPreferred && (
                      <button 
                        onClick={() => setPreferredPharmacy(pharmacy.id)}
                        className="set-preferred-btn"
                      >
                        Set as Preferred
                      </button>
                    )}
                    <button className="directions-btn">
                      <Navigation size={14} />
                      Directions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
