import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  ArrowRight,
  Clock,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar,
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

const getStatusBadge = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        ACTIVE
      </span>
    );
  }
  if (normalized === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        COMPLETED
      </span>
    );
  }
  if (normalized === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        UPCOMING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {String(status || "INACTIVE").toUpperCase()}
    </span>
  );
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

      setCurrentBatch(response.data?.currentBatch || null);
      setCurrentRole(response.data?.currentRole || "");
      setBatchHistory(
        Array.isArray(response.data?.batchHistory)
          ? response.data.batchHistory
          : [],
      );
    } catch (err) {
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
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FA]">
        <div className="flex items-center gap-2 text-[#00A8CC]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium text-[#14222B]">
            Loading your batch history...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-2xl border border-[#00A8CC]/30 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-5 shadow-lg sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-sm shadow-[#00A8CC]/20">
                <Archive size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  My Batch
                </h1>
                <p className="text-xs text-[#8FA3B0]">
                  View your current batch and historical cohorts you have
                  mentored
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#00A8CC]" : "text-[#00A8CC]"}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#00A8CC] bg-white shadow-sm">
          <div className="border-b border-[#00A8CC]/20 bg-[#F4F8FA] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#14222B]">
                  Batch History
                </h2>
                <p className="text-xs text-[#8FA3B0]">
                  Batches you have previously been assigned to
                </p>
              </div>

              <span className="rounded-xl border border-[#00A8CC]/30 bg-[#E3F5F9] px-3 py-1.5 text-xs font-bold text-[#00A8CC]">
                {previousBatches.length}{" "}
                {previousBatches.length === 1 ? "Batch" : "Batches"}
              </span>
            </div>
          </div>

          <div className="p-6">
            {previousBatches.length === 0 ? (
              <div className="p-10 text-center">
                <Archive className="mx-auto h-12 w-12 text-[#8FA3B0]" />
                <h3 className="mt-3 text-sm font-bold text-[#14222B]">
                  No previous batches
                </h3>
                <p className="mt-1 text-xs text-[#8FA3B0]">
                  Your previous batch assignments will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="hidden md:grid grid-cols-[1.8fr_1.2fr_1fr_1fr_130px] gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                  <span>DELIVERABLE BATCH</span>
                  <span>DURATION</span>
                  <span>JOINED ON</span>
                  <span>STATUS</span>
                  <span className="text-right">OPERATIONAL ACTION</span>
                </div>

                {previousBatches.map((item) => {
                  const batch = item.batch;
                  if (!batch) return null;

                  const initials = batch.name
                    ? batch.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "BH";

                  return (
                    <div
                      key={String(item.batchId)}
                      className="grid grid-cols-1 md:grid-cols-[1.8fr_1.2fr_1fr_1fr_130px] items-center gap-4 rounded-2xl border border-slate-200 border-l-[5px] border-l-[#00A8CC] bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9] font-bold text-[#00A8CC] text-xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-xs text-[#0F172A]">
                            {batch.name}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#00A8CC]">
                            COHORT ARCHIVE
                          </p>
                        </div>
                      </div>

                      <div className="text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#00A8CC]" />
                          <span>
                            {formatDate(batch.startDate)} —{" "}
                            {formatDate(batch.endDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-medium text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#8FA3B0]" />
                          <span>{formatDate(item.joinedAt)}</span>
                        </div>
                      </div>

                      <div>{getStatusBadge(batch.status)}</div>

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/mentor/my-batch/${item.batchId}`;
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#00A8CC]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#14222B] transition hover:bg-[#E3F5F9]"
                        >
                          <span>View Batch</span>
                          <ArrowRight size={13} className="text-[#00A8CC]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorBatchHistory;
