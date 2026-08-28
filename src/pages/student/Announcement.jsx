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
  X,
  Eye,
  Clock,
} from "lucide-react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedAnnouncement(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAudienceLabel = (audience) => {
    if (audience === "all") return "EVERYONE";
    if (audience === "assigned_students") return "MY MENTOR";
    if (audience === "mentor") return "MENTORS";
    return String(audience || "UNKNOWN").toUpperCase();
  };

  const getCreatorName = (item) => {
    if (!item?.createdBy) return "Admin";
    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) return fullName;
    if (item.createdBy.role === "admin") return "Administration";
    if (item.createdBy.role === "mentor") return "Mentor";
    return "Admin";
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <div className="rounded-2xl border border-[#1b3c47] bg-linear-to-r from-[#071b23] via-[#0f2b34] to-[#1b3c47] p-6 shadow-lg md:p-8">
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-[#00A8CC] p-3 shadow-lg shadow-[#00A8CC]/20">
              <Megaphone size={28} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Announcements
              </h1>
              <p className="mt-1 text-xs text-[#8FA3B0]">
                Stay up to date with the latest posts and notifications.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-xl">
          <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  Announcement Directory
                </h2>
                <p className="mt-1 text-sm font-medium text-[#8FA3B0]">
                  Click any announcement row to open and read full details
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

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                <AlertCircle size={17} />
                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-separate border-spacing-y-4 text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8FA3B0]">
                    <th className="px-6 pb-2">Announcement</th>
                    <th className="px-6 pb-2">Audience</th>
                    <th className="px-6 pb-2">Posted By</th>
                    <th className="px-6 pb-2">Published</th>
                    <th className="px-6 pb-2 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
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
                    announcements.map((item) => (
                      <tr
                        key={item._id}
                        onClick={() => setSelectedAnnouncement(item)}
                        className="group cursor-pointer transition-all hover:-translate-y-0.5"
                      >
                        <td className="rounded-l-2xl border-l-4 border-[#00A8CC] bg-white px-6 py-5 shadow-sm group-hover:bg-[#F9FDFE]">
                          <div className="flex items-center gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="max-w-[320px] truncate text-sm font-bold leading-tight text-[#14222B] group-hover:text-[#00A8CC]">
                                  {item.title}
                                </p>

                                {item.edited && (
                                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase text-amber-600">
                                    EDITED
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 max-w-90 truncate text-[11px] font-medium text-[#8FA3B0]">
                                {item.body}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="bg-white px-6 py-5 shadow-sm group-hover:bg-[#F9FDFE]">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wide ${
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

                        <td className="bg-white px-6 py-5 shadow-sm group-hover:bg-[#F9FDFE]">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E3F5F9] text-[#00A8CC]">
                              <User size={13} />
                            </div>
                            <span className="max-w-32.5 truncate text-xs font-bold text-gray-600">
                              {getCreatorName(item)}
                            </span>
                          </div>
                        </td>

                        <td className="bg-white px-6 py-5 shadow-sm group-hover:bg-[#F9FDFE]">
                          <p className="text-[11px] font-bold text-[#14222B]">
                            {formatDate(item.createdAt)}
                          </p>
                          <p className="mt-0.5 text-[10px] font-medium text-[#8FA3B0]">
                            {formatTime(item.createdAt)}
                          </p>
                        </td>

                        <td className="rounded-r-2xl bg-white px-6 py-5 shadow-sm group-hover:bg-[#F9FDFE]">
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              className="flex items-center gap-1.5 rounded-lg bg-[#E3F5F9] px-3 py-1.5 text-xs font-bold text-[#00A8CC] transition hover:bg-[#00A8CC] hover:text-white"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedAnnouncement && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b23]/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-100 bg-linear-to-r from-[#071b23] to-[#1b3c47] p-6 text-white">
              <div className="space-y-2 pr-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide ${
                      selectedAnnouncement.audience === "assigned_students"
                        ? "border-emerald-300 bg-emerald-500/20 text-emerald-300"
                        : selectedAnnouncement.audience === "mentor"
                          ? "border-purple-300 bg-purple-500/20 text-purple-300"
                          : "border-[#B3E5FC] bg-[#00A8CC]/20 text-[#8FE4F8]"
                    }`}
                  >
                    {getAudienceLabel(selectedAnnouncement.audience)}
                  </span>

                  {selectedAnnouncement.edited && (
                    <span className="rounded-md border border-amber-300/40 bg-amber-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-amber-300">
                      EDITED
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold leading-snug">
                  {selectedAnnouncement.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-lg p-1 text-gray-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 bg-[#F4F8FA] px-6 py-3 text-xs text-gray-500">
              <div className="flex items-center gap-2 font-medium">
                <User size={14} className="text-[#00A8CC]" />
                <span>Posted by:</span>
                <strong className="text-gray-800">
                  {getCreatorName(selectedAnnouncement)}
                </strong>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 font-medium">
                  <CalendarDays size={14} className="text-[#00A8CC]" />
                  <span>{formatDate(selectedAnnouncement.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-[#00A8CC]" />
                  <span>{formatTime(selectedAnnouncement.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6 md:p-8">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#14222B]">
                {selectedAnnouncement.body}
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-100 bg-[#F4F8FA] px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedAnnouncement(null)}
                className="rounded-xl bg-[#00A8CC] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#0088A6]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;
