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

  // =====================================================
  // DELETE
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

  // =====================================================
  // AUDIENCE
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
    <div className="min-h-full bg-[#F6FAFD] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="rounded-2xl bg-[#0A1931] px-5 py-4 shadow-sm md:px-6">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#1A3D63] p-3">
              <Megaphone className="h-5 w-5 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-white">
                Announcements
              </h1>

              <p className="mt-0.5 text-xs font-medium text-[#B3CFE5]">
                Manage announcements for students and mentors
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle size={17} />

            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {/* =====================================================
            NEW ANNOUNCEMENT
            NO BACKGROUND CARD
        ===================================================== */}

        {isAdmin && (
          <section className="px-1 py-2 md:px-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-[#EAF3F9] p-2">
                <Bell className="h-4 w-4 text-[#1A3D63]" />
              </div>

              <div>
                <h2 className="text-base font-black text-[#0A1931]">
                  New Announcement
                </h2>

                <p className="text-[11px] text-gray-400">
                  Create and publish an update
                </p>
              </div>
            </div>

            <form onSubmit={handlePublish} className="space-y-3">
              {/* TITLE */}

              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Subject Title"
                className="w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/30"
              />

              {/* MESSAGE */}

              <textarea
                rows={3}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message here..."
                className="w-full resize-none rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/30"
              />

              {/* CONTROLS */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full rounded-xl border border-gray-200 bg-white p-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setAudience("all")}
                    className={`flex-1 rounded-lg px-5 py-2 text-[10px] font-black transition-all sm:flex-none ${
                      audience === "all"
                        ? "bg-[#0A1931] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    EVERYONE
                  </button>

                  <button
                    type="button"
                    onClick={() => setAudience("mentor")}
                    className={`flex-1 rounded-lg px-5 py-2 text-[10px] font-black transition-all sm:flex-none ${
                      audience === "mentor"
                        ? "bg-[#0A1931] text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    MENTORS ONLY
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isPublishing}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-7 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPublishing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}

                  {isPublishing ? "Publishing..." : "Publish"}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* =====================================================
            RECENT FEED
        ===================================================== */}

        <section className="space-y-3 pb-10">
          <div className="flex items-center justify-between border-b border-[#B3CFE5]/40 px-1 pb-3">
            <div>
              <h2 className="text-base font-black text-[#0A1931]">
                Recent Feed
              </h2>

              <p className="text-[10px] text-gray-400">Latest announcements</p>
            </div>

            <span className="rounded-lg bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 shadow-sm">
              Total: {announcements.length}
            </span>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#1A3D63]" />

              <p className="mt-3 text-[11px] font-bold text-gray-400">
                Fetching Updates...
              </p>
            </div>
          ) : announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-white p-10 text-center">
              <Megaphone className="mx-auto mb-3 h-9 w-9 text-[#B3CFE5]" />

              <p className="text-sm font-bold text-[#0A1931]">
                No announcements yet.
              </p>

              <p className="mt-1 text-[11px] text-gray-400">
                Create an announcement to share an update.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[2fr_1fr_1.3fr_1fr_auto] items-center gap-4 border-b border-gray-200 bg-[#F6FAFD] px-4 py-2.5 text-[9px] font-black uppercase tracking-wider text-gray-400 md:grid">
                <span>Announcement</span>
                <span>Audience</span>
                <span>Posted By</span>
                <span>Date</span>
                <span className="text-right">Actions</span>
              </div>

              {/* TABLE ROWS */}

              <div className="divide-y divide-gray-100">
                {announcements.map((item) => (
                  <div key={item._id}>
                    {editingId === item._id ? (
                      /* =================================================
                         EDIT ROW
                      ================================================= */

                      <div className="space-y-3 bg-[#F6FAFD] p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-[#4A7FA7]"
                            placeholder="Announcement title"
                          />

                          <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
                            <button
                              type="button"
                              onClick={() => setEditAudience("all")}
                              className={`flex-1 rounded-md py-1.5 text-[9px] font-black ${
                                editAudience === "all"
                                  ? "bg-[#0A1931] text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              ALL
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditAudience("mentor")}
                              className={`flex-1 rounded-md py-1.5 text-[9px] font-black ${
                                editAudience === "mentor"
                                  ? "bg-[#0A1931] text-white"
                                  : "text-gray-400"
                              }`}
                            >
                              MENTORS
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={3}
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                          placeholder="Announcement message"
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isUpdating}
                            className="rounded-lg px-4 py-2 text-[10px] font-bold text-gray-500 hover:bg-white"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdate(item._id)}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 rounded-lg bg-[#0A1931] px-4 py-2 text-[10px] font-bold text-white disabled:opacity-50"
                          >
                            {isUpdating && (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            )}
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* =================================================
                         NORMAL ROW
                      ================================================= */

                      <div className="grid gap-3 px-4 py-3 transition-colors hover:bg-[#F6FAFD] md:grid-cols-[2fr_1fr_1.3fr_1fr_auto] md:items-center md:gap-4">
                        {/* ANNOUNCEMENT */}

                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF3F9] text-[#1A3D63]">
                            <Megaphone className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-xs font-extrabold text-[#0A1931]">
                                {item.title}
                              </h3>

                              {item.edited && (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-600">
                                  Edited
                                </span>
                              )}
                            </div>

                            <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-[11px] leading-relaxed text-gray-500">
                              {item.body}
                            </p>

                            {/* MOBILE META */}

                            <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] font-bold text-gray-400 md:hidden">
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
                          <span className="inline-flex rounded-md border border-[#B3CFE5] bg-[#EAF3F9] px-2 py-1 text-[9px] font-black uppercase text-[#1A3D63]">
                            {getAudienceLabel(item.audience)}
                          </span>
                        </div>

                        {/* CREATOR */}

                        <div className="hidden min-w-0 items-center gap-2 md:flex">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF3F9] text-[#1A3D63]">
                            <User size={11} />
                          </div>

                          <span className="truncate text-[10px] font-bold text-gray-500">
                            {getCreatorName(item)}
                          </span>
                        </div>

                        {/* DATE */}

                        <div className="hidden md:block">
                          <span className="text-[9px] font-bold text-gray-400">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>

                        {/* ACTIONS */}

                        {isAdmin && (
                          <div className="flex items-center gap-1 border-t border-gray-100 pt-2 md:border-0 md:pt-0">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              className="rounded-lg p-1.5 text-blue-500 transition-colors hover:bg-blue-50"
                              title="Edit announcement"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(item._id)}
                              className="rounded-lg p-1.5 text-red-400 transition-colors hover:bg-red-50"
                              title="Delete announcement"
                            >
                              <Trash2 size={14} />
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
