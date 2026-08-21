import React, { useEffect, useState } from "react";
import api from "../utils/api";

const ProfileForm = ({ role }) => {
  const [user, setUser] = useState(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

      const response = await api.get("/profile/me");

      const currentUser = response.data?.user;

      if (!currentUser) {
        throw new Error("User data was not returned");
      }

      setUser(currentUser);

      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setPhone(currentUser.phone || "");
      setBio(currentUser.bio || "");

      setPreview(currentUser.profileImage?.url || "");
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

    setProfileImage(file);

    const imageUrl = URL.createObjectURL(file);

    setPreview(imageUrl);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);
      formData.append("bio", bio);

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
      setLastName(updatedUser.lastName || "");
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{role} Profile</h1>
          <p className="mt-2 text-gray-500">
            Manage your personal information and profile photo.
          </p>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          {/* PROFILE IMAGE */}
          <div className="border-b border-gray-200 px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div>
                {preview ? (
                  <img
                    src={preview}
                    alt={`${role} profile`}
                    className="h-36 w-36 rounded-full object-cover ring-4 ring-gray-100"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-full bg-blue-100 text-5xl font-bold text-blue-600 ring-4 ring-gray-100">
                    {firstName ? firstName.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center sm:items-start">
                <h2 className="text-xl font-semibold text-gray-900">
                  Profile Photo
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  <label
                    htmlFor={`${role}-profile-image`}
                    className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
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
                      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {removing ? "Removing..." : "Remove Photo"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-8 sm:px-8">
              <h2 className="text-xl font-semibold text-gray-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update your account information.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || role}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={5}
                  maxLength={300}
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {bio.length}/300
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
              <button
                type="button"
                onClick={loadProfile}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
