"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiLock } from "react-icons/fi";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [focus, setFocus] = useState({ user: false, pass: false });

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
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-tr from-background via-surface to-accent relative overflow-hidden dark:from-background-dark dark:via-surface-dark dark:to-accent-dark transition-colors">
      {/* Kiri: Form Login */}
      <div className="flex-1 flex items-center justify-center min-h-screen px-4 md:px-0">
        <div className="w-full max-w-md bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-accent/40 dark:border-accent-dark/40 px-8 py-12 animate-bounceIn transition-colors">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={80}
              height={80}
              className="w-20 h-20 mb-2 drop-shadow-xl"
              priority
            />
            <h2 className="text-3xl font-heading font-semibold text-primary dark:text-primary-dark mb-1 tracking-wide">
              Login Admin
            </h2>
            <span className="text-xs text-accent dark:text-accent-dark font-bold tracking-widest">
              PointMap
            </span>
          </div>

          {/* ALERT ERROR */}
          {errorMsg && (
            <div className="flex items-center gap-2 bg-error/10 border border-error/30 text-error font-semibold px-4 py-2 rounded-xl mb-5 shadow w-full animate-bounceIn dark:bg-error-dark/10 dark:border-error-dark/30 dark:text-error-dark transition-colors">
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
          <form onSubmit={login} className="space-y-7 w-full mt-2">
            {/* Username */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent dark:text-accent-dark">
                <FiUser className="w-5 h-5" />
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                required
                id="username"
                className={`block w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-surface/90 dark:bg-surface-dark/90 border-accent/30 dark:border-accent-dark/30 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:border-primary-dark dark:focus:ring-primary-dark/30 outline-none transition-all duration-200 text-base shadow peer text-muted dark:text-muted-dark placeholder:text-accent/60 dark:placeholder:text-accent-dark/60 ${
                  focus.user || username
                    ? "ring-2 ring-primary border-primary dark:ring-primary-dark dark:border-primary-dark"
                    : ""
                }`}
                onFocus={() => setFocus((f) => ({ ...f, user: true }))}
                onBlur={() => setFocus((f) => ({ ...f, user: false }))}
                autoComplete="username"
                placeholder="Username"
              />
            </div>
            {/* Password */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent dark:text-accent-dark">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                id="password"
                className={`block w-full pl-10 pr-4 py-3 rounded-lg border-2 bg-surface/90 dark:bg-surface-dark/90 border-accent/30 dark:border-accent-dark/30 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:focus:border-primary-dark dark:focus:ring-primary-dark/30 outline-none transition-all duration-200 text-base shadow peer text-muted dark:text-muted-dark placeholder:text-accent/60 dark:placeholder:text-accent-dark/60 ${
                  focus.pass || password
                    ? "ring-2 ring-primary border-primary dark:ring-primary-dark dark:border-primary-dark"
                    : ""
                }`}
                onFocus={() => setFocus((f) => ({ ...f, pass: true }))}
                onBlur={() => setFocus((f) => ({ ...f, pass: false }))}
                autoComplete="current-password"
                placeholder="Password"
              />
            </div>
            <button
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-lg shadow bg-primary text-white hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary/80 transition-all duration-200 flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-accent-dark"
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
          <div className="mt-8 text-center text-sm text-muted dark:text-muted-dark">
            <Link
              href="/"
              className="hover:underline text-primary dark:text-primary-dark font-semibold"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
      {/* Kanan: Branding/Ilustrasi */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center min-h-screen bg-gradient-to-br from-background/10 via-accent/30 to-surface/0 dark:from-background-dark/10 dark:via-accent-dark/30 dark:to-surface-dark/0 animate-slideInLeft transition-colors">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={192}
          height={192}
          className="w-48 h-48 mb-8 drop-shadow-2xl opacity-90 animate-bounceIn"
          priority
        />
        <h1 className="text-5xl font-heading font-semibold text-primary dark:text-primary-dark drop-shadow-lg mb-2 tracking-wide animate-slideInLeft opacity-90">
          PointMap
        </h1>
        <p className="text-lg text-primary/80 dark:text-primary-dark/80 font-heading font-medium mb-4 animate-slideInLeft opacity-80">
          Polnep Interactive Map
        </p>
        <p className="max-w-md text-muted dark:text-muted-dark text-base text-center animate-slideInLeft opacity-70">
          Platform peta digital interaktif untuk menjelajahi kampus Politeknik
          Negeri Pontianak.
        </p>
      </div>
    </div>
  );
}
