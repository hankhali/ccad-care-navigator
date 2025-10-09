import { useState, useEffect } from "react";
import { Bell, Pill, Calendar, Clock, CheckCircle, X, Plus, AlertCircle } from "lucide-react";
import "./SmartNotifications.css";

interface MedicationAlert {
  id: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  frequency: 'once' | 'twice' | 'three_times' | 'four_times' | 'as_needed';
  instructions: string;
  taken: boolean;
  missedDoses: number;
  nextDose?: string;
  reminderEnabled: boolean;
}

interface AppointmentReminder {
  id: string;
  doctorName: string;
  specialty: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  type: 'in_person' | 'telehealth';
  reminderTime: string; // How many minutes before to remind
  reminded: boolean;
  notes?: string;
}

interface Notification {
  id: string;
  type: 'medication' | 'appointment' | 'missed_dose' | 'upcoming_appointment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionRequired: boolean;
  medicationId?: string;
  appointmentId?: string;
}

export default function SmartNotifications() {
  const [medications, setMedications] = useState<MedicationAlert[]>([]);
  const [appointments, setAppointments] = useState<AppointmentReminder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'medications' | 'appointments'>('notifications');
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);

  useEffect(() => {
    loadData();
    
    // Check for medication and appointment alerts every minute
    const interval = setInterval(() => {
      checkMedicationAlerts();
      checkAppointmentReminders();
    }, 60000);

    // Initial check
    checkMedicationAlerts();
    checkAppointmentReminders();

    return () => clearInterval(interval);
  }, [medications, appointments]);

  const loadData = () => {
    // Load medications
    const storedMeds = JSON.parse(localStorage.getItem('medicationAlerts') || '[]');
    if (storedMeds.length === 0) {
      const sampleMedications: MedicationAlert[] = [
        {
          id: '1',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          scheduledTime: '08:00',
          frequency: 'once',
          instructions: 'Take with breakfast',
          taken: false,
          missedDoses: 0,
          nextDose: '08:00',
          reminderEnabled: true
        },
        {
          id: '2',
          medicationName: 'Metformin',
          dosage: '500mg',
          scheduledTime: '08:00,20:00',
          frequency: 'twice',
          instructions: 'Take with meals',
          taken: false,
          missedDoses: 1,
          nextDose: '20:00',
          reminderEnabled: true
        }
      ];
      localStorage.setItem('medicationAlerts', JSON.stringify(sampleMedications));
      setMedications(sampleMedications);
    } else {
      setMedications(storedMeds);
    }

    // Load appointments
    const storedAppts = JSON.parse(localStorage.getItem('appointmentReminders') || '[]');
    if (storedAppts.length === 0) {
      const sampleAppointments: AppointmentReminder[] = [
        {
          id: '1',
          doctorName: 'Dr. Sarah Ahmed',
          specialty: 'Family Medicine',
          appointmentDate: '2025-10-10',
          appointmentTime: '14:00',
          location: 'Cleveland Clinic - Main Campus',
          type: 'in_person',
          reminderTime: '60', // 1 hour before
          reminded: false
        },
        {
          id: '2',
          doctorName: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          appointmentDate: '2025-10-11',
          appointmentTime: '10:30',
          location: 'Telehealth Video Call',
          type: 'telehealth',
          reminderTime: '30', // 30 minutes before
          reminded: false
        }
      ];
      localStorage.setItem('appointmentReminders', JSON.stringify(sampleAppointments));
      setAppointments(sampleAppointments);
    } else {
      setAppointments(storedAppts);
    }

    // Load notifications
    const storedNotifications = JSON.parse(localStorage.getItem('smartNotifications') || '[]');
    setNotifications(storedNotifications);
  };

  const checkMedicationAlerts = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const newNotifications: Notification[] = [];

    medications.forEach(medication => {
      if (!medication.reminderEnabled) return;

      const scheduledTimes = medication.scheduledTime.split(',');
      
      scheduledTimes.forEach(time => {
        if (time === currentTime && !medication.taken) {
          const notification: Notification = {
            id: `med-${medication.id}-${Date.now()}`,
            type: 'medication',
            title: 'Time for your medication',
            message: `Take ${medication.medicationName} ${medication.dosage} - ${medication.instructions}`,
            timestamp: now.toISOString(),
            read: false,
            actionRequired: true,
            medicationId: medication.id
          };
          newNotifications.push(notification);
        }
      });
    });

    if (newNotifications.length > 0) {
      const updated = [...notifications, ...newNotifications];
      setNotifications(updated);
      localStorage.setItem('smartNotifications', JSON.stringify(updated));
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        newNotifications.forEach(notif => {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/favicon.ico',
            tag: notif.id
          });
        });
      }
    }
  };

  const checkAppointmentReminders = () => {
    const now = new Date();
    const newNotifications: Notification[] = [];

    appointments.forEach(appointment => {
      if (appointment.reminded) return;

      const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
      const reminderTime = new Date(appointmentDateTime.getTime() - parseInt(appointment.reminderTime) * 60000);
      
      if (now >= reminderTime && now < appointmentDateTime) {
        const notification: Notification = {
          id: `appt-${appointment.id}-${Date.now()}`,
          type: 'upcoming_appointment',
          title: 'Upcoming Appointment',
          message: `${appointment.doctorName} (${appointment.specialty}) in ${appointment.reminderTime} minutes at ${appointment.location}`,
          timestamp: now.toISOString(),
          read: false,
          actionRequired: false,
          appointmentId: appointment.id
        };
        newNotifications.push(notification);

        // Mark as reminded
        const updatedAppointments = appointments.map(a => 
          a.id === appointment.id ? { ...a, reminded: true } : a
        );
        setAppointments(updatedAppointments);
        localStorage.setItem('appointmentReminders', JSON.stringify(updatedAppointments));
      }
    });

    if (newNotifications.length > 0) {
      const updated = [...notifications, ...newNotifications];
      setNotifications(updated);
      localStorage.setItem('smartNotifications', JSON.stringify(updated));
      
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        newNotifications.forEach(notif => {
          new Notification(notif.title, {
            body: notif.message,
            icon: '/favicon.ico',
            tag: notif.id
          });
        });
      }
    }
  };

  const markMedicationTaken = (medicationId: string) => {
    const updated = medications.map(med => 
      med.id === medicationId ? { ...med, taken: true } : med
    );
    setMedications(updated);
    localStorage.setItem('medicationAlerts', JSON.stringify(updated));

    // Mark related notifications as read
    const updatedNotifications = notifications.map(notif => 
      notif.medicationId === medicationId ? { ...notif, read: true, actionRequired: false } : notif
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('smartNotifications', JSON.stringify(updatedNotifications));
  };

  const markNotificationRead = (notificationId: string) => {
    const updated = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem('smartNotifications', JSON.stringify(updated));
  };

  const addMedication = (medicationData: Partial<MedicationAlert>) => {
    const newMedication: MedicationAlert = {
      id: String(Date.now()),
      medicationName: medicationData.medicationName || '',
      dosage: medicationData.dosage || '',
      scheduledTime: medicationData.scheduledTime || '08:00',
      frequency: medicationData.frequency || 'once',
      instructions: medicationData.instructions || '',
      taken: false,
      missedDoses: 0,
      reminderEnabled: true
    };

    const updated = [...medications, newMedication];
    setMedications(updated);
    localStorage.setItem('medicationAlerts', JSON.stringify(updated));
    setShowAddMedication(false);
  };

  const addAppointment = (appointmentData: Partial<AppointmentReminder>) => {
    const newAppointment: AppointmentReminder = {
      id: String(Date.now()),
      doctorName: appointmentData.doctorName || '',
      specialty: appointmentData.specialty || '',
      appointmentDate: appointmentData.appointmentDate || '',
      appointmentTime: appointmentData.appointmentTime || '',
      location: appointmentData.location || '',
      type: appointmentData.type || 'in_person',
      reminderTime: appointmentData.reminderTime || '60',
      reminded: false
    };

    const updated = [...appointments, newAppointment];
    setAppointments(updated);
    localStorage.setItem('appointmentReminders', JSON.stringify(updated));
    setShowAddAppointment(false);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read);
  const actionRequiredNotifications = notifications.filter(n => n.actionRequired && !n.read);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString();
  };

  return (
    <div className="smart-notifications-container">
      <div className="notifications-header">
        <div className="notifications-title">
          <Bell size={20} />
          <h3>Smart Notifications</h3>
        </div>
        <div className="notifications-badges">
          {unreadNotifications.length > 0 && (
            <div className="notification-badge unread">
              {unreadNotifications.length} unread
            </div>
          )}
          {actionRequiredNotifications.length > 0 && (
            <div className="notification-badge action">
              {actionRequiredNotifications.length} action needed
            </div>
          )}
        </div>
      </div>

      {/* Notification Permission */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="permission-prompt">
          <AlertCircle size={16} />
          <span>Enable notifications to get medication and appointment reminders</span>
          <button onClick={requestNotificationPermission} className="enable-btn">
            Enable Notifications
          </button>
        </div>
      )}

      <div className="notifications-tabs">
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          Notifications ({unreadNotifications.length})
        </button>
        <button 
          onClick={() => setActiveTab('medications')}
          className={`tab-btn ${activeTab === 'medications' ? 'active' : ''}`}
        >
          Medications ({medications.length})
        </button>
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
        >
          Appointments ({appointments.length})
        </button>
      </div>

      <div className="notifications-content">
        {activeTab === 'notifications' && (
          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <Bell size={48} />
                <p>No notifications yet</p>
                <small>You'll see medication and appointment reminders here</small>
              </div>
            ) : (
              notifications
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.actionRequired ? 'action-required' : ''}`}
                  >
                    <div className="notification-icon">
                      {notification.type === 'medication' ? <Pill size={16} /> : <Calendar size={16} />}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-time">
                        {new Date(notification.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="notification-actions">
                      {notification.actionRequired && notification.medicationId && (
                        <button 
                          onClick={() => markMedicationTaken(notification.medicationId!)}
                          className="take-medication-btn"
                        >
                          <CheckCircle size={14} />
                          Taken
                        </button>
                      )}
                      {!notification.read && (
                        <button 
                          onClick={() => markNotificationRead(notification.id)}
                          className="mark-read-btn"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="medications-section">
            <div className="section-header">
              <h4>Medication Schedule</h4>
              <button 
                onClick={() => setShowAddMedication(true)}
                className="add-btn"
              >
                <Plus size={14} />
                Add Medication
              </button>
            </div>
            
            <div className="medications-list">
              {medications.map((medication) => (
                <div key={medication.id} className="medication-item">
                  <div className="medication-info">
                    <div className="medication-name">
                      {medication.medicationName} {medication.dosage}
                    </div>
                    <div className="medication-schedule">
                      {medication.scheduledTime.split(',').map((time, index) => (
                        <span key={index} className="schedule-time">
                          {formatTime(time)}
                        </span>
                      ))}
                    </div>
                    <div className="medication-instructions">
                      {medication.instructions}
                    </div>
                    {medication.missedDoses > 0 && (
                      <div className="missed-doses">
                        ⚠️ {medication.missedDoses} missed doses
                      </div>
                    )}
                  </div>
                  <div className="medication-status">
                    {medication.taken ? (
                      <span className="status-taken">✅ Taken</span>
                    ) : (
                      <button 
                        onClick={() => markMedicationTaken(medication.id)}
                        className="take-btn"
                      >
                        Mark as Taken
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-section">
            <div className="section-header">
              <h4>Appointment Reminders</h4>
              <button 
                onClick={() => setShowAddAppointment(true)}
                className="add-btn"
              >
                <Plus size={14} />
                Add Reminder
              </button>
            </div>
            
            <div className="appointments-list">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="appointment-item">
                  <div className="appointment-info">
                    <div className="appointment-doctor">
                      {appointment.doctorName}
                    </div>
                    <div className="appointment-specialty">
                      {appointment.specialty}
                    </div>
                    <div className="appointment-datetime">
                      <Calendar size={14} />
                      {formatDateTime(appointment.appointmentDate, appointment.appointmentTime)}
                    </div>
                    <div className="appointment-location">
                      📍 {appointment.location}
                    </div>
                    <div className="appointment-reminder">
                      🔔 Remind {appointment.reminderTime} minutes before
                    </div>
                  </div>
                  <div className="appointment-status">
                    {appointment.reminded ? (
                      <span className="status-reminded">🔔 Reminded</span>
                    ) : (
                      <span className="status-pending">⏳ Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Medication Reminder</h3>
              <button onClick={() => setShowAddMedication(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Medication Name</label>
                <input type="text" placeholder="e.g., Lisinopril" />
              </div>
              <div className="form-group">
                <label>Dosage</label>
                <input type="text" placeholder="e.g., 10mg" />
              </div>
              <div className="form-group">
                <label>Time(s)</label>
                <input type="time" />
              </div>
              <div className="form-group">
                <label>Instructions</label>
                <input type="text" placeholder="e.g., Take with food" />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddMedication(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={() => addMedication({})} className="save-btn">
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Appointment Modal */}
      {showAddAppointment && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Appointment Reminder</h3>
              <button onClick={() => setShowAddAppointment(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Doctor Name</label>
                <input type="text" placeholder="e.g., Dr. Smith" />
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <input type="text" placeholder="e.g., Cardiology" />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" placeholder="e.g., Cleveland Clinic" />
              </div>
              <div className="form-group">
                <label>Remind me</label>
                <select>
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAddAppointment(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={() => addAppointment({})} className="save-btn">
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
