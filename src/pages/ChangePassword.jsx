import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  ArrowRight,
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

    // Check all fields
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError.error("Please fill in all fields.");
      return;
    }

    // ============================================================
    // PASSWORD REQUIREMENTS
    // ============================================================

    // Minimum 8 characters
    if (newPassword.length < 8) {
      setError.error("Password must be at least 8 characters long.");
      return;
    }

    // At least one uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      setError.error("Password must contain at least one uppercase letter.");
      return;
    }

    // At least one lowercase letter
    if (!/[a-z]/.test(newPassword)) {
      setError.error("Password must contain at least one lowercase letter.");
      return;
    }

    // At least one number
    if (!/[0-9]/.test(newPassword)) {
      setError.error("Password must contain at least one number.");
      return;
    }

    // At least one special character
    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setError.error("Password must contain at least one special character.");
      return;
    }

    // Confirm password
    if (newPassword !== confirmPassword) {
      setError.error("New passwords do not match.");
      return;
    }

    // New password cannot be the same as current password
    if (currentPassword === newPassword) {
      setError.error(
        "New password must be different from your current password.",
      );
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

      // Show backend error on frontend
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Skip changing the password.
   *
   * This calls the backend instead of only changing localStorage,
   * so mustChangePassword becomes false in MongoDB.
   */
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
    <div className="min-h-screen bg-[#F6FAFD] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="rounded-3xl bg-white shadow-xl border border-[#B3CFE5] overflow-hidden">
          {/* HEADER */}
          <div className="bg-[#0A1931] px-8 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A3D63]">
                <ShieldCheck size={30} className="text-[#B3CFE5]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Welcome to ASTU MSJ</h1>

                <p className="mt-1 text-sm text-[#B3CFE5]">
                  Secure your account
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#0A1931]">
              Change your password
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#7A7F85]">
              You are using a temporary password. You can change it now to keep
              your account secure, or skip this step and change it later.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* CURRENT PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Current Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7F85]"
                  />

                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7F85]"
                  >
                    {showCurrent ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  New Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7F85]"
                  />

                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7F85]"
                  >
                    {showNew ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>

                {/* PASSWORD REQUIREMENTS */}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Confirm New Password
                </label>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A7F85]"
                  />

                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-12 pr-12 outline-none focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7F85]"
                  >
                    {showConfirm ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* CHANGE PASSWORD */}
              <button
                type="submit"
                disabled={loading || skipLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A3D63] py-3.5 font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    Change Password
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

              {/* SKIP */}
              <button
                type="button"
                onClick={handleSkip}
                disabled={loading || skipLoading}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white py-3.5 font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {skipLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={19} className="animate-spin" />
                    Skipping...
                  </span>
                ) : (
                  "Skip for now"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#7A7F85]">
              You can change your password later from your profile settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
