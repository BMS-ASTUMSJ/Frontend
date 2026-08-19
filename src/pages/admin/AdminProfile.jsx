import { useEffect, useRef, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

import {
  Camera,
  User,
  Phone,
  Lock,
  ShieldCheck,
  Save,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

function AdminProfile() {
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ============================================================
  // LOAD ADMIN PROFILE
  // ============================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);

        const response = await api.get("/users/profile");

        const user = response.data?.user || response.data;

        setFormData((prev) => ({
          ...prev,
          phone: user?.phone || "",
          bio: user?.bio || "",
        }));

        if (user?.profileImage) {
          setProfileImage(user.profileImage);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);

        const message =
          err.response?.data?.message ||
          "Failed to load your profile.";

        toast.error(message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

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
  // HANDLE PROFILE IMAGE
  // ============================================================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    // Optional size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile image must be smaller than 5MB.");
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(imageUrl);
    setShowProfileMenu(false);

    toast.success("Profile image selected.");
  };

  const editProfileImage = () => {
    fileInputRef.current?.click();
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================
  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setSavingProfile(true);

      const response = await api.patch("/users/profile", {
        phone: formData.phone,
        bio: formData.bio,
      });

      const updatedUser = response.data?.user;

      if (updatedUser) {
        setFormData((prev) => ({
          ...prev,
          phone: updatedUser.phone || "",
          bio: updatedUser.bio || "",
        }));

        if (updatedUser.profileImage) {
          setProfileImage(updatedUser.profileImage);
        }
      }

      toast.success(
        response.data?.message || "Profile updated successfully."
      );
    } catch (err) {
      console.error("Profile update error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to update your profile.";

      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  // ============================================================
  // CHANGE PASSWORD
  // ============================================================
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill in all password fields.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await api.patch("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(
        response.data?.message || "Password updated successfully."
      );

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      setShowPassword(false);
    } catch (err) {
      console.error("Password change error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to update your password.";

      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  // ============================================================
  // LOADING PROFILE
  // ============================================================
  if (loadingProfile) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#F6FAFD]">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span className="font-semibold">
            Loading your profile...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFD] px-4 py-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#B3CFE5] md:p-8">
          {/* =====================================================
              PROFILE HEADER
          ===================================================== */}
          <div className="relative min-h-47.5">
            <div>
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1A3D63] p-3">
                  <ShieldCheck className="h-6 w-6 text-[#B3CFE5]" />
                </div>

                <div className="mb-8">
                  <h1 className="mt-9 text-3xl font-black text-[#0A1931] md:text-4xl">
                    My Profile
                  </h1>

                  <p className="mt-2 text-[#1A3D63]">
                    Manage your personal information and account security.
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                PROFILE IMAGE
            ===================================================== */}
            <div className="absolute right-0 top-0">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#B3CFE5] bg-[#1A3D63] shadow-md transition hover:border-[#4A7FA7]"
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Admin profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-14 w-14 text-[#B3CFE5]" />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-[#0A1931]/60 opacity-0 transition group-hover:opacity-100">
                  <Camera className="h-7 w-7 text-white" />
                </div>
              </button>

              <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#4A7FA7]">
                <Camera className="h-4 w-4 text-white" />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 top-32 z-30 w-52 overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-xl">
                  <div className="bg-[#0A1931] px-4 py-3">
                    <p className="text-sm font-bold text-white">
                      Account Settings
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={editProfileImage}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#0A1931] transition hover:bg-[#F6FAFD]"
                  >
                    <Camera className="h-5 w-5 text-[#4A7FA7]" />
                    Edit Profile Image
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(true);
                      setShowProfileMenu(false);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#0A1931] transition hover:bg-[#F6FAFD]"
                  >
                    <Lock className="h-5 w-5 text-[#4A7FA7]" />
                    Change Password
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* =====================================================
              PROFILE INFORMATION
          ===================================================== */}
          <div className="mt-4 border-t border-[#B3CFE5] pt-6">
            {/* PHONE */}
            <div className="flex items-center gap-4 border-b border-[#B3CFE5] py-5">
              <div className="rounded-xl bg-[#B3CFE5] p-3">
                <Phone className="h-5 w-5 text-[#1A3D63]" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#4A7FA7]">
                  Phone Number
                </p>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Add your phone number"
                  className="mt-1 w-full border-none bg-transparent p-0 font-semibold text-[#0A1931] outline-none placeholder:text-[#4A7FA7]/60"
                />
              </div>
            </div>

            {/* BIO */}
            <div className="flex items-start gap-4 py-5">
              <div className="rounded-xl bg-[#B3CFE5] p-3">
                <User className="h-5 w-5 text-[#1A3D63]" />
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-wide text-[#4A7FA7]">
                  Bio
                </p>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  maxLength="300"
                  placeholder="Tell us a little about yourself..."
                  className="mt-1 w-full resize-none border-none bg-transparent p-0 font-semibold text-[#0A1931] outline-none placeholder:text-[#4A7FA7]/60"
                />

                <p className="text-right text-xs text-[#4A7FA7]">
                  {formData.bio.length}/300
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              SAVE PROFILE
          ===================================================== */}
          <div className="mt-4 flex justify-end border-t border-[#B3CFE5] pt-5">
            <button
              type="button"
              onClick={handleProfileSubmit}
              disabled={savingProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4A7FA7] px-6 py-3 font-bold text-white transition hover:bg-[#1A3D63] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          CHANGE PASSWORD MODAL
      ============================================================ */}
      {showPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1931]/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <button
              type="button"
              onClick={() => setShowPassword(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-[#4A7FA7] transition hover:bg-[#F6FAFD] hover:text-[#0A1931]"
            >
              ✕
            </button>

            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B3CFE5]">
                <Lock className="h-6 w-6 text-[#1A3D63]" />
              </div>

              <h2 className="text-2xl font-bold text-[#0A1931]">
                Change Password
              </h2>

              <p className="mt-2 text-sm text-[#4A7FA7]">
                Create a new password to keep your account secure.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              {/* CURRENT PASSWORD */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Current Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 pr-12 text-[#0A1931] outline-none placeholder:text-[#4A7FA7]/60 focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(!showCurrentPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7FA7]"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* NEW PASSWORD */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  New Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 pr-12 text-[#0A1931] outline-none placeholder:text-[#4A7FA7]/60 focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7FA7]"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="mb-7">
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Confirm New Password{" "}
                  <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 pr-12 text-[#0A1931] outline-none placeholder:text-[#4A7FA7]/60 focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7FA7]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPassword(false)}
                  disabled={changingPassword}
                  className="rounded-xl border border-[#B3CFE5] px-5 py-3 font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#4A7FA7] px-6 py-3 font-bold text-white transition hover:bg-[#1A3D63] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProfile;