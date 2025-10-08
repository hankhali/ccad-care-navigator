import { Card } from "@/components/ui/card";
import { TrendingDown, Users, Clock, DollarSign, Award, BarChart3 } from "lucide-react";

const metrics = [
  {
    icon: TrendingDown,
    value: "30-40%",
    label: "ER Volume Reduction",
    description: "Fewer non-urgent ER visits",
    color: "text-routine"
  },
  {
    icon: Clock,
    value: "50%",
    label: "Faster Wait Times",
    description: "Reduced average waiting periods",
    color: "text-info"
  },
  {
    icon: Users,
    value: "95%",
    label: "Patient Satisfaction",
    description: "Improved care experience",
    color: "text-primary"
  },
  {
    icon: DollarSign,
    value: "AED 9.2M",
    label: "Annual Savings",
    description: "Cost reduction for CCAD",
    color: "text-accent"
  },
  {
    icon: Award,
    value: "95%+",
    label: "Triage Accuracy",
    description: "AI-powered precision",
    color: "text-routine"
  },
  {
    icon: BarChart3,
    value: "25%",
    label: "Staff Efficiency",
    description: "Improved workflow optimization",
    color: "text-urgent"
  }
];

export const Impact = () => {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Measurable Impact
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real results for Cleveland Clinic Abu Dhabi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-lg transition-all duration-300 animate-slide-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <metric.icon className={`w-8 h-8 ${metric.color}`} />
                  <div className={`text-4xl font-bold ${metric.color}`}>
                    {metric.value}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{metric.label}</h3>
                  <p className="text-muted-foreground text-sm">
                    {metric.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">ROI Analysis</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Average ER visit cost: <span className="font-semibold text-foreground">AED 700</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Daily non-urgent cases redirected: <span className="font-semibold text-foreground">36 patients</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Daily savings: <span className="font-semibold text-foreground">AED 25,200</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-routine rounded-full mt-2" />
                  <p className="text-lg font-bold text-routine">ROI achieved in 12 months</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">Quality Improvements</h3>
              <div className="space-y-3 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Standardized, evidence-based triage</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Reduced medical errors and bias</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Enhanced care continuity and documentation</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <p>Better chronic disease management</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
