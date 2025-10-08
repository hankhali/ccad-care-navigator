import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userMode, setUserMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Static/local signup: no validation — store role=user and navigate to dashboard
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Accept any input and treat as a normal user account for demo/static mode
    if (typeof window !== "undefined") localStorage.setItem("role", "user");
    setLoading(false);
    navigate("/dashboard");
  };

  // Static/local signin: accept any credentials and navigate based on selectedRole
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // If no role was selected, default to user and enable userMode so UAE Pass appears
    let role = selectedRole === "admin" ? "admin" : "user";
    if (!selectedRole) {
      role = "user";
      setSelectedRole("user");
      setUserMode(true);
    }
    if (typeof window !== "undefined") localStorage.setItem("role", role);
    setLoading(false);
    if (role === "admin") navigate("/admin");
    else navigate("/dashboard");
  };

  // UAE Pass should only be used for user accounts. For static mode, accept and continue.
  const handleUAEPass = () => {
    if (typeof window !== "undefined") localStorage.setItem("role", "user");
    toast({
      title: "UAE Pass",
      description: "Signed in as user via UAE Pass (static mode)"
    });
    navigate("/dashboard");
  };

  // Quick role sign-in handlers (static/frontend-only)
  const signInAsAdmin = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (typeof window !== "undefined") localStorage.setItem("role", "admin");
    setSelectedRole("admin");
    setUserMode(false);
    console.log("Auth: signInAsAdmin clicked, role set to admin");
    toast({ title: "Signed in", description: "Signed in as admin (static)" });
    navigate("/admin");
  };

  const signInAsUser = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (typeof window !== "undefined") localStorage.setItem("role", "user");
    setSelectedRole("user");
    // Ensure userMode is false so we navigate immediately without showing UAE Pass or forcing the form
    setUserMode(false);
    console.log("Auth: signInAsUser clicked, role set to user");
    toast({ title: "Signed in", description: "Signed in as user (static)" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-primary/20 shadow-md mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Cleveland Clinic Abu Dhabi</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Smart AI Triage System</h1>
          <p className="text-muted-foreground">Access your personalized healthcare navigation</p>
        </div>

        <Card className="border-primary/10 shadow-elegant">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {userMode && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleUAEPass}>
                  <Shield className="mr-2 h-4 w-4" />
                  UAE Pass (Users only)
                </Button>
              </>
            )}
          </CardContent>
        </Card>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={signInAsAdmin}
              aria-pressed={selectedRole === "admin"}
              className={`flex-1 rounded px-4 py-2 ${selectedRole === "admin" ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
              Sign in as Admin
            </button>
            <button
              type="button"
              onClick={signInAsUser}
              aria-pressed={selectedRole === "user"}
              className={`flex-1 rounded px-4 py-2 ${selectedRole === "user" ? 'bg-primary text-white' : 'border bg-card hover:bg-card/50'}`}>
              Sign in as User
            </button>
          </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          By continuing, you agree to Cleveland Clinic's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
