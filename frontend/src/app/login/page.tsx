"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setErrorMsg(data.error || "Login gagal");
      }
    } catch (error) {
      setErrorMsg("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/maps.svg"
          alt="Interactive Map Background"
          fill
          className="object-cover opacity-10"
          priority
        />
        {/* Multiple Gradient Layers - Enhanced */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-purple-600/35 to-fuchsia-600/40"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/30 via-blue-500/25 to-indigo-500/30"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-cyan-500/20"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-pink-500/15 via-rose-500/10 to-red-500/15"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-violet-400/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-400/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/25 rounded-full blur-3xl animate-pulse"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-sm z-10">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 p-8 min-h-[520px] flex flex-col justify-center">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.svg"
                alt="PointMap Logo"
                width={120}
                height={46}
                className="drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 drop-shadow-lg">
              Login
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-6 flex-1 flex flex-col justify-center"
          >
            {/* Username Field */}
            <div className="relative">
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                className={`block w-full bg-white/10 backdrop-blur-sm border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-transparent transition-all duration-200 pb-2 pr-12 rounded-t-lg px-3 py-2 ${
                  focusedField === "username" || username
                    ? "border-blue-600 dark:border-blue-400"
                    : "border-gray-400 dark:border-gray-500"
                }`}
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
              />
              <label
                htmlFor="username"
                className={`absolute left-3 top-2 text-gray-600 dark:text-gray-300 pointer-events-none transition-all duration-200 ${
                  focusedField === "username" || username
                    ? "text-xs -top-3.5 text-blue-600 dark:text-blue-400"
                    : "text-base top-2"
                }`}
              >
                Username
              </label>
              <span className="absolute right-4 top-2 text-gray-500 dark:text-gray-400 text-lg">
                <i className="fas fa-user"></i>
              </span>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                id="password"
                type={isVisible ? "text" : "password"}
                required
                autoComplete="current-password"
                className={`block w-full bg-white/10 backdrop-blur-sm border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-transparent transition-all duration-200 pb-2 pr-16 rounded-t-lg px-3 py-2 ${
                  focusedField === "password" || password
                    ? "border-blue-600 dark:border-blue-400"
                    : "border-gray-400 dark:border-gray-500"
                }`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
              />
              <label
                htmlFor="password"
                className={`absolute left-3 top-2 text-gray-600 dark:text-gray-300 pointer-events-none transition-all duration-200 ${
                  focusedField === "password" || password
                    ? "text-xs -top-3.5 text-blue-600 dark:text-blue-400"
                    : "text-base top-2"
                }`}
              >
                Password
              </label>
              <span
                className="absolute right-10 top-2 text-gray-500 dark:text-gray-400 text-lg cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                onClick={() => setIsVisible(!isVisible)}
              >
                <i
                  className={`fas ${isVisible ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </span>
              <span className="absolute right-4 top-2 text-gray-500 dark:text-gray-400 text-lg">
                <i className="fas fa-lock"></i>
              </span>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl text-sm animate-fadeInUp mb-4">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Login...
                </div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Tombol Kembali */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 group"
            >
              <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform duration-200"></i>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
