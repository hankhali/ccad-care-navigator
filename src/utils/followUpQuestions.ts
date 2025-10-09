// Dynamic Follow-up Questions System

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'yes_no' | 'text' | 'number' | 'scale';
  options?: string[];
  required: boolean;
  category: string;
}

export interface QuestionResponse {
  questionId: string;
  answer: string | number;
}

// Symptom-specific follow-up questions
const SYMPTOM_QUESTIONS: Record<string, FollowUpQuestion[]> = {
  fever: [
    {
      id: 'fever_temperature',
      question: 'What is your current temperature?',
      type: 'multiple_choice',
      options: [
        'Below 100°F (37.8°C)',
        '100-101°F (37.8-38.3°C)',
        '101-102°F (38.3-38.9°C)',
        '102-103°F (38.9-39.4°C)',
        'Above 103°F (39.4°C)',
        'I haven\'t measured it'
      ],
      required: true,
      category: 'fever'
    },
    {
      id: 'fever_duration',
      question: 'How long have you had the fever?',
      type: 'multiple_choice',
      options: [
        'Just started (less than 6 hours)',
        '6-12 hours',
        '1-2 days',
        '3-5 days',
        'More than 5 days'
      ],
      required: true,
      category: 'fever'
    },
    {
      id: 'fever_chills',
      question: 'Are you experiencing chills or shivering?',
      type: 'yes_no',
      required: true,
      category: 'fever'
    },
    {
      id: 'fever_other_symptoms',
      question: 'What other symptoms are you experiencing with the fever?',
      type: 'multiple_choice',
      options: [
        'Headache',
        'Body aches',
        'Sore throat',
        'Cough',
        'Nausea/Vomiting',
        'Diarrhea',
        'Rash',
        'Difficulty breathing',
        'None of the above'
      ],
      required: false,
      category: 'fever'
    }
  ],

  'chest pain': [
    {
      id: 'chest_pain_type',
      question: 'How would you describe the chest pain?',
      type: 'multiple_choice',
      options: [
        'Sharp, stabbing pain',
        'Dull, aching pain',
        'Burning sensation',
        'Pressure or squeezing',
        'Tight band around chest'
      ],
      required: true,
      category: 'chest_pain'
    },
    {
      id: 'chest_pain_location',
      question: 'Where exactly is the pain located?',
      type: 'multiple_choice',
      options: [
        'Center of chest',
        'Left side of chest',
        'Right side of chest',
        'Upper chest',
        'Lower chest',
        'Radiating to arm/jaw/back'
      ],
      required: true,
      category: 'chest_pain'
    },
    {
      id: 'chest_pain_triggers',
      question: 'What makes the pain worse?',
      type: 'multiple_choice',
      options: [
        'Physical activity',
        'Deep breathing',
        'Coughing',
        'Lying down',
        'Stress/anxiety',
        'Nothing specific'
      ],
      required: false,
      category: 'chest_pain'
    },
    {
      id: 'chest_pain_breathing',
      question: 'Are you having difficulty breathing?',
      type: 'yes_no',
      required: true,
      category: 'chest_pain'
    }
  ],

  headache: [
    {
      id: 'headache_type',
      question: 'How would you describe your headache?',
      type: 'multiple_choice',
      options: [
        'Throbbing/pulsating',
        'Tight band around head',
        'Sharp, stabbing',
        'Dull, constant ache',
        'Pressure behind eyes'
      ],
      required: true,
      category: 'headache'
    },
    {
      id: 'headache_location',
      question: 'Where is the headache located?',
      type: 'multiple_choice',
      options: [
        'Forehead',
        'Temples',
        'Back of head',
        'Top of head',
        'Behind eyes',
        'One side only',
        'All over'
      ],
      required: true,
      category: 'headache'
    },
    {
      id: 'headache_nausea',
      question: 'Are you experiencing nausea or vomiting?',
      type: 'yes_no',
      required: true,
      category: 'headache'
    },
    {
      id: 'headache_vision',
      question: 'Any vision changes or sensitivity to light?',
      type: 'yes_no',
      required: true,
      category: 'headache'
    }
  ],

  cough: [
    {
      id: 'cough_type',
      question: 'What type of cough do you have?',
      type: 'multiple_choice',
      options: [
        'Dry cough (no mucus)',
        'Productive cough (with mucus)',
        'Barking cough',
        'Whooping cough'
      ],
      required: true,
      category: 'cough'
    },
    {
      id: 'cough_mucus',
      question: 'If you\'re coughing up mucus, what color is it?',
      type: 'multiple_choice',
      options: [
        'Clear/white',
        'Yellow',
        'Green',
        'Brown',
        'Blood-tinged',
        'No mucus'
      ],
      required: false,
      category: 'cough'
    },
    {
      id: 'cough_timing',
      question: 'When is the cough worse?',
      type: 'multiple_choice',
      options: [
        'At night',
        'In the morning',
        'During the day',
        'After eating',
        'When lying down',
        'Consistent throughout day'
      ],
      required: false,
      category: 'cough'
    }
  ],

  'abdominal pain': [
    {
      id: 'abdominal_location',
      question: 'Where is the abdominal pain located?',
      type: 'multiple_choice',
      options: [
        'Upper right abdomen',
        'Upper left abdomen',
        'Lower right abdomen',
        'Lower left abdomen',
        'Around navel',
        'All over abdomen'
      ],
      required: true,
      category: 'abdominal_pain'
    },
    {
      id: 'abdominal_type',
      question: 'How would you describe the pain?',
      type: 'multiple_choice',
      options: [
        'Sharp, stabbing',
        'Dull, aching',
        'Cramping',
        'Burning',
        'Constant pressure'
      ],
      required: true,
      category: 'abdominal_pain'
    },
    {
      id: 'abdominal_nausea',
      question: 'Are you experiencing nausea or vomiting?',
      type: 'yes_no',
      required: true,
      category: 'abdominal_pain'
    },
    {
      id: 'abdominal_bowel',
      question: 'Any changes in bowel movements?',
      type: 'multiple_choice',
      options: [
        'Diarrhea',
        'Constipation',
        'Blood in stool',
        'No changes'
      ],
      required: false,
      category: 'abdominal_pain'
    }
  ],

  'shortness of breath': [
    {
      id: 'breathing_onset',
      question: 'When did the breathing difficulty start?',
      type: 'multiple_choice',
      options: [
        'Suddenly',
        'Gradually over hours',
        'Gradually over days',
        'Has been ongoing'
      ],
      required: true,
      category: 'breathing'
    },
    {
      id: 'breathing_triggers',
      question: 'What makes the breathing difficulty worse?',
      type: 'multiple_choice',
      options: [
        'Physical activity',
        'Lying flat',
        'Cold air',
        'Stress/anxiety',
        'Nothing specific'
      ],
      required: false,
      category: 'breathing'
    },
    {
      id: 'breathing_chest_pain',
      question: 'Do you have chest pain with the breathing difficulty?',
      type: 'yes_no',
      required: true,
      category: 'breathing'
    }
  ],

  rash: [
    {
      id: 'rash_appearance',
      question: 'How would you describe the rash?',
      type: 'multiple_choice',
      options: [
        'Red, flat spots',
        'Raised bumps',
        'Blisters',
        'Dry, scaly patches',
        'Hives (welts)'
      ],
      required: true,
      category: 'rash'
    },
    {
      id: 'rash_itchy',
      question: 'Is the rash itchy?',
      type: 'yes_no',
      required: true,
      category: 'rash'
    },
    {
      id: 'rash_location',
      question: 'Where is the rash located?',
      type: 'multiple_choice',
      options: [
        'Face',
        'Arms',
        'Legs',
        'Torso',
        'Hands/feet',
        'All over body'
      ],
      required: true,
      category: 'rash'
    }
  ]
};

