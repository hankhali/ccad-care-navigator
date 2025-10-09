import { useState, useEffect } from "react";
import { Bell, Calendar, Clock, CheckCircle, AlertCircle, X } from "lucide-react";
import "./FollowUpReminders.css";

interface FollowUpReminder {
  id: string;
  date: string;
  symptoms: string;
  severity: number;
  created: string;
  completed?: boolean;
}

interface FollowUpRemindersProps {
  onClose?: () => void;
}

export default function FollowUpReminders({ onClose }: FollowUpRemindersProps) {
  const [reminders, setReminders] = useState<FollowUpReminder[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    loadReminders();
    
    // Check for due reminders every minute
    const interval = setInterval(checkDueReminders, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadReminders = () => {
    const stored = JSON.parse(localStorage.getItem('followUpReminders') || '[]');
    setReminders(stored);
  };

  const checkDueReminders = () => {
    const now = new Date();
    const stored = JSON.parse(localStorage.getItem('followUpReminders') || '[]');
    
    stored.forEach((reminder: FollowUpReminder) => {
      const reminderDate = new Date(reminder.date);
      const timeDiff = reminderDate.getTime() - now.getTime();
      
      // Show notification if reminder is due (within 5 minutes)
      if (timeDiff <= 5 * 60 * 1000 && timeDiff > 0 && !reminder.completed) {
        showNotification(reminder);
      }
    });
  };

  const showNotification = (reminder: FollowUpReminder) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Health Check-in Reminder', {
        body: `Time to check on your symptoms: ${reminder.symptoms}`,
        icon: '/favicon.ico',
        tag: reminder.id
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const markAsCompleted = (id: string) => {
    const updated = reminders.map(reminder => 
      reminder.id === id ? { ...reminder, completed: true } : reminder
    );
    setReminders(updated);
    localStorage.setItem('followUpReminders', JSON.stringify(updated));
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter(reminder => reminder.id !== id);
    setReminders(updated);
    localStorage.setItem('followUpReminders', JSON.stringify(updated));
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date();
  };

  const isDueSoon = (date: string) => {
    const now = new Date();
    const reminderDate = new Date(date);
    const timeDiff = reminderDate.getTime() - now.getTime();
    return timeDiff <= 24 * 60 * 60 * 1000 && timeDiff > 0; // Due within 24 hours
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const reminderDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (reminderDay.getTime() === today.getTime()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (reminderDay.getTime() === today.getTime() + 24 * 60 * 60 * 1000) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleString();
    }
  };

  const getSeverityColor = (severity: number) => {
    const colors = [
      "#10b981", "#22c55e", "#84cc16", "#eab308", "#f59e0b",
      "#f97316", "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"
    ];
    return colors[severity - 1] || "#6b7280";
  };

  const activeReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  return (
    <div className="followup-container">
      <div className="followup-header">
        <div className="followup-title">
          <Bell size={20} />
          <h3>Follow-up Reminders</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="close-btn">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="followup-content">
        {activeReminders.length === 0 && completedReminders.length === 0 ? (
          <div className="empty-reminders">
            <Calendar size={48} />
            <p>No follow-up reminders scheduled</p>
            <small>Schedule check-ins during your next triage assessment</small>
          </div>
        ) : (
          <>
            {/* Notification Permission */}
            {'Notification' in window && Notification.permission === 'default' && (
              <div className="notification-prompt">
                <AlertCircle size={16} />
                <span>Enable notifications to get reminded about your check-ins</span>
                <button onClick={requestNotificationPermission} className="enable-btn">
                  Enable
                </button>
              </div>
            )}

            {/* Active Reminders */}
            {activeReminders.length > 0 && (
              <div className="reminders-section">
                <h4>Upcoming Check-ins</h4>
                <div className="reminders-list">
                  {activeReminders.map((reminder) => (
                    <div 
                      key={reminder.id} 
                      className={`reminder-item ${isOverdue(reminder.date) ? 'overdue' : isDueSoon(reminder.date) ? 'due-soon' : ''}`}
                    >
                      <div className="reminder-content">
                        <div className="reminder-main">
                          <div className="reminder-symptoms">
                            {reminder.symptoms}
                          </div>
                          <div className="reminder-meta">
                            <Clock size={14} />
                            <span>{formatDate(reminder.date)}</span>
                            <div 
                              className="severity-indicator"
                              style={{ backgroundColor: getSeverityColor(reminder.severity) }}
                            >
                              {reminder.severity}/10
                            </div>
                          </div>
                        </div>
                        <div className="reminder-actions">
                          <button 
                            onClick={() => markAsCompleted(reminder.id)}
                            className="complete-btn"
                            title="Mark as completed"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button 
                            onClick={() => deleteReminder(reminder.id)}
                            className="delete-btn"
                            title="Delete reminder"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {isOverdue(reminder.date) && (
                        <div className="overdue-banner">
                          <AlertCircle size={14} />
                          Overdue - Please check your symptoms
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Reminders */}
            {completedReminders.length > 0 && (
              <div className="reminders-section">
                <div className="section-toggle">
                  <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="toggle-btn"
                  >
                    Completed ({completedReminders.length})
                    <span className={`toggle-arrow ${showCompleted ? 'open' : ''}`}>▼</span>
                  </button>
                </div>
                
                {showCompleted && (
                  <div className="reminders-list">
                    {completedReminders.map((reminder) => (
                      <div key={reminder.id} className="reminder-item completed">
                        <div className="reminder-content">
                          <div className="reminder-main">
                            <div className="reminder-symptoms">
                              {reminder.symptoms}
                            </div>
                            <div className="reminder-meta">
                              <CheckCircle size={14} />
                              <span>Completed on {formatDate(reminder.date)}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => deleteReminder(reminder.id)}
                            className="delete-btn"
                            title="Delete reminder"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
