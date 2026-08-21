import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  ClipboardList,
  PlusCircle,
  Calendar,
  Trophy,
  FileText,
  Trash2,
  Loader2,
  Users,
  Link as LinkIcon,
  Upload,
  X,
  Pencil,
  Download,
  ExternalLink,
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
  const [deleteAssignment, setDeleteAssignment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/assignments");

      setAssignments(res.data.assignments || []);
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

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

    if (Number(formData.maxScore) <= 0) {
      toast.error("Maximum score must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);

      const data = new FormData();

      data.append("title", formData.title.trim());
      data.append("description", formData.description.trim());
      data.append("instructorName", formData.instructorName.trim());
      data.append("deadline", formData.deadline);
      data.append("maxScore", Number(formData.maxScore));
      data.append("link", formData.link.trim());

      selectedFiles.forEach((file) => {
        data.append("files", file);
      });

      if (editingAssignment) {
        data.append("replaceFiles", replaceFiles);

        await api.patch(`/assignments/${editingAssignment._id}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Assignment updated successfully");
      } else {
        await api.post("/assignments", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Assignment published successfully");
      }

      resetForm();

      await fetchAssignments();
    } catch (err) {
      console.error("ASSIGNMENT SAVE ERROR:", err);

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
      deadline: formatDateForInput(assignment.deadline),
      maxScore: assignment.maxScore || 100,
      link: assignment.link || "",
    });

    setSelectedFiles([]);
    setReplaceFiles(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    if (!id) return;

    try {
      setDeleting(true);

      await api.delete(`/assignments/${id}`);

      toast.success("Assignment deleted successfully");

      if (editingAssignment?._id === id) {
        resetForm();
      }

      setDeleteAssignment(null);

      await fetchAssignments();
    } catch (err) {
      console.error("DELETE ASSIGNMENT ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to delete assignment");
    } finally {
      setDeleting(false);
    }
  };

  const getBatchName = (assignment) => {
    if (!assignment?.batch) {
      return "No batch";
    }

    if (typeof assignment.batch === "object") {
      return assignment.batch.name || "Unknown batch";
    }

    return "Unknown batch";
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;

    return new Date(deadline) < new Date();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "#";

    const baseURL = api.defaults?.baseURL || "";

    const serverURL = baseURL.replace(/\/api\/?$/, "");

    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }

    return `${serverURL}${fileUrl}`;
  };

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#B3CFE5] pb-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center bg-[#0A1931]">
              <ClipboardList size={24} className="text-[#B3CFE5]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0A1931]">
                Assignment Management
              </h1>

              <p className="text-sm text-[#7A7F85]">
                Create and manage student assignments.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A3D63]">
            <Trophy size={18} />
            {assignments.length} Assignment
            {assignments.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* CREATE / EDIT */}

        <section className="mb-10">
          <div className="mb-5 flex items-center justify-between border-b border-[#B3CFE5] pb-3">
            <div className="flex items-center gap-2.5">
              {editingAssignment ? (
                <Pencil size={18} className="text-[#1A3D63]" />
              ) : (
                <PlusCircle size={18} className="text-[#1A3D63]" />
              )}

              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  {editingAssignment ? "Edit Assignment" : "Create Assignment"}
                </h2>

                <p className="text-xs text-[#7A7F85]">
                  {editingAssignment
                    ? "Update assignment information"
                    : "Add a new assignment for students"}
                </p>
              </div>
            </div>

            {editingAssignment && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition hover:text-red-600"
              >
                <X size={15} />
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* ROW 1 */}

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0A1931]">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="Assignment title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#B3CFE5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0A1931]">
                  Instructor
                </label>

                <input
                  type="text"
                  name="instructorName"
                  placeholder="Instructor name"
                  value={formData.instructorName}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#B3CFE5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0A1931]">
                  External Link
                  <span className="ml-1 font-normal text-gray-400">
                    optional
                  </span>
                </label>

                <input
                  type="url"
                  name="link"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full border border-[#B3CFE5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>
            </div>

            {/* ROW 2 */}

            <div className="mt-5 grid gap-5 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-[#0A1931]">
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Assignment requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full resize-none border border-[#B3CFE5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0A1931]">
                  Deadline
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#B3CFE5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#0A1931]">
                  Max Points
                </label>

                <input
                  type="number"
                  name="maxScore"
                  min="1"
                  value={formData.maxScore}
                  onChange={handleChange}
                  required
                  className="w-full border border-[#B3CFE5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>
            </div>

            {/* FILE UPLOAD */}

            <div className="mt-5 flex flex-col gap-3 border-t border-[#EAF3F9] pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex cursor-pointer items-center gap-2 border border-dashed border-[#B3CFE5] px-4 py-2.5 text-xs font-bold text-[#1A3D63] transition hover:border-[#1A3D63] hover:bg-[#F6FAFD]">
                  <Upload size={15} />
                  Add Files
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  />
                </label>

                <span className="text-[11px] text-gray-400">
                  PDF, Word, PowerPoint, Excel, TXT, ZIP, RAR · 20 MB max
                </span>
              </div>

              {selectedFiles.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center gap-2 border border-[#B3CFE5] bg-white px-2.5 py-1.5"
                    >
                      <FileText size={13} className="text-[#1A3D63]" />

                      <span className="max-w-[160px] truncate text-[10px] font-semibold text-[#0A1931]">
                        {file.name}
                      </span>

                      <span className="text-[9px] text-gray-400">
                        {formatFileSize(file.size)}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="text-gray-400 transition hover:text-red-600"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* EXISTING FILES */}

            {editingAssignment &&
              (editingAssignment.files || []).length > 0 && (
                <div className="mt-4 border-t border-[#EAF3F9] pt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-[#0A1931]">
                      Existing files:
                    </span>

                    {editingAssignment.files.map((file, index) => (
                      <a
                        key={`${file.fileName}-${index}`}
                        href={getFileUrl(file.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#4A7FA7] transition hover:text-[#0A1931]"
                      >
                        <FileText size={13} />

                        <span className="max-w-[180px] truncate">
                          {file.originalName}
                        </span>

                        <Download size={11} />
                      </a>
                    ))}

                    <label className="ml-2 flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-red-600">
                      <input
                        type="checkbox"
                        checked={replaceFiles}
                        onChange={(e) => setReplaceFiles(e.target.checked)}
                      />
                      Replace existing files
                    </label>
                  </div>
                </div>
              )}

            {/* SUBMIT */}

            <div className="mt-5 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex min-w-[180px] items-center justify-center gap-2 bg-[#1A3D63] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />

                    {editingAssignment ? "Updating..." : "Publishing..."}
                  </>
                ) : editingAssignment ? (
                  <>
                    <Pencil size={16} />
                    Update Assignment
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    Publish Assignment
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ASSIGNMENT TABLE */}

        <section>
          <div className="mb-4 flex items-center justify-between border-b border-[#B3CFE5] pb-3">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-[#1A3D63]" />

              <h2 className="text-lg font-bold text-[#0A1931]">
                Recent Assignments
              </h2>
            </div>

            <span className="text-xs text-[#7A7F85]">
              {assignments.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center border border-[#B3CFE5] bg-white">
              <Loader2 className="h-7 w-7 animate-spin text-[#1A3D63]" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="border border-dashed border-[#B3CFE5] bg-white py-12 text-center">
              <FileText size={40} className="mx-auto mb-3 text-[#B3CFE5]" />

              <p className="font-semibold text-[#0A1931]">
                No assignments yet.
              </p>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Create your first assignment above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#B3CFE5] bg-white">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD]">
                    <th className="px-5 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Assignment
                    </th>

                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Instructor
                    </th>

                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Batch
                    </th>

                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Deadline
                    </th>

                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Points
                    </th>

                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Files
                    </th>

                    <th className="px-4 py-3 text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Status
                    </th>

                    <th className="px-4 py-3 text-right text-[11px] font-black uppercase tracking-wide text-[#0A1931]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((assignment) => {
                    const expired = isExpired(assignment.deadline);

                    return (
                      <tr
                        key={assignment._id}
                        className="border-b border-[#EAF3F9] transition hover:bg-[#F6FAFD]"
                      >
                        {/* ASSIGNMENT */}

                        <td className="max-w-[280px] px-5 py-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center bg-[#EAF3F9]">
                              <FileText size={15} className="text-[#1A3D63]" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#0A1931]">
                                {assignment.title}
                              </p>

                              <p className="mt-1 line-clamp-2 text-xs text-[#7A7F85]">
                                {assignment.description}
                              </p>

                              {assignment.link && (
                                <a
                                  href={assignment.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-1 flex w-fit items-center gap-1 text-[10px] font-semibold text-[#4A7FA7] hover:text-[#0A1931]"
                                >
                                  <LinkIcon size={11} />
                                  External Link
                                  <ExternalLink size={9} />
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* INSTRUCTOR */}

                        <td className="px-4 py-4">
                          <span className="text-xs font-semibold text-[#1A3D63]">
                            {assignment.instructorName || "—"}
                          </span>
                        </td>

                        {/* BATCH */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A3D63]">
                            <Users size={13} />
                            {getBatchName(assignment)}
                          </div>
                        </td>

                        {/* DEADLINE */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1A3D63]">
                            <Calendar size={13} />

                            {assignment.deadline
                              ? new Date(
                                  assignment.deadline,
                                ).toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </div>
                        </td>

                        {/* POINTS */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#4A7FA7]">
                            <Trophy size={13} />
                            {assignment.maxScore || 0}
                          </div>
                        </td>

                        {/* FILES */}

                        <td className="px-4 py-4">
                          {(assignment.files || []).length > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <FileText size={13} className="text-[#1A3D63]" />

                              <span className="text-xs font-semibold text-[#1A3D63]">
                                {assignment.files.length}
                              </span>

                              <div className="ml-1 flex gap-1">
                                {assignment.files
                                  .slice(0, 2)
                                  .map((file, index) => (
                                    <a
                                      key={`${file.fileName}-${index}`}
                                      href={getFileUrl(file.fileUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title={file.originalName}
                                      className="text-[#4A7FA7] hover:text-[#0A1931]"
                                    >
                                      <Download size={13} />
                                    </a>
                                  ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No files
                            </span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase ${
                              expired
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {expired ? "Expired" : "Live"}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleEdit(assignment)}
                              title="Edit assignment"
                              className="p-2 text-gray-400 transition hover:bg-blue-50 hover:text-[#1A3D63]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteAssignment(assignment)}
                              title="Delete assignment"
                              className="p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* DELETE CONFIRMATION MODAL */}

      {deleteAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1931]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white shadow-2xl">
            {/* MODAL HEADER */}

            <div className="border-b border-[#B3CFE5] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-red-50">
                  <Trash2 size={20} className="text-red-600" />
                </div>

                <div>
                  <h3 className="font-bold text-[#0A1931]">
                    Delete Assignment
                  </h3>

                  <p className="text-xs text-[#7A7F85]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* MODAL BODY */}

            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-[#4A4F55]">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#0A1931]">
                  "{deleteAssignment.title}"
                </span>
                ?
              </p>

              <div className="mt-3 border border-red-100 bg-red-50 px-3 py-2.5">
                <p className="text-xs leading-5 text-red-600">
                  Any uploaded files associated with this assignment will also
                  be deleted.
                </p>
              </div>
            </div>

            {/* MODAL ACTIONS */}

            <div className="flex justify-end gap-3 border-t border-[#EAF3F9] px-6 py-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteAssignment(null)}
                className="border border-[#B3CFE5] px-5 py-2 text-sm font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(deleteAssignment._id)}
                className="flex min-w-[95px] items-center justify-center gap-2 bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {deleting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Deleting
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignment;
