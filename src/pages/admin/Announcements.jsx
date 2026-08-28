import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";

import {
  Megaphone,
  Send,
  Trash2,
  Pencil,
  Loader2,
  AlertCircle,
  User,
  X,
  RefreshCw,
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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
      toast.error("Announcement title is required.");
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

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditTitle(item.title || "");
    setEditBody(item.body || "");
    setEditAudience(item.audience || "all");

    setError("");

    setTimeout(() => {
      const element = document.getElementById(`announcement-edit-${item._id}`);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
    setEditAudience("all");
  };

  const handleUpdate = async (id) => {
    if (!editTitle.trim()) {
      toast.error("Announcement title is required.");
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

  const handleDeleteTrigger = (id) => {
    if (!id) return;

    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setError("");

      const response = await api.delete(`/announcements/${deleteTargetId}`);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to delete announcement.",
        );
      }

      toast.success("Announcement deleted successfully.");

      if (editingId === deleteTargetId) {
        cancelEdit();
      }

      await loadAnnouncements();
    } catch (err) {
      console.error("Delete announcement error:", err);

      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete announcement.",
      );
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

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

  const getAudienceLabel = (announcementAudience) => {
    if (announcementAudience === "all") {
      return "EVERYONE";
    }

    if (announcementAudience === "mentor") {
      return "MENTORS";
    }

    if (announcementAudience === "assigned_students") {
      return "ASSIGNED STUDENTS";
    }

    return String(announcementAudience || "UNKNOWN").toUpperCase();
  };

  const getCreatorName = (item) => {
    if (!item?.createdBy) {
      return "Admin";
    }

    const firstName = item.createdBy.firstName || "";
    const lastName = item.createdBy.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Admin";
  };

  const getInitials = (titleValue) => {
    if (!titleValue) return "AN";

    const words = titleValue.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }

    return titleValue.substring(0, 2).toUpperCase();
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
                Announcement Management
              </h1>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-xl">
          {isAdmin && (
            <div className="border-b border-[#F4F8FA] p-6 md:p-8">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#14222B]">
                    {editingId ? "Modify Announcement" : "New Announcement"}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-[#8FA3B0]">
                    {editingId
                      ? "Update the selected announcement"
                      : "Create and publish an announcement"}
                  </p>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={isUpdating}
                    className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-50 disabled:opacity-50"
                  >
                    <X size={18} />
                    CANCEL EDITING
                  </button>
                )}
              </div>

              {!editingId ? (
                <form onSubmit={handlePublish} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                        Announcement Title
                      </label>

                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="e.g. Important Bootcamp Update"
                        className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none transition-all focus:ring-2 focus:ring-[#00A8CC]/10"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                        Message
                      </label>

                      <textarea
                        rows={5}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                        placeholder="Write your announcement message..."
                        className="w-full resize-none rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none transition-all focus:ring-2 focus:ring-[#00A8CC]/10"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                        Audience
                      </label>

                      <div className="flex w-full max-w-md rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-1">
                        <button
                          type="button"
                          onClick={() => setAudience("all")}
                          className={`flex-1 rounded-lg px-5 py-3 text-[10px] font-black transition-all ${
                            audience === "all"
                              ? "bg-white text-[#00A8CC] border border-[#00A8CC] shadow-sm"
                              : "text-gray-500 hover:text-[#0D2A38]"
                          }`}
                        >
                          EVERYONE
                        </button>

                        <button
                          type="button"
                          onClick={() => setAudience("mentor")}
                          className={`flex-1 rounded-lg px-5 py-3 text-[10px] font-black transition-all ${
                            audience === "mentor"
                              ? "bg-white border border-[#00A8CC] text-[#00A8CC] shadow-sm"
                              : "text-gray-500 hover:text-[#0D2A38]"
                          }`}
                        >
                          MENTORS ONLY
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={isPublishing}
                      className="flex items-center gap-2 rounded-2xl bg-[#00A8CC] px-10 py-4 text-xs font-black uppercase tracking-[0.15em] text-white shadow-xl shadow-[#00A8CC]/20 transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Publish Announcement
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  id={`announcement-edit-${editingId}`}
                  className="space-y-6"
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                        Announcement Title
                      </label>

                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none focus:ring-2 focus:ring-[#00A8CC]/10"
                        placeholder="Announcement title"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                        Message
                      </label>

                      <textarea
                        rows={5}
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="w-full resize-none rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none focus:ring-2 focus:ring-[#00A8CC]/10"
                        placeholder="Announcement message"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                        Audience
                      </label>

                      <div className="flex w-full max-w-md rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-1">
                        <button
                          type="button"
                          onClick={() => setEditAudience("all")}
                          className={`flex-1 rounded-lg px-5 py-3 text-[10px] font-black transition-all ${
                            editAudience === "all"
                              ? "bg-[#00A8CC] text-white"
                              : "text-gray-500"
                          }`}
                        >
                          EVERYONE
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditAudience("mentor")}
                          className={`flex-1 rounded-lg px-5 py-3 text-[10px] font-black transition-all ${
                            editAudience === "mentor"
                              ? "bg-[#00A8CC] text-white"
                              : "text-gray-500"
                          }`}
                        >
                          MENTORS ONLY
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={isUpdating}
                      className="rounded-xl border border-[#B4D7E2] px-6 py-3 text-xs font-bold text-[#14222B] transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      CANCEL
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdate(editingId)}
                      disabled={isUpdating}
                      className="flex items-center gap-2 rounded-xl bg-[#00A8CC] px-8 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-[#00A8CC]/20 transition hover:bg-[#0088A6] disabled:opacity-50"
                    >
                      {isUpdating && (
                        <Loader2 size={16} className="animate-spin" />
                      )}

                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-6 md:p-8">
            <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  Announcement Directory
                </h2>

                <p className="mt-1 text-sm font-medium text-[#8FA3B0]">
                  Manage published announcements
                </p>
              </div>

              <button
                type="button"
                onClick={loadAnnouncements}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#00A8CC] transition hover:text-[#0088A6]"
              >
                <RefreshCw size={14} />
                Refresh Announcements
              </button>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
                <AlertCircle size={17} />

                <span className="text-xs font-bold">{error}</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5 border-separate border-spacing-y-4 text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8FA3B0]">
                    <th className="px-6 pb-2">Announcement</th>

                    <th className="px-6 pb-2">Audience</th>

                    <th className="px-6 pb-2">Posted By</th>

                    <th className="px-6 pb-2">Published</th>

                    <th className="px-6 pb-2">Status</th>

                    {isAdmin && (
                      <th className="px-6 pb-2 text-right">
                        Operational Actions
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 6 : 5}
                        className="py-20 text-center"
                      >
                        <Loader2 className="inline-block animate-spin text-[#00A8CC]" />

                        <p className="mt-3 text-xs font-bold text-[#8FA3B0]">
                          Loading announcements...
                        </p>
                      </td>
                    </tr>
                  ) : announcements.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 6 : 5}
                        className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 py-20 text-center font-bold text-[#8FA3B0]"
                      >
                        <Megaphone
                          size={36}
                          className="mx-auto mb-3 text-[#00A8CC]/40"
                        />
                        No announcements found.
                      </td>
                    </tr>
                  ) : (
                    announcements.map((item) => {
                      const initials = getInitials(item.title);

                      return (
                        <tr
                          key={item._id}
                          className="group transition-transform hover:translate-x-1"
                        >
                          <td className="rounded-l-2xl border-l-4 border-[#00A8CC] bg-white px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[11px] font-bold text-[#00A8CC] shadow-inner">
                                {initials}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="max-w-75 truncate text-sm font-bold leading-tight text-[#14222B]">
                                    {item.title}
                                  </p>

                                  {item.edited && (
                                    <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[8px] font-black uppercase text-amber-600">
                                      EDITED
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 max-w-90 truncate text-[10px] font-medium text-[#8FA3B0]">
                                  {item.body}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide ${
                                item.audience === "mentor"
                                  ? "border-purple-200 bg-purple-50 text-purple-600"
                                  : "border-[#B3E5FC] bg-[#E0F7FA] text-[#00A8CC]"
                              }`}
                            >
                              {getAudienceLabel(item.audience)}
                            </span>
                          </td>

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E3F5F9] text-[#00A8CC]">
                                <User size={13} />
                              </div>

                              <span className="max-w-32.5 truncate text-xs font-bold text-gray-600">
                                {getCreatorName(item)}
                              </span>
                            </div>
                          </td>

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <p className="text-[11px] font-bold text-[#14222B]">
                              {formatDate(item.createdAt)}
                            </p>

                            <p className="mt-0.5 text-[10px] font-medium text-[#8FA3B0]">
                              {formatTime(item.createdAt)}
                            </p>
                          </td>

                          <td className="bg-white px-6 py-5 shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />

                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                PUBLISHED
                              </span>
                            </div>
                          </td>

                          {isAdmin && (
                            <td className="rounded-r-2xl bg-white px-6 py-5 text-right shadow-sm">
                              <div className="flex justify-end gap-5">
                                <button
                                  type="button"
                                  onClick={() => startEdit(item)}
                                  className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#00A8CC] transition hover:opacity-70"
                                >
                                  <Pencil size={14} />
                                  EDIT
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteTrigger(item._id)}
                                  className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 transition hover:opacity-70"
                                >
                                  <Trash2 size={14} />
                                  DELETE
                                </button>
                              </div>
                            </td>
                          )}
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-[#14222B]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-4xl border border-[#B4D7E2] bg-white p-8 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <h3 className="mb-2 text-2xl font-bold text-[#14222B]">
                Delete Announcement?
              </h3>

              <p className="mb-8 px-4 text-sm leading-relaxed text-[#8FA3B0]">
                This action cannot be undone. This announcement will be
                permanently removed from the system.
              </p>

              <div className="flex w-full gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTargetId(null);
                  }}
                  className="flex-1 rounded-xl border border-[#B4D7E2] py-2 text-sm font-bold text-[#1C2E3A] transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-rose-500 py-2 text-sm font-black uppercase text-white shadow-lg shadow-rose-200 transition hover:bg-rose-600"
                >
                  DELETE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;
