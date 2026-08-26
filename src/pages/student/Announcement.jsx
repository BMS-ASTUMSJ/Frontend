import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  Megaphone,
  CalendarDays,
  Loader2,
  AlertCircle,
  User,
  RefreshCw,
} from "lucide-react";

function Announcements() {
  // ============================================================
  // STATE
  // ============================================================

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD ANNOUNCEMENTS
  // ============================================================

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      if (response.data?.success) {
        setAnnouncements(response.data.announcements || []);
      } else {
        const message =
          response.data?.message || "Failed to load announcements.";

        setAnnouncements([]);
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      console.error("Fetch student announcements error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to load announcements. Please refresh the page.";

      setAnnouncements([]);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // ============================================================
  // DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString(undefined, {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================================
  // TIME
  // ============================================================

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // AUDIENCE
  // ============================================================

  const getAudienceLabel = (audience) => {
    if (audience === "all") {
      return "EVERYONE";
    }

    if (audience === "assigned_students") {
      return "MY MENTOR";
    }

    if (audience === "mentor") {
      return "MENTORS";
    }

    return String(audience || "UNKNOWN").toUpperCase();
  };

  // ============================================================
  // CREATOR
  // ============================================================

  const getCreatorName = (item) => {
    if (!item?.createdBy) {
      return "Admin";
    }

    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      return fullName;
    }

    if (item.createdBy.role === "admin") {
      return "Administration";
    }

    if (item.createdBy.role === "mentor") {
      return "Mentor";
    }

    return "Admin";
  };

  // ============================================================
  // INITIALS
  // ============================================================

  const getInitials = (title) => {
    if (!title) return "AN";

    const words = title.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }

    return title.substring(0, 2).toUpperCase();
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="rounded-2xl border border-[#1b3c47] bg-gradient-to-r from-[#071b23] via-[#0f2b34] to-[#1b3c47] p-6 shadow-lg md:p-8">
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-[#00A8CC] p-3 shadow-lg shadow-[#00A8CC]/20">
              <Megaphone size={28} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Announcements
              </h1>
            </div>
          </div>
        </div>

        {/* ======================================================
            MAIN WHITE CARD
        ====================================================== */}

        <div className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-xl">
          <div className="p-6 md:p-8">
            {/* ==================================================
                DIRECTORY HEADER
            ================================================== */}

            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  Announcement Directory
                </h2>

                <p className="mt-1 text-sm font-medium text-[#8FA3B0]">
                  View the latest announcements and updates
                </p>
              </div>

              <div className="flex items-center gap-5">
                <span className="rounded-full bg-[#E3F5F9] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#00A8CC]">
                  {announcements.length}{" "}
                  {announcements.length === 1
                    ? "Announcement"
                    : "Announcements"}
                </span>

                <button
                  type="button"
                  onClick={loadAnnouncements}
                  disabled={loading}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#00A8CC] transition hover:text-[#0088A6] disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refresh
                </button>
              </div>
            </div>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                <AlertCircle size={17} />

                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            {/* ==================================================
                TABLE
            ================================================== */}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-separate border-spacing-y-4 text-left">
                {/* TABLE HEADER */}

                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8FA3B0]">
                    <th className="px-6 pb-2">Announcement</th>

                    <th className="px-6 pb-2">Audience</th>

                    <th className="px-6 pb-2">Posted By</th>

                    <th className="px-6 pb-2">Published</th>

                    <th className="px-6 pb-2">Status</th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                  {/* LOADING */}

                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center">
                        <Loader2
                          className="inline-block animate-spin text-[#00A8CC]"
                          size={28}
                        />

                        <p className="mt-3 text-xs font-bold text-[#8FA3B0]">
                          Loading announcements...
                        </p>
                      </td>
                    </tr>
                  ) : announcements.length === 0 ? (
                    /* EMPTY */

                    <tr>
                      <td
                        colSpan={5}
                        className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 py-20 text-center font-bold text-[#8FA3B0]"
                      >
                        <Megaphone
                          size={36}
                          className="mx-auto mb-3 text-[#00A8CC]/40"
                        />

                        <p className="text-sm">No announcements found.</p>

                        <p className="mt-1 text-xs font-medium text-[#A8B8C0]">
                          Check back later for important updates.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    /* DATA */

                    announcements.map((item) => {
                      const initials = getInitials(item.title);

                      return (
                        <tr
                          key={item._id}
                          className="group transition-transform hover:translate-x-1"
                        >
                          {/* ==================================
                              ANNOUNCEMENT
                          ================================== */}

                          <td className="rounded-l-2xl border-l-4 border-[#00A8CC] bg-white px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-4">
                              {/* INITIALS */}

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[11px] font-bold text-[#00A8CC] shadow-inner">
                                {initials}
                              </div>

                              {/* CONTENT */}

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="max-w-[350px] truncate text-sm font-bold leading-tight text-[#14222B]">
                                    {item.title}
                                  </p>

                                  {item.edited && (
                                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-black uppercase text-amber-600">
                                      EDITED
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 max-w-[400px] truncate text-[10px] font-medium text-[#8FA3B0]">
                                  {item.body}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ==================================
                              AUDIENCE
                          ================================== */}

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide ${
                                item.audience === "assigned_students"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                                  : item.audience === "mentor"
                                    ? "border-purple-200 bg-purple-50 text-purple-600"
                                    : "border-[#B3E5FC] bg-[#E0F7FA] text-[#00A8CC]"
                              }`}
                            >
                              {getAudienceLabel(item.audience)}
                            </span>
                          </td>

                          {/* ==================================
                              CREATOR
                          ================================== */}

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E3F5F9] text-[#00A8CC]">
                                <User size={13} />
                              </div>

                              <span className="max-w-[130px] truncate text-xs font-bold text-gray-600">
                                {getCreatorName(item)}
                              </span>
                            </div>
                          </td>

                          {/* ==================================
                              DATE
                          ================================== */}

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <p className="text-[11px] font-bold text-[#14222B]">
                              {formatDate(item.createdAt)}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-[#8FA3B0]">
                              {formatTime(item.createdAt)}
                            </p>
                          </td>

                          {/* ==================================
                              STATUS
                          ================================== */}

                          <td className="rounded-r-2xl bg-white px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />

                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                PUBLISHED
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcements;
