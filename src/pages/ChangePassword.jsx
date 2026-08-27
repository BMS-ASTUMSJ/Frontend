import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowRight,
  Check,
  X,
  ArrowLeft,
} from "lucide-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const validations = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

  const goToDashboard = () => {
    if (user.role === "admin") {
      navigate("/admin");
    } else if (user.role === "mentor") {
      navigate("/mentor");
    } else if (user.role === "student") {
      navigate("/student");
    } else {
      navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
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
      toast.error("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from your current password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.patch("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success(response.data?.message || "Password changed successfully!");

      const updatedUser = {
        ...user,
        mustChangePassword: false,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setTimeout(() => {
        goToDashboard();
      }, 500);
    } catch (err) {
      console.error("Change password error:", err);
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      setSkipLoading(true);

      const response = await api.patch("/auth/skip-password-change");

      toast.success(response.data?.message || "Password change skipped.");

      const updatedUser = {
        ...user,
        mustChangePassword: false,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setTimeout(() => {
        goToDashboard();
      }, 500);
    } catch (err) {
      console.error("Skip password change error:", err);
      toast.error(
        err.response?.data?.message || "Could not skip password change.",
      );
    } finally {
      setSkipLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#1C2E3A] via-[#14222B] to-[#0E171E] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#304c51] blur-3xl pointer-events-none border border-[#293E4C]" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#496065] blur-3xl pointer-events-none border border-[#293E4C]" />

      <div className="w-full max-w-md relative z-10">
        <button
          type="button"
          onClick={goToDashboard}
          className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-[#8FA3B0] hover:text-[#00A8CC] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="rounded-3xl bg-[#FFFFFF] shadow-2xl border border-[#B4D7E2]/50 overflow-hidden">
          <div className="bg-[#1b3c47] px-8 py-7 text-white border-b border-[#293E4C] relative">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1C2E3A] border border-[#293E4C] shadow-inner">
                <ShieldCheck size={26} className="text-[#00A8CC]" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-[#FFFFFF]">
                  ASTU MSJ Security
                </h1>
                <p className="mt-0.5 text-xs text-[#8FA3B0]">
                  Protect and update your credentials
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#14222B]">
              Change Your Password
            </h2>
            <p className="mt-1 text-xs text-[#8FA3B0]">
              Enter your current password and set a secure new one.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                  Current Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                  />

                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] py-2.5 pl-10 pr-10 text-sm text-[#14222B] placeholder-[#8FA3B0] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0] hover:text-[#14222B] transition-colors"
                  >
                    {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                  New Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                  />

                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] py-2.5 pl-10 pr-10 text-sm text-[#14222B] placeholder-[#8FA3B0] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0] hover:text-[#14222B] transition-colors"
                  >
                    {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-3 space-y-1.5 rounded-xl bg-[#E3F5F9] p-3 text-xs border border-[#B4D7E2]">
                    <p className="font-semibold text-[#14222B]">
                      Password Requirements:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[#1C2E3A]">
                      <span
                        className={`flex items-center gap-1.5 ${
                          validations.length
                            ? "text-[#0088A6] font-semibold"
                            : "text-[#8FA3B0]"
                        }`}
                      >
                        {validations.length ? (
                          <Check size={13} className="text-[#00A8CC]" />
                        ) : (
                          <X size={13} />
                        )}
                        8+ characters
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          validations.uppercase
                            ? "text-[#0088A6] font-semibold"
                            : "text-[#8FA3B0]"
                        }`}
                      >
                        {validations.uppercase ? (
                          <Check size={13} className="text-[#00A8CC]" />
                        ) : (
                          <X size={13} />
                        )}
                        Uppercase
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          validations.special
                            ? "text-[#0088A6] font-semibold"
                            : "text-[#8FA3B0]"
                        }`}
                      >
                        {validations.special ? (
                          <Check size={13} className="text-[#00A8CC]" />
                        ) : (
                          <X size={13} />
                        )}
                        1 Special char
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#14222B]">
                  Confirm New Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                  />

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] py-2.5 pl-10 pr-10 text-sm text-[#14222B] placeholder-[#8FA3B0] outline-none transition focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8FA3B0] hover:text-[#14222B] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  disabled={loading || skipLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A8CC] py-3 text-sm font-semibold text-white shadow-md hover:bg-[#0088A6] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      Change Password
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={loading || skipLoading}
                  className="w-full rounded-xl border border-[#293E4C]/20 bg-[#F4F8FA] py-3 text-sm font-semibold text-[#1C2E3A] hover:bg-[#E3F5F9] transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {skipLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={17} className="animate-spin" />
                      Skipping...
                    </span>
                  ) : (
                    "Skip for now"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
