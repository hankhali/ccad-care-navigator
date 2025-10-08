import { Hero } from "@/components/Hero";
import { SymptomChecker } from "@/components/SymptomChecker";
import { Features } from "@/components/Features";
import { Impact } from "@/components/Impact";
import { Dashboard } from "@/components/Dashboard";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <SymptomChecker />
      <Features />
      <Impact />
      <Dashboard />
    </main>
  );
};

export default Index;
