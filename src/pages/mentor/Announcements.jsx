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
  X,
} from "lucide-react";
import toast from "react-hot-toast";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      setError("");

      const response = await api.delete(`/announcements/${deleteId}`);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to delete announcement.",
        );
      }

      toast.success("Announcement deleted successfully.");

      setDeleteId(null);
      await loadAnnouncements();
    } catch (err) {
      console.error("Delete mentor announcement error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete announcement.",
      );
    } finally {
      setIsDeleting(false);
    }
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
    <div className="min-h-full bg-[#EBF3F6] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl bg-linear-to-r from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-6 shadow-md md:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#00A8CC]/20 p-3 text-[#00A8CC]">
              <Megaphone className="h-7 w-7" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Announcements
              </h1>

              <p className="mt-1 text-xs font-medium text-[#8EA0A8] md:text-sm">
                Stay updated and communicate with your assigned students
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle size={20} />

            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#EAF5F8] p-2.5 text-[#00A8CC]">
                <Bell className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0F2837]">
                  New Announcement
                </h2>

                <p className="mt-0.5 text-xs font-medium text-[#7C8E98]">
                  This announcement will be sent to your assigned students.
                </p>
              </div>
            </div>

            <span className="rounded-lg bg-[#EAF5F8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#00A8CC]">
              Assigned Students
            </span>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                Subject Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. React System Design"
                className="w-full rounded-xl border-none bg-[#F4F7F9] px-4 py-3.5 text-sm font-medium text-[#0F2837] outline-none transition-all focus:ring-2 focus:ring-[#00A8CC]/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                Announcement Body
              </label>
              <textarea
                rows={4}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message here..."
                className="w-full resize-none rounded-xl border-none bg-[#F4F7F9] px-4 py-3.5 text-sm font-medium text-[#0F2837] outline-none transition-all focus:ring-2 focus:ring-[#00A8CC]/50"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPublishing}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#008CAE] disabled:cursor-not-allowed disabled:opacity-50"
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

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#0F2837]">
              Recent Announcements
            </h2>

            <span className="rounded-md bg-[#F4F7F9] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#7C8E98]">
              Total: {announcements.length}
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#00A8CC]" />

              <p className="mt-4 text-xs font-bold text-[#7C8E98]">
                Fetching Updates...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#D2E0E6] bg-[#F4F7F9] p-12 text-center">
              <Megaphone className="mx-auto mb-3 h-10 w-10 text-[#A0B1BA]" />

              <p className="font-bold text-[#0F2837]">No announcements yet.</p>

              <p className="mt-1 text-xs text-[#7C8E98]">
                Check back later for important updates.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full min-w-225 border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 bg-[#F4F7F9]">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                        Announcement
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                        Audience
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                        Posted By
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                        Date
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#4A5D68]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {announcements.map((item) => {
                      const ownAnnouncement = isOwnAnnouncement(item);

                      return (
                        <tr
                          key={item._id}
                          className="transition hover:bg-[#F9FCFD]"
                        >
                          <td className="px-5 py-4">
                            {editingId === item._id ? (
                              <div className="min-w-[320px] space-y-3">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="w-full rounded-lg bg-[#F4F7F9] px-3 py-2 text-sm font-bold text-[#0F2837] outline-none focus:ring-2 focus:ring-[#00A8CC]/50"
                                />

                                <textarea
                                  rows={3}
                                  value={editBody}
                                  onChange={(e) => setEditBody(e.target.value)}
                                  className="w-full resize-none rounded-lg bg-[#F4F7F9] px-3 py-2 text-sm text-[#0F2837] outline-none focus:ring-2 focus:ring-[#00A8CC]/50"
                                />

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={cancelEdit}
                                    disabled={isUpdating}
                                    className="rounded-lg px-3 py-1.5 text-xs font-bold text-[#7C8E98] hover:bg-gray-100"
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleUpdate(item._id)}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 rounded-lg bg-[#97b1c2] px-4 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                                  >
                                    {isUpdating && (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    )}
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="max-w-95">
                                <div className="flex items-center gap-2">
                                  <Megaphone className="h-4 w-4 shrink-0 text-[#00A8CC]" />

                                  <p className="truncate text-sm font-bold text-[#0F2837]">
                                    {item.title}
                                  </p>
                                </div>

                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#7C8E98]">
                                  {item.body}
                                </p>
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold ${
                                item.audience === "mentor"
                                  ? "bg-blue-50 text-blue-600"
                                  : item.audience === "assigned_students"
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-[#EAF5F8] text-[#00A8CC]"
                              }`}
                            >
                              {getAudienceLabel(item.audience)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-[#A0B1BA]" />

                              <span className="text-xs font-semibold text-[#0F2837]">
                                {getCreatorName(item)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-[#A0B1BA]" />

                              <span className="whitespace-nowrap text-xs text-[#7C8E98]">
                                {formatDate(item.createdAt)}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-center">
                            {item.edited ? (
                              <>
                                <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-600">
                                  Edited
                                </span>

                                {item.updatedAt && (
                                  <p className="mt-1 text-[9px] text-amber-500">
                                    {formatDate(item.updatedAt)}
                                  </p>
                                )}
                              </>
                            ) : (
                              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                                Published
                              </span>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {ownAnnouncement && editingId !== item._id ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="rounded-lg p-2 text-blue-500 transition hover:bg-blue-50"
                                  title="Edit announcement"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteId(item._id)}
                                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                  title="Delete announcement"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ) : editingId !== item._id ? (
                              <span className="block text-center text-l text-olive-900">
                                —
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2837]">
                  Confirm Deletion
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4">
              <p className="text-sm font-medium text-[#4A5D68]">
                Are you sure you want to delete this announcement? This action
                cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-bold text-[#4A5D68] transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose-400 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;
