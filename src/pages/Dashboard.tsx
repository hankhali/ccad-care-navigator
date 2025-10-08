import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import UserHome from "./UserHome";
import { Dashboard as DashboardComponent } from "@/components/Dashboard";
import AppLayout from "@/components/AppLayout";

function Overview() {
  return <DashboardComponent />;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  // Role bypass for static/demo mode: if localStorage.role === 'user' treat as signed-in user
  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    console.log("Dashboard mount, role=", role);
    if (role === "user") {
      const fake = { id: "user" } as unknown as User;
      console.log("Dashboard: setting fake user", fake);
      setUser(fake);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      else navigate("/auth");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) setUser(session.user);
      else navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    if (role === "user") {
      if (typeof window !== "undefined") localStorage.removeItem("role");
      navigate("/auth");
      return;
    }
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading dashboard...</div>
          <div className="text-sm text-muted-foreground">Checking session and permissions</div>
        </div>
      </div>
    );

  // If running in frontend-only user mode, render the user-facing UserHome
  if (role === "user") {
    return (
      <AppLayout userName={user.email ?? user.id} onSignOut={handleSignOut}>
        <UserHome />
      </AppLayout>
    );
  }

  return (
    <AppLayout userName={user.email ?? user.id} onSignOut={handleSignOut}>
      <Routes>
        <Route index element={<Overview />} />
      </Routes>
    </AppLayout>
  );
}
