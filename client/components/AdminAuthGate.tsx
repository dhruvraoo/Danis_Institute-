import React, { useState, useEffect } from "react";

const LOCALSTORAGE_KEY = "isAdminAuthed";
const ADMIN_USERNAME_KEY = "adminUsername";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem(LOCALSTORAGE_KEY) === "true");

  useEffect(() => {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    setAuthed(false);
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/accounts/api/admin-login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem(LOCALSTORAGE_KEY, "true");
        localStorage.setItem(ADMIN_USERNAME_KEY, data.username);
        setAuthed(true);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900 dark:text-blue-400">Admin Login</h2>
        
        <div className="mb-4">
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Username"
            disabled={loading}
            required
          />
        </div>
        
        <div className="mb-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Password"
            disabled={loading}
            required
          />
        </div>
        
        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}
        
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-50"
          disabled={loading || !username || !password}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Contact system administrator for credentials
        </div>
      </form>
    </div>
  );
} 