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
      <div className="mx-auto max-w-5xl space-y-8">
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

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} />

            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div className="space-y-4 pb-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-[#0A1931]">Recent Feed</h2>

            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Total: {announcements.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-[#B3CFE5]/30 bg-white py-20 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#1A3D63]" />

              <p className="mt-4 text-xs font-bold text-gray-400">
                Fetching Updates...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-[#B3CFE5] bg-white p-16 text-center">
              <Megaphone className="mx-auto mb-4 h-12 w-12 text-[#B3CFE5] opacity-50" />

              <p className="font-bold text-[#0A1931]">No announcements yet.</p>

              <p className="mt-1 text-xs text-gray-400">
                Check back later for important updates.
              </p>
            </div>
          ) : (
            announcements.map((item) => (
              <div
                key={item._id}
                className="group rounded-3xl border border-[#B3CFE5]/30 bg-white p-6 shadow-sm transition-all hover:border-[#4A7FA7] hover:shadow-md"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#B3CFE5]/40 bg-[#F6FAFD] text-[#1A3D63] transition-all group-hover:bg-[#1A3D63] group-hover:text-white">
                    <Megaphone size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-extrabold text-[#0A1931]">
                        {item.title}
                      </h3>

                      <span
                        className={`rounded border px-2 py-0.5 text-[9px] font-black uppercase ${
                          item.audience === "assigned_students"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-[#B3CFE5] bg-[#EAF3F9] text-[#1A3D63]"
                        }`}
                      >
                        {getAudienceLabel(item.audience)}
                      </span>

                      {item.edited && (
                        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black uppercase text-amber-600">
                          Edited
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={12} />

                        {formatDate(item.createdAt)}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <User size={12} />

                        <span>
                          Posted by{" "}
                          <span className="text-[#1A3D63]">
                            {getCreatorName(item)}
                          </span>
                        </span>
                      </div>
                    </div>

                    <p className="mt-4 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-600">
                      {item.body}
                    </p>

                    {item.edited && item.updatedAt && (
                      <p className="mt-2 text-[10px] font-semibold text-amber-500">
                        Edited on {formatDate(item.updatedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
