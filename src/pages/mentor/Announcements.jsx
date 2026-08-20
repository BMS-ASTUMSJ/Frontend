import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Megaphone,
  CalendarDays,
  Loader2,
  AlertCircle,
  Bell,
  Send,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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
      console.error("Fetch mentor announcements error:", err);

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

    try {
      setIsPublishing(true);
      setError("");

      const response = await api.post("/announcements", {
        title: title.trim(),
        body: body.trim(),
        audience: "assigned_students",
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to publish announcement.",
        );
      }

      setTitle("");
      setBody("");

      toast.success("Announcement sent to your assigned students.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Publish mentor announcement error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to publish announcement.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditTitle(item.title || "");
    setEditBody(item.body || "");
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
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

    try {
      setIsUpdating(true);
      setError("");

      const response = await api.patch(`/announcements/${id}`, {
        title: editTitle.trim(),
        body: editBody.trim(),
        audience: "assigned_students",
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to update announcement.",
        );
      }

      cancelEdit();

      toast.success("Announcement updated successfully.");

      await loadAnnouncements();
    } catch (err) {
      console.error("Update mentor announcement error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to update announcement.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // =====================================================
  // DELETE ANNOUNCEMENT
  // =====================================================
  const handleDelete = (id) => {
    if (!id) return;

    toast(
      (t) => (
        <div className="w-[320px]">
          <p className="mb-2 text-sm font-bold text-[#0A1931]">
            Delete this announcement?
          </p>

          <p className="mb-4 text-xs text-gray-500">
            This action cannot be undone.
          </p>

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

                  const response = await api.delete(`/announcements/${id}`);

                  if (!response.data?.success) {
                    throw new Error(
                      response.data?.message ||
                        "Failed to delete announcement.",
                    );
                  }

                  toast.success("Announcement deleted successfully.");

                  await loadAnnouncements();
                } catch (err) {
                  console.error("Delete mentor announcement error:", err);

                  toast.error(
                    err.response?.data?.message ||
                      err.message ||
                      "Failed to delete announcement.",
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
      },
    );
  };

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

    if (audience === "mentor") {
      return "Mentors Only";
    }

    if (audience === "assigned_students") {
      return "Assigned Students";
    }

    return audience;
  };

  const getCreatorName = (item) => {
    if (!item?.createdBy) {
      return "Unknown";
    }

    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Unknown";
  };

  const isOwnAnnouncement = (item) => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser || !item?.createdBy) {
      return false;
    }

    try {
      const user = JSON.parse(storedUser);

      const userId = user?._id || user?.id || user?.userId;

      const creatorId =
        typeof item.createdBy === "object"
          ? item.createdBy?._id
          : item.createdBy;

      if (!userId || !creatorId) {
        return false;
      }

      return String(userId) === String(creatorId);
    } catch (error) {
      console.error("Failed to check announcement ownership:", error);

      return false;
    }
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
                Stay updated and communicate with your assigned students
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

        <div className="rounded-3xl border border-[#B3CFE5]/40 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#EAF3F9] p-2.5">
                <Bell className="h-5 w-5 text-[#1A3D63]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  New Announcement
                </h2>

                <p className="mt-0.5 text-xs font-medium text-gray-400">
                  This announcement will be sent to your assigned students.
                </p>
              </div>
            </div>

            <span className="rounded-xl bg-[#EAF3F9] px-3 py-2 text-[10px] font-black uppercase text-[#1A3D63]">
              Assigned Students
            </span>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Subject Title"
              className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#4A7FA7] focus:ring-4 focus:ring-[#B3CFE5]/20"
            />

            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Type your message here..."
              className="w-full resize-none rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none transition-all focus:border-[#4A7FA7]"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPublishing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#4A7FA7] px-10 py-3 text-sm font-bold text-white transition-all hover:bg-[#1A3D63] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                {isPublishing ? "Publishing..." : "Send to Assigned Students"}
              </button>
            </div>
          </form>
        </div>

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
          announcements.map((item) => {
            const ownAnnouncement = isOwnAnnouncement(item);

            return (
              <div
                key={item._id}
                className="group rounded-3xl border border-[#B3CFE5]/30 bg-white p-6 shadow-sm transition-all hover:border-[#4A7FA7] hover:shadow-md"
              >
                {editingId === item._id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-xl border p-3 font-bold outline-none focus:border-[#4A7FA7]"
                    />

                    <textarea
                      rows={3}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      className="w-full rounded-xl border p-3 outline-none focus:border-[#4A7FA7]"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                        className="px-4 text-xs font-bold text-gray-400"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdate(item._id)}
                        disabled={isUpdating}
                        className="flex items-center gap-2 rounded-xl bg-[#0A1931] px-6 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {isUpdating && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-6 md:flex-row">
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
                              item.audience === "mentor"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : item.audience === "assigned_students"
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

                          {item.createdBy && (
                            <div className="flex items-center gap-1.5">
                              <User size={12} />

                              <span>
                                Posted by{" "}
                                <span className="text-[#1A3D63]">
                                  {getCreatorName(item)}
                                </span>
                              </span>
                            </div>
                          )}
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

                    {ownAnnouncement && (
                      <div className="flex gap-2 border-t border-gray-100 pt-4 md:flex-col md:border-l md:border-t-0 md:pl-4 md:pt-0">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-xl p-2 text-blue-500 transition-colors hover:bg-blue-50"
                          title="Edit announcement"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="rounded-xl p-2 text-red-400 transition-colors hover:bg-red-50"
                          title="Delete announcement"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Announcements;
