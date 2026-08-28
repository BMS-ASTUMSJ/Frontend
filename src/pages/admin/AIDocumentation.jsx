import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FileText,
  FileUp,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Database,
  UploadCloud,
  FileType2,
} from "lucide-react";
import api from "../../utils/api";

function AIDocumentation() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const [deleteDocumentId, setDeleteDocumentId] = useState(null);

  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/documents");

      if (response.data?.success) {
        setDocuments(response.data.documents || []);
      } else {
        toast.error(response.data?.message || "Failed to load documents");
      }
    } catch (error) {
      console.error("Load documents error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load AI documents",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreate = () => {
    setEditingDocument(null);
    setTitle("");
    setSelectedFile(null);
    setDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowModal(true);
  };
  const handleEdit = (document) => {
    setEditingDocument(document);
    setTitle(document.title || "");
    setSelectedFile(null);
    setDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingDocument(null);
    setTitle("");
    setSelectedFile(null);
    setDragging(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const extension = `.${file.name.split(".").pop().toLowerCase()}`;
    const allowedExtensions = [".pdf", ".docx", ".txt"];

    if (!allowedExtensions.includes(extension)) {
      toast.error("Only PDF, DOCX, and TXT files are allowed.");
      return false;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size cannot exceed 20 MB.");
      return false;
    }

    if (
      file.type &&
      !allowedTypes.includes(file.type) &&
      extension !== ".txt"
    ) {
      console.warn("Unexpected MIME type:", file.type);
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      const filename = file.name.replace(/\.[^/.]+$/, "");
      setTitle(filename);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Document title is required.");
      return;
    }

    try {
      setSaving(true);

      if (editingDocument) {
        const response = await api.put(`/documents/${editingDocument._id}`, {
          title: title.trim(),
        });

        if (response.data?.success) {
          const updatedDocument = response.data.document ||
            response.data.data?.document || {
              ...editingDocument,
              title: title.trim(),
            };

          setDocuments((current) =>
            current.map((document) =>
              document._id === editingDocument._id
                ? {
                    ...document,
                    ...updatedDocument,
                    title: title.trim(),
                  }
                : document,
            ),
          );

          toast.success("Document title updated successfully.");

          closeModal();
        }

        return;
      }
      if (!selectedFile) {
        toast.error("Please select a PDF, DOCX, or TXT file.");
        return;
      }

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("title", title.trim());

      const response = await api.post("/documents/upload", formData);

      if (response.data?.success) {
        const newDocument =
          response.data.document || response.data.data?.document;

        if (newDocument) {
          setDocuments((current) => [
            newDocument,
            ...current.filter((document) => document._id !== newDocument._id),
          ]);
        } else {
          await loadDocuments();
        }

        toast.success(
          `Document processed successfully${
            response.data.chunksCreated
              ? ` (${response.data.chunksCreated} chunks)`
              : ""
          }`,
        );

        closeModal();
      }
    } catch (error) {
      console.error("Save document error:", error);

      if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message ||
            "This document already exists. Please upload a different file.",
        );

        return;
      }

      if (error.response?.status === 429) {
        toast.error(
          "Voyage AI rate limit reached. Please wait a moment and try again.",
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to process document.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReprocess = async (documentId) => {
    try {
      setProcessingId(documentId);

      setDocuments((current) =>
        current.map((document) =>
          document._id === documentId
            ? {
                ...document,
                status: "processing",
                processingError: null,
              }
            : document,
        ),
      );

      const response = await api.post(`/documents/${documentId}/reprocess`);

      if (response.data?.success) {
        const updatedDocument =
          response.data.document || response.data.data?.document;

        if (updatedDocument) {
          setDocuments((current) =>
            current.map((document) =>
              document._id === documentId
                ? {
                    ...document,
                    ...updatedDocument,
                  }
                : document,
            ),
          );
        } else {
          await loadDocuments();
        }

        toast.success(
          `Document reprocessed successfully${
            response.data.chunksCreated
              ? ` (${response.data.chunksCreated} chunks)`
              : ""
          }`,
        );
      }
    } catch (error) {
      console.error("Reprocess document error:", error);

      setDocuments((current) =>
        current.map((document) =>
          document._id === documentId
            ? {
                ...document,
                status: "failed",
                processingError:
                  error.response?.data?.message ||
                  error.response?.data?.error ||
                  "Failed to reprocess document.",
              }
            : document,
        ),
      );

      if (error.response?.status === 429) {
        toast.error(
          "Voyage AI rate limit reached. Please wait a moment and try again.",
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.error ||
            "Failed to reprocess document.",
        );
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      setDeletingId(documentId);

      const response = await api.delete(`/documents/${documentId}`);

      if (response.data?.success) {
        toast.success("Document deleted successfully.");

        setDocuments((current) =>
          current.filter((document) => document._id !== documentId),
        );
      }
    } catch (error) {
      console.error("Delete document error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete document.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteConfirmation = (documentId) => {
    setDeleteDocumentId(documentId);
  };

  const cancelDelete = () => {
    if (deletingId) {
      return;
    }

    setDeleteDocumentId(null);
  };

  const confirmDelete = async () => {
    if (!deleteDocumentId) {
      return;
    }

    const documentId = deleteDocumentId;

    setDeleteDocumentId(null);

    await handleDelete(documentId);
  };

  const filteredDocuments = documents.filter((document) => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return true;
    }

    return (
      document.title?.toLowerCase().includes(query) ||
      document.type?.toLowerCase().includes(query) ||
      document.source?.toLowerCase().includes(query) ||
      document.originalName?.toLowerCase().includes(query)
    );
  });

  const renderStatus = (status) => {
    if (status === "processed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Processed
        </span>
      );
    }

    if (status === "processing") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
          <Clock3 className="h-3.5 w-3.5" />
          Processing
        </span>
      );
    }

    if (status === "failed") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-600">
          <AlertCircle className="h-3.5 w-3.5" />
          Failed
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-600">
        {status || "Unknown"}
      </span>
    );
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mb-6 overflow-hidden rounded-b-2xl bg-[#092F38] shadow-lg">
        <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-md">
              <Database className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[27px]">
                AI Documentation
              </h1>

              <p className="mt-1 text-xs font-medium text-slate-300">
                Manage documents used as knowledge for the AI Assistant.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-5 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#0095B6] hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Add Documentation
          </button>
        </div>
      </div>

      {/* =====================================================
          MAIN
      ====================================================== */}
      <div className="mx-auto max-w-[1250px]">
        {/* ===================================================
            OVERVIEW
        ==================================================== */}
        <div className="mb-5 rounded-2xl border border-[#D5E2E7] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#142F38]">
              Documentation Management
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-400">
              Upload PDF, DOCX, and TXT knowledge documents for RAG.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* TOTAL */}
            <div className="rounded-xl border border-[#D9E6EA] bg-[#F8FBFC] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Total Documents
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-[#173942]">
                    {documents.length}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E5F8FC] text-[#00A8CC]">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* PROCESSED */}
            <div className="rounded-xl border border-[#D9E6EA] bg-[#F8FBFC] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Processed
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                    {
                      documents.filter(
                        (document) => document.status === "processed",
                      ).length
                    }
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* FAILED */}
            <div className="rounded-xl border border-[#D9E6EA] bg-[#F8FBFC] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Failed
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-red-600">
                    {
                      documents.filter(
                        (document) => document.status === "failed",
                      ).length
                    }
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            SEARCH
        ==================================================== */}
        <div className="mb-5 rounded-2xl border border-[#D5E2E7] bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-extrabold uppercase tracking-wide text-[#173942]">
            Search Documentation
          </h3>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search documentation..."
              className="w-full rounded-xl border border-[#D5E2E7] bg-[#F7FAFB] py-3 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/10"
            />
          </div>
        </div>

        {/* ===================================================
            DOCUMENT LIST
        ==================================================== */}
        <div className="overflow-hidden rounded-2xl border border-[#D5E2E7] bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-[#E3ECEF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#173942]">
                Knowledge Documents
              </h2>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Files available to the AI retrieval system.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDocuments}
              disabled={loading}
              className="flex h-9 w-9 items-center justify-center self-end rounded-lg border border-[#D8E4E8] text-slate-500 transition hover:border-[#00A8CC] hover:bg-[#E9F9FC] hover:text-[#00A8CC] disabled:opacity-50 sm:self-auto"
              title="Refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="h-7 w-7 animate-spin text-[#00A8CC]" />

                <span className="text-sm font-semibold">
                  Loading documents...
                </span>
              </div>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF8FB] text-[#00A8CC]">
                <FileUp className="h-8 w-8" />
              </div>

              <h3 className="text-base font-extrabold text-[#173942]">
                No documentation found
              </h3>

              <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-400">
                Upload PDF, DOCX, or TXT files containing bootcamp policies,
                attendance requirements, assignments, schedules, FAQs, and other
                knowledge.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E8EFF1]">
              {filteredDocuments.map((document) => (
                <div
                  key={document._id}
                  className="px-5 py-5 transition hover:bg-[#FAFCFD]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* INFO */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F8FB] text-[#00A8CC]">
                        {document.type === "pdf" ? (
                          <FileType2 className="h-5 w-5" />
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-extrabold text-[#173942] sm:text-base">
                          {document.title}
                        </h3>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {renderStatus(document.status)}

                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-500">
                            {document.type}
                          </span>

                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold capitalize text-slate-500">
                            {document.source}
                          </span>

                          {document.fileSize ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                              {formatFileSize(document.fileSize)}
                            </span>
                          ) : null}
                        </div>

                        {document.originalName ? (
                          <p className="mt-2 truncate text-[11px] font-medium text-slate-400">
                            File: {document.originalName}
                          </p>
                        ) : null}

                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          Updated{" "}
                          {document.updatedAt
                            ? new Date(document.updatedAt).toLocaleString()
                            : "Unknown"}
                        </p>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      {/* EDIT */}
                      <button
                        type="button"
                        onClick={() => handleEdit(document)}
                        disabled={
                          saving ||
                          deletingId === document._id ||
                          processingId === document._id
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6E3E7] bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#00A8CC] hover:bg-[#EAF9FC] hover:text-[#00A8CC] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit Title
                      </button>

                      {/* REPROCESS */}
                      <button
                        type="button"
                        onClick={() => handleReprocess(document._id)}
                        disabled={
                          processingId === document._id ||
                          deletingId === document._id
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#D6E3E7] bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-[#00A8CC] hover:bg-[#EAF9FC] hover:text-[#00A8CC] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-3.5 w-3.5 ${
                            processingId === document._id ? "animate-spin" : ""
                          }`}
                        />

                        {processingId === document._id
                          ? "Processing..."
                          : "Reprocess"}
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() => openDeleteConfirmation(document._id)}
                        disabled={
                          deletingId === document._id ||
                          processingId === document._id
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* PROCESSING ERROR */}
                  {document.status === "failed" && document.processingError ? (
                    <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                        <div>
                          <p className="text-xs font-bold text-red-700">
                            Processing failed
                          </p>

                          <p className="mt-1 text-xs leading-5 text-red-600">
                            {document.processingError}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          UPLOAD / EDIT MODAL
      ====================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between bg-[#092F38] px-5 py-4 text-white sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A8CC]">
                  {editingDocument ? (
                    <Pencil className="h-5 w-5" />
                  ) : (
                    <UploadCloud className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2 className="text-base font-extrabold sm:text-lg">
                    {editingDocument
                      ? "Edit Documentation"
                      : "Upload Documentation"}
                  </h2>

                  <p className="mt-0.5 text-[11px] font-medium text-slate-300 sm:text-xs">
                    {editingDocument
                      ? "Update the document title."
                      : "Upload knowledge for the AI Assistant."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="max-h-[calc(90vh-110px)] overflow-y-auto p-5 sm:p-6"
            >
              <div className="space-y-5">
                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#173942]">
                    Document Title
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. ASTU MSJ Attendance Policy"
                    disabled={saving}
                    className="w-full rounded-xl border border-[#D5E2E7] bg-[#F8FBFC] px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/10 disabled:opacity-60"
                  />
                </div>

                {/* FILE UPLOAD */}
                {!editingDocument && (
                  <div>
                    <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#173942]">
                      Documentation File
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !saving && fileInputRef.current?.click()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                        dragging
                          ? "border-[#00A8CC] bg-[#EAF9FC]"
                          : "border-[#D5E2E7] bg-[#F8FBFC] hover:border-[#00A8CC] hover:bg-[#F2FBFD]"
                      } ${saving ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      {selectedFile ? (
                        <div className="flex flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F8FC] text-[#00A8CC]">
                            <FileText className="h-7 w-7" />
                          </div>

                          <p className="mt-4 max-w-full truncate px-4 text-sm font-extrabold text-[#173942]">
                            {selectedFile.name}
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {formatFileSize(selectedFile.size)}
                          </p>

                          <p className="mt-3 text-xs font-bold text-[#00A8CC]">
                            Click to choose another file
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E5F8FC] text-[#00A8CC]">
                            <UploadCloud className="h-7 w-7" />
                          </div>

                          <p className="mt-4 text-sm font-extrabold text-[#173942]">
                            Drop your documentation here
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            or click to browse your computer
                          </p>

                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                            <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold text-red-600">
                              PDF
                            </span>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-600">
                              DOCX
                            </span>

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                              TXT
                            </span>
                          </div>

                          <p className="mt-4 text-[11px] font-medium text-slate-400">
                            Maximum file size: 20 MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* EDIT INFO */}
                {editingDocument && (
                  <div className="rounded-xl border border-[#DDE9EC] bg-[#F8FBFC] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E5F8FC] text-[#00A8CC]">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#155B68]">
                          Existing Documentation
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {editingDocument.originalName ||
                            editingDocument.title}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          To replace the file, delete this document and upload
                          the new version.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* PROCESSING INFORMATION */}
                {!editingDocument && (
                  <div className="rounded-xl border border-[#D7EEF3] bg-[#F0FBFD] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#00A8CC] shadow-sm">
                        <Database className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#155B68]">
                          AI Knowledge Processing
                        </p>

                        <p className="mt-1 text-xs font-medium leading-5 text-[#4D7C85]">
                          The uploaded file will be extracted, checked for
                          duplicates, converted into searchable chunks, and
                          processed for AI retrieval.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex flex-col-reverse gap-2 border-t border-[#E2EBEE] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-xl border border-[#D5E2E7] px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#008EAD] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {editingDocument ? (
                          <Pencil className="h-4 w-4" />
                        ) : (
                          <FileUp className="h-4 w-4" />
                        )}

                        {editingDocument ? "Save Title" : "Upload & Process"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ====================================================== */}
      {deleteDocumentId && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}
            <div className="bg-[#092F38] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/20">
                  <Trash2 className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    Delete Document?
                  </h2>

                  <p className="mt-0.5 text-xs font-medium text-slate-300">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-6">
              <p className="text-sm leading-6 text-slate-600">
                Are you sure you want to delete this document?
              </p>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                  <div>
                    <p className="text-sm font-bold text-red-700">Warning</p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      The document and uploaded file will also be permanently
                      deleted.
                    </p>
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  disabled={deletingId !== null}
                  className="rounded-xl border border-[#D5E2E7] px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deletingId !== null}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIDocumentation;
