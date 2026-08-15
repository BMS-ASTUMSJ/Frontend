import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "./../assets/ASTUMSJ-Pp.jpg";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // ======================================================
  // EMAIL / PASSWORD LOGIN
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );

      // Backend returns accessToken, not token
      const { accessToken, user } = response.data;

      if (!accessToken) {
        setError("Login succeeded but no access token was received.");
        return;
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Login successful");
      console.log("Access token saved:", !!accessToken);
      console.log("User:", user);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "mentor") {
        navigate("/mentor");
      } else if (user.role === "student") {
        navigate("/student");
      } else {
        setError("Your account role is not recognized.");
      }
    } catch (err) {
      console.error("Login error:", err);

      const message = err.response?.data?.message;

      if (err.response?.status === 401) {
        setError("Incorrect email or password.");
      } else if (err.response?.status === 403) {
        setError(message || "Your account is not approved.");
      } else {
        setError(message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // GOOGLE LOGIN
  // ======================================================

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        "http://localhost:5000/api/auth/google",
        {
          credential: credentialResponse.credential,
        },
      );

      // Backend should return accessToken
      const { accessToken, user } = response.data;

      if (!accessToken) {
        setError(
          "Google login succeeded but no access token was received.",
        );
        return;
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Google login successful");
      console.log("Access token saved:", !!accessToken);
      console.log("User:", user);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "mentor") {
        navigate("/mentor");
      } else if (user.role === "student") {
        navigate("/student");
      } else {
        setError("Your account role is not recognized.");
      }
    } catch (err) {
      console.error("Google login error:", err);

      const message = err.response?.data?.message;

      if (err.response?.status === 404) {
        setError(
          message ||
            "No account exists with this Google email. Please contact the administrator.",
        );
      } else if (err.response?.status === 403) {
        setError(message || "Your account is suspended.");
      } else {
        setError(message || "Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFD] px-4 py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-5xl overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-[#B3CFE5] md:grid-cols-2">

        {/* ======================================================
            LEFT SIDE
        ====================================================== */}

        <div className="hidden bg-[#0A1931] p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl bg-[#4A7FA7]">
              <span className="text-lg font-bold">
                <img
                  src={logo}
                  alt="ASTU MSJ Logo"
                  className="h-full w-full object-cover"
                />
              </span>
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#B3CFE5]">
              ASTU MSJ
            </p>

            <h1 className="text-4xl font-bold leading-tight">
              Welcome back to the bootcamp.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-[#B3CFE5]">
              Continue your learning journey, connect with mentors, work on
              projects, and keep growing your technical skills.
            </p>
          </div>

          <p className="text-sm text-[#7A7F85]">
            Learn. Build. Compete. Grow.
          </p>
        </div>

        {/* ======================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex items-center p-7 sm:p-10">
          <div className="w-full">

            {/* Header */}

            <div className="mb-8">
              <Link
                to="/"
                className="mb-6 inline-flex text-sm font-medium text-[#7A7F85] transition hover:text-[#1A3D63]"
              >
                ← Back to Home
              </Link>

              <h2 className="text-3xl font-bold text-[#0A1931]">
                Login
              </h2>

              <p className="mt-2 text-sm text-[#7A7F85]">
                Enter your account details to continue.
              </p>
            </div>

            {/* Error */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* ======================================================
                LOGIN FORM
            ====================================================== */}

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Email */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Email Address{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A7F85]" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-4 text-sm text-[#0A1931] outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>
              </div>

              {/* Password */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#0A1931]">
                    Password{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#4A7FA7] hover:text-[#1A3D63]"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A7F85]" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-12 text-sm text-[#0A1931] outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7F85] hover:text-[#1A3D63]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1A3D63] py-3.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              {/* Google Login */}

              <div className="flex w-full justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => {
                    setError(
                      "Google login failed. Please try again.",
                    );
                  }}
                  useOneTap={false}
                />
              </div>
            </form>

            {/* Register */}

            <p className="mt-7 text-center text-sm text-[#7A7F85]">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#1A3D63] hover:text-[#4A7FA7]"
              >
                Apply now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;