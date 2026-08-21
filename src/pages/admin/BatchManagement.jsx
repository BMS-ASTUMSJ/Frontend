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

    if (!batch || batch.status === newStatus) return;

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
      } else if (response.data?.batch) {
        setBatches((previousBatches) =>
          previousBatches.map((item) =>
            item._id === batchId ? response.data.batch : item,
          ),
        );
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

      if (response.data?.batches) {
        setBatches(response.data.batches);
      } else if (response.data?.batch) {
        setBatches((previousBatches) =>
          previousBatches.map((batch) =>
            batch._id === batchId ? response.data.batch : batch,
          ),
        );
      } else {
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
      <div className="mx-auto max-w-7xl space-y-10">
        {/* HEADER */}
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

        {/* ALERTS */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <p className="text-sm font-medium">{success}</p>
          </div>
        )}

        {/* =====================================================
            CREATE NEW BATCH
        ====================================================== */}
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-[#EAF3F9] p-3 text-[#1A3D63]">
              <Plus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#0A1931]">
                Create New Batch
              </h2>

              <p className="text-sm text-[#7A7F85]">
                Add a new bootcamp batch to the system.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateBatch}>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
                  className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* START DATE */}
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
                  className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3D63]"
                />
              </div>

              {/* END DATE */}
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
                  className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3D63]"
                />
              </div>

              {/* STATUS */}
              <div>
                <label className="text-sm font-semibold text-[#0A1931]">
                  Initial Status
                </label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3D63]"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-semibold text-[#0A1931]">
                  Description
                </label>

                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this bootcamp batch..."
                  className="mt-2 w-full resize-none rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm outline-none focus:border-[#1A3D63]"
                />
              </div>

              {/* CREATE BUTTON */}
              <button
                type="submit"
                disabled={actionId === "creating"}
                className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-6 py-3 font-semibold text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionId === "creating" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                Create Batch
              </button>
            </div>
          </form>
        </section>

        {/* DIVIDER */}
        <div className="h-px bg-[#B3CFE5]" />

        {/* =====================================================
            EXISTING BATCHES
        ====================================================== */}
        <section>
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A1931]">
                Existing Batches
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                {batches.length} batch
                {batches.length !== 1 ? "es" : ""} found
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-[#1A3D63]" />
            </div>
          ) : batches.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#B3CFE5] py-16 text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-[#B3CFE5]" />

              <p className="mt-3 font-semibold text-[#0A1931]">
                No batches found
              </p>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Create your first bootcamp batch above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#B3CFE5] bg-white">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD]">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Batch
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Duration
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Registration
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch._id}
                      className="border-b border-gray-100 transition last:border-0 hover:bg-[#F6FAFD]"
                    >
                      {/* BATCH */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3F9] text-[#1A3D63]">
                            <ClipboardList className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-bold text-[#0A1931]">
                              {batch.name}
                            </p>

                            {batch.description && (
                              <p className="mt-1 max-w-xs truncate text-xs text-[#7A7F85]">
                                {batch.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* DURATION */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 shrink-0 text-[#4A7FA7]" />

                          <div>
                            <p className="font-medium text-[#0A1931]">
                              {formatDate(batch.startDate)}
                            </p>

                            <p className="text-xs text-[#7A7F85]">
                              to {formatDate(batch.endDate)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <select
                            value={batch.status || "upcoming"}
                            onChange={(e) =>
                              handleStatusChange(batch._id, e.target.value)
                            }
                            disabled={actionId === batch._id}
                            className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none ${getStatusStyle(
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
                      </td>

                      {/* REGISTRATION */}
                      <td className="px-6 py-5">
                        <div
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${
                            batch.isRegistrationOpen
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              batch.isRegistrationOpen
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />

                          {batch.isRegistrationOpen ? "Open" : "Closed"}
                        </div>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRegistration(batch._id)}
                          disabled={actionId === `registration-${batch._id}`}
                          className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            batch.isRegistrationOpen
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-[#EAF3F9] text-[#1A3D63] hover:bg-[#B3CFE5]"
                          }`}
                        >
                          {actionId === `registration-${batch._id}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : batch.isRegistrationOpen ? (
                            "Close Registration"
                          ) : (
                            "Open Registration"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default BatchManagement;
