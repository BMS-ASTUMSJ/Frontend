import { useEffect, useState } from "react";
import { Loader2, Save, User, Camera, Trash2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

function ProfileForm({ role = "Student" }) {
  const isStudent = role?.toLowerCase() === "student";

  const [profile, setProfile] = useState({
    firstName: "",
    phone: "",
    bio: "",
    profileImage: "",
    email: "",
    gender: "",
    schoolId: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      let response;
      try {
        response = await api.get("/profile/me");
      } catch (e) {
        response = await api.get("/users/profile");
      }

      if (response?.data?.success || response?.data?.user) {
        const user = response.data.user || response.data;
        const imageUrl =
          typeof user?.profileImage === "object"
            ? user?.profileImage?.url
            : user?.profileImage || "";

        setProfile({
          firstName: user?.firstName || "",
          phone: user?.phone || "",
          bio: user?.bio || "",
          profileImage: imageUrl,
          email: user?.email || "",
          gender: user?.gender || "",
          schoolId: user?.schoolId || "",
        });

        setPreviewImage(imageUrl);
      } else {
        toast.error(response?.data?.message || "Failed to load profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

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

  const handleRemoveImage = async () => {
    try {
      setRemovingImage(true);

      let response;
      try {
        response = await api.delete("/profile/me/image");
      } catch (e) {
        response = await api.delete("/profile/remove-image");
      }

      if (response?.data?.success) {
        setSelectedImage(null);
        setProfile((previous) => ({
          ...previous,
          profileImage: "",
        }));
        setPreviewImage("");
        toast.success(response.data.message || "Profile image removed successfully.");
      } else {
        toast.error(response?.data?.message || "Failed to remove profile image.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove profile image.");
    } finally {
      setRemovingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const formData = new FormData();

      if (!isStudent) {
        formData.append("firstName", profile.firstName);
        formData.append("phone", profile.phone);
      }

      formData.append("bio", profile.bio);

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
        formData.append("image", selectedImage);
      }

      let response;
      try {
        response = await api.patch("/profile/me", formData);
      } catch (e) {
        try {
          response = await api.put("/profile/upload-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (e2) {
          response = await api.put("/users/profile", {
            bio: profile.bio,
            ...(!isStudent ? { firstName: profile.firstName, phone: profile.phone } : {}),
          });
        }
      }

      if (response?.data?.success) {
        const user = response.data.user;
        const imageUrl =
          typeof user?.profileImage === "object"
            ? user?.profileImage?.url
            : user?.profileImage || previewImage;

        setProfile((prev) => ({
          ...prev,
          firstName: user?.firstName || prev.firstName,
          phone: user?.phone || prev.phone,
          bio: user?.bio || prev.bio,
          profileImage: imageUrl,
        }));

        setPreviewImage(imageUrl);
        setSelectedImage(null);
        toast.success(response.data.message || "Profile updated successfully.");
      } else {
        toast.error(response?.data?.message || "Failed to update profile.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <p className="text-sm font-medium text-[#4A7FA7]">{role} Account Settings</p>
          <h1 className="mt-1 text-2xl font-bold text-[#0A1931]">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isStudent
              ? "View your academic info and customize your bio and avatar."
              : "View and update your personal information."}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#D6D6D6] bg-white shadow-sm">
          <div className="border-b border-[#D6D6D6] bg-[#F6FAFD] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#B3CFE5]/50 border border-[#B3CFE5]">
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

                <label
                  htmlFor="profileImageInput"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#0A1931] text-white shadow-md transition hover:bg-[#1A3D63]"
                >
                  <Camera className="h-3.5 w-3.5" />
                </label>

                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div>
                <h2 className="font-semibold text-[#0A1931] text-lg">
                  {profile.firstName || role}
                </h2>
                <p className="text-sm text-gray-500">
                  {role} {profile.gender && `• ${profile.gender}`} {profile.schoolId && `• ID: ${profile.schoolId}`}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <label
                htmlFor="profileImageInput"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#D6D6D6] bg-white px-3 py-2 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
              >
                <Camera className="h-4 w-4" />
                Update Picture
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
                  Remove Picture
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-[#0A1931]"
                  >
                    First Name
                  </label>
                  {isStudent && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  disabled={isStudent}
                  value={profile.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                    isStudent
                      ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      : "border-[#D6D6D6] bg-white focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-[#0A1931]"
                  >
                    Phone
                  </label>
                  {isStudent && (
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  disabled={isStudent}
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none ${
                    isStudent
                      ? "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                      : "border-[#D6D6D6] bg-white focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-[#0A1931]"
                  >
                    Bio / About Self
                  </label>
                  <span className="text-xs text-gray-400">
                    {profile.bio?.length || 0}/300
                  </span>
                </div>

                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={300}
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself..."
                  className="w-full resize-none rounded-xl border border-[#D6D6D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                />
              </div>
            </div>

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