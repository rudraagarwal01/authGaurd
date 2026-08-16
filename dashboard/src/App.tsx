import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { DomainsTable } from "./components/DomainsTable";
import { ReportsChart } from "./components/ReportsChart";

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("ag_token"));
  const [guest, setGuest] = useState(false);

  const handleLogin = () => setToken(localStorage.getItem("ag_token"));

  const handleLogout = () => {
    localStorage.removeItem("ag_token");
    setToken(null);
    setGuest(false);
  };

  const isAdmin = !!token;

  if (!token && !guest) {
    return <LoginPage onLogin={handleLogin} onGuest={() => setGuest(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-red-600 font-bold text-xl">🛡 AuthGuard</span>
          <span className="text-gray-400 text-sm font-medium">
            {isAdmin ? "Admin Dashboard" : "Dashboard"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {!isAdmin && (
            <button
              onClick={() => { setGuest(false); }}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Admin login →
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <ReportsChart />
        <DomainsTable isAdmin={isAdmin} />
      </main>
    </div>
  );
}