export function getFollowUpQuestions(symptoms: string): FollowUpQuestion[] {
  const lowerSymptoms = symptoms.toLowerCase();
  const questions: FollowUpQuestion[] = [];
  
  // Check for each symptom keyword and add relevant questions
  Object.keys(SYMPTOM_QUESTIONS).forEach(symptom => {
    if (lowerSymptoms.includes(symptom)) {
      questions.push(...SYMPTOM_QUESTIONS[symptom]);
    }
  });
  
  // Remove duplicates based on question ID
  const uniqueQuestions = questions.filter((question, index, self) => 
    index === self.findIndex(q => q.id === question.id)
  );
  
  return uniqueQuestions;
}

export function analyzeFollowUpResponses(responses: QuestionResponse[]): {
  riskFactors: string[];
  recommendations: string[];
  urgencyModifier: number; // -2 to +3 to adjust base urgency
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];
  let urgencyModifier = 0;
  
  responses.forEach(response => {
    switch (response.questionId) {
      case 'fever_temperature':
        if (response.answer === 'Above 103°F (39.4°C)') {
          riskFactors.push('High fever (>103°F) indicates serious infection');
          urgencyModifier += 2;
        } else if (response.answer === '102-103°F (38.9-39.4°C)') {
          riskFactors.push('Significant fever requires medical attention');
          urgencyModifier += 1;
        }
        break;
        
      case 'fever_duration':
        if (response.answer === 'More than 5 days') {
          riskFactors.push('Prolonged fever may indicate serious condition');
          urgencyModifier += 1;
        }
        break;
        
      case 'chest_pain_type':
        if (response.answer === 'Pressure or squeezing' || response.answer === 'Tight band around chest') {
          riskFactors.push('Chest pressure may indicate cardiac issue');
          urgencyModifier += 3;
        }
        break;
        
      case 'chest_pain_breathing':
        if (response.answer === 'yes') {
          riskFactors.push('Chest pain with breathing difficulty requires immediate attention');
          urgencyModifier += 2;
        }
        break;
        
      case 'headache_vision':
        if (response.answer === 'yes') {
          riskFactors.push('Vision changes with headache may indicate serious condition');
          urgencyModifier += 1;
        }
        break;
        
      case 'cough_mucus':
        if (response.answer === 'Blood-tinged') {
          riskFactors.push('Blood in cough requires immediate medical evaluation');
          urgencyModifier += 2;
        } else if (response.answer === 'Green') {
          riskFactors.push('Green mucus may indicate bacterial infection');
          urgencyModifier += 1;
        }
        break;
        
      case 'breathing_onset':
        if (response.answer === 'Suddenly') {
          riskFactors.push('Sudden breathing difficulty requires immediate attention');
          urgencyModifier += 3;
        }
        break;
        
      case 'abdominal_location':
        if (response.answer === 'Lower right abdomen') {
          riskFactors.push('Lower right abdominal pain may indicate appendicitis');
          urgencyModifier += 2;
        }
        break;
    }
  });
  
  // Generate recommendations based on responses
  if (urgencyModifier >= 2) {
    recommendations.push('Seek immediate medical attention');
    recommendations.push('Do not delay treatment');
  } else if (urgencyModifier >= 1) {
    recommendations.push('Schedule urgent care visit within 24 hours');
    recommendations.push('Monitor symptoms closely');
  } else {
    recommendations.push('Continue monitoring symptoms');
    recommendations.push('Seek care if symptoms worsen');
  }
  
  return {
    riskFactors,
    recommendations,
    urgencyModifier: Math.max(-2, Math.min(3, urgencyModifier))
  };
}
