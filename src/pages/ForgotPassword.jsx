import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Mail, Lock, KeyRound } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      setMessage(
        response.data.message ||
          "A verification code has been sent to your email.",
      );

      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to send verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-reset-otp", {
        email: email.trim(),
        otp,
      });

      setMessage(response.data.message || "OTP verified successfully.");

      setStep(3);
    } catch (err) {
      console.error("Verify OTP error:", err);

      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        email: email.trim(),
        newPassword,
      });

      setMessage(
        response.data.message || "Your password has been reset successfully.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFD] px-4 py-12">
      <div className="mx-auto flex min-h-150 max-w-lg items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-7 shadow-lg ring-1 ring-[#B3CFE5] sm:p-10">
          {/* Back to Login */}

          <Link
            to="/login"
            className="mb-8 inline-flex text-sm font-medium text-[#7A7F85] hover:text-[#1A3D63]"
          >
            ← Back to Login
          </Link>

          {/* Header */}

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#B3CFE5]">
              {step === 1 && <Mail className="h-6 w-6 text-[#1A3D63]" />}

              {step === 2 && <KeyRound className="h-6 w-6 text-[#1A3D63]" />}

              {step === 3 && <Lock className="h-6 w-6 text-[#1A3D63]" />}
            </div>

            <h1 className="text-3xl font-bold text-[#0A1931]">
              {step === 1 && "Forgot Password?"}

              {step === 2 && "Verify Your Email"}

              {step === 3 && "Create New Password"}
            </h1>

            <p className="mt-2 leading-6 text-[#7A7F85]">
              {step === 1 &&
                "Enter your email and we'll send you a verification code."}

              {step === 2 && `Enter the 6-digit code sent to ${email}.`}

              {step === 3 && "Create a new password for your account."}
            </p>
          </div>

          {/* Success message */}

          {message && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* Error message */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ======================================
              STEP 1
          ====================================== */}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Email Address <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7A7F85]" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-4 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1A3D63] py-3.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7] disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* ======================================
              STEP 2
          ====================================== */}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  6-Digit OTP <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-[#0A1931] outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1A3D63] py-3.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7] disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
                className="w-full text-sm font-medium text-[#4A7FA7] hover:text-[#1A3D63]"
              >
                Change email
              </button>
            </form>
          )}

          {/* ======================================
              STEP 3
          ====================================== */}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  New Password <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Confirm Password <span className="text-red-500">*</span>
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter password again"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1A3D63] py-3.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7] disabled:opacity-60"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
