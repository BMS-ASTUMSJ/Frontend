import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft } from "lucide-react";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/forgot-password", {
        email: email.trim(),
      });

      toast.success(
        response.data.message ||
          "A verification code has been sent to your email.",
      );

      setStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to send verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter the 6-digit OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-reset-otp", {
        email: email.trim(),
        otp,
      });

      toast.success(response.data.message || "OTP verified successfully.");

      setStep(3);
    } catch (err) {
      console.error("Verify OTP error:", err);

      toast.error(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!validations.length) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (!validations.uppercase) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }

    if (!validations.lowercase) {
      toast.error("Password must contain at least one lowercase letter.");
      return;
    }

    if (!validations.number) {
      toast.error("Password must contain at least one number.");
      return;
    }

    if (!validations.special) {
      toast.error("Password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        email: email.trim(),
        newPassword,
      });

      toast.success(
        response.data.message || "Your password has been reset successfully.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#1C2E3A] via-[#14222B] to-[#0E171E] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00A8CC]/10 blur-3xl pointer-events-none border border-[#293E4C]" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#00A8CC]/10 blur-3xl pointer-events-none border border-[#293E4C]" />

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#8FA3B0] hover:text-[#00A8CC] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>

        <div className="rounded-3xl bg-[#FFFFFF] shadow-2xl border border-[#B4D7E2]/50 overflow-hidden">
          <div className="bg-[#1b3c47] px-8 py-7 text-white border-b border-[#293E4C] relative overflow-hidden">
            <div className="absolute top-3 right-4 w-12 h-12 rounded-full bg-[#00A8CC]/15 border border-[#00A8CC]/30 pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1C2E3A] border border-[#293E4C] shadow-inner">
                {step === 1 && <Mail size={24} className="text-[#00A8CC]" />}
                {step === 2 && (
                  <KeyRound size={24} className="text-[#00A8CC]" />
                )}
                {step === 3 && <Lock size={24} className="text-[#00A8CC]" />}
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                  {step === 1 && "Forgot Password?"}
                  {step === 2 && "Verify Email"}
                  {step === 3 && "New Password"}
                </h1>
                <p className="mt-0.5 text-xs text-[#8FA3B0]">
                  ASTU MSJ Security Verification
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#14222B]">
              {step === 1 && "Reset your account password"}
              {step === 2 && "Enter verification code"}
              {step === 3 && "Create your new password"}
            </h2>
            <p className="mt-1 text-xs text-[#8FA3B0]">
              {step === 1 &&
                "Enter your email and we'll send you a 6-digit verification code."}
              {step === 2 && `Enter the 6-digit code sent to ${email}.`}
              {step === 3 &&
                "Ensure your new password meets all security criteria."}
            </p>

            {step === 1 && (
              <form onSubmit={handleSendOTP} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                    />

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] py-2.5 pl-10 pr-4 text-sm text-[#14222B] placeholder-[#8FA3B0] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#00A8CC] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0088A6] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending Code..." : "Send Verification Code"}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                    6-Digit OTP <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] text-[#14222B] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                  />
                </div>

                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#00A8CC] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0088A6] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                    }}
                    className="w-full rounded-xl border border-[#293E4C]/20 bg-[#F4F8FA] py-3 text-sm font-semibold text-[#1C2E3A] hover:bg-[#E3F5F9] transition"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                    New Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                    />

                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] py-2.5 pl-10 pr-10 text-sm text-[#14222B] placeholder-[#8FA3B0] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0] hover:text-[#14222B] transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  <div className="mt-2 text-xs text-[#8FA3B0] space-y-1">
                    <p className="font-medium text-[#14222B]">
                      Password must contain:
                    </p>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <li
                        className={`flex items-center gap-1.5 ${validations.length ? "text-[#0088A6] font-medium" : ""}`}
                      >
                        <span>•</span> At least 8 characters
                      </li>
                      <li
                        className={`flex items-center gap-1.5 ${validations.uppercase ? "text-[#0088A6] font-medium" : ""}`}
                      >
                        <span>•</span> Uppercase letter
                      </li>
                      <li
                        className={`flex items-center gap-1.5 ${validations.special ? "text-[#0088A6] font-medium" : ""}`}
                      >
                        <span>•</span> Special character
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                    />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] py-2.5 pl-10 pr-10 text-sm text-[#14222B] placeholder-[#8FA3B0] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0] hover:text-[#14222B] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#00A8CC] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0088A6] transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
