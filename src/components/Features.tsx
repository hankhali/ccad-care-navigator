import { Card } from "@/components/ui/card";
import { 
  Smartphone, 
  Monitor, 
  Brain,
  Clock,
  Shield,
  Languages,
  Bell,
  Activity
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Smart Mobile App",
    description: "AI-powered symptom checker with instant triage and appointment booking",
    gradient: "from-primary to-primary-light"
  },
  {
    icon: Monitor,
    title: "Hospital Kiosks",
    description: "ATM-style triage stations with biometric check-in and vital signs integration",
    gradient: "from-info to-primary"
  },
  {
    icon: Brain,
    title: "AI Flow Optimizer",
    description: "Real-time patient routing and predictive wait time calculations",
    gradient: "from-routine to-info"
  },
  {
    icon: Languages,
    title: "Multi-Language",
    description: "Support for Arabic, English, Hindi, Tagalog, and Urdu",
    gradient: "from-urgent to-accent"
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "HIPAA compliant with end-to-end encryption and UAE health data compliance",
    gradient: "from-primary-dark to-primary"
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "SMS/WhatsApp updates with queue position and pre-arrival instructions",
    gradient: "from-accent to-urgent"
  },
  {
    icon: Activity,
    title: "Wearable Integration",
    description: "Sync with Apple Watch, Fitbit for continuous vital monitoring",
    gradient: "from-routine to-primary-light"
  },
  {
    icon: Clock,
    title: "24/7 Available",
    description: "Round-the-clock AI assistance for your healthcare navigation needs",
    gradient: "from-primary to-routine"
  }
];

export const Features = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Three-Tiered AI System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive healthcare navigation at every touchpoint
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up group border-border/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
