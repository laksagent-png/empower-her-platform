import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, AlertCircle, ShieldCheck, UserPlus } from "lucide-react";

const AdminLogin = () => {
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    let ok = false;
    if (isRegistering) {
      ok = await register(email, password);
      if (!ok) setError("Failed to create account. Email might be in use or password too weak.");
    } else {
      ok = await login(email, password);
      if (!ok) setError("Invalid email or password");
    }
    
    setLoading(false);
    if (ok) {
      navigate("/admin/dashboard", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane - Branding/Image */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 text-primary-foreground relative overflow-hidden">
        <div className="relative z-10">
          <a href="/" className="font-heading text-4xl font-bold tracking-tight">
            Aagaj
          </a>
          <p className="mt-4 text-lg text-primary-foreground/80 max-w-md">
            Empowering women through skill development, financial literacy, and community workshops across India.
          </p>
        </div>
        
        <div className="relative z-10">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium">
              "When you empower a woman, you empower a generation."
            </p>
            <footer className="text-sm text-primary-foreground/70">Aagaj Foundation</footer>
          </blockquote>
        </div>

        {/* Decorative background elements */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-secondary/20 blur-3xl"></div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck size={28} />
              </div>
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
              {isRegistering ? "Create Admin Account" : "Admin Portal"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isRegistering 
                ? "Set up a new administrator account for the platform." 
                : "Sign in to manage events, registrations, and platform content."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {error && (
              <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-4 text-sm font-medium">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aagaj.org"
                  required
                  autoFocus
                  className="h-12 px-4 bg-muted/50 border-muted-foreground/20 focus:bg-background"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 px-4 bg-muted/50 border-muted-foreground/20 focus:bg-background"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold shadow-md transition-all hover:shadow-lg"
              >
                {loading ? (
                  isRegistering ? "Creating account..." : "Signing in..."
                ) : (
                  <>
                    {isRegistering ? <UserPlus size={18} className="mr-2" /> : <LogIn size={18} className="mr-2" />} 
                    {isRegistering ? "Create Admin Account" : "Sign In to Dashboard"}
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-muted-foreground"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? "Already have an account? Sign in" : "Need an admin account? Create one"}
              </Button>
            </div>
          </form>
          
          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>Secure access restricted to authorized personnel only.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
