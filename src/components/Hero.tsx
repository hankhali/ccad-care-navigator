import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Clock, Shield, Smartphone } from "lucide-react";

export const Hero = () => {
  const scrollToDemo = () => {
    document.getElementById("symptom-checker")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-90" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      {/* Floating medical icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Activity className="absolute top-20 left-10 w-12 h-12 text-primary-light/20 animate-pulse-slow" />
        <Shield className="absolute bottom-40 right-20 w-16 h-16 text-primary-light/20 animate-pulse-slow" style={{ animationDelay: "1s" }} />
        <Clock className="absolute top-40 right-40 w-10 h-10 text-primary-light/20 animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Logo badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-md">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm font-medium text-primary">Cleveland Clinic Abu Dhabi</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
            Smart AI Triage &
            <br />
            <span className="bg-gradient-to-r from-primary-foreground to-primary-light bg-clip-text text-transparent">
              Navigation System
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            Get the right care, at the right place, at the right time. AI-powered guidance for your health decisions.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">30-40%</div>
              <div className="text-sm text-primary-foreground/80">ER Volume Reduction</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">50%</div>
              <div className="text-sm text-primary-foreground/80">Faster Wait Times</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary-foreground">95%</div>
              <div className="text-sm text-primary-foreground/80">Patient Satisfaction</div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button
              size="lg"
              variant="hero"
              onClick={scrollToDemo}
              className="text-lg px-8 py-6 h-auto"
            >
              Try Symptom Checker
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 h-auto bg-card/80 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-card hover:text-foreground"
            >
              <Smartphone className="w-5 h-5" />
              View Mobile App
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-12 text-sm text-primary-foreground/70">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              HIPAA Compliant
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              95% Accuracy
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              24/7 Available
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-primary-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};
