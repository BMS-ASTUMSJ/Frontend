import { useEffect, useState } from "react";
import { Loader2, Save, User, Camera, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../utils/api";

function ProfileForm() {
  const [profile, setProfile] = useState({
    firstName: "",
    phone: "",
    bio: "",
    profileImage: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      // Your profile router:
      // GET /api/profile/me
      const response = await api.get("/profile/me");

      if (response.data.success) {
        const user = response.data.user;

        setProfile({
          firstName: user?.firstName || "",
          phone: user?.phone || "",
          bio: user?.bio || "",
          profileImage: user?.profileImage?.url || "",
        });

        setPreviewImage(user?.profileImage?.url || "");
      } else {
        toast.error(response.data.message || "Failed to load profile");
      }
    } catch (error) {
      console.error("LOAD PROFILE ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HANDLE TEXT INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // HANDLE IMAGE
  // ============================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setSelectedImage(file);

    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  };

  // ============================================================
  // REMOVE IMAGE
  // ============================================================

  const handleRemoveImage = async () => {
    try {
      setRemovingImage(true);

      const response = await api.delete("/profile/me/image");

      if (response.data.success) {
        setSelectedImage(null);

        setProfile((previous) => ({
          ...previous,
          profileImage: "",
        }));

        setPreviewImage("");

        toast.success(
          response.data.message || "Profile image removed successfully.",
        );
      } else {
        toast.error(response.data.message || "Failed to remove profile image.");
      }
    } catch (error) {
      console.error("REMOVE PROFILE IMAGE ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to remove profile image.",
      );
    } finally {
      setRemovingImage(false);
    }
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       * We use FormData because the backend uses:
       *
       * uploadProfile.single("profileImage")
       *
       * Therefore JSON will NOT upload the image.
       */

      const formData = new FormData();

      formData.append("firstName", profile.firstName);
      formData.append("phone", profile.phone);
      formData.append("bio", profile.bio);

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const response = await api.patch("/profile/me", formData);

      if (response.data.success) {
        const user = response.data.user;

        const imageUrl = user?.profileImage?.url || "";

        setProfile({
          firstName: user?.firstName || "",
          phone: user?.phone || "",
          bio: user?.bio || "",
          profileImage: imageUrl,
        });

        setPreviewImage(imageUrl);
        setSelectedImage(null);

        toast.success(response.data.message || "Profile updated successfully.");
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-2 text-[#4A7FA7]">
          <Loader2 className="h-5 w-5 animate-spin" />

          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}

        <div className="mb-6">
          <p className="text-sm font-medium text-[#4A7FA7]">Account Settings</p>

          <h1 className="mt-1 text-2xl font-bold text-[#0A1931]">My Profile</h1>

          <p className="mt-1 text-sm text-gray-500">
            View and update your personal information.
          </p>
        </div>

        {/* PROFILE */}

        <div className="overflow-hidden rounded-2xl border border-[#D6D6D6] bg-white shadow-sm">
          {/* PROFILE HEADER */}

          <div className="border-b border-[#D6D6D6] bg-[#F6FAFD] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#B3CFE5]/50">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-[#1A3D63]" />
                  )}
                </div>

                {/* CAMERA BUTTON */}

                <label
                  htmlFor="profileImage"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#0A1931] text-white shadow-md transition hover:bg-[#1A3D63]"
                >
                  <Camera className="h-3.5 w-3.5" />
                </label>

                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A1931]">
                  {profile.firstName || "Admin"}
                </h2>

                <p className="text-sm text-gray-500">
                  Update your profile information
                </p>
              </div>
            </div>

            {/* IMAGE ACTIONS */}

            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="profileImage"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#D6D6D6] bg-white px-3 py-2 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
              >
                <Camera className="h-4 w-4" />
                Update Image
              </label>

              {previewImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={removingImage}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {removingImage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove Image
                </button>
              )}
            </div>
          </div>

          {/* FORM */}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* FIRST NAME */}

              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-[#0A1931]"
                >
                  First Name
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profile.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full rounded-xl border border-[#D6D6D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                />
              </div>

              {/* PHONE */}

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-[#0A1931]"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-[#D6D6D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                />
              </div>

              {/* BIO */}

              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-medium text-[#0A1931]"
                >
                  Bio
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself..."
                  className="w-full resize-none rounded-xl border border-[#D6D6D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                />
              </div>
            </div>

            {/* SAVE */}

            <div className="mt-8 flex justify-end border-t border-[#D6D6D6] pt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#0A1931] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1A3D63] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileForm;
