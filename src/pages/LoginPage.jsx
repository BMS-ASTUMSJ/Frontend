import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔗 CONNECTED TO BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user info (optional)
      localStorage.setItem("user", JSON.stringify(res.data.user));

      console.log("Login successful:", res.data);

      // Redirect after login
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[85vh] items-center justify-center bg-[#F5F0E8] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#2B362E]/10 bg-[#BFC4A3]/30 p-8 shadow-lg backdrop-blur-sm">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-[#2B362E]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[#2B362E]/80">
            Please enter your details to log in
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#2B362E]">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="mt-1.5 w-full rounded-xl border border-[#2B362E]/20 bg-[#F5F0E8] px-4 py-3 text-[#2B362E] placeholder-[#2B362E]/40 outline-none transition focus:border-[#2B362E] focus:ring-1 focus:ring-[#2B362E]"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-[#2B362E]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-[#6B8063] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-[#2B362E]/20 bg-[#F5F0E8] px-4 py-3 text-[#2B362E] placeholder-[#2B362E]/40 outline-none transition focus:border-[#2B362E] focus:ring-1 focus:ring-[#2B362E]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2B362E] py-3.5 font-semibold text-[#F5F0E8] shadow-md transition-all hover:bg-[#6B8063] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
        {/* Register Link */}
        <p className="mt-6 text-center text-sm font-medium text-[#2B362E]/80">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-[#2B362E] hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}

export default LoginPage;
