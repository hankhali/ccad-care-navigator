import { useState, useRef, useEffect } from "react";
import { X, Camera, Mic, MicOff, Upload, Calendar, AlertCircle, ChevronRight } from "lucide-react";
import { analyzeSymptoms, generateDemoVariation, SymptomData } from "@/utils/triageAlgorithm";
import { getFollowUpQuestions, analyzeFollowUpResponses, FollowUpQuestion, QuestionResponse } from "@/utils/followUpQuestions";
import TriageResultsModal from "./TriageResultsModal";
import "./EnhancedTriageForm.css";

interface EnhancedTriageFormProps {
  onClose: () => void;
  onSubmit?: (data: TriageData) => void;
}

interface TriageData {
  symptoms: string;
  severity: number;
  photos: File[];
  voiceNote: Blob | null;
  duration: string;
  additionalInfo: string;
}

export default function EnhancedTriageForm({ onClose, onSubmit }: EnhancedTriageFormProps) {
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpQuestions, setFollowUpQuestions] = useState<FollowUpQuestion[]>([]);
  const [followUpResponses, setFollowUpResponses] = useState<QuestionResponse[]>([]);
  const [showFollowUpQuestions, setShowFollowUpQuestions] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [triageResults, setTriageResults] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const severityLabels = [
    "No pain", "Minimal", "Mild", "Moderate", "Moderate+", 
    "Severe", "Severe+", "Very severe", "Extreme", "Unbearable"
  ];

  const severityColors = [
    "#10b981", "#22c55e", "#84cc16", "#eab308", "#f59e0b",
    "#f97316", "#ef4444", "#dc2626", "#b91c1c", "#7f1d1d"
  ];

  // Check for follow-up questions when symptoms change
  useEffect(() => {
    if (symptoms.trim().length > 3) { // Check for any meaningful input
      const questions = getFollowUpQuestions(symptoms);
      setFollowUpQuestions(questions);
      setShowFollowUpQuestions(questions.length > 0);
      // Reset responses when symptoms change significantly
      if (questions.length > 0) {
        setFollowUpResponses([]);
      }
    } else {
      setFollowUpQuestions([]);
      setShowFollowUpQuestions(false);
      setFollowUpResponses([]);
    }
  }, [symptoms]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPhotos(prev => [...prev, ...files].slice(0, 3)); // Max 3 photos
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setVoiceNote(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const deleteVoiceNote = () => {
    setVoiceNote(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFollowUpResponse = (questionId: string, answer: string | number) => {
    setFollowUpResponses(prev => {
      const existing = prev.filter(r => r.questionId !== questionId);
      return [...existing, { questionId, answer }];
    });
  };

  const renderFollowUpQuestion = (question: FollowUpQuestion) => {
    const currentResponse = followUpResponses.find(r => r.questionId === question.id);
    
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div key={question.id} className="follow-up-question">
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="question-options">
              {question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleFollowUpResponse(question.id, option)}
                  className={`option-btn ${currentResponse?.answer === option ? 'selected' : ''}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
        
      case 'yes_no':
        return (
          <div key={question.id} className="follow-up-question">
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="question-options">
              <button
                onClick={() => handleFollowUpResponse(question.id, 'yes')}
                className={`option-btn ${currentResponse?.answer === 'yes' ? 'selected' : ''}`}
              >
                Yes
              </button>
              <button
                onClick={() => handleFollowUpResponse(question.id, 'no')}
                className={`option-btn ${currentResponse?.answer === 'no' ? 'selected' : ''}`}
              >
                No
              </button>
            </div>
          </div>
        );
        
      case 'text':
        return (
          <div key={question.id} className="follow-up-question">
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <textarea
              value={currentResponse?.answer as string || ''}
              onChange={(e) => handleFollowUpResponse(question.id, e.target.value)}
              className="question-textarea"
              placeholder="Please provide details..."
              rows={3}
            />
          </div>
        );
        
      case 'scale':
        return (
          <div key={question.id} className="follow-up-question">
            <label className="question-label">
              {question.question}
              {question.required && <span className="required">*</span>}
            </label>
            <div className="scale-options">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => handleFollowUpResponse(question.id, num)}
                  className={`scale-btn ${currentResponse?.answer === num ? 'selected' : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!symptoms.trim()) {
      alert('Please describe your symptoms before submitting.');
      return;
    }

    const triageData: TriageData = {
      symptoms,
      severity,
      photos,
      voiceNote,
      duration,
      additionalInfo
    };
    
    // Use intelligent triage algorithm
    const symptomData: SymptomData = {
      symptoms,
      severity,
      duration,
      additionalInfo,
      photos,
      voiceNote
    };
    
    // Analyze symptoms and get recommendation
    const analysisResult = analyzeSymptoms(symptomData);
    
    // Analyze follow-up responses if any
    let followUpAnalysis = { riskFactors: [], recommendations: [], urgencyModifier: 0 };
    if (followUpResponses.length > 0) {
      followUpAnalysis = analyzeFollowUpResponses(followUpResponses);
    }
    
    // Adjust the analysis result based on follow-up responses
    const adjustedResult = {
      ...analysisResult,
      reasoning: [...analysisResult.reasoning, ...followUpAnalysis.riskFactors],
      nextSteps: [...analysisResult.nextSteps, ...followUpAnalysis.recommendations],
      confidence: Math.min(95, analysisResult.confidence + (followUpResponses.length * 2)) // Increase confidence with more data
    };
    
    // Adjust urgency based on follow-up responses
    if (followUpAnalysis.urgencyModifier > 0) {
      // Upgrade recommendation if follow-up indicates higher urgency
      const urgencyLevels = ['Self_Care', 'Telehealth', 'Clinic', 'Urgent_Care', 'ER'];
      const currentIndex = urgencyLevels.indexOf(adjustedResult.recommendation);
      const newIndex = Math.min(urgencyLevels.length - 1, currentIndex + followUpAnalysis.urgencyModifier);
      adjustedResult.recommendation = urgencyLevels[newIndex] as any;
    }
    
    // Add some demo variation for repeated use
    const finalResult = generateDemoVariation(adjustedResult);
    
    // Save to localStorage for demo
    const entry = {
      id: String(Date.now()),
      timestamp: new Date().toISOString(),
      summary: symptoms || "Enhanced triage assessment",
      result: finalResult.recommendation,
      confidence: finalResult.confidence,
      urgencyLevel: finalResult.urgencyLevel,
      reasoning: finalResult.reasoning,
      nextSteps: finalResult.nextSteps,
      redFlags: finalResult.redFlags,
      estimatedWaitTime: finalResult.estimatedWaitTime,
      raw: triageData,
      followUpDate: followUpDate || null,
      severity,
      hasPhotos: photos.length > 0,
      hasVoiceNote: !!voiceNote,
      followUpRecommended: finalResult.followUpRecommended
    };
    
    // Get existing history
    const existing = JSON.parse(localStorage.getItem('triageHistory') || '[]');
    existing.unshift(entry);
    localStorage.setItem('triageHistory', JSON.stringify(existing));
    
    // Schedule follow-up if date is set or recommended
    if (followUpDate || finalResult.followUpRecommended) {
      const followUps = JSON.parse(localStorage.getItem('followUpReminders') || '[]');
      const followUpDateToUse = followUpDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 1 week from now if recommended
      
      followUps.push({
        id: entry.id,
        date: followUpDateToUse,
        symptoms,
        severity,
        created: new Date().toISOString()
      });
      localStorage.setItem('followUpReminders', JSON.stringify(followUps));
    }
    
    // Trigger events
    window.dispatchEvent(new CustomEvent('triage:created'));
    
    onSubmit?.(triageData);
    
    // Show beautiful results modal
    setTriageResults(finalResult);
    setShowResults(true);
  };

  return (
    <div className="enhanced-triage-overlay">
      <div className="enhanced-triage-modal">
        <div className="enhanced-triage-header">
          <h2>Enhanced Symptom Assessment</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="enhanced-triage-content">
          {/* Symptoms Description */}
          <div className="form-section">
            <label className="form-label">Describe your symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe what you're experiencing..."
              className="symptoms-textarea"
              rows={3}
            />
          </div>

          {/* Severity Scale */}
          <div className="form-section">
            <label className="form-label">Pain/Discomfort Level</label>
            <div className="severity-scale">
              <div className="severity-numbers">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSeverity(num)}
                    className={`severity-btn ${severity === num ? 'active' : ''}`}
                    style={{
                      backgroundColor: severity === num ? severityColors[num - 1] : '#f3f4f6',
                      color: severity === num ? 'white' : '#6b7280'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <div className="severity-label">
                <span style={{ color: severityColors[severity - 1] }}>
                  {severityLabels[severity - 1]}
                </span>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="form-section">
            <label className="form-label">How long have you had these symptoms?</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="duration-select"
            >
              <option value="">Select duration</option>
              <option value="less-than-hour">Less than 1 hour</option>
              <option value="few-hours">A few hours</option>
              <option value="today">Started today</option>
              <option value="yesterday">Since yesterday</option>
              <option value="few-days">A few days</option>
              <option value="week">About a week</option>
              <option value="weeks">Several weeks</option>
              <option value="months">Months</option>
            </select>
          </div>

          {/* Follow-up Questions */}
          {showFollowUpQuestions && followUpQuestions.length > 0 && (
            <div className="form-section follow-up-section">
              <div className="follow-up-header">
                <ChevronRight size={16} />
                <label className="form-label">📋 Additional Questions</label>
                <span className="follow-up-count">({followUpQuestions.length} questions)</span>
              </div>
              <div className="follow-up-description">
                <strong>Smart AI Analysis:</strong> Based on your symptoms, we have some additional questions to better assess your condition:
              </div>
              <div className="follow-up-questions">
                {followUpQuestions.map(renderFollowUpQuestion)}
              </div>
            </div>
          )}

          {/* Demo Helper - Show what triggers questions */}
          {!showFollowUpQuestions && symptoms.trim().length > 0 && (
            <div className="form-section demo-helper">
              <div className="demo-helper-content">
                <div className="demo-helper-icon">💡</div>
                <div className="demo-helper-text">
                  <strong>Try typing specific symptoms like:</strong>
                  <div className="demo-examples">
                    "fever" • "chest pain" • "headache" • "cough" • "abdominal pain"
                  </div>
                  <small>Our AI will ask relevant follow-up questions to improve accuracy</small>
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div className="form-section">
            <label className="form-label">Upload Photos (Optional)</label>
            <div className="photo-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden-input"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="upload-btn"
                disabled={photos.length >= 3}
              >
                <Camera size={20} />
                Take/Upload Photo ({photos.length}/3)
              </button>
              
              {photos.length > 0 && (
                <div className="photo-preview">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Symptom photo ${index + 1}`}
                        className="photo-thumbnail"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="remove-photo-btn"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Voice Note */}
          <div className="form-section">
            <label className="form-label">Voice Note (Optional)</label>
            <div className="voice-note-area">
              {!voiceNote ? (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`voice-btn ${isRecording ? 'recording' : ''}`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  {isRecording ? `Recording... ${formatTime(recordingTime)}` : 'Record Voice Note'}
                </button>
              ) : (
                <div className="voice-note-preview">
                  <div className="voice-note-info">
                    <Mic size={16} />
                    <span>Voice note recorded ({formatTime(recordingTime)})</span>
                  </div>
                  <button onClick={deleteVoiceNote} className="delete-voice-btn">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Reminder */}
          <div className="form-section">
            <label className="form-label">Schedule Follow-up Check-in</label>
            <div className="followup-area">
              <Calendar size={16} />
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="followup-input"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="form-section">
            <label className="form-label">Additional Information</label>
            <textarea
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any other relevant information, medications, allergies, etc."
              className="additional-textarea"
              rows={2}
            />
          </div>
        </div>

        <div className="enhanced-triage-footer">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="submit-btn"
            disabled={!symptoms.trim()}
          >
            Complete Assessment
          </button>
        </div>
      </div>
      
      {/* Results Modal */}
      {showResults && triageResults && (
        <TriageResultsModal
          result={triageResults}
          onClose={() => {
            setShowResults(false);
            onClose();
          }}
          onNewAssessment={() => {
            setShowResults(false);
            // Reset form
            setSymptoms("");
            setSeverity(5);
            setDuration("");
            setAdditionalInfo("");
            setPhotos([]);
            setVoiceNote(null);
            setFollowUpDate("");
            setFollowUpQuestions([]);
            setFollowUpResponses([]);
            setShowFollowUpQuestions(false);
          }}
        />
      )}
    </div>
  );
}
