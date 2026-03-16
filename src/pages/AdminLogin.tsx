import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, AlertCircle } from "lucide-react";

const AdminLogin = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/admin/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/admin/dashboard", { replace: true });
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="font-heading text-3xl font-bold text-primary">
            Aagaj
          </a>
          <p className="text-muted-foreground mt-2">Admin Portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl shadow-card p-8 space-y-5"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground text-center">
            Sign In
          </h1>

          {error && (
            <div className="flex items-center gap-2 text-destructive bg-destructive/10 rounded-lg p-3 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aagaj.org"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gradient-warm text-primary-foreground min-h-[48px] text-base font-semibold"
          >
            {loading ? (
              "Signing in…"
            ) : (
              <>
                <LogIn size={18} /> Sign In
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Mock credentials: admin@aagaj.org / aagaj2026
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
