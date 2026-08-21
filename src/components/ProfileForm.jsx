import React, { useEffect, useState } from "react";
import api from "../utils/api";

const ProfileForm = ({ role }) => {
  const [user, setUser] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await api.get("/profile/me");

      const currentUser = response.data?.user;

      if (!currentUser) {
        throw new Error("User data was not returned");
      }

      setUser(currentUser);

      setFirstName(currentUser.firstName || "");
      setPhone(currentUser.phone || "");
      setBio(currentUser.bio || "");
      setPreview(currentUser.profileImage?.url || "");
      setProfileImage(null);
    } catch (err) {
      console.error("LOAD PROFILE ERROR:", err);

      setError(
        err.response?.data?.message || err.message || "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setError("");
    setSuccess("");

    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    const imageUrl = URL.createObjectURL(file);

    setProfileImage(file);
    setPreview(imageUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("firstName", firstName.trim());
      formData.append("phone", phone.trim());
      formData.append("bio", bio.trim());

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await api.patch("/profile/me", formData);

      const updatedUser = response.data?.user;

      if (!updatedUser) {
        throw new Error("Updated user data was not returned");
      }

      setUser(updatedUser);
      setFirstName(updatedUser.firstName || "");
      setPhone(updatedUser.phone || "");
      setBio(updatedUser.bio || "");
      setPreview(updatedUser.profileImage?.url || "");
      setProfileImage(null);

      setSuccess(response.data?.message || "Profile updated successfully.");
    } catch (err) {
      console.error("PROFILE UPDATE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setRemoving(true);
      setError("");
      setSuccess("");

      const response = await api.delete("/profile/me/image");

      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }

      setPreview("");
      setProfileImage(null);

      setUser((previous) => ({
        ...previous,
        profileImage: {
          url: "",
          publicId: "",
        },
      }));

      setSuccess(
        response.data?.message || "Profile image removed successfully.",
      );
    } catch (err) {
      console.error("REMOVE IMAGE ERROR:", err);

      setError(err.response?.data?.message || "Failed to remove profile image");
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A3D63] border-t-transparent" />

          <p className="text-sm font-medium text-[#7A7F85]">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFD] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 border-b border-[#B3CFE5]/50 pb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#4A7FA7]">
            Account Settings
          </p>

          <h1 className="text-3xl font-black tracking-tight text-[#0A1931]">
            {role} Profile
          </h1>

          <p className="mt-2 text-sm text-[#7A7F85]">
            Manage your personal information and profile photo.
          </p>
        </div>

        {success && (
          <div className="mb-6 border-l-4 border-green-500 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="border-b border-[#B3CFE5]/50 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="shrink-0">
              {preview ? (
                <img
                  src={preview}
                  alt={`${role} profile`}
                  className="h-32 w-32 rounded-full object-cover ring-4 ring-white shadow-lg"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full border-2 border-dashed border-[#B3CFE5] bg-[#EAF3F9]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-12 w-12 text-[#4A7FA7]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                Profile Photo
              </h2>

              <p className="mt-1 max-w-md text-sm text-[#7A7F85]">
                Upload a professional profile image. PNG, JPG and WebP images
                are supported.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <label
                  htmlFor={`${role}-profile-image`}
                  className="cursor-pointer rounded-xl bg-[#1A3D63] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A1931]"
                >
                  Choose Photo
                </label>

                <input
                  id={`${role}-profile-image`}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {preview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={removing}
                    className="rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {removing ? "Removing..." : "Remove Photo"}
                  </button>
                )}
              </div>

              <p className="mt-2 text-xs text-[#7A7F85]">
                Maximum file size: 5MB
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit}>
          <section className="py-8">
            <div className="mb-6">
              <h2 className="text-xl font-black text-[#0A1931]">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Update the information associated with your profile.
              </p>
            </div>

            <div className="max-w-2xl space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                  First Name
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className="w-full border-b-2 border-[#B3CFE5] bg-transparent px-1 py-3 text-sm text-[#0A1931] outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                  Phone Number
                </label>

                <input
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full border-b-2 border-[#B3CFE5] bg-transparent px-1 py-3 text-sm text-[#0A1931] outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                    Bio
                  </label>

                  <span className="text-xs font-medium text-[#7A7F85]">
                    {bio.length}/300
                  </span>
                </div>

                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={5}
                  maxLength={300}
                  placeholder="Tell us a little about yourself..."
                  className="w-full resize-none rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm text-[#0A1931] outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]/30"
                />
              </div>
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 border-t border-[#B3CFE5]/50 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={loadProfile}
              className="rounded-xl border border-[#B3CFE5] bg-white px-6 py-2.5 text-sm font-bold text-[#4A7FA7] transition hover:bg-[#EAF3F9]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#1A3D63] px-7 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
