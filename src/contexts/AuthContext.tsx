import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock credentials — replace with real auth when backend is ready
const MOCK_ADMIN = { email: "admin@aagaj.org", password: "aagaj2026" };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("aagaj_admin") === "true"
  );

  const login = useCallback(async (email: string, password: string) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
      sessionStorage.setItem("aagaj_admin", "true");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("aagaj_admin");
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
