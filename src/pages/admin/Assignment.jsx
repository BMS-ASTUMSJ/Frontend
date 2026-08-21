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
  Clock,
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

  // ============================================================
  // FETCH ASSIGNMENTS
  // ============================================================

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

  // ============================================================
  // HANDLE FORM CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // RESET FORM
  // ============================================================

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

  // ============================================================
  // FILE VALIDATION
  // ============================================================

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

  // ============================================================
  // FILE CHANGE
  // ============================================================

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

  // ============================================================
  // REMOVE SELECTED FILE
  // ============================================================

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // FORMAT DATE FOR INPUT
  // ============================================================

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

  // ============================================================
  // SUBMIT
  // ============================================================

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

  // ============================================================
  // EDIT
  // ============================================================

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

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    if (!id) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment? Uploaded files will also be deleted.",
    );

    if (!confirmed) return;

    try {
      await api.delete(`/assignments/${id}`);

      toast.success("Assignment deleted successfully");

      if (editingAssignment?._id === id) {
        resetForm();
      }

      await fetchAssignments();
    } catch (err) {
      console.error("DELETE ASSIGNMENT ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to delete assignment");
    }
  };

  // ============================================================
  // BATCH NAME
  // ============================================================

  const getBatchName = (assignment) => {
    if (!assignment?.batch) {
      return "No batch";
    }

    if (typeof assignment.batch === "object") {
      return assignment.batch.name || "Unknown batch";
    }

    return "Unknown batch";
  };

  // ============================================================
  // EXPIRED
  // ============================================================

  const isExpired = (deadline) => {
    if (!deadline) return false;

    return new Date(deadline) < new Date();
  };

  // ============================================================
  // FILE SIZE
  // ============================================================

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

  // ============================================================
  // FILE URL
  // ============================================================

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
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="rounded-3xl bg-[#0A1931] p-6 text-white shadow-sm md:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#1A3D63] p-3">
                <ClipboardList size={28} className="text-[#B3CFE5]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Assignment Management
                </h1>

                <p className="mt-1 text-sm text-[#B3CFE5]">
                  Create and manage student assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold">
              <Trophy size={18} className="text-yellow-400" />
              {assignments.length} Assignment
              {assignments.length !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {/* ======================================================
            CREATE / EDIT FORM
        ====================================================== */}

        <div className="border-b border-[#B3CFE5] pb-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#EAF3F9] p-2">
                {editingAssignment ? (
                  <Pencil size={20} className="text-[#1A3D63]" />
                ) : (
                  <PlusCircle size={20} className="text-[#1A3D63]" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#0A1931]">
                  {editingAssignment ? "Edit Assignment" : "New Assignment"}
                </h2>

                <p className="text-xs text-gray-500">
                  {editingAssignment
                    ? "Update the assignment details below."
                    : "Publish a new assignment to the current batch."}
                </p>
              </div>
            </div>

            {editingAssignment && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                title="Cancel editing"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              {/* TITLE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Project Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. React & Tailwind Portfolio"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* INSTRUCTOR */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Instructor Name
                </label>

                <input
                  type="text"
                  name="instructorName"
                  placeholder="e.g. Abebe Kebede"
                  value={formData.instructorName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Provide detailed project requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="h-24 w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* LINK */}

              <div className="md:col-span-2">
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <LinkIcon size={14} />
                  External Link
                  <span className="font-normal normal-case tracking-normal text-gray-400">
                    optional
                  </span>
                </label>

                <input
                  type="url"
                  name="link"
                  placeholder="https://example.com/resource"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* FILE UPLOAD */}

              <div className="md:col-span-2">
                <label className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                  <Upload size={14} />
                  Assignment Files
                  <span className="font-normal normal-case tracking-normal text-gray-400">
                    optional
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-[#B3CFE5] bg-white p-4 transition hover:border-[#1A3D63] hover:bg-[#F6FAFD]">
                  <div className="rounded-xl bg-[#EAF3F9] p-3">
                    <Upload size={22} className="text-[#4A7FA7]" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0A1931]">
                      Click to select files
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      PDF, Word, PowerPoint, Excel, TXT, ZIP, RAR • Max 20 MB
                      per file
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  />
                </label>

                {/* SELECTED FILES */}

                {selectedFiles.length > 0 && (
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-xl border border-[#B3CFE5] bg-white p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText
                            size={18}
                            className="shrink-0 text-[#1A3D63]"
                          />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#0A1931]">
                              {file.name}
                            </p>

                            <p className="text-[10px] text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DEADLINE */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Deadline
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              {/* POINTS */}

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Maximum Points
                </label>

                <input
                  type="number"
                  name="maxScore"
                  min="1"
                  value={formData.maxScore}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63]"
                />
              </div>

              {/* EXISTING FILES */}

              {editingAssignment &&
                (editingAssignment.files || []).length > 0 && (
                  <div className="md:col-span-2">
                    <div className="rounded-xl border border-[#B3CFE5] bg-white p-4">
                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                        Existing Files
                      </p>

                      <div className="grid gap-2 md:grid-cols-2">
                        {editingAssignment.files.map((file, index) => (
                          <a
                            key={`${file.fileName}-${index}`}
                            href={getFileUrl(file.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:bg-[#F6FAFD]"
                          >
                            <FileText
                              size={18}
                              className="shrink-0 text-[#1A3D63]"
                            />

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#0A1931]">
                                {file.originalName}
                              </p>

                              <p className="text-[10px] text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>

                            <Download
                              size={16}
                              className="ml-auto shrink-0 text-[#4A7FA7]"
                            />
                          </a>
                        ))}
                      </div>

                      <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                        <input
                          type="checkbox"
                          checked={replaceFiles}
                          onChange={(e) => setReplaceFiles(e.target.checked)}
                          className="mt-1"
                        />

                        <div>
                          <p className="text-xs font-bold text-red-700">
                            Replace existing files
                          </p>

                          <p className="mt-1 text-[10px] text-red-600">
                            Existing files will be deleted and replaced with the
                            newly selected files.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
            </div>

            {/* SUBMIT */}

            <div className="mt-5 flex gap-3">
              {editingAssignment && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#B3CFE5] px-5 py-3 text-sm font-bold text-[#0A1931] transition hover:bg-[#F6FAFD]"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A3D63] py-3 text-sm font-bold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />

                    {editingAssignment ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>
                    {editingAssignment ? (
                      <>
                        <Pencil size={17} />
                        Update Assignment
                      </>
                    ) : (
                      <>
                        <FileText size={17} />
                        Publish Assignment
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================
            ASSIGNMENT LIST
        ====================================================== */}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-[#0A1931]">
                <Clock size={20} className="text-[#4A7FA7]" />
                Recent Assignments
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {assignments.length} assignment
                {assignments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#1A3D63]" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="border-y border-dashed border-[#B3CFE5] py-12 text-center">
              <FileText size={42} className="mx-auto mb-3 text-[#B3CFE5]" />

              <p className="font-semibold text-[#0A1931]">
                No assignments yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Create your first assignment above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border-y border-[#B3CFE5]">
              <table className="w-full min-w-262.5">
                <thead>
                  <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD] text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-4 py-3">Assignment</th>

                    <th className="px-4 py-3">Batch</th>

                    <th className="px-4 py-3">Instructor</th>

                    <th className="px-4 py-3">Deadline</th>

                    <th className="px-4 py-3">Points</th>

                    <th className="px-4 py-3">Files</th>

                    <th className="px-4 py-3">Status</th>

                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {assignments.map((assignment) => {
                    const expired = isExpired(assignment.deadline);

                    return (
                      <tr
                        key={assignment._id}
                        className="border-b border-gray-100 transition last:border-0 hover:bg-[#F6FAFD]"
                      >
                        {/* ASSIGNMENT */}

                        <td className="px-4 py-4">
                          <div className="max-w-xs">
                            <p className="font-semibold text-[#0A1931]">
                              {assignment.title}
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                              {assignment.description}
                            </p>

                            {assignment.link && (
                              <a
                                href={assignment.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 flex w-fit items-center gap-1 text-xs font-semibold text-[#1A3D63] hover:underline"
                              >
                                <LinkIcon size={12} />
                                External Link
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* BATCH */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A3D63]">
                            <Users size={15} />
                            {getBatchName(assignment)}
                          </div>
                        </td>

                        {/* INSTRUCTOR */}

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {assignment.instructorName || "-"}
                        </td>

                        {/* DEADLINE */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={15} />

                            {new Date(assignment.deadline).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </td>

                        {/* POINTS */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#4A7FA7]">
                            <Trophy size={15} />
                            {assignment.maxScore}
                          </div>
                        </td>

                        {/* FILES */}

                        <td className="px-4 py-4">
                          {(assignment.files || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assignment.files.map((file, index) => (
                                <a
                                  key={`${file.fileName}-${index}`}
                                  href={getFileUrl(file.fileUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={file.originalName}
                                  className="flex items-center gap-1 rounded-lg bg-[#EAF3F9] px-2 py-1 text-xs font-semibold text-[#1A3D63] hover:bg-[#B3CFE5]"
                                >
                                  <FileText size={13} />

                                  {assignment.files.length}
                                </a>
                              ))}
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
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
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
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-50 hover:text-[#1A3D63]"
                              title="Edit assignment"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(assignment._id)}
                              className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                              title="Delete assignment"
                            >
                              <Trash2 size={17} />
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
        </div>
      </div>
    </div>
  );
};

export default AdminAssignment;
