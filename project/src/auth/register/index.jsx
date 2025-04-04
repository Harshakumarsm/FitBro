import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useAuth } from "../../contexts/authContexts";

export default function RegisterPage() {
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

  const validations = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      // Navigation will happen automatically through the useEffect above
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-100 via-white to-gray-100 flex items-center justify-center min-h-screen p-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-md w-full border-t-4 border-[#E7473C]">
        <h2 className="text-4xl font-extrabold text-center text-[#E7473C] mb-8 tracking-wide">Create Account</h2>

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

            <ul className="text-sm mt-2 space-y-1 text-gray-700">
              <li className={validations.length ? "text-green-600" : "text-gray-500"}>✔ At least 8 characters</li>
              <li className={validations.upper ? "text-green-600" : "text-gray-500"}>✔ One uppercase letter</li>
              <li className={validations.lower ? "text-green-600" : "text-gray-500"}>✔ One lowercase letter</li>
              <li className={validations.number ? "text-green-600" : "text-gray-500"}>✔ One number</li>
              <li className={validations.special ? "text-green-600" : "text-gray-500"}>✔ One special character</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={!allValid || loading}
            className={`w-full py-3 px-4 rounded-xl font-bold shadow-md transition duration-300 text-white ${
              allValid && !loading ? "bg-[#E7473C] hover:bg-red-600" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <Link to="/" className="text-[#E7473C] hover:underline font-medium"> Login</Link>
        </p>
      </div>
    </div>
  );
}