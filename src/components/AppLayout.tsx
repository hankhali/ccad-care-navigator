import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Activity, Zap, Star, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWidget from "@/components/ChatWidget";

interface AppLayoutProps {
  children: ReactNode;
  userName?: string;
  onSignOut?: () => void;
}

export const AppLayout = ({ children, userName, onSignOut }: AppLayoutProps) => {
  // Role detection (static mode)
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  if (typeof window !== 'undefined') {
    // forward chat requests to open triage UI
    window.removeEventListener('chat:start-triage', () => {})
    window.addEventListener('chat:start-triage', () => {
      try { window.dispatchEvent(new CustomEvent('open:triage')) } catch {}
    })
  }
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-72 hidden md:flex flex-col border-r border-primary/10 bg-card/70 backdrop-blur-sm p-4">
        <div className="mb-6 flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <div>
            <div className="text-sm font-semibold">Cleveland Clinic</div>
            <div className="text-xs text-muted-foreground">AI Triage</div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {/* Symptom Checker removed for demo users */}
          {role !== 'user' && (
            <NavLink to="/specs" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-card/50'}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Specifications
            </NavLink>
          )}
          {role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-card/50'}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15 8H9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Admin Console
            </NavLink>
          )}
        </nav>

          <div className="mt-6">
          <div className="text-xs text-muted-foreground mb-2">Signed in as</div>
          <div className="text-sm font-medium mb-3">{userName ?? 'User'}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (typeof window !== "undefined") localStorage.removeItem("role");
              onSignOut?.();
            }}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-sm border-b border-primary/10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 rounded-md bg-card/50">☰</button>
              <div className="text-lg font-semibold">Cleveland Clinic AI Triage</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground hidden sm:block">{userName}</div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
};

export default AppLayout;
