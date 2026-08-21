import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  Megaphone,
  CalendarDays,
  Loader2,
  AlertCircle,
  User,
} from "lucide-react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getAudienceLabel = (audience) => {
    if (audience === "all") {
      return "Everyone";
    }

    if (audience === "assigned_students") {
      return "My Mentor";
    }

    return audience;
  };

  const getCreatorName = (item) => {
    if (!item?.createdBy) {
      return "Administration";
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

    return "Administration";
  };

  return (
    <div className="min-h-full bg-[#F6FAFD] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="rounded-3xl bg-[#0A1931] p-6 shadow-xl md:p-8">
          <div className="flex items-center gap-5">
            <div className="rounded-2xl border border-white/5 bg-[#1A3D63] p-4 shadow-inner">
              <Megaphone className="h-7 w-7 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Announcements
              </h1>

              <p className="mt-1 text-sm font-medium text-[#B3CFE5]">
                Latest updates and important information
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} />

            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4 pb-10">
          {/* Feed Header */}
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#0A1931]">Recent Feed</h2>

            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Total: {announcements.length}
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="rounded-3xl border border-[#B3CFE5]/30 bg-white py-20 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1A3D63]" />

              <p className="mt-4 text-xs font-bold text-gray-400">
                Fetching Updates...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            /* Empty */
            <div className="rounded-3xl border-2 border-dashed border-[#B3CFE5] bg-white p-16 text-center">
              <Megaphone className="mx-auto mb-4 h-12 w-12 text-[#B3CFE5] opacity-50" />

              <p className="font-bold text-[#0A1931]">No announcements yet.</p>

              <p className="mt-1 text-xs text-gray-400">
                Check back later for important updates.
              </p>
            </div>
          ) : (
            /* Table */
            <div className="overflow-hidden rounded-3xl border border-[#B3CFE5]/40 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#B3CFE5]/40 bg-[#F6FAFD]">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        Announcement
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        Audience
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        Posted By
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        Date
                      </th>

                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {announcements.map((item) => (
                      <tr
                        key={item._id}
                        className="group border-b border-[#E2E8F0] last:border-b-0 transition-colors hover:bg-[#F8FBFD]"
                      >
                        {/* Announcement */}
                        <td className="max-w-md px-6 py-5 align-top">
                          <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#B3CFE5]/40 bg-[#F6FAFD] text-[#1A3D63] transition-all group-hover:border-[#1A3D63] group-hover:bg-[#1A3D63] group-hover:text-white">
                              <Megaphone size={20} />
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-sm font-extrabold text-[#0A1931]">
                                {item.title}
                              </h3>

                              <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">
                                {item.body}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Audience */}
                        <td className="px-6 py-5 align-top">
                          <span
                            className={`inline-flex rounded border px-2.5 py-1 text-[9px] font-black uppercase ${
                              item.audience === "assigned_students"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-[#B3CFE5] bg-[#EAF3F9] text-[#1A3D63]"
                            }`}
                          >
                            {getAudienceLabel(item.audience)}
                          </span>
                        </td>

                        {/* Posted By */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF3F9] text-[#1A3D63]">
                              <User size={14} />
                            </div>

                            <div>
                              <p className="text-xs font-bold text-[#1A3D63]">
                                {getCreatorName(item)}
                              </p>

                              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">
                                Posted by
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex items-start gap-2">
                            <CalendarDays
                              size={14}
                              className="mt-0.5 flex-shrink-0 text-[#1A3D63]"
                            />

                            <span className="whitespace-nowrap text-xs font-semibold text-[#64748B]">
                              {formatDate(item.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5 align-top">
                          {item.edited ? (
                            <div>
                              <span className="inline-flex rounded border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase text-amber-600">
                                Edited
                              </span>

                              {item.updatedAt && (
                                <p className="mt-2 whitespace-nowrap text-[9px] font-semibold text-amber-500">
                                  {formatDate(item.updatedAt)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex rounded border border-green-200 bg-green-50 px-2.5 py-1 text-[9px] font-black uppercase text-green-700">
                              Published
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
