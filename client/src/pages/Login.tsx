
import { useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [, setLocation] = useLocation();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          setLocation("/upload");
        } else {
          setMessage(
            "Account created. Please check your email and confirm your account before logging in."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setLocation("/upload");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            ATS Resume Analyzer
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {isSignup
              ? "Create your account to get started."
              : "Sign in to access your resume analysis."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setIsSignup(false);
              setError("");
              setMessage("");
            }}
            className={`rounded-md py-2 text-sm font-medium ${
              !isSignup
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSignup(true);
              setError("");
              setMessage("");
            }}
            className={`rounded-md py-2 text-sm font-medium ${
              isSignup
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create account"
                : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          {isSignup ? "Already have an account?" : "New to ATS Analyzer?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setMessage("");
            }}
            className="font-semibold text-blue-600 hover:underline"
          >
            {isSignup ? "Login" : "Create account"}
          </button>
        </p>
      </div>
    </main>
  );
}
