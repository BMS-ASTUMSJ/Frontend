import { useState, useEffect, useMemo } from "react";
import api from "../../utils/api";

import {
  Layers,
  Plus,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  Search,
  ChevronDown,
} from "lucide-react";

import toast, { Toaster } from "react-hot-toast";

function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionId, setActionId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming",
  });

  const fetchBatches = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/batches");

      setBatches(response.data?.batches || []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to fetch batches from the server.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Batch name is required.");
      toast.error("Batch name is required.");
      return;
    }
    if (
      formData.startDate &&
      new Date(formData.startDate) < new Date(new Date().setHours(0, 0, 0, 0))
    ) {
      toast.error("Start date should be today or a future date.");
      return;
    }
    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      toast.error("End date cannot be before start date.");
      return;
    }

    try {
      setActionId("creating");

      await api.post("/batches", {
        name: formData.name.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description.trim(),
        status: formData.status,
      });

      setSuccess("Batch created successfully.");
      toast.success("Batch created successfully.");

      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        status: "upcoming",
      });

      await fetchBatches(false);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create batch.";

      setError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const handleStatusChange = async (batchId, newStatus) => {
    const batch = batches.find((item) => item._id === batchId);

    if (!batch || batch.status === newStatus) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setActionId(batchId);

      const response = await api.patch(`/batches/${batchId}/status`, {
        status: newStatus,
      });

      if (response.data?.batches) {
        setBatches(response.data.batches);
      } else if (response.data?.batch) {
        setBatches((previous) =>
          previous.map((item) =>
            item._id === batchId ? response.data.batch : item,
          ),
        );
      } else {
        setBatches((previous) =>
          previous.map((item) =>
            item._id === batchId
              ? {
                  ...item,
                  status: newStatus,
                }
              : item,
          ),
        );
      }

      const message =
        response.data?.message || "Batch status updated successfully.";

      setSuccess(message);
      toast.success(message);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update batch status.";

      setError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const handleToggleRegistration = async (batchId) => {
    setError("");
    setSuccess("");

    try {
      setActionId(`registration-${batchId}`);

      const response = await api.patch(
        `/batches/${batchId}/toggle-registration`,
      );

      if (response.data?.batches) {
        setBatches(response.data.batches);
      } else if (response.data?.batch) {
        setBatches((previous) =>
          previous.map((batch) =>
            batch._id === batchId ? response.data.batch : batch,
          ),
        );
      } else {
        await fetchBatches(false);
      }

      const message =
        response.data?.message || "Registration status updated successfully.";

      setSuccess(message);
      toast.success("Registration status updated.");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update registration status.";

      setError(message);
      toast.error(message);
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "Not Set";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Not Set";
    }

    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasOpenRegistration = batches.some(
    (batch) => batch.isRegistrationOpen === true,
  );

  const filteredBatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    return batches.filter((batch) => {
      const name = batch.name?.toLowerCase() || "";
      const description = batch.description?.toLowerCase() || "";

      const matchesSearch =
        !query || name.includes(query) || description.includes(query);

      const matchesStatus =
        statusFilter === "all" || batch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [batches, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "13px",
          },
        }}
      />

      <div className="min-h-screen bg-[#f3f7f8] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-345">
          <div className="relative mb-7 overflow-hidden rounded-[26px] bg-[#082d38] px-6 py-7 shadow-[0_12px_35px_rgba(8,45,56,0.15)] sm:px-9 lg:px-10">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#08a9cd]/10 blur-3xl" />
            <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-[#08a9cd]/5 blur-3xl" />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-14.5 w-14.5 shrink-0 items-center justify-center rounded-[17px] bg-[#08a9cd] text-white shadow-[0_8px_20px_rgba(8,169,205,0.22)]">
                  <Layers size={29} strokeWidth={2.2} />
                </div>

                <div>
                  <h1 className="text-[25px] font-bold tracking-tight text-white sm:text-[29px]">
                    Batch Management
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-sm md:flex">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      hasOpenRegistration
                        ? "animate-pulse bg-emerald-400"
                        : "bg-rose-400"
                    }`}
                  />

                  {hasOpenRegistration
                    ? "Registration Open"
                    : "Registration Closed"}
                </div>

                <button
                  type="button"
                  onClick={() => fetchBatches(false)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? "animate-spin" : ""}
                  />

                  <span>Refresh</span>
                </button>
              </div>
            </div>
          </div>

          <main>
            <section className="overflow-hidden rounded-[25px] border border-[#dce8eb] bg-white shadow-[0_10px_35px_rgba(20,50,60,0.08)]">
              <div className="border-b border-[#e8eef1] px-6 py-7 sm:px-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#e4f7fb] text-[#00a8cc]">
                    <Plus size={22} strokeWidth={2.4} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#122530]">
                      Create New Batch
                    </h2>

                    <p className="mt-1 text-sm font-medium text-[#91a4ad]">
                      Add a new training cohort to the bootcamp system
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateBatch} className="p-6 sm:p-8">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wide text-[#263b45]">
                      Batch Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Batch 3 (2026)"
                      className="h-12.75 w-full rounded-xl border border-[#d2e3e9] bg-[#f8fafb] px-4 text-sm font-semibold text-[#152832] outline-none transition placeholder:text-[#9aaeb7] focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wide text-[#263b45]">
                      Start Date
                    </label>

                    <div className="relative">
                      <Calendar
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fa3ad]"
                      />

                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="h-12.75 w-full rounded-xl border border-[#d2e3e9] bg-[#f8fafb] pl-11 pr-4 text-sm font-semibold text-[#152832] outline-none transition focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wide text-[#263b45]">
                      End Date
                    </label>

                    <div className="relative">
                      <Calendar
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fa3ad]"
                      />

                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            endDate: e.target.value,
                          })
                        }
                        className="h-12.75 w-full rounded-xl border border-[#d2e3e9] bg-[#f8fafb] pl-11 pr-4 text-sm font-semibold text-[#152832] outline-none transition focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wide text-[#263b45]">
                      Initial Status
                    </label>

                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            status: e.target.value,
                          })
                        }
                        className="h-12.75 w-full appearance-none rounded-xl border border-[#d2e3e9] bg-[#f8fafb] px-4 pr-10 text-sm font-semibold text-[#152832] outline-none transition focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                      >
                        <option value="upcoming">Upcoming</option>

                        <option value="active">Active</option>
                      </select>

                      <ChevronDown
                        size={17}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8fa3ad]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-wide text-[#263b45]">
                    Description
                  </label>

                  <div className="flex flex-col gap-4 lg:flex-row">
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief overview or focus areas of this batch..."
                      className="h-12.75 flex-1 rounded-xl border border-[#d2e3e9] bg-[#f8fafb] px-4 text-sm font-semibold text-[#152832] outline-none transition placeholder:text-[#9aaeb7] focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                    />

                    <button
                      type="submit"
                      disabled={actionId === "creating"}
                      className="inline-flex h-12.75 min-w-45 items-center justify-center gap-2 rounded-xl bg-[#08a9cd] px-6 text-sm font-bold text-white shadow-[0_7px_20px_rgba(0,168,204,0.2)] transition hover:bg-[#008eae] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionId === "creating" ? (
                        <Loader2 size={17} className="animate-spin" />
                      ) : (
                        <Plus size={17} />
                      )}
                      Create Batch
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {error && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                <div className="flex items-center gap-3">
                  <AlertCircle size={18} className="shrink-0 text-rose-500" />

                  <span>{error}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  className="rounded-lg p-1.5 transition hover:bg-rose-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {success && (
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={18}
                    className="shrink-0 text-emerald-500"
                  />

                  <span>{success}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  className="rounded-lg p-1.5 transition hover:bg-emerald-100"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <section className="mt-7 overflow-hidden rounded-[25px] border border-[#d8e7ec] bg-white shadow-[0_8px_30px_rgba(20,50,60,0.07)]">
              <div className="border-b border-[#e7eef1] px-6 py-7 sm:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-[23px] font-bold tracking-tight text-[#122530]">
                      Batch Directory
                    </h2>

                    <p className="mt-1 text-sm font-medium text-[#8da3ad]">
                      View and manage all bootcamp training batches
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 pb-1 lg:flex-row lg:items-center">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8fa6b0]"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by batch name or description..."
                      className="h-12.75 w-full rounded-xl border border-[#d2e3e9] bg-[#f8fafb] pl-11 pr-11 text-sm font-semibold text-[#152832] outline-none transition placeholder:text-[#9aaeb7] focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#8fa3ad] transition hover:bg-[#eaf3f6] hover:text-[#152832]"
                      >
                        <X size={15} />
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="h-12.75 min-w-43.75 appearance-none rounded-xl border border-[#d2e3e9] bg-[#f8fafb] px-4 pr-10 text-sm font-bold capitalize text-[#263b45] outline-none transition focus:border-[#00a8cc] focus:bg-white focus:ring-2 focus:ring-[#00a8cc]/10"
                    >
                      <option value="all">All statuses</option>

                      <option value="active">Active</option>

                      <option value="upcoming">Upcoming</option>

                      <option value="completed">Completed</option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#8fa3ad]"
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex min-h-82.5 flex-col items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e3f7fb]">
                    <Loader2
                      size={28}
                      className="animate-spin text-[#00a8cc]"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#8fa3ad]">
                    Loading batches...
                  </p>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="flex min-h-90 flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#e5f7fb] text-[#00a8cc]">
                    <Layers size={34} strokeWidth={1.8} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#122530]">
                    No batches found
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-[#94a7b0]">
                    {search || statusFilter !== "all"
                      ? "No batches match your active filters."
                      : "Create your first training cohort using the form above."}
                  </p>

                  {(search || statusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 rounded-xl bg-[#e4f7fb] px-5 py-2.5 text-xs font-bold text-[#008eae] transition hover:bg-[#d4f1f7]"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto px-2 pb-6 pt-2 sm:px-9">
                  <div className="min-w-237.5">
                    <div className="grid grid-cols-[2fr_1.3fr_1.25fr_1.15fr_1.3fr] border-b border-[#edf1f2] px-2 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a5ae]">
                      <div>Batch</div>

                      <div>Duration</div>

                      <div>Status</div>

                      <div>Registration</div>

                      <div>Created</div>
                    </div>

                    <div className="space-y-3 pt-3">
                      {filteredBatches.map((batch) => {
                        const status = batch.status || "upcoming";

                        const statusClasses =
                          status === "active"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                            : status === "completed"
                              ? "border-slate-200 bg-slate-100 text-slate-600"
                              : "border-orange-100 bg-orange-50 text-orange-600";

                        return (
                          <div
                            key={batch._id}
                            className="grid grid-cols-[2fr_1.3fr_1.25fr_1.15fr_1.3fr] items-center overflow-hidden rounded-[19px] border border-[#edf1f2] border-l-4 border-l-[#08a9cd] bg-white shadow-[0_4px_18px_rgba(20,50,60,0.055)] transition hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(20,50,60,0.09)]"
                          >
                            <div className="px-5 py-5">
                              <div className="flex items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e4f5f8] text-[#00a8cc]">
                                  <Layers size={20} strokeWidth={2.2} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-[15px] font-bold text-[#172c36]">
                                    {batch.name}
                                  </p>

                                  <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide text-[#08a9cd]">
                                    Bootcamp Batch
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="px-4 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#334852]">
                                  {formatDate(batch.startDate)}
                                </span>

                                <span className="mt-1 text-[11px] font-semibold text-[#9aabb2]">
                                  {formatDate(batch.endDate)}
                                </span>
                              </div>
                            </div>

                            <div className="px-4 py-5">
                              <div className="relative inline-block">
                                <select
                                  value={status}
                                  onChange={(e) =>
                                    handleStatusChange(
                                      batch._id,
                                      e.target.value,
                                    )
                                  }
                                  disabled={actionId === batch._id}
                                  className={`h-9 cursor-pointer appearance-none rounded-full border pl-3.5 pr-8 text-[10px] font-bold uppercase tracking-wide outline-none transition ${statusClasses}`}
                                >
                                  <option value="upcoming">Upcoming</option>

                                  <option value="active">Active</option>

                                  <option value="completed">Completed</option>
                                </select>

                                <ChevronDown
                                  size={12}
                                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-current opacity-70"
                                />
                              </div>
                            </div>

                            <div className="px-4 py-5">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleRegistration(batch._id)
                                }
                                disabled={
                                  actionId === `registration-${batch._id}`
                                }
                                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[10px] font-bold uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  batch.isRegistrationOpen
                                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    batch.isRegistrationOpen
                                      ? "animate-pulse bg-emerald-500"
                                      : "bg-slate-400"
                                  }`}
                                />

                                {actionId === `registration-${batch._id}` ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : batch.isRegistrationOpen ? (
                                  "Open"
                                ) : (
                                  "Closed"
                                )}
                              </button>
                            </div>

                            <div className="px-4 py-5">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-[#263b45]">
                                  {formatDate(batch.createdAt)}
                                </span>

                                <span className="mt-1 text-[11px] font-semibold text-[#9aabb2]">
                                  {formatTime(batch.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}

export default BatchManagement;
