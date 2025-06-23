"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/dashboard");
      } else {
        setErrorMsg(data.error || "Login gagal. Username atau password salah.");
      }
    } catch (err) {
      setErrorMsg("Tidak dapat terhubung ke server.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-primary via-white to-toscaLight">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl px-8 py-10 border-t-4 border-primary relative">
        {/* LOGO/HEADER */}
        <div className="flex flex-col items-center mb-7">
          <div className="rounded-full bg-accent p-4 shadow-lg mb-2">
            <img src="/logo.svg" alt="Logo" className="w-16 h-16" />
          </div>
          <h1 className="text-2xl font-extrabold text-primary">Login Admin</h1>
          <span className="text-xs text-tosca font-bold mt-1">
            PointMap Polnep
          </span>
        </div>

        {/* ALERT ERROR */}
        {errorMsg && (
          <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-700 font-semibold px-4 py-2 rounded-xl mb-5 shadow">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="10" cy="10" r="9" stroke="#fb7185" />
              <path d="M10 6v4m0 4h.01" stroke="#fb7185" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* FORM LOGIN */}
        <form onSubmit={login} className="space-y-6">
          <div className="relative">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
              id="username"
              className="input peer"
              placeholder=" "
              autoFocus
            />
            <label htmlFor="username" className="input-label">
              Username
            </label>
          </div>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              id="password"
              className="input peer"
              placeholder=" "
            />
            <label htmlFor="password" className="input-label">
              Password
            </label>
          </div>
          <button
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-lg shadow bg-primary text-white hover:bg-dark transition flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
