import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  ClipboardList,
  Plus,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [actionId, setActionId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming",
  });

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/batches");

      setBatches(response.data?.batches || []);
    } catch (err) {
      console.error("Fetch batches error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch batches from the server.",
      );
    } finally {
      setLoading(false);
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
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      setError("End date cannot be before start date.");
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

      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        status: "upcoming",
      });

      await fetchBatches();
    } catch (err) {
      console.error("Create batch error:", err);

      setError(err.response?.data?.message || "Failed to create batch.");
    } finally {
      setActionId(null);
    }
  };

  const handleStatusChange = async (batchId, newStatus) => {
    const batch = batches.find((item) => item._id === batchId);

    if (!batch) return;

    if (batch.status === newStatus) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setActionId(batchId);

      const response = await api.patch(`/batches/${batchId}/status`, {
        status: newStatus,
      });

      setSuccess(
        response.data?.message || "Batch status updated successfully.",
      );

      if (response.data?.batches) {
        setBatches(response.data.batches);
      } else {
        setBatches((previousBatches) =>
          previousBatches.map((item) =>
            item._id === batchId
              ? {
                  ...item,
                  status: newStatus,
                }
              : item,
          ),
        );
      }
    } catch (err) {
      console.error("Update batch status error:", err);

      setError(err.response?.data?.message || "Failed to update batch status.");
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

      /*
       * If backend returns the updated batch
       */
      if (response.data?.batch) {
        setBatches((previousBatches) =>
          previousBatches.map((batch) =>
            batch._id === batchId ? response.data.batch : batch,
          ),
        );
      }

      /*
       * If backend returns the complete batches list
       */
      if (response.data?.batches) {
        setBatches(response.data.batches);
      }

      /*
       * If backend doesn't return the updated batch/list,
       * fetch the latest data from the server.
       */
      if (!response.data?.batch && !response.data?.batches) {
        await fetchBatches();
      }

      setSuccess(
        response.data?.message || "Registration status updated successfully.",
      );
    } catch (err) {
      console.error("Toggle registration error:", err);

      setError(
        err.response?.data?.message || "Failed to update registration status.",
      );
    } finally {
      setActionId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Set";

    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "border-green-200 bg-green-100 text-green-700";

      case "upcoming":
        return "border-blue-200 bg-blue-100 text-blue-700";

      case "completed":
        return "border-gray-200 bg-gray-100 text-gray-700";

      default:
        return "border-gray-200 bg-gray-100 text-gray-700";
    }
  };

  const hasOpenRegistration = batches.some(
    (batch) => batch.isRegistrationOpen === true,
  );

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="rounded-3xl bg-[#0A1931] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 text-white">
              <div className="rounded-2xl bg-[#1A3D63] p-3">
                <ClipboardList className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">Batch Management</h1>

                <p className="mt-1 text-sm text-[#B3CFE5]">
                  Create and manage bootcamp batches.
                </p>
              </div>
            </div>

            {/* REGISTRATION STATUS */}

            <div className="rounded-2xl bg-white/10 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B3CFE5]">
                Registration
              </p>

              <div className="mt-1 flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    hasOpenRegistration ? "bg-green-400" : "bg-red-400"
                  }`}
                />

                <span className="text-sm font-bold text-white">
                  {hasOpenRegistration ? "Currently Open" : "Currently Closed"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-fit rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-bold text-[#0A1931]">
              Create New Batch
            </h2>

            <form onSubmit={handleCreateBatch} className="space-y-5">
              {/* BATCH NAME */}

              <div>
                <label className="text-sm font-semibold text-[#0A1931]">
                  Batch Name
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
                  placeholder="e.g. Batch 1 (2026)"
                  className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-[#0A1931]">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-3 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-[#0A1931]">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate: e.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-3 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="text-sm font-semibold text-[#0A1931]">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this bootcamp batch..."
                  className="mt-2 w-full resize-none rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#1A3D63]"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="text-sm font-semibold text-[#0A1931]">
                  Initial Batch Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* CREATE */}

              <button
                type="submit"
                disabled={actionId === "creating"}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A3D63] py-3 font-semibold text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionId === "creating" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Create Batch
              </button>
            </form>
          </div>

          {/* ====================================================
              BATCH LIST
          ==================================================== */}

          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  Existing Batches
                </h2>

                <p className="mt-1 text-xs text-[#7A7F85]">
                  {batches.length} batch
                  {batches.length !== 1 ? "es" : ""} found
                </p>
              </div>
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="flex justify-center rounded-3xl bg-white p-12">
                <Loader2 className="h-7 w-7 animate-spin text-[#1A3D63]" />
              </div>
            ) : batches.length === 0 ? (
              /* EMPTY */

              <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-12 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-[#B3CFE5]" />

                <p className="mt-3 font-semibold text-[#0A1931]">
                  No batches found
                </p>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  Create your first bootcamp batch.
                </p>
              </div>
            ) : (
              /* BATCHES */

              batches.map((batch) => (
                <div
                  key={batch._id}
                  className="rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    {/* BATCH INFORMATION */}

                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F6FAFD] text-[#1A3D63]">
                        <ClipboardList className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-[#0A1931]">
                            {batch.name}
                          </h3>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${getStatusStyle(
                              batch.status,
                            )}`}
                          >
                            {batch.status || "unknown"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#7A7F85]">
                          <Calendar className="h-3.5 w-3.5" />

                          <span>
                            {formatDate(batch.startDate)}
                            {" - "}
                            {formatDate(batch.endDate)}
                          </span>
                        </div>

                        {batch.description && (
                          <p className="mt-2 max-w-xl text-xs text-[#7A7F85]">
                            {batch.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ==================================================
                        RIGHT SIDE
                    ================================================== */}

                    <div className="flex flex-wrap items-center gap-3">
                      {/* STATUS SELECTOR */}

                      <div className="flex items-center gap-2">
                        <select
                          value={batch.status || "upcoming"}
                          onChange={(e) =>
                            handleStatusChange(batch._id, e.target.value)
                          }
                          disabled={actionId === batch._id}
                          className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none transition ${getStatusStyle(
                            batch.status,
                          )} ${
                            actionId === batch._id
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                        >
                          <option value="upcoming">Upcoming</option>

                          <option value="active">Active</option>

                          <option value="completed">Completed</option>
                        </select>

                        {actionId === batch._id && (
                          <Loader2 className="h-4 w-4 animate-spin text-[#1A3D63]" />
                        )}
                      </div>

                      {/* REGISTRATION OPEN / CLOSE BUTTON */}

                      <button
                        type="button"
                        onClick={() => handleToggleRegistration(batch._id)}
                        disabled={actionId === `registration-${batch._id}`}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          batch.isRegistrationOpen
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {actionId === `registration-${batch._id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              batch.isRegistrationOpen
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                        )}

                        {batch.isRegistrationOpen
                          ? "Registration Open"
                          : "Registration Closed"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchManagement;
