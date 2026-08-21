import { useEffect, useState } from "react";
import { Loader2, Save, User } from "lucide-react";
import toast from "react-hot-toast";

import api from "../utils/api";

function ProfileForm() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/users/profile");

      console.log("PROFILE RESPONSE:", response.data);

      if (response.data.success) {
        const user = response.data.user;

        setProfile({
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          phone: user?.phone || "",
          bio: user?.bio || "",
          profileImage: user?.profileImage || "",
        });
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
  // HANDLE INPUT
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await api.patch("/users/profile", {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        bio: profile.bio,
        profileImage: profile.profileImage,
      });

      console.log("UPDATE PROFILE RESPONSE:", response.data);

      if (response.data.success) {
        const user = response.data.user || response.data.data;

        if (user) {
          setProfile((previous) => ({
            ...previous,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.email || previous.email,
            phone: user.phone || "",
            bio: user.bio || "",
            profileImage: user.profileImage || "",
          }));
        }

        toast.success(response.data.message || "Profile updated successfully");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to update profile");
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
  // PROFILE
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

        {/* PROFILE CARD */}

        <div className="overflow-hidden rounded-2xl border border-[#D6D6D6] bg-white shadow-sm">
          {/* PROFILE HEADER */}

          <div className="border-b border-[#D6D6D6] bg-[#F6FAFD] px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-[#B3CFE5]/50">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-7 w-7 text-[#1A3D63]" />
                )}
              </div>

              <div>
                <h2 className="font-semibold text-[#0A1931]">
                  {profile.firstName || profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`.trim()
                    : "Student"}
                </h2>

                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
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

              {/* LAST NAME */}

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-[#0A1931]"
                >
                  Last Name
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profile.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full rounded-xl border border-[#D6D6D6] bg-white px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-[#0A1931]"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-[#D6D6D6] bg-gray-50 px-4 py-3 text-sm text-gray-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Email cannot be changed here.
                </p>
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

              {/* PROFILE IMAGE */}

              <div className="md:col-span-2">
                <label
                  htmlFor="profileImage"
                  className="mb-2 block text-sm font-medium text-[#0A1931]"
                >
                  Profile Image URL
                </label>

                <input
                  id="profileImage"
                  name="profileImage"
                  type="text"
                  value={profile.profileImage}
                  onChange={handleChange}
                  placeholder="Enter profile image URL"
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
