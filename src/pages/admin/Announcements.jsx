import { useEffect, useState } from "react";
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
} from "lucide-react";

function Announcements() {
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

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [isPublishing, setIsPublishing] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAudience, setEditAudience] = useState("all");
  const [isUpdating, setIsUpdating] = useState(false);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/announcements");

      if (response.data?.success) {
        setAnnouncements(response.data.announcements || []);
      } else {
        setAnnouncements([]);
        setError(response.data?.message || "Failed to load announcements.");
      }
    } catch (err) {
      console.error("Fetch announcements error:", err);

      setAnnouncements([]);

      setError(
        err.response?.data?.message ||
          "Failed to load announcements. Please refresh the page.",
      );
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
          response.data?.message || "Failed to publish announcement.",
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
          "Error publishing announcement.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

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
                  console.error("Delete announcement error:", err);

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
          response.data?.message || "Failed to update announcement.",
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
          "Failed to update announcement.",
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

  const getCreatorName = (item) => {
    if (!item?.createdBy) {
      return "Unknown";
    }

    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Unknown";
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
                Manage announcements for students and mentors
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

        {isAdmin && (
          <div className="rounded-3xl border border-[#B3CFE5]/40 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-[#EAF3F9] p-2.5">
                <Bell className="h-5 w-5 text-[#1A3D63]" />
              </div>

              <h2 className="text-lg font-bold text-[#0A1931]">
                New Announcement
              </h2>
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

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="grid flex-1 grid-cols-2 gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setAudience("all")}
                    className={`rounded-xl py-2.5 text-xs font-black transition-all ${
                      audience === "all"
                        ? "bg-[#0A1931] text-white shadow-md"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    EVERYONE
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudience("mentor")}
                    className={`rounded-xl py-2.5 text-xs font-black transition-all ${
                      audience === "mentor"
                        ? "bg-[#0A1931] text-white shadow-md"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    MENTORS ONLY
                  </button>
                </div>

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

                  {isPublishing ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
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
                Create an announcement to share an update.
              </p>
            </div>
          ) : (
            announcements.map((item) => (
              <div
                key={item._id}
                className="group rounded-3xl border border-[#B3CFE5]/30 bg-white p-6 shadow-sm transition-all hover:border-[#4A7FA7]"
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

                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                        <button
                          type="button"
                          onClick={() => setEditAudience("all")}
                          className={`rounded-lg px-4 py-1.5 text-[10px] font-black ${
                            editAudience === "all"
                              ? "bg-white text-[#0A1931] shadow-sm"
                              : "text-gray-400"
                          }`}
                        >
                          ALL
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditAudience("mentor")}
                          className={`rounded-lg px-4 py-1.5 text-[10px] font-black ${
                            editAudience === "mentor"
                              ? "bg-white text-[#0A1931] shadow-sm"
                              : "text-gray-400"
                          }`}
                        >
                          MENTORS
                        </button>
                      </div>

                      <div className="flex gap-2">
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
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-6 md:flex-row">
                    <div className="flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#B3CFE5]/40 bg-[#F6FAFD] text-[#1A3D63] transition-all group-hover:bg-[#1A3D63] group-hover:text-white">
                        <Megaphone size={22} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-extrabold text-[#0A1931]">
                            {item.title}
                          </h3>

                          <span className="rounded border border-[#B3CFE5] bg-[#EAF3F9] px-2 py-0.5 text-[9px] font-black uppercase text-[#1A3D63]">
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

                    {isAdmin && (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Announcements;
