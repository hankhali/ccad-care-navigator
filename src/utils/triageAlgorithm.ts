// Intelligent Triage Algorithm for Dynamic Symptom Assessment

export interface SymptomData {
  symptoms: string;
  severity: number;
  duration: string;
  additionalInfo: string;
  photos?: File[];
  voiceNote?: Blob | null;
}

export interface TriageResult {
  recommendation: 'ER' | 'Urgent_Care' | 'Clinic' | 'Telehealth' | 'Self_Care';
  confidence: number;
  urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  reasoning: string[];
  nextSteps: string[];
  redFlags: string[];
  estimatedWaitTime?: string;
  followUpRecommended: boolean;
}

// Emergency keywords that indicate immediate medical attention
const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'shortness of breath',
  'severe bleeding', 'unconscious', 'seizure', 'severe head injury', 'poisoning',
  'severe burns', 'broken bone', 'severe allergic reaction', 'anaphylaxis',
  'severe abdominal pain', 'vomiting blood', 'blood in stool', 'severe headache',
  'loss of consciousness', 'paralysis', 'severe trauma', 'overdose'
];

// Urgent care keywords
const URGENT_KEYWORDS = [
  'fever', 'high fever', 'persistent vomiting', 'severe pain', 'infection',
  'wound', 'cut', 'sprain', 'minor fracture', 'severe cough', 'flu symptoms',
  'dehydration', 'rash', 'eye injury', 'ear pain', 'sinus infection'
];

// Clinic/routine care keywords
const CLINIC_KEYWORDS = [
  'check up', 'routine', 'mild pain', 'cold', 'cough', 'sore throat',
  'headache', 'fatigue', 'stress', 'anxiety', 'depression', 'insomnia',
  'joint pain', 'back pain', 'skin condition', 'allergies'
];

// Telehealth appropriate keywords
const TELEHEALTH_KEYWORDS = [
  'consultation', 'follow up', 'medication review', 'mental health',
  'anxiety', 'depression', 'stress', 'insomnia', 'mild symptoms',
  'prescription refill', 'health advice', 'wellness check'
];

// Self-care keywords
const SELF_CARE_KEYWORDS = [
  'mild headache', 'minor cold', 'slight fatigue', 'wellness',
  'prevention', 'nutrition advice', 'exercise', 'sleep issues',
  'stress management', 'minor aches'
];

