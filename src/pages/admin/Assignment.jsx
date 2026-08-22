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
  Sparkles,
  ChevronRight,
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

      toast.error(
        err.response?.data?.message || "Failed to load assignments"
      );
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
    const extension =
      "." + file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      toast.error(
        `${file.name}: Unsupported file type. Allowed: PDF, Word, PowerPoint, Excel, TXT, ZIP and RAR.`
      );

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `${file.name} is larger than the 20 MB limit.`
      );

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
        prev.map((file) => `${file.name}-${file.size}`)
      );

      const newFiles = validFiles.filter(
        (file) =>
          !existingNames.has(`${file.name}-${file.size}`)
      );

      return [...prev, ...newFiles];
    });

    e.target.value = "";
  };

  // ============================================================
  // REMOVE SELECTED FILE
  // ============================================================

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    const year = parsedDate.getFullYear();
    const month = String(
      parsedDate.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      parsedDate.getDate()
    ).padStart(2, "0");

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
      data.append(
        "description",
        formData.description.trim()
      );
      data.append(
        "instructorName",
        formData.instructorName.trim()
      );
      data.append("deadline", formData.deadline);
      data.append(
        "maxScore",
        Number(formData.maxScore)
      );
      data.append("link", formData.link.trim());

      selectedFiles.forEach((file) => {
        data.append("files", file);
      });

      if (editingAssignment) {
        data.append("replaceFiles", replaceFiles);

        await api.patch(
          `/assignments/${editingAssignment._id}`,
          data,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success(
          "Assignment updated successfully"
        );
      } else {
        await api.post("/assignments", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success(
          "Assignment published successfully"
        );
      }

      resetForm();

      await fetchAssignments();
    } catch (err) {
      console.error("ASSIGNMENT SAVE ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to save assignment"
      );
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
      instructorName:
        assignment.instructorName || "",
      deadline: formatDateForInput(
        assignment.deadline
      ),
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
      "Are you sure you want to delete this assignment? Uploaded files will also be deleted."
    );

    if (!confirmed) return;

    try {
      await api.delete(`/assignments/${id}`);

      toast.success(
        "Assignment deleted successfully"
      );

      if (editingAssignment?._id === id) {
        resetForm();
      }

      await fetchAssignments();
    } catch (err) {
      console.error(
        "DELETE ASSIGNMENT ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to delete assignment"
      );
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
      return (
        assignment.batch.name ||
        "Unknown batch"
      );
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

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  // ============================================================
  // FILE URL
  // ============================================================

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "#";

    const baseURL =
      api.defaults?.baseURL || "";

    const serverURL = baseURL.replace(
      /\/api\/?$/,
      ""
    );

    if (fileUrl.startsWith("http")) {
      return fileUrl;
    }

    return `${serverURL}${fileUrl}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f5ef] px-4 py-6 md:px-7 md:py-8">

      {/* ======================================================
          ANIMATED BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-80 w-80 animate-[floatSlow_12s_ease-in-out_infinite] rounded-full bg-orange-200/30 blur-3xl" />

        <div className="absolute right-[-100px] top-20 h-96 w-96 animate-[floatReverse_15s_ease-in-out_infinite] rounded-full bg-amber-200/25 blur-3xl" />

        <div className="absolute bottom-[-150px] left-[35%] h-96 w-96 animate-[floatSlow_18s_ease-in-out_infinite] rounded-full bg-orange-100/40 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,150,80,0.08),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(255,190,120,0.08),transparent_30%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-8">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <section className="group relative overflow-hidden rounded-[30px] border border-white/80 bg-gradient-to-br from-[#18202b] via-[#27313b] to-[#3b3b38] px-6 py-7 text-white shadow-[0_20px_60px_rgba(30,35,40,0.14)] md:px-8 md:py-8">

          <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl transition duration-700 group-hover:scale-125" />

          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div className="flex items-center gap-4">

              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-900/20 transition duration-500 group-hover:rotate-3 group-hover:scale-105">

                <ClipboardList
                  size={29}
                  strokeWidth={1.8}
                />

                <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white/10 blur-md" />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-orange-300">
                  <Sparkles size={13} />
                  Administration
                </div>

                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  Assignment Management
                </h1>

                <p className="mt-1 text-sm text-white/60">
                  Create, organize and manage student assignments.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md transition duration-300 hover:bg-white/10">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10">
                <Trophy
                  size={19}
                  className="text-orange-300"
                />
              </div>

              <div>
                <p className="text-lg font-black">
                  {assignments.length}
                </p>

                <p className="text-[10px] uppercase tracking-wider text-white/50">
                  Assignment
                  {assignments.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-orange-500 via-amber-300 to-transparent" />
        </section>

        {/* ======================================================
            CREATE / EDIT SECTION
        ====================================================== */}

        <section className="animate-[fadeUp_0.7s_ease-out]">

          <div className="mb-5 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                {editingAssignment ? (
                  <Pencil
                    size={19}
                    className="text-orange-500"
                  />
                ) : (
                  <PlusCircle
                    size={19}
                    className="text-orange-500"
                  />
                )}
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-[#252a2f]">
                  {editingAssignment
                    ? "Edit Assignment"
                    : "New Assignment"}
                </h2>

                <p className="text-xs text-[#7d817f]">
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
                className="group flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#777] transition-all duration-300 hover:bg-white hover:text-[#222] hover:shadow-sm"
              >
                <X
                  size={16}
                  className="transition-transform group-hover:rotate-90"
                />
                Cancel
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[28px] border border-white/80 bg-white/70 p-5 shadow-[0_15px_45px_rgba(40,35,25,0.06)] backdrop-blur-xl md:p-7"
          >

            <div className="grid gap-5 md:grid-cols-2">

              {/* TITLE */}

              <div className="group">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  Project Title
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. React & Tailwind Portfolio"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#e3ded5] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#252a2f] outline-none transition-all duration-300 placeholder:text-[#aaa59e] hover:border-[#d5cec3] focus:border-orange-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)]"
                />
              </div>

              {/* INSTRUCTOR */}

              <div className="group">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  Instructor Name
                </label>

                <input
                  type="text"
                  name="instructorName"
                  placeholder="e.g. Abebe Kebede"
                  value={formData.instructorName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#e3ded5] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#252a2f] outline-none transition-all duration-300 placeholder:text-[#aaa59e] hover:border-[#d5cec3] focus:border-orange-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)]"
                />
              </div>

              {/* DESCRIPTION */}

              <div className="md:col-span-2">
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  Description
                </label>

                <textarea
                  name="description"
                  placeholder="Provide detailed project requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="h-28 w-full resize-none rounded-2xl border border-[#e3ded5] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#252a2f] outline-none transition-all duration-300 placeholder:text-[#aaa59e] hover:border-[#d5cec3] focus:border-orange-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)]"
                />
              </div>

              {/* LINK */}

              <div className="md:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  <LinkIcon size={13} />
                  External Link
                  <span className="font-normal normal-case tracking-normal text-[#aaa]">
                    optional
                  </span>
                </label>

                <input
                  type="url"
                  name="link"
                  placeholder="https://example.com/resource"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-[#e3ded5] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#252a2f] outline-none transition-all duration-300 placeholder:text-[#aaa59e] hover:border-[#d5cec3] focus:border-orange-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)]"
                />
              </div>

              {/* FILE UPLOAD */}

              <div className="md:col-span-2">

                <label className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  <Upload size={13} />
                  Assignment Files
                  <span className="font-normal normal-case tracking-normal text-[#aaa]">
                    optional
                  </span>
                </label>

                <label className="group flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[#d8d1c7] bg-[#fffdf9] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-300 hover:bg-white hover:shadow-lg hover:shadow-orange-100/40">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                    <Upload size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#33383d]">
                      Click to select files
                    </p>

                    <p className="mt-1 text-xs text-[#98948e]">
                      PDF, Word, PowerPoint, Excel, TXT, ZIP, RAR
                      {" "}• Max 20 MB per file
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
                    {selectedFiles.map(
                      (file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="group flex items-center justify-between rounded-2xl border border-[#e6e0d7] bg-white px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#33383d]">
                                {file.name}
                              </p>

                              <p className="text-[10px] text-[#999]">
                                {formatFileSize(
                                  file.size
                                )}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeSelectedFile(
                                index
                              )
                            }
                            className="rounded-xl p-2 text-[#aaa] transition-all duration-300 hover:bg-red-50 hover:text-red-500"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* DEADLINE */}

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  Deadline
                </label>

                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#e3ded5] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#252a2f] outline-none transition-all duration-300 hover:border-[#d5cec3] focus:border-orange-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)]"
                />
              </div>

              {/* POINTS */}

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                  Maximum Points
                </label>

                <input
                  type="number"
                  name="maxScore"
                  min="1"
                  value={formData.maxScore}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-[#e3ded5] bg-[#fffdf9] px-4 py-3.5 text-sm text-[#252a2f] outline-none transition-all duration-300 hover:border-[#d5cec3] focus:border-orange-300 focus:bg-white focus:shadow-[0_0_0_4px_rgba(249,115,22,0.07)]"
                />
              </div>

              {/* EXISTING FILES */}

              {editingAssignment &&
                (editingAssignment.files || [])
                  .length > 0 && (
                  <div className="md:col-span-2">
                    <div className="rounded-2xl border border-[#e5ded4] bg-[#fffdf9] p-5">

                      <p className="mb-3 text-[11px] font-black uppercase tracking-[0.13em] text-[#777]">
                        Existing Files
                      </p>

                      <div className="grid gap-2 md:grid-cols-2">
                        {editingAssignment.files.map(
                          (file, index) => (
                            <a
                              key={`${file.fileName}-${index}`}
                              href={getFileUrl(
                                file.fileUrl
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 rounded-2xl border border-[#eee8df] bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="rounded-xl bg-orange-50 p-2 text-orange-500">
                                <FileText size={17} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#33383d]">
                                  {file.originalName}
                                </p>

                                <p className="text-[10px] text-[#999]">
                                  {formatFileSize(
                                    file.size
                                  )}
                                </p>
                              </div>

                              <Download
                                size={15}
                                className="ml-auto shrink-0 text-[#aaa] transition group-hover:text-orange-500"
                              />
                            </a>
                          )
                        )}
                      </div>

                      <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 transition hover:bg-red-50">
                        <input
                          type="checkbox"
                          checked={replaceFiles}
                          onChange={(e) =>
                            setReplaceFiles(
                              e.target.checked
                            )
                          }
                          className="mt-1 accent-orange-500"
                        />

                        <div>
                          <p className="text-xs font-bold text-red-700">
                            Replace existing files
                          </p>

                          <p className="mt-1 text-[10px] text-red-500">
                            Existing files will be deleted and
                            replaced with the newly selected files.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
            </div>

            {/* SUBMIT */}

            <div className="mt-6 flex gap-3">

              {editingAssignment && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-[#ded8cf] bg-white px-6 py-3.5 text-sm font-bold text-[#555] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#faf8f4] hover:shadow-md"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e97835] to-[#ef914d] py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200/40 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-200/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <span className="relative flex items-center gap-2">
                  {submitting ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      {editingAssignment
                        ? "Updating..."
                        : "Publishing..."}
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
                </span>
              </button>
            </div>
          </form>
        </section>

        {/* ======================================================
            ASSIGNMENT TABLE
        ====================================================== */}

        <section className="animate-[fadeUp_0.9s_ease-out]">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                  <Clock
                    size={19}
                    className="text-orange-500"
                  />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight text-[#252a2f]">
                    Recent Assignments
                  </h2>

                  <p className="mt-0.5 text-xs text-[#89857f]">
                    Manage all published assignments
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden rounded-full border border-[#e5ded4] bg-white/70 px-4 py-2 text-xs font-bold text-[#777] shadow-sm sm:block">
              {assignments.length} total
            </div>
          </div>

          {loading ? (
            <div className="flex h-52 items-center justify-center rounded-[28px] border border-white/80 bg-white/60">
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                  <Loader2
                    className="animate-spin text-orange-500"
                    size={23}
                  />
                </div>

                <p className="text-xs font-semibold text-[#999]">
                  Loading assignments...
                </p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#d9d2c8] bg-white/50 py-16 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-400">
                <FileText size={28} />
              </div>

              <p className="font-black text-[#33383d]">
                No assignments yet
              </p>

              <p className="mt-1 text-sm text-[#999]">
                Create your first assignment above.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-white/80 bg-white/75 shadow-[0_15px_45px_rgba(40,35,25,0.07)] backdrop-blur-xl">

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1100px]">

                  <thead>
                    <tr className="border-b border-[#e9e3da] bg-[#f7f3ed]/80 text-left">

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Assignment
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Batch
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Instructor
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Deadline
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Points
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Files
                      </th>

                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.13em] text-[#8b867f]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {assignments.map(
                      (assignment, index) => {
                        const expired =
                          isExpired(
                            assignment.deadline
                          );

                        return (
                          <tr
                            key={assignment._id}
                            style={{
                              animationDelay: `${index * 70}ms`,
                            }}
                            className="group animate-[rowIn_0.5s_ease-out_both] border-b border-[#eee9e2] transition-all duration-300 last:border-0 hover:bg-[#fffaf4] hover:shadow-[inset_4px_0_0_#ed8240]"
                          >

                            {/* ASSIGNMENT */}

                            <td className="px-5 py-5">
                              <div className="max-w-xs">

                                <div className="flex items-start gap-3">

                                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-all duration-300 group-hover:scale-105 group-hover:rotate-2">
                                    <FileText size={16} />
                                  </div>

                                  <div className="min-w-0">

                                    <p className="font-black text-[#30353a]">
                                      {assignment.title}
                                    </p>

                                    <p className="mt-1 line-clamp-1 text-xs text-[#96918a]">
                                      {assignment.description}
                                    </p>

                                    {assignment.link && (
                                      <a
                                        href={
                                          assignment.link
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 flex w-fit items-center gap-1 text-[11px] font-bold text-[#a66a42] transition hover:text-orange-600 hover:underline"
                                      >
                                        <LinkIcon
                                          size={11}
                                        />
                                        External Link
                                        <ExternalLink
                                          size={10}
                                        />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* BATCH */}

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2 text-sm font-bold text-[#66635e]">
                                <Users
                                  size={15}
                                  className="text-[#a49e95]"
                                />

                                {getBatchName(
                                  assignment
                                )}
                              </div>
                            </td>

                            {/* INSTRUCTOR */}

                            <td className="px-5 py-5 text-sm text-[#706c66]">
                              {assignment.instructorName ||
                                "-"}
                            </td>

                            {/* DEADLINE */}

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2 text-sm text-[#706c66]">
                                <Calendar
                                  size={15}
                                  className="text-[#aaa49c]"
                                />

                                {new Date(
                                  assignment.deadline
                                ).toLocaleDateString(
                                  undefined,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </div>
                            </td>

                            {/* POINTS */}

                            <td className="px-5 py-5">
                              <div className="flex items-center gap-2 text-sm font-black text-[#68645f]">
                                <Trophy
                                  size={15}
                                  className="text-[#d39a69]"
                                />

                                {assignment.maxScore}
                              </div>
                            </td>

                            {/* FILES */}

                            <td className="px-5 py-5">
                              {(assignment.files || [])
                                .length > 0 ? (
                                <div className="flex flex-wrap gap-1">

                                  {assignment.files.map(
                                    (
                                      file,
                                      fileIndex
                                    ) => (
                                      <a
                                        key={`${file.fileName}-${fileIndex}`}
                                        href={getFileUrl(
                                          file.fileUrl
                                        )}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={
                                          file.originalName
                                        }
                                        className="flex items-center gap-1 rounded-xl bg-[#f6f1ea] px-2.5 py-1.5 text-[11px] font-bold text-[#77716a] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-600"
                                      >
                                        <FileText
                                          size={12}
                                        />
                                        {assignment.files
                                          .length}
                                      </a>
                                    )
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-[#aaa49c]">
                                  No files
                                </span>
                              )}
                            </td>

                            {/* STATUS */}

                            <td className="px-5 py-5">

                              <span
                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${
                                  expired
                                    ? "border-red-100 bg-red-50 text-red-600"
                                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    expired
                                      ? "bg-red-500"
                                      : "bg-emerald-500 animate-pulse"
                                  }`}
                                />

                                {expired
                                  ? "Expired"
                                  : "Live"}
                              </span>
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-5">

                              <div className="flex justify-end gap-1">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      assignment
                                    )
                                  }
                                  className="group/edit rounded-xl p-2.5 text-[#aaa49c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-50 hover:text-orange-600"
                                  title="Edit assignment"
                                >
                                  <Pencil
                                    size={16}
                                    className="transition-transform duration-300 group-hover/edit:rotate-[-8deg]"
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      assignment._id
                                    )
                                  }
                                  className="group/delete rounded-xl p-2.5 text-[#aaa49c] transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600"
                                  title="Delete assignment"
                                >
                                  <Trash2
                                    size={16}
                                    className="transition-transform duration-300 group-hover/delete:scale-110"
                                  />
                                </button>

                                <span className="hidden items-center justify-center text-[#d4cec5] transition-all duration-300 group-hover:flex">
                                  <ChevronRight
                                    size={15}
                                  />
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ======================================================
          PAGE ANIMATION STYLES
      ====================================================== */}

      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes rowIn {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes floatSlow {
            0%,
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(30px, 20px, 0) scale(1.08);
            }
          }

          @keyframes floatReverse {
            0%,
            100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(-25px, 30px, 0) scale(1.1);
            }
          }

          input,
          textarea,
          button,
          a {
            -webkit-tap-highlight-color: transparent;
          }

          ::-webkit-scrollbar {
            width: 7px;
            height: 7px;
          }

          ::-webkit-scrollbar-track {
            background: #f5f1eb;
          }

          ::-webkit-scrollbar-thumb {
            background: #d5cfc6;
            border-radius: 999px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: #c4bbb0;
          }
        `}
      </style>
    </div>
  );
};

export default AdminAssignment;