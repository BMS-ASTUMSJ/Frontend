import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArrowRight,
  CalendarDays,
  Clock,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";
import api from "../../utils/api";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusStyle = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "completed":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "upcoming":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "inactive":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

const MentorBatchHistory = () => {
  const [currentBatch, setCurrentBatch] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [currentRole, setCurrentRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchBatchHistory = useCallback(async () => {
    try {
      setError("");

      const response = await api.get("/batch-history/my");

      console.log("BATCH HISTORY RESPONSE:", response.data);

      setCurrentBatch(response.data?.currentBatch || null);
      setCurrentRole(response.data?.currentRole || "");
      setBatchHistory(
        Array.isArray(response.data?.batchHistory)
          ? response.data.batchHistory
          : [],
      );
    } catch (err) {
      console.error("Failed to load batch history:", err);

      setError(
        err.response?.data?.message || "Failed to load your batch history.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBatchHistory();
  }, [fetchBatchHistory]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBatchHistory();
  };

  const previousBatches = batchHistory.filter((item) => {
    if (!currentBatch?._id) return true;

    return String(item.batchId) !== String(currentBatch._id);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FAFD] p-6">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B3CFE5]/40">
              <Loader2 size={25} className="animate-spin text-[#1A3D63]" />
            </div>

            <p className="mt-4 text-sm font-semibold text-[#1A3D63]">
              Loading your batch history...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A7FA7]">
              <Archive size={15} />
              Mentor
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0A1931] sm:text-3xl">
              My Batch
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              View your current batch and the batches you have previously worked
              with.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#B3CFE5] bg-white px-4 py-2.5 text-sm font-bold text-[#1A3D63] shadow-sm transition hover:bg-[#F6FAFD] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-bold text-red-700">
              Batch History Error
            </p>

            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* CURRENT BATCH */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />

            <h2 className="text-lg font-bold text-[#0A1931]">Current Batch</h2>
          </div>

          {currentBatch ? (
            <div className="overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-sm">
              <div className="bg-[#0A1931] p-6 text-white">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Current Batch
                    </div>

                    <h3 className="text-2xl font-bold">{currentBatch.name}</h3>

                    {currentBatch.description && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#B3CFE5]">
                        {currentBatch.description}
                      </p>
                    )}
                  </div>

                  <div
                    className={`self-start rounded-full border px-3 py-1.5 text-xs font-bold capitalize sm:self-auto ${getStatusStyle(
                      currentBatch.status,
                    )}`}
                  >
                    {currentBatch.status || "Active"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3">
                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="Start Date"
                  value={formatDate(currentBatch.startDate)}
                />

                <InfoCard
                  icon={<CalendarDays size={18} />}
                  label="End Date"
                  value={formatDate(currentBatch.endDate)}
                />

                <InfoCard
                  icon={<Users size={18} />}
                  label="Your Role"
                  value={currentRole || "Mentor"}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#B3CFE5] bg-white p-8 text-center shadow-sm">
              <Archive size={28} className="mx-auto text-[#4A7FA7]" />

              <h3 className="mt-3 font-bold text-[#0A1931]">
                No current batch
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                You are not currently assigned to a batch.
              </p>
            </div>
          )}
        </section>

        {/* PREVIOUS BATCHES */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                Batch History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Batches you have previously been assigned to.
              </p>
            </div>

            <span className="rounded-full bg-[#B3CFE5]/50 px-3 py-1 text-xs font-bold text-[#1A3D63]">
              {previousBatches.length}{" "}
              {previousBatches.length === 1 ? "Batch" : "Batches"}
            </span>
          </div>

          {previousBatches.length === 0 ? (
            <div className="rounded-2xl border border-[#B3CFE5] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B3CFE5]/30">
                <Archive size={24} className="text-[#4A7FA7]" />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#1A3D63]">
                No previous batches
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Your previous batch assignments will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {previousBatches.map((item) => {
                const batch = item.batch;

                if (!batch) return null;

                return (
                  <div
                    key={String(item.batchId)}
                    className="group overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* CARD HEADER */}
                    <div className="bg-[#1A3D63] p-5 text-white">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                          <Archive size={19} />
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${getStatusStyle(
                            batch.status,
                          )}`}
                        >
                          {batch.status || "Completed"}
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-bold">{batch.name}</h3>
                    </div>

                    {/* CARD BODY */}
                    <div className="p-5">
                      {batch.description && (
                        <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-500">
                          {batch.description}
                        </p>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <CalendarDays size={15} />

                            <span className="text-xs font-semibold">Start</span>
                          </div>

                          <span className="text-xs font-bold text-[#1A3D63]">
                            {formatDate(batch.startDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <CalendarDays size={15} />

                            <span className="text-xs font-semibold">End</span>
                          </div>

                          <span className="text-xs font-bold text-[#1A3D63]">
                            {formatDate(batch.endDate)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock size={15} />

                            <span className="text-xs font-semibold">
                              Joined
                            </span>
                          </div>

                          <span className="text-xs font-bold text-[#1A3D63]">
                            {formatDate(item.joinedAt)}
                          </span>
                        </div>
                      </div>

                      {/* VIEW */}
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = `/mentor/my-batch/${item.batchId}`;
                        }}
                        className="mt-6 flex w-full items-center justify-between rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-xs font-bold text-[#1A3D63] transition hover:border-[#4A7FA7] hover:bg-[#B3CFE5]/30"
                      >
                        <span>View Batch</span>

                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="rounded-xl border border-[#B3CFE5]/70 bg-[#F6FAFD] p-4">
      <div className="flex items-center gap-2 text-[#4A7FA7]">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-bold capitalize text-[#1A3D63]">
        {value}
      </p>
    </div>
  );
};

export default MentorBatchHistory;
