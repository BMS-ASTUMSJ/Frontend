import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Save,
  User,
  Camera,
  Trash2,
  Lock,
  KeyRound,
  UserCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

function ProfileForm({ role = "Student" }) {
  const navigate = useNavigate();

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

  // ============================================================
  // LOAD PROFILE
  // ============================================================

  const loadProfile = async () => {
    try {
      setLoading(true);

      const response = await api.get("/profile/me");

      const data = response?.data;

      if (!data) {
        throw new Error("No profile data returned.");
      }

      const user = data.user || data;

      const imageUrl =
        typeof user?.profileImage === "object"
          ? user?.profileImage?.url || ""
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
    } catch (error) {
      console.error("Load profile error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to load profile.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

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
  // HANDLE IMAGE SELECTION
  // ============================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewImage(imageUrl);
  };

  // ============================================================
  // REMOVE PROFILE IMAGE
  // ============================================================

  const handleRemoveImage = async () => {
    try {
      setRemovingImage(true);

      const response = await api.delete("/profile/me/image");

      if (response?.data?.success) {
        setSelectedImage(null);

        setProfile((previous) => ({
          ...previous,
          profileImage: "",
        }));

        if (previewImage && previewImage.startsWith("blob:")) {
          URL.revokeObjectURL(previewImage);
        }

        setPreviewImage("");

        toast.success(
          response.data.message || "Profile image removed successfully.",
        );
      } else {
        toast.error(
          response?.data?.message || "Failed to remove profile image.",
        );
      }
    } catch (error) {
      console.error("Remove profile image error:", error);

      toast.error(
        error?.response?.data?.message || "Failed to remove profile image.",
      );
    } finally {
      setRemovingImage(false);
    }
  };

  // ============================================================
  // SAVE PROFILE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const formData = new FormData();

      // Students cannot modify these fields
      if (!isStudent) {
        formData.append("firstName", profile.firstName);
        formData.append("phone", profile.phone);
      }

      formData.append("bio", profile.bio);

      if (selectedImage) {
        formData.append("profileImage", selectedImage);
      }

      const response = await api.patch("/profile/me", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response?.data?.success) {
        toast.error(response?.data?.message || "Failed to update profile.");
        return;
      }

      const user = response?.data?.user || {};

      const imageUrl =
        typeof user?.profileImage === "object"
          ? user?.profileImage?.url || ""
          : user?.profileImage ||
            (selectedImage ? previewImage : profile.profileImage);

      setProfile((previous) => ({
        ...previous,
        firstName: user?.firstName ?? previous.firstName,
        phone: user?.phone ?? previous.phone,
        bio: user?.bio ?? previous.bio,
        profileImage: imageUrl,
      }));

      if (selectedImage && previewImage?.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }

      setPreviewImage(imageUrl);
      setSelectedImage(null);

      toast.success(response.data.message || "Profile updated successfully.");
    } catch (error) {
      console.error("Update profile error:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update profile.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // CLEANUP OBJECT URL
  // ============================================================

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FA] px-4">
        <div className="flex items-center gap-2 text-[#00A8CC]">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span className="text-sm font-medium text-[#14222B]">
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F4F8FA] pb-16 pt-16 lg:pt-0">
      {/* ========================================================
          PAGE HEADER
      ======================================================== */}

      <div className="mx-auto w-full max-w-[1170px] px-3 pt-4 sm:px-5 sm:pt-5 md:px-6">
        <div
          className="
            flex
            min-h-[110px]
            items-center
            rounded-2xl
            bg-gradient-to-r
            from-[#06232C]
            via-[#0C3039]
            to-[#1B414A]
            px-4
            py-5
            shadow-sm

            sm:min-h-[120px]
            sm:px-6

            md:min-h-[132px]
            md:rounded-[20px]
            md:px-10
            md:py-7
          "
        >
          <div className="flex min-w-0 items-center gap-3 sm:gap-4 md:gap-5">
            {/* Header Icon */}
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-[#00A8CC]
                text-white
                shadow-md

                sm:h-12
                sm:w-12

                md:h-14
                md:w-14
                md:rounded-[13px]
              "
            >
              <UserCheck
                className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7"
                strokeWidth={2.2}
              />
            </div>

            {/* Header Title */}
            <h1
              className="
                min-w-0
                truncate
                text-2xl
                font-extrabold
                tracking-tight
                text-white

                sm:text-3xl

                md:text-[34px]
              "
            >
              My Profile
            </h1>
          </div>
        </div>
      </div>

      {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

      <div
        className="
          mx-auto
          w-full
          max-w-[1170px]
          space-y-4
          px-3
          pt-5
          pb-8

          sm:space-y-5
          sm:px-5
          sm:pt-6

          md:space-y-6
          md:px-6
          md:pt-7
          md:pb-12
        "
      >
        {/* ======================================================
            PROFILE CARD
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-[#B4D7E2]/50
            bg-white
            p-4
            shadow-sm

            sm:rounded-[20px]
            sm:p-5

            md:p-7
          "
        >
          {/* TOP PROFILE SECTION */}

          <div
            className="
              flex
              flex-col
              gap-5

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* USER INFORMATION */}

            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              {/* AVATAR */}

              <div className="relative shrink-0">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#B4D7E2]
                    bg-[#E3F5F9]
                    shadow-inner

                    sm:h-16
                    sm:w-16
                    sm:rounded-2xl
                  "
                >
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-[#14222B] sm:h-8 sm:w-8" />
                  )}
                </div>

                {/* CAMERA BUTTON */}

                <label
                  htmlFor="profileImageInput"
                  className="
                    absolute
                    -bottom-1
                    -right-1
                    flex
                    h-6
                    w-6
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-lg
                    bg-[#00A8CC]
                    text-white
                    shadow
                    transition
                    hover:bg-[#0088A6]
                  "
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

              {/* NAME */}

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-[#14222B] sm:text-lg">
                  {profile.firstName || role}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">{role} Account</p>
              </div>
            </div>

            {/* CHANGE PASSWORD */}

            <button
              type="button"
              onClick={() => navigate("/change-password")}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-[#B4D7E2]
                bg-white
                px-4
                py-2.5
                text-xs
                font-semibold
                text-[#14222B]
                transition
                hover:bg-[#E3F5F9]

                sm:w-auto
                sm:self-center
              "
            >
              <KeyRound className="h-4 w-4 shrink-0 text-[#00A8CC]" />

              <span>Change Password</span>
            </button>
          </div>

          {/* IMAGE ACTIONS */}

          <div
            className="
              mt-5
              flex
              flex-col
              gap-2
              border-t
              border-gray-100
              pt-5

              xs:flex-row
              xs:flex-wrap
              xs:items-center
              sm:flex-row
              sm:flex-wrap
              sm:gap-3
            "
          >
            <label
              htmlFor="profileImageInput"
              className="
                inline-flex
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                border-[#B4D7E2]
                bg-white
                px-4
                py-2.5
                text-xs
                font-semibold
                text-[#14222B]
                transition
                hover:bg-[#E3F5F9]

                sm:w-auto
                sm:py-2
              "
            >
              <Camera className="h-3.5 w-3.5 text-[#00A8CC]" />
              Update Picture
            </label>

            {previewImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={removingImage}
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-1.5
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-red-600
                  transition
                  hover:bg-red-100
                  disabled:cursor-not-allowed
                  disabled:opacity-50

                  sm:w-auto
                  sm:py-2
                "
              >
                {removingImage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Remove Picture
              </button>
            )}
          </div>
        </div>

        {/* ======================================================
            PROFILE FORM CARD
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-[#B4D7E2]/50
            bg-white
            p-4
            shadow-sm

            sm:rounded-[20px]
            sm:p-5

            md:p-7
          "
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {/* FIRST NAME */}

              <div className="min-w-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="firstName"
                    className="
                      block
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#14222B]

                      sm:text-xs
                    "
                  >
                    Name
                  </label>

                  {isStudent && (
                    <span
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1
                        text-[9px]
                        font-bold
                        text-[#8FA3B0]

                        sm:text-[10px]
                      "
                    >
                      <Lock className="h-3 w-3" />
                      Locked
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
                  className={`
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    px-3.5
                    py-3
                    text-xs
                    outline-none
                    transition

                    sm:px-4

                    ${
                      isStudent
                        ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                        : "border-[#B4D7E2]/70 bg-white text-[#14222B] focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC]"
                    }
                  `}
                />
              </div>

              {/* PHONE */}

              <div className="min-w-0">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label
                    htmlFor="phone"
                    className="
                      block
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#14222B]

                      sm:text-xs
                    "
                  >
                    Phone
                  </label>

                  {isStudent && (
                    <span
                      className="
                        flex
                        shrink-0
                        items-center
                        gap-1
                        text-[9px]
                        font-bold
                        text-[#8FA3B0]

                        sm:text-[10px]
                      "
                    >
                      <Lock className="h-3 w-3" />
                      Locked
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
                  className={`
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    px-3.5
                    py-3
                    text-xs
                    outline-none
                    transition

                    sm:px-4

                    ${
                      isStudent
                        ? "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400"
                        : "border-[#B4D7E2]/70 bg-white text-[#14222B] focus:border-[#00A8CC] focus:ring-1 focus:ring-[#00A8CC]"
                    }
                  `}
                />
              </div>

              {/* NOTE */}

              <div className="min-w-0 md:col-span-2">
                <label
                  htmlFor="bio"
                  className="
                    mb-2
                    block
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#14222B]

                    sm:text-xs
                  "
                >
                  Note
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  maxLength={300}
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us a little about yourself..."
                  className="
                    w-full
                    min-w-0
                    resize-none
                    rounded-xl
                    border
                    border-[#B4D7E2]/70
                    bg-white
                    px-3.5
                    py-3
                    text-xs
                    text-[#14222B]
                    placeholder-[#8FA3B0]
                    outline-none
                    transition

                    sm:px-4

                    focus:border-[#00A8CC]
                    focus:ring-1
                    focus:ring-[#00A8CC]
                  "
                />

                <div
                  className="
                    mt-1.5
                    text-right
                    text-[10px]
                    font-medium
                    text-[#8FA3B0]
                  "
                >
                  {profile.bio.length}/300
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}

            <div
              className="
                mt-5
                flex
                flex-col
                border-t
                border-gray-100
                pt-5

                sm:mt-6
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="submit"
                disabled={saving}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#00A8CC]
                  px-6
                  py-3
                  text-xs
                  font-bold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-[#0088A6]
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:w-auto
                  sm:py-2.5
                "
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
