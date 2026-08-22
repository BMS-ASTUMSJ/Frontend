

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

import {
  Megaphone,
  Send,
  Trash2,
  Pencil,
  CalendarDays,
  Bell,
  Loader2,
  AlertCircle,
  User,
  Users,
  UserRoundCheck,
  ArrowUpRight,
  Radio,
  Sparkles,
  X,
  Check,
} from "lucide-react";

function Announcements() {
  // =====================================================
  // USER / ROLE
  // =====================================================

  const storedUser = localStorage.getItem("user");

  let user = { role: "admin" };

  try {
    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("Invalid user data in localStorage:", error);
  }

  const role = String(user?.role || "admin").toLowerCase();
  const isAdmin = role === "admin";

  // =====================================================
  // STATE
  // =====================================================

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAudience, setEditAudience] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);

  // =====================================================
  // LOAD ANNOUNCEMENTS
  // =====================================================

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      if (response.data?.success) {
        setAnnouncements(response.data.announcements || []);
      } else {
        setAnnouncements([]);
        setError(
          response.data?.message || "Failed to load announcements."
        );
      }
    } catch (err) {
      console.error("Fetch announcements error:", err);

      setAnnouncements([]);

      setError(
        err.response?.data?.message ||
          "Failed to load announcements. Please refresh the page."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const total = announcements.length;

    const everyone = announcements.filter(
      (item) => item?.audience === "all"
    ).length;

    const mentors = announcements.filter(
      (item) => item?.audience === "mentor"
    ).length;

    const edited = announcements.filter(
      (item) => item?.edited === true
    ).length;

    return {
      total,
      everyone,
      mentors,
      edited,
    };
  }, [announcements]);

  // =====================================================
  // PUBLISH
  // =====================================================

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!body.trim()) {
      toast.error("Announcement message is required.");
      return;
    }

    if (!["all", "mentor"].includes(audience)) {
      toast.error("Please select a valid audience.");
      return;
    }

    try {
      setIsPublishing(true);
      setError("");

      const response = await api.post("/announcements", {
        title: title.trim(),
        body: body.trim(),
        audience,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to publish announcement."
        );
      }

      setTitle("");
      setBody("");
      setAudience("all");

      toast.success("Announcement published successfully.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Publish announcement error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Error publishing announcement."
      );
    } finally {
      setIsPublishing(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = (id) => {
    if (!id) return;

    toast(
      (t) => (
        <div className="w-[320px]">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>

            <div>
              <p className="text-sm font-black text-[#0A1931]">
                Delete announcement?
              </p>

              <p className="text-[11px] text-gray-400">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg px-4 py-2 text-xs font-bold text-gray-500 transition hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  setError("");

                  const response = await api.delete(
                    `/announcements/${id}`
                  );

                  if (!response.data?.success) {
                    throw new Error(
                      response.data?.message ||
                        "Failed to delete announcement."
                    );
                  }

                  toast.success(
                    "Announcement deleted successfully."
                  );

                  await loadAnnouncements();
                } catch (err) {
                  console.error(
                    "Delete announcement error:",
                    err
                  );

                  toast.error(
                    err.response?.data?.message ||
                      err.message ||
                      "Failed to delete announcement."
                  );
                }
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  };

  // =====================================================
  // EDIT
  // =====================================================

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditTitle(item.title || "");
    setEditBody(item.body || "");
    setEditAudience(item.audience || "all");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditAudience("all");
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (!editBody.trim()) {
      toast.error("Announcement message is required.");
      return;
    }

    if (!["all", "mentor"].includes(editAudience)) {
      toast.error("Please select a valid audience.");
      return;
    }

    try {
      setIsUpdating(true);
      setError("");

      const response = await api.patch(`/announcements/${id}`, {
        title: editTitle.trim(),
        body: editBody.trim(),
        audience: editAudience,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to update announcement."
        );
      }

      cancelEdit();

      toast.success("Announcement updated successfully.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Update announcement error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update announcement."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString();
  };

  // =====================================================
  // AUDIENCE LABEL
  // =====================================================

  const getAudienceLabel = (announcementAudience) => {
    if (announcementAudience === "all") {
      return "Everyone";
    }

    if (announcementAudience === "mentor") {
      return "Mentors Only";
    }

    if (announcementAudience === "assigned_students") {
      return "Assigned Students";
    }

    return announcementAudience;
  };

  // =====================================================
  // CREATOR
  // =====================================================

  const getCreatorName = (item) => {
    if (!item?.createdBy) {
      return "Unknown";
    }

    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Unknown";
  };

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-full bg-[#EAF3F9] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1250px] space-y-7">

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[32px]
            bg-gradient-to-br
            from-[#12395B]
            via-[#1A4B70]
            to-[#39465A]
            px-6
            py-8
            shadow-[0_20px_50px_rgba(10,25,49,0.16)]
            md:px-9
            md:py-9
          "
        >
          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border-[28px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-24 right-28 h-64 w-64 rounded-full border-[24px] border-white/5" />

          <div className="pointer-events-none absolute right-[-40px] top-20 h-36 w-36 rounded-full border-[18px] border-white/5" />

          <div className="relative z-10 flex flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              {/* Hero icon circle */}

              <div className="relative hidden h-24 w-24 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-inner sm:flex">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F47A35] shadow-lg">
                  <Megaphone className="h-8 w-8 text-white" />
                </div>

                <span className="absolute right-1 top-2 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-[#284B68] bg-[#FF9A62]" />
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#FFB083]">
                  <Sparkles className="h-4 w-4" />
                  Communication Center
                </div>

                <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                  Announcements
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#D5E5F0] md:text-base">
                  Share important updates, news, reminders, and
                  information with your bootcamp community.
                </p>
              </div>
            </div>

            {/* Total badge */}

            <div className="flex items-center gap-3 self-start rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md md:self-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F47A35]">
                <Radio className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-[#BFD1DF]">
                  Total Updates
                </p>

                <p className="text-xl font-black text-white">
                  {statistics.total}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CIRCULAR STATISTICS
        ================================================= */}

        <section className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div
            className="
              group
              relative
              aspect-square
              w-full
              max-w-[265px]
              overflow-hidden
              rounded-full
              border
              border-[#E6D8C5]
              bg-[#FFFDF8]
              shadow-[0_15px_35px_rgba(27,63,92,0.09)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:scale-[1.025]
              hover:shadow-[0_25px_45px_rgba(27,63,92,0.15)]
            "
          >
            {/* soft inner circle */}

            <div className="pointer-events-none absolute inset-3 rounded-full border border-[#F0E7D9]" />

            {/* Icon */}

            <div className="absolute left-7 top-7 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3F9] shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Megaphone className="h-6 w-6 text-[#285A7D]" />
            </div>

            {/* Arrow */}

            <div className="absolute right-8 top-8 z-10 text-[#AFC0CB] transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight className="h-5 w-5" />
            </div>

            {/* Content */}

            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-8 text-center">

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8798A5]">
                Total
              </p>

              <p className="mt-2 text-5xl font-black leading-none text-[#123D60]">
                {statistics.total}
              </p>

              <p className="mt-3 max-w-[145px] text-[11px] font-semibold leading-4 text-[#8D9BA5]">
                All announcements
              </p>
            </div>
          </div>

          {/* EVERYONE */}

          <div
            className="
              group
              relative
              aspect-square
              w-full
              max-w-[265px]
              overflow-hidden
              rounded-full
              border
              border-[#E6D8C5]
              bg-[#FFFDF8]
              shadow-[0_15px_35px_rgba(27,63,92,0.09)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:scale-[1.025]
              hover:shadow-[0_25px_45px_rgba(27,63,92,0.15)]
            "
          >
            <div className="pointer-events-none absolute inset-3 rounded-full border border-[#F0E7D9]" />

            {/* Orange dot */}

            <span className="absolute right-8 top-9 h-3.5 w-3.5 animate-pulse rounded-full bg-[#F47A35] shadow-[0_0_0_5px_rgba(244,122,53,0.08)]" />

            {/* Icon */}

            <div className="absolute left-7 top-7 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0E7] shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <Users className="h-6 w-6 text-[#F47A35]" />
            </div>

            {/* Content */}

            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-8 text-center">

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8798A5]">
                Everyone
              </p>

              <p className="mt-2 text-5xl font-black leading-none text-[#123D60]">
                {statistics.everyone}
              </p>

              <p className="mt-3 max-w-[150px] text-[11px] font-semibold leading-4 text-[#8D9BA5]">
                Community updates
              </p>
            </div>
          </div>

          {/* MENTORS */}

          <div
            className="
              group
              relative
              aspect-square
              w-full
              max-w-[265px]
              overflow-hidden
              rounded-full
              border
              border-[#E6D8C5]
              bg-[#FFFDF8]
              shadow-[0_15px_35px_rgba(27,63,92,0.09)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:scale-[1.025]
              hover:shadow-[0_25px_45px_rgba(27,63,92,0.15)]
            "
          >
            <div className="pointer-events-none absolute inset-3 rounded-full border border-[#F0E7D9]" />

            {/* Blue dot */}

            <span className="absolute right-8 top-9 h-3.5 w-3.5 animate-pulse rounded-full bg-[#285A7D] shadow-[0_0_0_5px_rgba(40,90,125,0.08)]" />

            {/* Icon */}

            <div className="absolute left-7 top-7 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3F9] shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <UserRoundCheck className="h-6 w-6 text-[#285A7D]" />
            </div>

            {/* Content */}

            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-8 text-center">

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8798A5]">
                Mentors
              </p>

              <p className="mt-2 text-5xl font-black leading-none text-[#123D60]">
                {statistics.mentors}
              </p>

              <p className="mt-3 max-w-[150px] text-[11px] font-semibold leading-4 text-[#8D9BA5]">
                Mentor announcements
              </p>
            </div>
          </div>

          {/* EDITED */}

          <div
            className="
              group
              relative
              aspect-square
              w-full
              max-w-[265px]
              overflow-hidden
              rounded-full
              border
              border-[#E6D8C5]
              bg-[#FFFDF8]
              shadow-[0_15px_35px_rgba(27,63,92,0.09)]
              transition-all
              duration-500
              hover:-translate-y-2
              hover:scale-[1.025]
              hover:shadow-[0_25px_45px_rgba(27,63,92,0.15)]
            "
          >
            <div className="pointer-events-none absolute inset-3 rounded-full border border-[#F0E7D9]" />

            {/* Gold dot */}

            <span className="absolute right-8 top-9 h-3.5 w-3.5 animate-pulse rounded-full bg-[#D9A52B] shadow-[0_0_0_5px_rgba(217,165,43,0.08)]" />

            {/* Icon */}

            <div className="absolute left-7 top-7 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF5D9] shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <Pencil className="h-6 w-6 text-[#D49B22]" />
            </div>

            {/* Content */}

            <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-8 text-center">

              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8798A5]">
                Edited
              </p>

              <p className="mt-2 text-5xl font-black leading-none text-[#123D60]">
                {statistics.edited}
              </p>

              <p className="mt-3 max-w-[150px] text-[11px] font-semibold leading-4 text-[#8D9BA5]">
                Updated announcements
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-red-700 shadow-sm">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
              <AlertCircle size={18} />
            </div>

            <span className="text-xs font-bold">
              {error}
            </span>
          </div>
        )}

        {/* =================================================
            CREATE ANNOUNCEMENT
        ================================================= */}

        {isAdmin && (
          <section className="overflow-hidden rounded-[28px] border border-[#E7DCCB] bg-[#FFFDF8] shadow-[0_15px_40px_rgba(27,63,92,0.08)]">

            {/* Header */}

            <div className="border-b border-[#E9DFD0] px-6 py-6 md:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0E7]">
                    <Bell className="h-6 w-6 text-[#F47A35]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#123D60]">
                      Create New Announcement
                    </h2>

                    <p className="mt-1 text-xs font-medium text-[#8D9BA5]">
                      Publish an important update to your
                      bootcamp community.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#EAF3F9] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#285A7D]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Admin Publishing
                </div>
              </div>
            </div>

            {/* Form */}

            <form
              onSubmit={handlePublish}
              className="space-y-5 px-6 py-7 md:px-8"
            >
              {/* TITLE */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#234966]">
                    Announcement Title
                  </label>

                  <span className="text-[10px] font-bold text-[#A0ADB6]">
                    {title.length}/120
                  </span>
                </div>

                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly assessment reminder"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-[#E3D5C3]
                    bg-[#FFFDF8]
                    px-5
                    py-4
                    text-sm
                    font-semibold
                    text-[#123D60]
                    outline-none
                    transition-all
                    placeholder:text-[#AAB4BB]
                    focus:border-[#F47A35]
                    focus:ring-4
                    focus:ring-[#F47A35]/10
                  "
                />
              </div>

              {/* MESSAGE */}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#234966]">
                    Message
                  </label>

                  <span className="text-[10px] font-bold text-[#A0ADB6]">
                    {body.length}/1000
                  </span>
                </div>

                <textarea
                  rows={5}
                  required
                  maxLength={1000}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your announcement message here..."
                  className="
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-[#E3D5C3]
                    bg-[#FFFDF8]
                    px-5
                    py-4
                    text-sm
                    leading-6
                    text-[#123D60]
                    outline-none
                    transition-all
                    placeholder:text-[#AAB4BB]
                    focus:border-[#F47A35]
                    focus:ring-4
                    focus:ring-[#F47A35]/10
                  "
                />
              </div>

              {/* CONTROLS */}

              <div className="flex flex-col gap-4 border-t border-[#E9DFD0] pt-5 md:flex-row md:items-center md:justify-between">

                {/* Audience */}

                <div>
                  <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-[#8798A5]">
                    Audience
                  </p>

                  <div className="flex rounded-2xl border border-[#E3D5C3] bg-[#F8F2E9] p-1">

                    <button
                      type="button"
                      onClick={() => setAudience("all")}
                      className={`rounded-xl px-5 py-2.5 text-[10px] font-black transition-all ${
                        audience === "all"
                          ? "bg-[#123D60] text-white shadow-md"
                          : "text-[#8D9BA5] hover:text-[#123D60]"
                      }`}
                    >
                      EVERYONE
                    </button>

                    <button
                      type="button"
                      onClick={() => setAudience("mentor")}
                      className={`rounded-xl px-5 py-2.5 text-[10px] font-black transition-all ${
                        audience === "mentor"
                          ? "bg-[#123D60] text-white shadow-md"
                          : "text-[#8D9BA5] hover:text-[#123D60]"
                      }`}
                    >
                      MENTORS
                    </button>
                  </div>
                </div>

                {/* Publish */}

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#F47A35]
                    px-8
                    py-3.5
                    text-xs
                    font-black
                    uppercase
                    tracking-wider
                    text-white
                    shadow-[0_10px_20px_rgba(244,122,53,0.22)]
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:bg-[#E96827]
                    hover:shadow-[0_15px_25px_rgba(244,122,53,0.28)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isPublishing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}

                  {isPublishing
                    ? "Publishing..."
                    : "Publish Announcement"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =================================================
            RECENT FEED
        ================================================= */}

        <section className="pb-10">

          {/* Feed header */}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#F47A35]" />

                <h2 className="text-xl font-black text-[#123D60]">
                  Recent Feed
                </h2>
              </div>

              <p className="mt-1 text-xs font-medium text-[#8D9BA5]">
                Latest announcements from your bootcamp
              </p>
            </div>

            <div className="rounded-full border border-[#E5D8C7] bg-[#FFFDF8] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#8D9BA5] shadow-sm">
              Total:{" "}
              <span className="text-[#123D60]">
                {announcements.length}
              </span>
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="rounded-[28px] border border-[#E7DCCB] bg-[#FFFDF8] py-20 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3F9]">
                <Loader2 className="h-6 w-6 animate-spin text-[#285A7D]" />
              </div>

              <p className="mt-4 text-xs font-black uppercase tracking-wider text-[#8D9BA5]">
                Fetching Updates...
              </p>
            </div>
          ) : announcements.length === 0 ? (

            /* =================================================
                EMPTY
            ================================================= */

            <div className="rounded-[28px] border border-dashed border-[#DCCDBB] bg-[#FFFDF8] p-16 text-center shadow-sm">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAF3F9]">
                <Megaphone className="h-9 w-9 text-[#285A7D]" />
              </div>

              <p className="mt-5 text-base font-black text-[#123D60]">
                No announcements yet
              </p>

              <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#8D9BA5]">
                Create your first announcement to share
                important updates with your bootcamp community.
              </p>
            </div>

          ) : (

            /* =================================================
                ANNOUNCEMENTS TABLE
            ================================================= */

            <div className="overflow-hidden rounded-[28px] border border-[#E5D8C7] bg-[#FFFDF8] shadow-[0_15px_40px_rgba(27,63,92,0.07)]">

              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[2fr_1fr_1.3fr_1fr_auto] items-center gap-4 border-b border-[#E8DDCF] bg-[#F8F1E7] px-6 py-4 text-[9px] font-black uppercase tracking-[0.16em] text-[#8D9BA5] md:grid">
                <span>Announcement</span>
                <span>Audience</span>
                <span>Posted By</span>
                <span>Date</span>
                <span className="text-right">
                  Actions
                </span>
              </div>

              {/* TABLE ROWS */}

              <div className="divide-y divide-[#EDE3D7]">

                {announcements.map((item) => (

                  <div key={item._id}>

                    {/* =================================================
                        EDIT ROW
                    ================================================= */}

                    {editingId === item._id ? (

                      <div className="space-y-4 bg-[#F8F1E7] p-5 md:p-6">

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0E7]">
                              <Pencil className="h-4 w-4 text-[#F47A35]" />
                            </div>

                            <p className="text-xs font-black uppercase tracking-wider text-[#123D60]">
                              Edit Announcement
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isUpdating}
                            className="rounded-full p-2 text-[#8D9BA5] transition hover:bg-white hover:text-[#123D60]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">

                          <input
                            type="text"
                            value={editTitle}
                            maxLength={120}
                            onChange={(e) =>
                              setEditTitle(e.target.value)
                            }
                            className="w-full rounded-2xl border border-[#E3D5C3] bg-[#FFFDF8] px-4 py-3 text-sm font-bold text-[#123D60] outline-none focus:border-[#F47A35]"
                            placeholder="Announcement title"
                          />

                          <div className="flex rounded-2xl border border-[#E3D5C3] bg-[#FFFDF8] p-1">

                            <button
                              type="button"
                              onClick={() =>
                                setEditAudience("all")
                              }
                              className={`flex-1 rounded-xl py-2 text-[9px] font-black ${
                                editAudience === "all"
                                  ? "bg-[#123D60] text-white"
                                  : "text-[#8D9BA5]"
                              }`}
                            >
                              ALL
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setEditAudience("mentor")
                              }
                              className={`flex-1 rounded-xl py-2 text-[9px] font-black ${
                                editAudience === "mentor"
                                  ? "bg-[#123D60] text-white"
                                  : "text-[#8D9BA5]"
                              }`}
                            >
                              MENTORS
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={editBody}
                          maxLength={1000}
                          onChange={(e) =>
                            setEditBody(e.target.value)
                          }
                          className="w-full resize-none rounded-2xl border border-[#E3D5C3] bg-[#FFFDF8] px-4 py-3 text-sm text-[#123D60] outline-none focus:border-[#F47A35]"
                          placeholder="Announcement message"
                        />

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isUpdating}
                            className="rounded-xl px-5 py-2.5 text-xs font-bold text-[#8D9BA5] transition hover:bg-white"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleUpdate(item._id)
                            }
                            disabled={isUpdating}
                            className="flex items-center gap-2 rounded-xl bg-[#123D60] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1A4B70] disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}

                            Save Changes
                          </button>
                        </div>
                      </div>

                    ) : (

                      /* =================================================
                          NORMAL ROW
                      ================================================= */

                      <div className="grid gap-4 px-5 py-5 transition-colors duration-300 hover:bg-[#FBF5EC] md:grid-cols-[2fr_1fr_1.3fr_1fr_auto] md:items-center md:px-6">

                        {/* ANNOUNCEMENT */}

                        <div className="flex min-w-0 items-start gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF3F9] transition-transform duration-300 hover:scale-110">
                            <Megaphone className="h-5 w-5 text-[#285A7D]" />
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="truncate text-sm font-black text-[#123D60]">
                                {item.title}
                              </h3>

                              {item.edited && (
                                <span className="rounded-full bg-[#FFF4D8] px-2 py-1 text-[8px] font-black uppercase tracking-wider text-[#C58D16]">
                                  Edited
                                </span>
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-[#7E8D97]">
                              {item.body}
                            </p>

                            {/* Mobile metadata */}

                            <div className="mt-3 flex flex-wrap items-center gap-3 text-[9px] font-bold text-[#9AA6AE] md:hidden">

                              <span className="flex items-center gap-1">
                                <CalendarDays size={10} />
                                {formatDate(item.createdAt)}
                              </span>

                              <span className="flex items-center gap-1">
                                <User size={10} />
                                {getCreatorName(item)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* AUDIENCE */}

                        <div>
                          <span className="inline-flex rounded-full border border-[#D8E5EC] bg-[#EAF3F9] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#285A7D]">
                            {getAudienceLabel(item.audience)}
                          </span>
                        </div>

                        {/* CREATOR */}

                        <div className="hidden min-w-0 items-center gap-2 md:flex">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF0E7]">
                            <User size={13} className="text-[#F47A35]" />
                          </div>

                          <span className="truncate text-[10px] font-bold text-[#7E8D97]">
                            {getCreatorName(item)}
                          </span>
                        </div>

                        {/* DATE */}

                        <div className="hidden md:block">
                          <span className="text-[9px] font-bold text-[#9AA6AE]">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>

                        {/* ACTIONS */}

                        {isAdmin && (
                          <div className="flex items-center gap-1 border-t border-[#EDE3D7] pt-3 md:border-0 md:pt-0">

                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="rounded-xl p-2 text-[#285A7D] transition-all hover:bg-[#EAF3F9] hover:scale-105"
                              title="Edit announcement"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item._id)
                              }
                              className="rounded-xl p-2 text-[#D85D48] transition-all hover:bg-red-50 hover:scale-105"
                              title="Delete announcement"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Announcements;