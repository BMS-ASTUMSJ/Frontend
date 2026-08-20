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

  // ============================================================
  // FORM CHANGE
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
  // FILE SELECT
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
  // CREATE / UPDATE
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
  // START EDIT
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

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#0A1931] p-8 text-white shadow-lg md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div className="rounded-2xl bg-[#1A3D63] p-4">
              <ClipboardList size={32} className="text-[#B3CFE5]" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Assignment Management</h1>

              <p className="mt-1 text-sm text-[#B3CFE5]">
                Create and track student projects and deadlines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3">
            <Trophy size={20} className="text-yellow-400" />

            <span className="text-lg font-semibold">
              {assignments.length} Assignment
              {assignments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ======================================================
            MAIN GRID
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ====================================================
              FORM
          ==================================================== */}

          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="sticky top-8 space-y-5 rounded-3xl border border-[#B3CFE5] bg-white p-8 shadow-sm"
            >
              {/* FORM HEADER */}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#EAF3F9] p-2">
                    {editingAssignment ? (
                      <Pencil size={20} className="text-[#1A3D63]" />
                    ) : (
                      <PlusCircle size={20} className="text-[#1A3D63]" />
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-[#0A1931]">
                    {editingAssignment ? "Edit Assignment" : "New Assignment"}
                  </h2>
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

              <div className="space-y-4">
                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                    Project Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. React & Tailwind Portfolio"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                {/* DESCRIPTION */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                    Descriptions
                  </label>

                  <textarea
                    name="description"
                    placeholder="Provide detailed project requirements..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="h-32 w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                {/* INSTRUCTOR */}

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                    Instructor Name
                  </label>

                  <input
                    type="text"
                    name="instructorName"
                    placeholder="e.g. Abebe Kebede"
                    value={formData.instructorName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                {/* LINK */}

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0A1931]">
                    <LinkIcon size={15} />
                    Link
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>

                  <input
                    type="url"
                    name="link"
                    placeholder="https://example.com/resource"
                    value={formData.link}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0A1931]">
                    <Upload size={16} />
                    Assignment Files
                    <span className="font-normal text-gray-400">
                      (optional)
                    </span>
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-6 text-center transition hover:border-[#1A3D63] hover:bg-[#EAF3F9]">
                    <Upload size={28} className="mb-2 text-[#4A7FA7]" />

                    <span className="text-sm font-bold text-[#0A1931]">
                      Click to select files
                    </span>

                    <span className="mt-1 text-xs text-[#7A7F85]">
                      PDF, Word, PowerPoint, Excel, TXT, ZIP, RAR
                    </span>

                    <span className="mt-1 text-xs text-[#7A7F85]">
                      Maximum 20 MB per file
                    </span>

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
                    <div className="mt-3 space-y-2">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                      Deadline
                    </label>

                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                      Points
                    </label>

                    <input
                      type="number"
                      name="maxScore"
                      min="1"
                      value={formData.maxScore}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63]"
                    />
                  </div>
                </div>

                {/* EDIT FILE OPTIONS */}

                {editingAssignment &&
                  (editingAssignment.files || []).length > 0 && (
                    <div className="rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">
                      <p className="mb-3 text-sm font-bold text-[#0A1931]">
                        Existing Files
                      </p>

                      <div className="space-y-2">
                        {editingAssignment.files.map((file, index) => (
                          <a
                            key={`${file.fileName}-${index}`}
                            href={getFileUrl(file.fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-xl bg-white p-3 transition hover:bg-[#EAF3F9]"
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

                      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
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
                            The existing files will be deleted and replaced with
                            the newly selected files.
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A3D63] py-4 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />

                      {editingAssignment ? "Updating..." : "Publishing..."}
                    </>
                  ) : (
                    <>
                      {editingAssignment ? (
                        <>
                          <Pencil size={18} />
                          Update Assignment
                        </>
                      ) : (
                        <>
                          <FileText size={18} />
                          Publish Assignment
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ====================================================
              ASSIGNMENT LIST
          ==================================================== */}

          <div className="space-y-4 lg:col-span-3">
            <h2 className="flex items-center gap-2 px-2 text-xl font-bold text-[#0A1931]">
              <Clock size={20} className="text-[#4A7FA7]" />
              Recent Assignments
            </h2>

            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-[#B3CFE5] bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#1A3D63]" />
              </div>
            ) : assignments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-12 text-center">
                <FileText size={48} className="mx-auto mb-4 text-[#B3CFE5]" />

                <p className="font-semibold text-[#0A1931]">
                  No assignments yet.
                </p>

                <p className="text-sm text-[#7A7F85]">
                  Start by filling out the form on the left.
                </p>
              </div>
            ) : (
              assignments.map((assignment) => {
                const expired = isExpired(assignment.deadline);

                return (
                  <div
                    key={assignment._id}
                    className="group relative rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-3">
                        {/* TITLE */}

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                              expired
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {expired ? "Expired" : "Live"}
                          </span>

                          <h3 className="text-lg font-bold text-[#0A1931]">
                            {assignment.title}
                          </h3>
                        </div>

                        {/* DESCRIPTION */}

                        <p className="line-clamp-2 max-w-md text-sm text-[#7A7F85]">
                          {assignment.description}
                        </p>

                        {/* INSTRUCTOR */}

                        {assignment.instructorName && (
                          <p className="text-xs font-semibold text-[#4A7FA7]">
                            Instructor: {assignment.instructorName}
                          </p>
                        )}

                        {/* DETAILS */}

                        <div className="flex flex-wrap gap-3 pt-2">
                          {/* BATCH */}

                          <div className="flex items-center gap-2 rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#1A3D63]">
                            <Users size={14} />
                            {getBatchName(assignment)}
                          </div>

                          {/* DEADLINE */}

                          <div className="flex items-center gap-2 rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#1A3D63]">
                            <Calendar size={14} />
                            Due:{" "}
                            {new Date(assignment.deadline).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </div>

                          {/* SCORE */}

                          <div className="flex items-center gap-2 rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#4A7FA7]">
                            <Trophy size={14} />
                            Max: {assignment.maxScore} pts
                          </div>

                          {/* FILE COUNT */}

                          {(assignment.files || []).length > 0 && (
                            <div className="flex items-center gap-2 rounded-full bg-[#EAF3F9] px-3 py-1.5 text-xs font-semibold text-[#1A3D63]">
                              <FileText size={14} />
                              {assignment.files.length} file
                              {assignment.files.length !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>

                        {/* FILES */}

                        {(assignment.files || []).length > 0 && (
                          <div className="space-y-2 pt-2">
                            {assignment.files.map((file, index) => (
                              <a
                                key={`${file.fileName}-${index}`}
                                href={getFileUrl(file.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex max-w-md items-center gap-3 rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-3 transition hover:bg-[#EAF3F9]"
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

                                <ExternalLink
                                  size={15}
                                  className="ml-auto shrink-0 text-[#4A7FA7]"
                                />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* EXTERNAL LINK */}

                        {assignment.link && (
                          <a
                            href={assignment.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-fit items-center gap-2 rounded-xl bg-[#EAF3F9] px-3 py-2 text-xs font-bold text-[#1A3D63] transition hover:bg-[#B3CFE5]"
                          >
                            <LinkIcon size={14} />
                            Open External Link
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 items-center gap-1">
                        {/* EDIT */}

                        <button
                          type="button"
                          onClick={() => handleEdit(assignment)}
                          className="rounded-xl p-2 text-gray-400 transition hover:bg-blue-50 hover:text-[#1A3D63]"
                          title="Edit assignment"
                        >
                          <Pencil size={20} />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() => handleDelete(assignment._id)}
                          className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete assignment"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssignment;
