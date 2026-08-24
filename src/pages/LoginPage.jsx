import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Mail, Lock, Loader2 } from "lucide-react";
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fillDemoAccount = (role) => {
    const demoAccounts = {
      admin: {
        email: "admin@bms.com",
        password: "Admin@123",
      },

      mentor: {
        email: "demomentor8@gmail.com",
        password: "studentMentor@123",
      },

      student: {
        email: "demoastumsj@gmail.com",
        password: "studentDemo@123",
      },
    };

    setFormData(demoAccounts[role]);
    setShowPassword(true);
  };

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

  const handleLoginSuccess = (accessToken, user) => {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Login successful:", user);

    toast.success("Login successful! Welcome back.");

    redirectUser(user);
  };

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
    <div className="relative flex min-h-screen items-center bg- justify-center overflow-x-hidden bg-cover bg-center bg-no-repeat px-3 py-6 sm:px-6 md:px-8 lg:py-8">
      {/* DARK BACKGROUND OVERLAY */}
      <div className="absolute inset-0 bg-[#0f2b34] backdrop-blur-[2px]" />

      <main className="relative z-10 my-auto flex h-auto min-h-150 w-full max-w-300 flex-col justify-center overflow-hidden rounded-[20px] bg-[#f8f9fa] shadow-[0_25px_80px_rgba(0,0,0,0.55)] sm:rounded-[28px] md:flex-row lg:h-[840px]">
        <svg
          className="absolute inset-y-0 left-0 z-0 hidden h-full w-[62%] md:block"
          viewBox="0 0 700 900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="darkPanelGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1b3c47" />
              <stop offset="50%" stopColor="#0f2b34" />
              <stop offset="100%" stopColor="#071b23" />
            </linearGradient>

            <radialGradient id="darkGlow" cx="15%" cy="8%" r="105%">
              <stop offset="0%" stopColor="#48636c" stopOpacity="0.38" />
              <stop offset="55%" stopColor="#1a3b45" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#071b23" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="
              M 0 0
              H 520
              C 620 120, 660 250, 660 390
              C 660 580, 560 760, 260 900
              H 0
              Z
            "
            fill="url(#darkPanelGradient)"
          />

          <path
            d="
              M 0 0
              H 520
              C 620 120, 660 250, 660 390
              C 660 580, 560 760, 260 900
              H 0
              Z
            "
            fill="url(#darkGlow)"
          />
        </svg>

        <div className="absolute inset-0 bg-[#f8f9fa] md:hidden" />

        <div className="absolute -right-10 -top-10 z-5 hidden h-55 w-55 rounded-full bg-[radial-gradient(circle_at_34%_28%,#d8f1f4_0%,#aacfd6_25%,#7698a1_48%,#4d6b74_70%,#2b454e_100%)] shadow-[inset_-18px_-18px_35px_rgba(0,0,0,0.18)] md:block" />

        <div className="absolute -bottom-15 -right-10 z-5 hidden h-45 w-45 rounded-full bg-[radial-gradient(circle_at_30%_25%,#d8f1f4_0%,#a8ced6_30%,#7699a2_56%,#4d6b74_78%,#29434c_100%)] shadow-[inset_-15px_-15px_30px_rgba(0,0,0,0.15)] md:block" />

        <div className="absolute -bottom-30 -left-22.5 z-10 hidden h-90 w-90 rounded-full bg-[radial-gradient(circle_at_34%_24%,#daf3f6_0%,#b0d3da_27%,#7b9fa8_51%,#526f78_75%,#2c474f_100%)] shadow-[20px_20px_55px_rgba(0,0,0,0.3)] md:block" />

        <div className="absolute bottom-27.5 left-[31%] z-30 hidden h-52.5 w-52.5 rounded-full bg-[radial-gradient(circle_at_32%_22%,#d9f2f6_0%,#aecfd7_27%,#789aa4_52%,#506d76_75%,#2b454e_100%)] shadow-[18px_25px_45px_rgba(0,0,0,0.32)] md:block" />

        <section className="absolute left-0 top-0 z-20 hidden h-full w-[48%] flex-col justify-between px-16 py-14 text-white md:flex">
          <div>
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={logo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="mb-2 text-[15px] font-bold uppercase tracking-[0.2em] text-[#9fc4cf]">
              ASTU MSJ
            </p>

            <h1 className="max-w-105 text-[44px] font-extrabold leading-[1.18] tracking-tight text-white">
              Welcome back to
              <br />
              the bootcamp.
            </h1>

            <p className="mt-6 max-w-105 text-[15px] leading-[1.6] text-[#cbe0e5]">
              Continue your learning journey, connect with mentors,
              <br />
              and keep growing your technical skills.
            </p>
          </div>
        </section>

        <section className="relative z-40 mx-auto flex h-full w-full max-w-110 flex-col justify-center px-5 py-8 sm:px-8 md:absolute md:right-8 md:mx-0 md:w-auto md:py-10 lg:right-16 sm:right-12">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex text-[14px] font-semibold text-[#00a6c0] transition hover:text-[#0b596b]"
            >
              ← Back to Home
            </Link>

            <h2 className="mt-3 text-[32px] font-bold tracking-tight text-[#1c2d33] sm:text-[42px]">
              Login
            </h2>

            <p className="mt-1 text-[14px] text-[#63757d]">
              Enter your account details to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7d959e]" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className="h-13 w-full rounded-xl border border-[#d1dcde] bg-white pl-12 pr-4 text-[15px] font-medium text-[#1c2d33] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#0f768e]/15"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7d959e]" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-13 w-full rounded-xl border border-[#d1dcde] bg-white pl-12 pr-16 text-[15px] font-medium text-[#1c2d33] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#0f768e]/15"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-bold tracking-wider text-[#354850] uppercase transition hover:text-[#0f768e]"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>

            <div className="flex items-center justify-between px-0.5 text-[13px] sm:text-[14px]">
              <label className="flex cursor-pointer items-center gap-2 text-[#51646c]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#bdcbce] text-[#0f768e] focus:ring-[#0f768e]"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-[#00a6c0] transition hover:text-[#0b596b] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#00a6c0] text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(10,122,147,0.25)] transition hover:bg-[#076277] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}
              {loading ? "Signing in..." : "Login"}
            </button>

            <div className="rounded-[14px] border border-[#d1e0e4] bg-[#f0f5f7] p-3.5 sm:p-4 text-center">
              <p className="text-[14px] sm:text-[15px] font-bold text-[#22353c]">
                Demo Accounts
              </p>

              <p className="mt-0.5 text-[12px] sm:text-[13px] text-[#63757d]">
                Select a role to automatically fill the login details.
              </p>

              <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2.5">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin")}
                  disabled={loading}
                  className="rounded-[10px] border border-[#89bdcb] bg-white py-2 text-[11px] sm:text-[12px] font-bold text-[#2a3e46] transition hover:bg-[#e8f4f7] hover:text-[#0f768e] disabled:opacity-50"
                >
                  Admin Demo
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("mentor")}
                  disabled={loading}
                  className="rounded-[10px] border border-[#89bdcb] bg-white py-2 text-[11px] sm:text-[12px] font-bold text-[#2a3e46] transition hover:bg-[#e8f4f7] hover:text-[#0f768e] disabled:opacity-50"
                >
                  Mentor Demo
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount("student")}
                  disabled={loading}
                  className="rounded-[10px] border border-[#89bdcb] bg-white py-2 text-[11px] sm:text-[12px] font-bold text-[#2a3e46] transition hover:bg-[#e8f4f7] hover:text-[#0f768e] disabled:opacity-50"
                >
                  Student Demo
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-[#d5e0e3]" />
              <span className="text-[14px] text-[#71828a]">Or</span>
              <div className="h-px flex-1 bg-[#d5e0e3]" />
            </div>

            <div className="flex min-h-13 w-full items-center justify-center overflow-hidden rounded-xl border border-[#bdcbce] bg-white">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() =>
                  toast.error("Google login failed. Please try again.")
                }
                useOneTap={false}
                width="380"
              />
            </div>
          </form>

          <p className="mt-5 text-center text-[14px] sm:text-[15px] text-[#63757d]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-bold text-[#00a6c0] transition hover:text-[#0b596b] hover:underline"
            >
              Apply now
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
