import { useEffect, useState } from "react";
import {
  Loader2,
  Save,
  User,
  Camera,
  Trash2,
  Sparkles,
  Phone,
  UserCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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
    toast.success("Image preview updated!");
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
          response.data.message || "Profile image removed successfully."
        );
      } else {
        toast.error(response.data.message || "Failed to remove profile image.");
      }
    } catch (error) {
      console.error("REMOVE PROFILE IMAGE ERROR:", error);
      toast.error(
        error.response?.data?.message || "Failed to remove profile image."
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-[#FAF4EB]/90 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">Loading Profile Data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            background: "#FAF4EB",
            color: "#16344E",
            border: "1px solid #E8DCB8",
            fontWeight: "600",
          },
        }}
      />

      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes rotateOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .rotate-orbit { animation: rotateOrbit 16s linear infinite; }
        .smooth-transition { transition: all 220ms ease; }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach Gradient)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Moving Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        {/* Reduced space-y between header and form card */}
        <div className="page-enter relative z-10 mx-auto max-w-4xl space-y-4">

          {/* ======================================================
              1. TOP HEADER BANNER
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[26px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-6 shadow-[0_15px_45px_rgba(23,56,84,0.2)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4.5">
                <div className="float-slow relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <UserCheck size={26} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#F38744] shadow-[0_0_10px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="h-1.5 w-4.5 rounded-full bg-[#F38744]" />
                    <Sparkles size={13} className="text-[#F38744]" />
                   
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    My Profile
                  </h1>

                  
                </div>
              </div>
            </div>
          </header>

          {/* ======================================================
              2. CREAMY GLASS PROFILE CARD
          ====================================================== */}
          <div className="overflow-hidden rounded-[28px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_15px_45px_rgba(23,56,84,0.08)] backdrop-blur-xl">

            {/* AVATAR & VISUAL IDENTITY HEADER */}
            <div className="border-b border-[#EBDCC8] bg-[#F5ECE0]/80 px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                
                <div className="flex items-center gap-4.5">
                  {/* Circular Avatar Orb with Rotating Dashed Ring */}
                  <div className="relative">
                    <div className="rotate-orbit pointer-events-none absolute inset-[-4px] rounded-full border border-dashed border-[#DE7E4A]/50" />
                    
                    <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border-2 border-[#EBDCC8] bg-gradient-to-br from-[#E0F0FA] to-[#C9E4F7] shadow-md">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-[#173854]" />
                      )}
                    </div>

                    {/* Camera Button Trigger */}
                    <label
                      htmlFor="profileImageUpload"
                      className="smooth-transition absolute -bottom-1 -right-1 flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#173854] to-[#224A6D] text-white shadow-lg hover:scale-110 hover:shadow-xl"
                      title="Upload photo"
                    >
                      <Camera size={13} />
                    </label>

                    <input
                      id="profileImageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-[#16344E]">
                      {profile.firstName || "Administrator"}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      System Administrator • Active Session
                    </p>
                  </div>
                </div>

                {/* Avatar Action Pills */}
                <div className="flex items-center gap-2.5">
                  <label
                    htmlFor="profileImageUpload"
                    className="smooth-transition inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] px-3.5 py-2 text-xs font-bold text-[#16344E] shadow-sm hover:-translate-y-0.5 hover:bg-[#FFFDF9]"
                  >
                    <Camera size={14} className="text-[#E26D2C]" />
                    <span>Change Avatar</span>
                  </label>

                  {previewImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={removingImage}
                      className="smooth-transition inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-50"
                    >
                      {removingImage ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      <span>Remove</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* FORM INPUTS */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-7.5 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">

                {/* FIRST NAME */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]"
                  >
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={profile.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="h-12 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] placeholder-slate-400 outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={handleChange}
                      placeholder="e.g. +251 900 000 000"
                      className="h-12 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] placeholder-slate-400 outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                    />
                  </div>
                </div>

                {/* BIO */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="bio"
                    className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]"
                  >
                    About & Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={profile.bio}
                    onChange={handleChange}
                    placeholder="Describe your role, responsibilities, or background..."
                    className="w-full resize-none rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 p-4 text-sm font-semibold text-[#16344E] placeholder-slate-400 outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                  />
                </div>

              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end border-t border-[#EBDCC8] pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="smooth-transition inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-8 py-3 text-sm font-black text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </>
  );
}

export default ProfileForm;