export function analyzeSymptoms(data: SymptomData): TriageResult {
  const symptoms = data.symptoms.toLowerCase();
  const severity = data.severity;
  const duration = data.duration;
  
  // Initialize scoring system
  let emergencyScore = 0;
  let urgentScore = 0;
  let clinicScore = 0;
  let telehealthScore = 0;
  let selfCareScore = 0;
  
  const reasoning: string[] = [];
  const nextSteps: string[] = [];
  const redFlags: string[] = [];
  
  // Analyze keywords
  EMERGENCY_KEYWORDS.forEach(keyword => {
    if (symptoms.includes(keyword)) {
      emergencyScore += 10;
      redFlags.push(`"${keyword}" indicates potential emergency`);
    }
  });
  
  URGENT_KEYWORDS.forEach(keyword => {
    if (symptoms.includes(keyword)) {
      urgentScore += 5;
    }
  });
  
  CLINIC_KEYWORDS.forEach(keyword => {
    if (symptoms.includes(keyword)) {
      clinicScore += 3;
    }
  });
  
  TELEHEALTH_KEYWORDS.forEach(keyword => {
    if (symptoms.includes(keyword)) {
      telehealthScore += 4;
    }
  });
  
  SELF_CARE_KEYWORDS.forEach(keyword => {
    if (symptoms.includes(keyword)) {
      selfCareScore += 2;
    }
  });
  
  // Severity scoring (1-10 scale)
  if (severity >= 8) {
    emergencyScore += 8;
    reasoning.push(`High severity level (${severity}/10) suggests urgent medical attention`);
  } else if (severity >= 6) {
    urgentScore += 6;
    reasoning.push(`Moderate-high severity (${severity}/10) requires prompt care`);
  } else if (severity >= 4) {
    clinicScore += 4;
    reasoning.push(`Moderate severity (${severity}/10) suitable for clinic visit`);
  } else if (severity >= 2) {
    telehealthScore += 3;
    reasoning.push(`Low-moderate severity (${severity}/10) may be addressed via telehealth`);
  } else {
    selfCareScore += 2;
    reasoning.push(`Low severity (${severity}/10) may be manageable with self-care`);
  }
  
  // Duration analysis
  switch (duration) {
    case 'less-than-hour':
      if (severity >= 7) emergencyScore += 5;
      reasoning.push('Recent onset of symptoms');
      break;
    case 'few-hours':
      if (severity >= 6) urgentScore += 3;
      reasoning.push('Symptoms developed within hours');
      break;
    case 'today':
      clinicScore += 2;
      reasoning.push('Same-day symptom onset');
      break;
    case 'yesterday':
      clinicScore += 1;
      reasoning.push('Symptoms started yesterday');
      break;
    case 'few-days':
      telehealthScore += 2;
      reasoning.push('Ongoing symptoms for several days');
      break;
    case 'week':
    case 'weeks':
      telehealthScore += 3;
      reasoning.push('Chronic or persistent symptoms');
      break;
    case 'months':
      clinicScore += 2;
      reasoning.push('Long-term symptoms requiring evaluation');
      break;
  }
  
  // Additional factors
  if (data.photos && data.photos.length > 0) {
    reasoning.push('Visual documentation provided for assessment');
    clinicScore += 1;
  }
  
  if (data.voiceNote) {
    reasoning.push('Voice description provided for detailed assessment');
    clinicScore += 1;
  }
  
  // Determine recommendation based on highest score
  const scores = [
    { type: 'ER', score: emergencyScore, urgency: 'Critical' as const },
    { type: 'Urgent_Care', score: urgentScore, urgency: 'High' as const },
    { type: 'Clinic', score: clinicScore, urgency: 'Medium' as const },
    { type: 'Telehealth', score: telehealthScore, urgency: 'Low' as const },
    { type: 'Self_Care', score: selfCareScore, urgency: 'Low' as const }
  ];
  
  // Sort by score and get the highest
  scores.sort((a, b) => b.score - a.score);
  const topRecommendation = scores[0];
  
  // Calculate confidence based on score difference
  const secondHighest = scores[1];
  const scoreDifference = topRecommendation.score - secondHighest.score;
  let confidence = Math.min(95, 60 + (scoreDifference * 3));
  
  // Adjust confidence based on severity alignment
  if (severity >= 8 && topRecommendation.type === 'ER') confidence += 10;
  if (severity <= 3 && topRecommendation.type === 'Self_Care') confidence += 5;
  
  confidence = Math.min(95, Math.max(45, confidence));
  
  // Generate next steps based on recommendation
  switch (topRecommendation.type) {
    case 'ER':
      nextSteps.push('Go to Emergency Department immediately');
      nextSteps.push('Call 999 if symptoms worsen');
      nextSteps.push('Bring list of current medications');
      nextSteps.push('Have someone drive you or call ambulance');
      break;
      
    case 'Urgent_Care':
      nextSteps.push('Visit Urgent Care within 2-4 hours');
      nextSteps.push('Call ahead to check wait times');
      nextSteps.push('Bring insurance card and ID');
      nextSteps.push('Monitor symptoms closely');
      break;
      
    case 'Clinic':
      nextSteps.push('Schedule appointment with primary care physician');
      nextSteps.push('Book within 1-3 days if possible');
      nextSteps.push('Prepare list of symptoms and questions');
      nextSteps.push('Bring current medications list');
      break;
      
    case 'Telehealth':
      nextSteps.push('Schedule telehealth consultation');
      nextSteps.push('Prepare quiet space with good internet');
      nextSteps.push('Have symptoms list and medications ready');
      nextSteps.push('Consider in-person visit if symptoms worsen');
      break;
      
    case 'Self_Care':
      nextSteps.push('Monitor symptoms at home');
      nextSteps.push('Rest and stay hydrated');
      nextSteps.push('Use over-the-counter remedies as appropriate');
      nextSteps.push('Seek medical care if symptoms worsen');
      break;
  }
  
  // Add red flags for emergency situations
  if (emergencyScore > 5) {
    redFlags.push('Symptoms may indicate serious medical condition');
    redFlags.push('Do not delay seeking immediate medical attention');
  }
  
  // Estimate wait times
  let estimatedWaitTime: string | undefined;
  switch (topRecommendation.type) {
    case 'ER':
      estimatedWaitTime = '15-45 minutes (priority based)';
      break;
    case 'Urgent_Care':
      estimatedWaitTime = '30-90 minutes';
      break;
    case 'Clinic':
      estimatedWaitTime = '1-3 days for appointment';
      break;
    case 'Telehealth':
      estimatedWaitTime = 'Same day or next day';
      break;
    case 'Self_Care':
      estimatedWaitTime = 'Immediate self-management';
      break;
  }
  
  // Determine if follow-up is recommended
  const followUpRecommended = severity >= 4 || 
    duration === 'weeks' || 
    duration === 'months' || 
    topRecommendation.type !== 'Self_Care';
  
  return {
    recommendation: topRecommendation.type as any,
    confidence: Math.round(confidence),
    urgencyLevel: topRecommendation.urgency,
    reasoning,
    nextSteps,
    redFlags,
    estimatedWaitTime,
    followUpRecommended
  };
}

// Helper function to generate realistic but varied results for demo
export function generateDemoVariation(baseResult: TriageResult): TriageResult {
  // Add some randomization for demo purposes while keeping it realistic
  const variations = [-5, -3, -1, 0, 1, 3, 5];
  const confidenceVariation = variations[Math.floor(Math.random() * variations.length)];
  
  const newConfidence = Math.min(95, Math.max(45, baseResult.confidence + confidenceVariation));
  
  // Occasionally suggest alternative recommendations for borderline cases
  if (baseResult.confidence < 70 && Math.random() < 0.3) {
    const alternatives = {
      'ER': 'Urgent_Care',
      'Urgent_Care': 'Clinic',
      'Clinic': 'Telehealth',
      'Telehealth': 'Self_Care',
      'Self_Care': 'Telehealth'
    };
    
    const altRecommendation = alternatives[baseResult.recommendation as keyof typeof alternatives];
    if (altRecommendation) {
      return {
        ...baseResult,
        recommendation: altRecommendation as any,
        confidence: newConfidence,
        reasoning: [...baseResult.reasoning, 'Alternative recommendation based on symptom analysis']
      };
    }
  }
  
  return {
    ...baseResult,
    confidence: newConfidence
  };
}
