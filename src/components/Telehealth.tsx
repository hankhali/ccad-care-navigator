import { useState, useEffect } from "react";
import { Video, Calendar, Clock, User, Phone, MessageCircle, Camera, CameraOff, Mic, MicOff } from "lucide-react";
import "./Telehealth.css";

interface TelehealthAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'phone' | 'chat';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  prescription?: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  languages: string[];
  availability: string[];
  avatar: string;
  consultationFee: number;
}

export default function Telehealth() {
  const [appointments, setAppointments] = useState<TelehealthAppointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'consultation'>('appointments');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callSettings, setCallSettings] = useState({
    video: true,
    audio: true
  });

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const loadAppointments = () => {
    const stored = JSON.parse(localStorage.getItem('telehealthAppointments') || '[]');
    if (stored.length === 0) {
      const sampleAppointments: TelehealthAppointment[] = [
        {
          id: '1',
          doctorName: 'Dr. Sarah Ahmed',
          specialty: 'Family Medicine',
          date: '2025-10-10',
          time: '14:00',
          duration: 30,
          type: 'video',
          status: 'scheduled',
          meetingLink: 'https://meet.cleveland-clinic.com/room/abc123'
        },
        {
          id: '2',
          doctorName: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          date: '2025-10-08',
          time: '10:30',
          duration: 45,
          type: 'video',
          status: 'completed',
          notes: 'Patient reported improved symptoms. Continue current medication.',
          prescription: 'Lisinopril 10mg - Continue as prescribed'
        }
      ];
      localStorage.setItem('telehealthAppointments', JSON.stringify(sampleAppointments));
      setAppointments(sampleAppointments);
    } else {
      setAppointments(stored);
    }
  };

  const loadDoctors = () => {
    const stored = JSON.parse(localStorage.getItem('telehealthDoctors') || '[]');
    if (stored.length === 0) {
      const sampleDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. Sarah Ahmed',
          specialty: 'Family Medicine',
          rating: 4.8,
          experience: '8 years',
          languages: ['English', 'Arabic'],
          availability: ['Today 2:00 PM', 'Tomorrow 10:00 AM', 'Tomorrow 3:00 PM'],
          avatar: '👩‍⚕️',
          consultationFee: 150
        },
        {
          id: '2',
          name: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          rating: 4.9,
          experience: '12 years',
          languages: ['English', 'Mandarin'],
          availability: ['Today 4:00 PM', 'Tomorrow 9:00 AM'],
          avatar: '👨‍⚕️',
          consultationFee: 200
        },
        {
          id: '3',
          name: 'Dr. Priya Patel',
          specialty: 'Dermatology',
          rating: 4.7,
          experience: '6 years',
          languages: ['English', 'Hindi'],
          availability: ['Tomorrow 11:00 AM', 'Tomorrow 2:00 PM'],
          avatar: '👩‍⚕️',
          consultationFee: 175
        }
      ];
      localStorage.setItem('telehealthDoctors', JSON.stringify(sampleDoctors));
      setDoctors(sampleDoctors);
    } else {
      setDoctors(stored);
    }
  };

  const bookAppointment = (doctorId: string, timeSlot: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return;

    const [date, time] = timeSlot.includes('Today') 
      ? [new Date().toISOString().split('T')[0], timeSlot.split(' ')[1] + ' ' + timeSlot.split(' ')[2]]
      : [new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], timeSlot.split(' ')[1] + ' ' + timeSlot.split(' ')[2]];

    const newAppointment: TelehealthAppointment = {
      id: String(Date.now()),
      doctorName: doctor.name,
      specialty: doctor.specialty,
      date,
      time: time.replace(' ', ''),
      duration: 30,
      type: 'video',
      status: 'scheduled',
      meetingLink: `https://meet.cleveland-clinic.com/room/${Math.random().toString(36).substr(2, 9)}`
    };

    const updated = [...appointments, newAppointment];
    setAppointments(updated);
    localStorage.setItem('telehealthAppointments', JSON.stringify(updated));
    
    alert(`Appointment booked with ${doctor.name} for ${timeSlot}`);
    setActiveTab('appointments');
  };

  const joinCall = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    if (!appointment) return;

    // Update appointment status
    const updated = appointments.map(a => 
      a.id === appointmentId ? { ...a, status: 'in_progress' as const } : a
    );
    setAppointments(updated);
    localStorage.setItem('telehealthAppointments', JSON.stringify(updated));
    
    setIsInCall(true);
    setActiveTab('consultation');
  };

  const endCall = () => {
    setIsInCall(false);
    
    // Update appointment status to completed
    const updated = appointments.map(a => 
      a.status === 'in_progress' ? { ...a, status: 'completed' as const } : a
    );
    setAppointments(updated);
    localStorage.setItem('telehealthAppointments', JSON.stringify(updated));
    
    setActiveTab('appointments');
  };

  const toggleVideo = () => {
    setCallSettings(prev => ({ ...prev, video: !prev.video }));
  };

  const toggleAudio = () => {
    setCallSettings(prev => ({ ...prev, audio: !prev.audio }));
  };

  const getStatusColor = (status: TelehealthAppointment['status']) => {
    switch (status) {
      case 'scheduled': return '#f59e0b';
      case 'in_progress': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusLabel = (status: TelehealthAppointment['status']) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString();
  };

  const isUpcoming = (date: string, time: string) => {
    const appointmentTime = new Date(`${date}T${time}`);
    const now = new Date();
    return appointmentTime > now;
  };

  const upcomingAppointments = appointments.filter(a => 
    a.status === 'scheduled' && isUpcoming(a.date, a.time)
  );

  return (
    <div className="telehealth-container">
      <div className="telehealth-header">
        <div className="telehealth-title">
          <Video size={20} />
          <h3>Telehealth</h3>
        </div>
        {upcomingAppointments.length > 0 && (
          <div className="upcoming-badge">
            <Clock size={14} />
            <span>{upcomingAppointments.length} upcoming</span>
          </div>
        )}
      </div>

      <div className="telehealth-tabs">
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
        >
          My Appointments
        </button>
        <button 
          onClick={() => setActiveTab('doctors')}
          className={`tab-btn ${activeTab === 'doctors' ? 'active' : ''}`}
        >
          Find Doctors
        </button>
        {isInCall && (
          <button 
            onClick={() => setActiveTab('consultation')}
            className={`tab-btn ${activeTab === 'consultation' ? 'active' : ''} in-call`}
          >
            🔴 In Call
          </button>
        )}
      </div>

      <div className="telehealth-content">
        {activeTab === 'appointments' && (
          <div className="appointments-section">
            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="upcoming-section">
                <h4>Upcoming Appointments</h4>
                <div className="appointments-list">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-item upcoming">
                      <div className="appointment-info">
                        <div className="appointment-doctor">
                          <User size={16} />
                          <span>{appointment.doctorName}</span>
                          <span className="specialty">{appointment.specialty}</span>
                        </div>
                        <div className="appointment-details">
                          <div className="detail-item">
                            <Calendar size={14} />
                            <span>{formatDateTime(appointment.date, appointment.time)}</span>
                          </div>
                          <div className="detail-item">
                            <Clock size={14} />
                            <span>{appointment.duration} minutes</span>
                          </div>
                          <div className="detail-item">
                            <Video size={14} />
                            <span>{appointment.type} call</span>
                          </div>
                        </div>
                      </div>
                      <div className="appointment-actions">
                        <button 
                          onClick={() => joinCall(appointment.id)}
                          className="join-btn"
                        >
                          <Video size={14} />
                          Join Call
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Appointments */}
            <div className="all-appointments-section">
              <h4>All Appointments</h4>
              <div className="appointments-list">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-info">
                      <div className="appointment-doctor">
                        <User size={16} />
                        <span>{appointment.doctorName}</span>
                        <span className="specialty">{appointment.specialty}</span>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <div className="appointment-details">
                        <div className="detail-item">
                          <Calendar size={14} />
                          <span>{formatDateTime(appointment.date, appointment.time)}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>{appointment.duration} minutes</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="appointment-notes">
                          <strong>Notes:</strong> {appointment.notes}
                        </div>
                      )}
                      {appointment.prescription && (
                        <div className="appointment-prescription">
                          <strong>Prescription:</strong> {appointment.prescription}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="doctors-section">
            <div className="doctors-list">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="doctor-card">
                  <div className="doctor-info">
                    <div className="doctor-avatar">{doctor.avatar}</div>
                    <div className="doctor-details">
                      <div className="doctor-name">{doctor.name}</div>
                      <div className="doctor-specialty">{doctor.specialty}</div>
                      <div className="doctor-meta">
                        <span className="rating">⭐ {doctor.rating}</span>
                        <span className="experience">{doctor.experience} experience</span>
                      </div>
                      <div className="doctor-languages">
                        Languages: {doctor.languages.join(', ')}
                      </div>
                      <div className="consultation-fee">
                        Consultation: AED {doctor.consultationFee}
                      </div>
                    </div>
                  </div>
                  <div className="doctor-availability">
                    <h5>Available Times</h5>
                    <div className="time-slots">
                      {doctor.availability.map((slot, index) => (
                        <button 
                          key={index}
                          onClick={() => bookAppointment(doctor.id, slot)}
                          className="time-slot"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'consultation' && isInCall && (
          <div className="consultation-section">
            <div className="video-call-interface">
              <div className="video-area">
                <div className="doctor-video">
                  <div className="video-placeholder">
                    <User size={64} />
                    <span>Dr. Sarah Ahmed</span>
                  </div>
                </div>
                <div className="patient-video">
                  <div className="video-placeholder small">
                    {callSettings.video ? <Camera size={32} /> : <CameraOff size={32} />}
                    <span>You</span>
                  </div>
                </div>
              </div>
              
              <div className="call-controls">
                <button 
                  onClick={toggleAudio}
                  className={`control-btn ${!callSettings.audio ? 'muted' : ''}`}
                >
                  {callSettings.audio ? <Mic size={20} /> : <MicOff size={20} />}
                </button>
                <button 
                  onClick={toggleVideo}
                  className={`control-btn ${!callSettings.video ? 'disabled' : ''}`}
                >
                  {callSettings.video ? <Camera size={20} /> : <CameraOff size={20} />}
                </button>
                <button className="control-btn">
                  <MessageCircle size={20} />
                </button>
                <button 
                  onClick={endCall}
                  className="control-btn end-call"
                >
                  <Phone size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
