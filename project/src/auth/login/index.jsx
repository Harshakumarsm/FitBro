import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { googleLogin, login } from "../../firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../contexts/authContexts";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userlogin } = useAuth();

  // Redirect if user is already logged in
  useEffect(() => {
    if (userlogin) {
      console.log("User is already logged in, redirecting to home");
      navigate("/home");
    }
  }, [userlogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      // Navigation will happen automatically through the useEffect above
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await googleLogin();
      // Navigation will happen automatically through the useEffect above
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-100 via-white to-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full border-t-4 border-[#E7473C]">
        <h2 className="text-4xl font-extrabold text-center text-[#E7473C] mb-8 tracking-wide">Welcome Back</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E7473C] focus:border-[#E7473C] transition"
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E7473C] focus:border-[#E7473C] transition"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#E7473C] hover:bg-red-600 text-white py-3 px-4 rounded-xl font-bold shadow-md hover:shadow-lg transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl flex items-center justify-center hover:bg-gray-100 transition duration-300 shadow-sm ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5 mr-3"
            />
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <Link to="/register" className="text-[#E7473C] hover:underline font-medium"> Sign up</Link>
        </p>
      </div>
    </div>
  );
}