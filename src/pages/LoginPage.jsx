import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Code2,
  Users,
} from "lucide-react";

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
  // HANDLE INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // REDIRECT USER
  // ============================================================

  const redirectUser = (user) => {
    if (!user) {
      toast.error("User information was not received.");
      return;
    }

    const role = String(user.role || "").toLowerCase();

    // Students and mentors who must change their password
    if (
      (role === "student" || role === "mentor") &&
      user.mustChangePassword === true
    ) {
      navigate("/change-password");
      return;
    }

    // Admin
    if (role === "admin") {
      navigate("/admin");
      return;
    }

    // Mentor
    if (role === "mentor") {
      navigate("/mentor");
      return;
    }

    // Student
    if (role === "student") {
      navigate("/student");
      return;
    }

    toast.error("Your account role is not recognized.");
  };

  // ============================================================
  // SAVE LOGIN INFORMATION
  // ============================================================

  const handleLoginSuccess = (accessToken, user) => {
    if (!accessToken) {
      toast.error("Login succeeded but no access token was received.");
      return;
    }

    if (!user) {
      toast.error("Login succeeded but user information was not received.");
      return;
    }

    // Clear old authentication data first
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Save new authentication data
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Login successful:", user);

    toast.success("Login successful! Welcome back.");

    redirectUser(user);
  };

  // ============================================================
  // GET BACKEND ERROR MESSAGE
  // ============================================================

  const getErrorMessage = (err, defaultMessage) => {
    const data = err?.response?.data;

    if (!data) {
      return defaultMessage;
    }

    // Most common backend format:
    // { message: "Invalid email or password" }

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    // Sometimes backend returns:
    // { error: "Invalid credentials" }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    // Sometimes:
    // { errors: ["Invalid credentials"] }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      const firstError = data.errors[0];

      if (typeof firstError === "string") {
        return firstError;
      }

      if (firstError?.message) {
        return firstError.message;
      }
    }

    return defaultMessage;
  };

  // ============================================================
  // NORMALIZE EMAIL
  // ============================================================

  const normalizeEmail = (email) => {
    return email.trim().toLowerCase();
  };

  // ============================================================
  // NORMAL LOGIN
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate requests
    if (loading) {
      return;
    }

    const email = normalizeEmail(formData.email);
    const password = formData.password;

    // Validation
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      console.log("Attempting login with:", email);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      /*
       * Support either:
       *
       * {
       *   accessToken: "...",
       *   user: {...}
       * }
       *
       * OR
       *
       * {
       *   token: "...",
       *   user: {...}
       * }
       */

      const accessToken =
        response.data?.accessToken ||
        response.data?.token ||
        response.data?.data?.accessToken ||
        response.data?.data?.token;

      const user =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data;

      if (!accessToken) {
        console.error(
          "Login response did not contain an access token:",
          response.data,
        );

        toast.error(
          "Login succeeded but the server did not return an access token.",
        );

        return;
      }

      if (!user || typeof user !== "object") {
        console.error(
          "Login response did not contain a valid user:",
          response.data,
        );

        toast.error(
          "Login succeeded but the server did not return user information.",
        );

        return;
      }

      handleLoginSuccess(accessToken, user);
    } catch (err) {
      console.error("Login error:", err);

      const status = err?.response?.status;

      const backendMessage = getErrorMessage(
        err,
        "Login failed. Please try again.",
      );

      // ========================================================
      // 401 UNAUTHORIZED
      // ========================================================

      if (status === 401) {
        /*
         * IMPORTANT:
         *
         * A 401 comes from the backend.
         * This frontend cannot correct an invalid password.
         *
         * We show the backend message if one exists.
         */

        toast.error(
          backendMessage ||
            "Invalid email or password. Please check your credentials.",
        );

        return;
      }

      // ========================================================
      // 403 FORBIDDEN
      // ========================================================

      if (status === 403) {
        toast.error(
          backendMessage ||
            "Your account is not allowed to log in. It may be pending, rejected, or suspended.",
        );

        return;
      }

      // ========================================================
      // 404 NOT FOUND
      // ========================================================

      if (status === 404) {
        toast.error(
          backendMessage ||
            "The login endpoint was not found. Check the backend API URL.",
        );

        return;
      }

      // ========================================================
      // 400 BAD REQUEST
      // ========================================================

      if (status === 400) {
        toast.error(
          backendMessage || "Please check the information you entered.",
        );

        return;
      }

      // ========================================================
      // 500 SERVER ERROR
      // ========================================================

      if (status >= 500) {
        toast.error(
          backendMessage ||
            "The server encountered an error. Please try again later.",
        );

        return;
      }

      // ========================================================
      // NO RESPONSE
      // ========================================================

      if (!err?.response) {
        toast.error(
          "Cannot connect to the server. Make sure the backend is running on port 5000.",
        );

        return;
      }

      // ========================================================
      // OTHER ERROR
      // ========================================================

      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async (credentialResponse) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      if (!credentialResponse?.credential) {
        toast.error("Google credential was not received.");
        return;
      }

      console.log("Google credential received.");

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      console.log("GOOGLE LOGIN RESPONSE:", response.data);

      const accessToken =
        response.data?.accessToken ||
        response.data?.token ||
        response.data?.data?.accessToken ||
        response.data?.data?.token;

      const user =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data;

      if (!accessToken) {
        toast.error(
          "Google login succeeded but no access token was received.",
        );
        return;
      }

      if (!user || typeof user !== "object") {
        toast.error(
          "Google login succeeded but user information was not received.",
        );
        return;
      }

      handleLoginSuccess(accessToken, user);
    } catch (err) {
      console.error("Google login error:", err);

      const status = err?.response?.status;

      const backendMessage = getErrorMessage(
        err,
        "Google login failed. Please try again.",
      );

      if (status === 401) {
        toast.error(
          backendMessage || "Google authentication was not accepted.",
        );
        return;
      }

      if (status === 403) {
        toast.error(
          backendMessage ||
            "Your account is not allowed to log in or has been suspended.",
        );
        return;
      }

      if (status === 404) {
        toast.error(
          backendMessage ||
            "No account exists with this Google email.",
        );
        return;
      }

      if (!err?.response) {
        toast.error(
          "Cannot connect to the server. Make sure the backend is running.",
        );
        return;
      }

      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#061426] text-white">

      {/* ======================================================
          BACKGROUND
      ======================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        {/* Blue glow */}
        <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-[#163B5C]/40 blur-[120px]" />

        {/* Orange glow */}
        <div className="absolute -bottom-48 -right-48 h-[600px] w-[600px] rounded-full bg-[#F4A261]/15 blur-[130px]" />

        {/* Teal glow */}
        <div className="absolute right-[30%] top-[10%] h-64 w-64 rounded-full bg-[#58C7B0]/10 blur-[100px]" />

        {/* Small orange glow */}
        <div className="absolute bottom-[25%] left-[20%] h-40 w-40 rounded-full bg-[#F4A261]/10 blur-[80px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* ======================================================
          PAGE
      ======================================================= */}

      <div className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-10">

        <div className="w-full max-w-6xl">

          {/* ==================================================
              MAIN CARD
          =================================================== */}

          <div className="grid overflow-hidden rounded-[2rem] border border-[#4F9CCB]/20 bg-[#0D2742]/95 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-2">

            {/* ==================================================
                LEFT SIDE
            =================================================== */}

            <div className="relative overflow-hidden bg-[#0A1931] px-8 py-10 sm:px-10 lg:min-h-[720px] lg:px-12 xl:px-14">

              {/* Decorative circles */}

              <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-[#F4A261]/20" />

              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#4F9CCB]/15" />

              <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#163B5C]/50 blur-[100px]" />

              <div className="absolute bottom-24 right-16 h-20 w-20 rounded-full bg-[#F4A261]/10 blur-2xl" />

              {/* Content */}

              <div className="relative z-10 flex h-full flex-col justify-between">

                <div>

                  {/* LOGO */}

                  <div className="mb-10 flex items-center gap-4">

                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[#4F9CCB]/30 bg-[#163B5C] p-1.5 shadow-lg shadow-black/20">

                      <img
                        src={logo}
                        alt="ASTU MSJ Logo"
                        className="h-full w-full rounded-xl object-cover"
                      />

                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#F4A261]">
                        ASTU MSJ
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#8FC4E4]">
                        Bootcamp
                      </p>
                    </div>

                  </div>

                  {/* WELCOME BADGE */}

                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#F4A261]/25 bg-[#F4A261]/10 px-4 py-2">

                    <Sparkles className="h-4 w-4 text-[#F4A261]" />

                    <span className="text-xs font-bold text-[#F4A261]">
                      Welcome back
                    </span>

                  </div>

                  {/* HEADING */}

                  <h1 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-white xl:text-6xl">

                    Keep building

                    <span className="block text-[#F4A261]">
                      your future.
                    </span>

                  </h1>

                  <p className="mt-7 max-w-lg text-base leading-8 text-[#8FC4E4] sm:text-lg">
                    Continue your learning journey, connect with mentors,
                    solve challenging problems, and turn your skills into
                    real-world projects.
                  </p>

                  {/* FEATURE CARDS */}

                  <div className="mt-10 grid gap-3">

                    <LoginFeature
                      icon={<ShieldCheck className="h-5 w-5" />}
                      title="Secure access"
                      text="Your account and learning journey stay protected."
                      iconBg="bg-[#F4A261]/10"
                      iconColor="text-[#F4A261]"
                    />

                    <LoginFeature
                      icon={<Code2 className="h-5 w-5" />}
                      title="Learn by doing"
                      text="Build practical projects and strengthen your skills."
                      iconBg="bg-[#4F9CCB]/10"
                      iconColor="text-[#4F9CCB]"
                    />

                    <LoginFeature
                      icon={<Users className="h-5 w-5" />}
                      title="Grow together"
                      text="Learn with mentors and other ambitious students."
                      iconBg="bg-[#58C7B0]/10"
                      iconColor="text-[#58C7B0]"
                    />

                  </div>

                </div>

                {/* LEFT FOOTER */}

                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">

                  <div>

                    <p className="text-sm font-bold text-white">
                      Learn. Build. Compete. Grow.
                    </p>

                    <p className="mt-1 text-xs text-[#6F9AB8]">
                      ASTU MSJ Bootcamp • 2026
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#F4A261]/25 bg-[#F4A261]/10">

                    <ArrowUpRight className="h-5 w-5 text-[#F4A261]" />

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                RIGHT SIDE
            =================================================== */}

            <div className="relative bg-[#102F4D] px-7 py-10 sm:px-10 lg:px-12 xl:px-14">

              {/* Decoration */}

              <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#4F9CCB]/10 blur-[100px]" />

              <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#F4A261]/5 blur-[100px]" />

              <div className="relative z-10 flex min-h-full items-center">

                <div className="w-full">

                  {/* BACK */}

                  <Link
                    to="/"
                    className="group mb-10 inline-flex items-center gap-2 text-sm font-semibold text-[#8FC4E4] transition hover:text-[#F4A261]"
                  >

                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

                    Back to Home

                  </Link>

                  {/* HEADING */}

                  <div className="mb-8">

                    <div className="mb-4 flex items-center gap-3">

                      <span className="h-1 w-9 rounded-full bg-[#F4A261]" />

                      <span className="text-xs font-black uppercase tracking-[0.25em] text-[#8FC4E4]">
                        Account Access
                      </span>

                    </div>

                    <h2 className="text-4xl font-black tracking-tight text-white">
                      Welcome back.
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-[#7FAAC7]">
                      Sign in to continue your bootcamp journey.
                    </p>

                  </div>

                  {/* ==================================================
                      FORM
                  =================================================== */}

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    {/* EMAIL */}

                    <div>

                      <label className="mb-2 block text-sm font-bold text-[#D9EDF7]">
                        Email Address

                        <span className="ml-1 text-[#F4A261]">
                          *
                        </span>
                      </label>

                      <div className="group relative">

                        <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6F9AB8] transition group-focus-within:text-[#F4A261]" />

                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={loading}
                          required
                          className="w-full rounded-2xl border border-[#4F9CCB]/20 bg-[#0A2138] py-4 pl-12 pr-4 text-sm font-medium text-white outline-none transition placeholder:text-[#5F86A2] hover:border-[#4F9CCB]/40 focus:border-[#F4A261] focus:bg-[#0B263F] focus:ring-4 focus:ring-[#F4A261]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                      </div>

                    </div>

                    {/* PASSWORD */}

                    <div>

                      <div className="mb-2 flex items-center justify-between">

                        <label className="text-sm font-bold text-[#D9EDF7]">

                          Password

                          <span className="ml-1 text-[#F4A261]">
                            *
                          </span>

                        </label>

                        <Link
                          to="/forgot-password"
                          className="text-xs font-bold text-[#8FC4E4] transition hover:text-[#F4A261]"
                        >
                          Forgot password?
                        </Link>

                      </div>

                      <div className="group relative">

                        <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6F9AB8] transition group-focus-within:text-[#F4A261]" />

                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={loading}
                          required
                          className="w-full rounded-2xl border border-[#4F9CCB]/20 bg-[#0A2138] py-4 pl-12 pr-12 text-sm font-medium text-white outline-none transition placeholder:text-[#5F86A2] hover:border-[#4F9CCB]/40 focus:border-[#F4A261] focus:bg-[#0B263F] focus:ring-4 focus:ring-[#F4A261]/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((prev) => !prev)
                          }
                          disabled={loading}
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F9AB8] transition hover:text-[#F4A261] disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}

                        </button>

                      </div>

                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative mt-3 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#F4A261] py-4 text-sm font-black text-[#061426] shadow-lg shadow-[#F4A261]/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFB477] hover:shadow-xl hover:shadow-[#F4A261]/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading && (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      )}

                      {loading ? "Signing in..." : "Sign in"}

                    </button>

                    {/* DIVIDER */}

                    <div className="relative my-7">

                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-white/10" />
                      </div>

                      <div className="relative flex justify-center">

                        <span className="bg-[#102F4D] px-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#6F9AB8]">
                          Or continue with
                        </span>

                      </div>

                    </div>

                    {/* GOOGLE */}

                    <div className="flex w-full items-center justify-center rounded-2xl border border-[#4F9CCB]/20 bg-[#0A2138] p-3 transition hover:border-[#4F9CCB]/40">

                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                          toast.error(
                            "Google login failed. Please try again.",
                          );
                        }}
                        useOneTap={false}
                        theme="filled_black"
                        size="large"
                        text="signin_with"
                        shape="rectangular"
                      />

                    </div>

                  </form>

                  {/* REGISTER */}

                  <div className="mt-8 rounded-2xl border border-[#58C7B0]/15 bg-[#58C7B0]/5 p-4 text-center">

                    <p className="text-sm text-[#7FAAC7]">

                      Don't have an account?{" "}

                      <Link
                        to="/register"
                        className="font-black text-[#58C7B0] transition hover:text-[#7EE0CF]"
                      >
                        Apply now
                      </Link>

                    </p>

                  </div>

                  {/* FOOTER */}

                  <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#557B96]">
                    ASTU MSJ • Learn • Build • Compete
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// ============================================================
// LOGIN FEATURE COMPONENT
// ============================================================

function LoginFeature({
  icon,
  title,
  text,
  iconBg,
  iconColor,
}) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-[#102A46]/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#4F9CCB]/30 hover:bg-[#153653]">

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>

      <div>

        <p className="text-sm font-bold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-[#6F9AB8]">
          {text}
        </p>

      </div>

    </div>
  );
}

export default LoginPage;