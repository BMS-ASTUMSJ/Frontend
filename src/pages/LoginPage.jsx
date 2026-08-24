import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import logo from "./../assets/ASTUMSJ-Pp.jpg";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // FILL DEMO ACCOUNT
  // ============================================================
  const fillDemoAccount = (role) => {
    const demoAccounts = {
      admin: {
        email: "admin@bms.com",
        password: "Admin@123",
      },

      mentor: {
        email: "demo.mentor@astu-msj.com",
        password: "YOUR_MENTOR_DEMO_PASSWORD",
      },

      student: {
        email: "demomentor8@gmail.com",
        password: "studentMentor@123",
      },
    };

    setFormData(demoAccounts[role]);

    // Make sure the password is visible after selecting a demo account
    setShowPassword(true);
  };

  // ============================================================
  // REDIRECT USER
  // ============================================================
  const redirectUser = (user) => {
    if (
      (user.role === "student" || user.role === "mentor") &&
      user.mustChangePassword === true
    ) {
      navigate("/change-password");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "mentor") {
      navigate("/mentor");
    } else if (user.role === "student") {
      navigate("/student");
    } else {
      toast.error("Your account role is not recognized.");
    }
  };

  // ============================================================
  // LOGIN SUCCESS
  // ============================================================
  const handleLoginSuccess = (accessToken, user) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Login successful:", user);

    toast.success("Login successful! Welcome back.");

    redirectUser(user);
  };

  // ============================================================
  // NORMAL LOGIN
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { accessToken, user } = response.data;

      if (!accessToken || !user) {
        toast.error(
          "Login succeeded but account information was not received.",
        );
        return;
      }

      handleLoginSuccess(accessToken, user);
    } catch (err) {
      console.error("Login error:", err);

      const message = err.response?.data?.message;

      if (err.response?.status === 401) {
        toast.error("Incorrect email or password.");
      } else if (err.response?.status === 403) {
        toast.error(message || "Your account is suspended or not approved.");
      } else if (!err.response) {
        toast.error(
          "Cannot connect to the server. Make sure the backend is running.",
        );
      } else {
        toast.error(message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true);

      if (!credentialResponse?.credential) {
        toast.error("Google credential was not received.");
        return;
      }

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      const { accessToken, user } = response.data;

      if (!accessToken || !user) {
        toast.error("Google login failed to retrieve account information.");
        return;
      }

      handleLoginSuccess(accessToken, user);
    } catch (err) {
      console.error("Google login error:", err);

      const message = err.response?.data?.message;

      if (err.response?.status === 404) {
        toast.error(message || "No account exists with this Google email.");
      } else if (err.response?.status === 403) {
        toast.error(message || "Your account is suspended.");
      } else if (!err.response) {
        toast.error(
          "Cannot connect to the server. Make sure the backend is running.",
        );
      } else {
        toast.error(message || "Google login failed. Please try again.");
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
            <div className="mb-8 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white p-1">
              <img
                src={logo}
                alt="ASTU MSJ Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#B3CFE5]">
              ASTU MSJ
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white">
              Welcome back to the bootcamp.
            </h1>

            <p className="mt-5 max-w-sm leading-7 text-[#B3CFE5]">
              Continue your learning journey, connect with mentors, and keep
              growing your technical skills.
            </p>
          </div>

          <p className="text-sm text-[#7A7F85]">Learn. Build. Compete. Grow.</p>
        </div>

        {/* ======================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="flex items-center p-7 sm:p-10">
          <div className="w-full">
            {/* HEADER */}
            <div className="mb-8">
              <Link
                to="/"
                className="mb-6 inline-flex text-sm font-medium text-[#7A7F85] transition hover:text-[#1A3D63]"
              >
                ← Back to Home
              </Link>

              <h2 className="text-3xl font-bold text-[#0A1931]">Login</h2>

              <p className="mt-2 text-sm text-[#7A7F85]">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ==================================================
                  EMAIL
              ================================================== */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Email Address <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A7F85]" />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-4 text-sm text-[#0A1931] outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>
              </div>

              {/* ==================================================
                  PASSWORD
              ================================================== */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-semibold text-[#0A1931]">
                    Password <span className="text-red-500">*</span>
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
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-12 text-sm text-[#0A1931] outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
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

              {/* ==================================================
                  LOGIN BUTTON
              ================================================== */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A3D63] py-3.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}

                {loading ? "Signing in..." : "Login"}
              </button>

              {/* ==================================================
                  DEMO ACCOUNTS
              ================================================== */}
              <div className="rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-[#0A1931]">
                    Demo Accounts
                  </p>

                  <p className="mt-1 text-xs text-[#7A7F85]">
                    Select a role to automatically fill the login details.
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {/* ADMIN */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("admin")}
                    disabled={loading}
                    className="rounded-xl border border-[#B3CFE5] bg-white px-2 py-2.5 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#EAF3F9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Admin Demo
                  </button>

                  {/* MENTOR */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("mentor")}
                    disabled={loading}
                    className="rounded-xl border border-[#B3CFE5] bg-white px-2 py-2.5 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#EAF3F9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Mentor Demo
                  </button>

                  {/* STUDENT */}
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("student")}
                    disabled={loading}
                    className="rounded-xl border border-[#B3CFE5] bg-white px-2 py-2.5 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#EAF3F9] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Student Demo
                  </button>
                </div>
              </div>

              {/* ==================================================
                  GOOGLE DIVIDER
              ================================================== */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* ==================================================
                  GOOGLE LOGIN
              ================================================== */}
              <div className="flex w-full justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() =>
                    toast.error("Google login failed. Please try again.")
                  }
                  useOneTap={false}
                />
              </div>
            </form>

            {/* REGISTER */}
            <p className="mt-8 text-center text-sm text-[#7A7F85]">
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
