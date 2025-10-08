import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Clock, 
  Stethoscope, 
  Home,
  ArrowRight,
  MessageSquare
} from "lucide-react";

type TriageResult = {
  severity: "emergency" | "urgent" | "routine" | "home";
  title: string;
  description: string;
  action: string;
  waitTime?: string;
  icon: any;
};

export const SymptomChecker = () => {
  const [step, setStep] = useState<"input" | "questions" | "result">("input");
  const [symptoms, setSymptoms] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<TriageResult | null>(null);

  const questions = [
    "How would you rate your pain level? (1-10)",
    "When did these symptoms start?",
    "Have you had similar symptoms before?",
    "Are you experiencing any difficulty breathing?",
    "Do you have any chronic medical conditions?"
  ];

  const handleStartAssessment = () => {
    if (symptoms.trim()) {
      setStep("questions");
    }
  };

  const handleAnswerQuestion = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Simulate AI triage decision
      const triageResult = simulateTriage(symptoms, newAnswers);
      setResult(triageResult);
      setStep("result");
    }
  };

  const simulateTriage = (symptoms: string, answers: string[]): TriageResult => {
    // Simple simulation based on keywords
    const lowerSymptoms = symptoms.toLowerCase();
    const painLevel = parseInt(answers[0]) || 0;
    
    if (
      lowerSymptoms.includes("chest pain") || 
      lowerSymptoms.includes("difficulty breathing") ||
      lowerSymptoms.includes("severe bleeding") ||
      painLevel >= 8
    ) {
      return {
        severity: "emergency",
        title: "Go to Emergency Room NOW",
        description: "Your symptoms require immediate medical attention. Please proceed to the nearest emergency room or call an ambulance.",
        action: "ER Visit Required",
        waitTime: "Immediate",
        icon: AlertCircle
      };
    } else if (
      lowerSymptoms.includes("fever") ||
      lowerSymptoms.includes("injury") ||
      painLevel >= 5
    ) {
      return {
        severity: "urgent",
        title: "Urgent Care Recommended",
        description: "Your symptoms should be evaluated within the next few hours. We recommend visiting urgent care or booking a same-day appointment.",
        action: "Book Urgent Appointment",
        waitTime: "Within 4 hours",
        icon: Clock
      };
    } else if (
      lowerSymptoms.includes("cough") ||
      lowerSymptoms.includes("cold") ||
      painLevel >= 3
    ) {
      return {
        severity: "routine",
        title: "Schedule Clinic Appointment",
        description: "Your symptoms can be addressed in a routine clinic visit. We recommend scheduling an appointment within the next few days.",
        action: "Book Clinic Appointment",
        waitTime: "1-3 days",
        icon: Stethoscope
      };
    } else {
      return {
        severity: "home",
        title: "Home Care Recommended",
        description: "Your symptoms can likely be managed at home with self-care. Monitor your condition and seek medical attention if symptoms worsen.",
        action: "View Home Care Tips",
        waitTime: "N/A",
        icon: Home
      };
    }
  };

  const resetChecker = () => {
    setStep("input");
    setSymptoms("");
    setCurrentQuestion(0);
    setAnswers([]);
    setResult(null);
  };

  const severityConfig = {
    emergency: {
      color: "emergency",
      bgClass: "bg-emergency/10 border-emergency",
      textClass: "text-emergency",
      badgeVariant: "destructive" as const
    },
    urgent: {
      color: "urgent",
      bgClass: "bg-urgent/10 border-urgent",
      textClass: "text-urgent",
      badgeVariant: "default" as const
    },
    routine: {
      color: "routine",
      bgClass: "bg-routine/10 border-routine",
      textClass: "text-routine",
      badgeVariant: "secondary" as const
    },
    home: {
      color: "info",
      bgClass: "bg-info/10 border-info",
      textClass: "text-info",
      badgeVariant: "outline" as const
    }
  };

  return (
    <section id="symptom-checker" className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            AI Symptom Checker
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Answer a few questions and let our AI guide you to the right level of care
          </p>
        </div>

        <Card className="p-8 shadow-lg">
          {step === "input" && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="symptoms" className="text-lg font-semibold">
                  What symptoms are you experiencing?
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe your symptoms in detail... (e.g., 'I have a persistent cough and mild fever for 2 days')"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="min-h-32 text-base"
                />
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-info/10 rounded-lg border border-info/20">
                <MessageSquare className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Be as specific as possible. Include when symptoms started, their severity, and any relevant medical history.
                </p>
              </div>

              <Button
                size="lg"
                variant="hero"
                onClick={handleStartAssessment}
                disabled={!symptoms.trim()}
                className="w-full"
              >
                Start Assessment
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {step === "questions" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="secondary" className="text-sm">
                  Question {currentQuestion + 1} of {questions.length}
                </Badge>
                <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 w-8 rounded-full transition-colors ${
                        idx <= currentQuestion ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-xl font-semibold">
                  {questions[currentQuestion]}
                </Label>
                <Input
                  placeholder="Type your answer..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      handleAnswerQuestion(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                  className="text-base"
                />
                <p className="text-sm text-muted-foreground">
                  Press Enter to continue
                </p>
              </div>
            </div>
          )}

          {step === "result" && result && (
            <div className="space-y-6 animate-fade-in">
              <div className={`p-6 rounded-xl border-2 ${severityConfig[result.severity].bgClass}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-card ${severityConfig[result.severity].textClass}`}>
                    <result.icon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-2xl font-bold">{result.title}</h3>
                      <Badge variant={severityConfig[result.severity].badgeVariant}>
                        {result.action}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {result.description}
                    </p>
                    {result.waitTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span className="font-medium">Expected Time:</span>
                        <span>{result.waitTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Button
                  size="lg"
                  variant={result.severity === "emergency" ? "emergency" : result.severity === "urgent" ? "urgent" : "success"}
                  className="w-full"
                >
                  {result.action}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={resetChecker}
                  className="w-full"
                >
                  Start New Assessment
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> This is an AI-powered assessment tool and should not replace professional medical advice. If you're experiencing a medical emergency, call emergency services immediately.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
};
