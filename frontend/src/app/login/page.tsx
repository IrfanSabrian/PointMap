/* eslint-disable @typescript-eslint/no-unused-vars */
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Reset error message

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        // Dispatch event untuk memberitahu komponen lain bahwa user login
        window.dispatchEvent(new Event("login-status-changed"));
        router.push("/dashboard");
      } else {
        // Tampilkan pesan error dari server atau pesan default
        setErrorMsg(
          data.error || data.message || "Username atau password salah"
        );
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("Terjadi kesalahan pada server. Silakan coba lagi.");
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
            <div className="relative mb-4">
              <input
                type="text"
                id="username"
                name="username"
                className="peer block w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                placeholder=" "
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label
                htmlFor="username"
                className="absolute left-4 top-2 text-gray-500 text-sm duration-200 transform -translate-y-1 scale-90 origin-[0] bg-white px-1 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:scale-90 peer-focus:text-primary"
              >
                Username
              </label>
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <i className="fas fa-user"></i>
              </span>
            </div>

            {/* Password Field */}
            <div className="relative mb-4">
              <input
                type={isVisible ? "text" : "password"}
                id="password"
                name="password"
                className="peer block w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white"
                placeholder=" "
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label
                htmlFor="password"
                className="absolute left-4 top-2 text-gray-500 text-sm duration-200 transform -translate-y-1 scale-90 origin-[0] bg-white px-1 pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:scale-90 peer-focus:text-primary"
              >
                Password
              </label>
              <span
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                onClick={() => setIsVisible(!isVisible)}
              >
                <i
                  className={`fas ${isVisible ? "fa-eye-slash" : "fa-eye"}`}
                ></i>
              </span>
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
