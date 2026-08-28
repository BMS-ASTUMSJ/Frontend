import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  ClipboardList,
  FileText,
  Trash2,
  Loader2,
  Link as LinkIcon,
  Upload,
  X,
  Pencil,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const allowedExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
  ".txt",
  ".zip",
  ".rar",
];

const AdminAssignment = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructorName: "",
    deadline: "",
    maxScore: 100,
    link: "",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [replaceFiles, setReplaceFiles] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [deadlineError, setDeadlineError] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/assignments");
      setAssignments(res.data?.assignments || []);
    } catch (err) {
      console.error("FETCH ASSIGNMENTS ERROR:", err);
      toast.error(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "deadline") {
      setDeadlineError("");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructorName: "",
      deadline: "",
      maxScore: 100,
      link: "",
    });
    setSelectedFiles([]);
    setEditingAssignment(null);
    setReplaceFiles(false);
    setDeadlineError("");
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const isDeadlineInPast = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime())) return false;
    return deadlineDate.getTime() <= Date.now();
  };

  const formatDateTimeForInput = (date) => {
    if (!date) return "";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "";
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const hours = String(parsedDate.getHours()).padStart(2, "0");
    const minutes = String(parsedDate.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const convertLocalDateTimeToISO = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString();
  };

  const validateFile = (file) => {
    const extension = "." + file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      toast.error(
        `${file.name}: Unsupported file type. Allowed: PDF, Word, PowerPoint, Excel, TXT, ZIP and RAR.`,
      );
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is larger than the 20 MB limit.`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const validFiles = files.filter(validateFile);
    setSelectedFiles((prev) => {
      const existingNames = new Set(
        prev.map((file) => `${file.name}-${file.size}`),
      );
      const newFiles = validFiles.filter(
        (file) => !existingNames.has(`${file.name}-${file.size}`),
      );
      return [...prev, ...newFiles];
    });
    e.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Assignment description is required");
      return;
    }
    if (!formData.instructorName.trim()) {
      toast.error("Instructor name is required");
      return;
    }
    if (!formData.deadline) {
      toast.error("Deadline is required");
      return;
    }
    const deadlineDate = new Date(formData.deadline);
    if (Number.isNaN(deadlineDate.getTime())) {
      toast.error("Please enter a valid deadline");
      return;
    }
    if (!editingAssignment && isDeadlineInPast(formData.deadline)) {
      setDeadlineError(
        "Please select the current date or a future date for the deadline.",
      );
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("instructorName", formData.instructorName.trim());
      data.append("deadline", convertLocalDateTimeToISO(formData.deadline));
      data.append("maxScore", Number(formData.maxScore));
      data.append("link", formData.link.trim());
      selectedFiles.forEach((file) => data.append("files", file));

      if (editingAssignment) {
        data.append("replaceFiles", replaceFiles);
        await api.put(`/assignments/${editingAssignment._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Assignment updated successfully");
      } else {
        await api.post("/assignments", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Assignment published successfully");
      }
      resetForm();
      await fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save assignment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      title: assignment.title || "",
      description: assignment.description || "",
      instructorName: assignment.instructorName || "",
      deadline: formatDateTimeForInput(assignment.deadline),
      maxScore: assignment.maxScore || 100,
      link: assignment.link || "",
    });
    setSelectedFiles([]);
    setReplaceFiles(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTrigger = (id) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await api.delete(`/assignments/${deleteTargetId}`);
      toast.success("Assignment deleted successfully");
      if (editingAssignment?._id === deleteTargetId) resetForm();
      await fetchAssignments();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete assignment");
    } finally {
      setShowDeleteModal(false);
      setDeleteTargetId(null);
    }
  };

  const getBatchName = (assignment) => {
    if (!assignment?.batch) return "No batch";
    return typeof assignment.batch === "object"
      ? assignment.batch.name || "Unknown batch"
      : "Unknown batch";
  };

  const [currentTime] = useState(() => Date.now());
  const isExpired = (deadline) =>
    deadline && new Date(deadline).getTime() < currentTime;

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "#";
    if (fileUrl.startsWith("http")) return fileUrl;
    const baseURL = api.defaults?.baseURL || "";
    const serverURL = baseURL.replace(/\/api\/?$/, "");
    return `${serverURL}${fileUrl}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-8">
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        <div className="bg-linear-to-r from-[#1b3c47] via-[#0f2b34] to-[#071b23] rounded-2xl p-6 md:p-8 shadow-lg border border-[#1b3c47]">
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-[#00A8CC] p-2 shadow-lg shadow-[#00A8CC]/20">
              <ClipboardList size={28} className="text-[#FFFFFF]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#FFFFFF]">
                Assignment Management
              </h1>
            </div>
          </div>
        </div>
        <div className="bg-[#FFFFFF] rounded-2xl shadow-xl overflow-hidden border border-[#B4D7E2]">
          <div className="p-8 border-b border-[#F4F8FA]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  {editingAssignment ? "Modify Assignment" : "New Assignment"}
                </h2>
                <p className="text-sm text-[#8FA3B0] mt-1 font-medium">
                  Configure parameters for student deliverables
                </p>
              </div>
              {editingAssignment && (
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                >
                  <X size={18} /> CANCEL EDITING
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    Project Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none focus:ring-2 focus:ring-[#00A8CC]/10 transition-all"
                    placeholder="e.g. React System Design"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    Instructor Name
                  </label>
                  <input
                    type="text"
                    name="instructorName"
                    value={formData.instructorName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none focus:ring-2 focus:ring-[#00A8CC]/10 transition-all"
                    placeholder="e.g. Abebe Kebede"
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="h-28 w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none focus:ring-2 focus:ring-[#00A8CC]/10 transition-all resize-none"
                    placeholder="Provide detailed project requirements..."
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    <LinkIcon size={14} />
                    Link (optional)
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none focus:ring-2 focus:ring-[#00A8CC]/10"
                    placeholder="https://example.com/resource"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B] mb-2">
                    Assignment
                  </label>
                  <label className="flex cursor-pointer items-center justify-center gap-4 rounded-xl border-2 border-dashed border-[#B4D7E2] bg-[#E3F5F9]/30 p-5 transition hover:bg-[#E3F5F9]/60 group">
                    <div className="rounded-lg bg-white p-2 text-[#00A8CC] group-hover:scale-110 transition-transform">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-[#14222B]">
                        Click to select files from your device
                      </p>
                      <p className="text-[10px] text-[#8FA3B0] font-medium uppercase tracking-tighter">
                        PDF, Word, TXT, ZIP, RAR • Max 20 MB per file
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {selectedFiles.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#B4D7E2] text-[11px] font-bold text-[#14222B]"
                        >
                          <FileText size={14} className="text-[#00A8CC]" />
                          <span className="truncate max-w-37.5">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(idx)}
                            className="text-red-400 hover:text-red-600 ml-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    Deadline
                  </label>

                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    min={!editingAssignment ? getMinDateTime() : undefined}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-xl bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none transition ${
                      deadlineError
                        ? "border border-red-500"
                        : "border border-[#B4D7E2]"
                    }`}
                  />

                  {deadlineError && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {deadlineError}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    Maximum Points
                  </label>
                  <input
                    type="number"
                    name="maxScore"
                    value={formData.maxScore}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] p-3.5 text-sm font-semibold text-[#14222B] outline-none"
                  />
                </div>
              </div>

              {editingAssignment &&
                (editingAssignment.files || []).length > 0 && (
                  <div className="rounded-xl border border-[#B4D7E2] bg-gray-50 p-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      Legacy Assets
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={replaceFiles}
                        onChange={(e) => setReplaceFiles(e.target.checked)}
                        className="rounded border-gray-300 text-[#00A8CC] focus:ring-[#00A8CC]"
                      />
                      <span className="text-xs font-bold text-red-500 group-hover:underline">
                        Purge and replace existing files on update
                      </span>
                    </label>
                  </div>
                )}

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-12 py-4 bg-[#00A8CC] hover:bg-[#0088A6] text-[#FFFFFF] rounded-2xl font-black text-xs transition disabled:opacity-50 uppercase tracking-[0.15em] shadow-xl shadow-[#00A8CC]/20 flex items-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : editingAssignment ? (
                    "Update Assignment"
                  ) : (
                    "Publish Assignment"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  Assignment Directory
                </h2>
              </div>
              <button
                onClick={fetchAssignments}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#00A8CC] hover:text-[#0088A6]"
              >
                <RefreshCw size={14} /> Refresh Terminal
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[#8FA3B0] text-[10px] font-bold uppercase tracking-[0.2em]">
                    <th className="px-6 pb-2">Deliverable</th>
                    <th className="px-6 pb-2">Instructor</th>
                    <th className="px-6 pb-2">Lock Date</th>
                    <th className="px-6 pb-2 text-center">Score</th>
                    <th className="px-6 pb-2 text-center">Resources</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2 text-right">
                      Operational Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-20 text-center">
                        <Loader2 className="animate-spin inline-block text-[#00A8CC]" />
                      </td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-20 text-center text-[#8FA3B0] font-bold bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100"
                      >
                        No assignment blueprints detected.
                      </td>
                    </tr>
                  ) : (
                    assignments.map((item) => {
                      const expired = isExpired(item.deadline);
                      const initials = item.title.substring(0, 2).toUpperCase();
                      return (
                        <tr
                          key={item._id}
                          className="hover:translate-x-1 transition-transform group"
                        >
                          <td className="px-6 py-5 bg-white rounded-l-2xl border-l-4 border-[#00A8CC] shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-[#E3F5F9] text-[#00A8CC] flex items-center justify-center font-bold text-[11px] shadow-inner">
                                {initials}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#14222B] leading-tight">
                                  {item.title}
                                </p>
                                <p className="text-[10px] font-bold text-[#00A8CC] uppercase tracking-tighter mt-1">
                                  {getBatchName(item)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 bg-white shadow-sm text-xs font-bold text-gray-600">
                            {item.instructorName}
                          </td>
                          <td className="px-6 py-5 bg-white shadow-sm">
                            <p className="text-[11px] font-bold text-[#14222B]">
                              {new Date(item.deadline).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-[#8FA3B0] font-medium mt-0.5">
                              {new Date(item.deadline).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </td>
                          <td className="px-6 py-5 bg-white shadow-sm text-center text-sm font-black text-[#14222B]">
                            {item.maxScore}
                          </td>
                          <td className="px-6 py-5 bg-white shadow-sm text-center">
                            {item.link || (item.files || []).length > 0 ? (
                              <div className="flex justify-center gap-2">
                                {item.link && (
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-gray-50 text-gray-400 hover:text-[#00A8CC] rounded-lg transition"
                                    title="External Resource"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                )}

                                {(item.files || []).length > 0 && (
                                  <div className="flex gap-1">
                                    {item.files.map((file, i) => (
                                      <a
                                        key={i}
                                        href={getFileUrl(file.fileUrl)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-gray-50 text-gray-400 hover:text-[#00A8CC] rounded-lg transition"
                                        title={file.originalName}
                                      >
                                        <FileText size={16} />
                                      </a>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gray-400">
                                --
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-5 bg-white shadow-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2.5 h-2.5 rounded-full ring-4 ${expired ? "bg-orange-500 ring-orange-100" : "bg-emerald-500 ring-emerald-100"}`}
                              />
                              <span
                                className={`text-[10px] font-black uppercase tracking-widest ${expired ? "text-orange-600" : "text-emerald-600"}`}
                              >
                                {expired ? "EXPIRED" : "Active"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 bg-white rounded-r-2xl shadow-sm text-right">
                            <div className="flex justify-end gap-5">
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-[#00A8CC] hover:opacity-70 transition flex items-center gap-1.5 text-[10px] font-black uppercase"
                              >
                                <Pencil size={14} /> EDIT
                              </button>
                              <button
                                onClick={() => handleDeleteTrigger(item._id)}
                                className="text-red-500 hover:opacity-70 transition flex items-center gap-1.5 text-[10px] font-black uppercase"
                              >
                                <Trash2 size={14} /> DELETE
                              </button>
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

      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-4xl p-8 shadow-2xl border border-[#B4D7E2] animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <h3 className="text-2xl font-bold text-[#14222B] mb-2">
                Delete Assignment?
              </h3>
              <p className="text-[#8FA3B0] text-sm leading-relaxed mb-8 px-4">
                This action cannot be undone. All associated files and student
                submissions data for this assignment will be permanently
                removed.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#B4D7E2] text-sm font-bold text-[#1C2E3A] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-sm font-black uppercase hover:bg-rose-400 shadow-lg shadow-mist-300 transition"
                >
                  DELETE NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignment;
