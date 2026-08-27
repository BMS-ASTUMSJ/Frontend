import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  CalendarDays,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import api from "../../utils/api";

const AdminBatchHistory = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/batches");
      setBatches(Array.isArray(res.data?.batches) ? res.data.batches : []);
    } catch (err) {
      console.error("Failed to load batches:", err);
      setError(err.response?.data?.message || "Failed to load batch history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const openBatch = async (batch) => {
    setSelectedBatch(batch);
    setMembers([]);
    setLoadingMembers(true);
    setError("");

    try {
      const res = await api.get(`/batches/${batch._id}`);

      const students = Array.isArray(res.data?.students)
        ? res.data.students
        : [];
      const mentors = Array.isArray(res.data?.mentors) ? res.data.mentors : [];

      const studentMembers = students.map((student) => {
        const historyEntry = Array.isArray(student.batchHistory)
          ? student.batchHistory.find(
              (item) =>
                item.batch &&
                String(item.batch._id || item.batch) === String(batch._id),
            )
          : null;

        return {
          ...student,
          userId: student._id,
          roleInBatch:
            historyEntry?.role ||
            (student.role === "student" ? "student" : student.role),
          currentRole: student.role,
          joinedAt: historyEntry?.joinedAt || student.createdAt,
          isCurrentBatch:
            student.batch &&
            String(student.batch._id || student.batch) === String(batch._id),
        };
      });

      const mentorMembers = mentors.map((mentor) => {
        const historyEntry = Array.isArray(mentor.batchHistory)
          ? mentor.batchHistory.find(
              (item) =>
                item.batch &&
                String(item.batch._id || item.batch) === String(batch._id),
            )
          : null;

        return {
          ...mentor,
          userId: mentor._id,
          roleInBatch:
            historyEntry?.role ||
            (mentor.role === "mentor" ? "mentor" : mentor.role),
          currentRole: mentor.role,
          joinedAt: historyEntry?.joinedAt || mentor.createdAt,
          isCurrentBatch:
            mentor.batch &&
            String(mentor.batch._id || mentor.batch) === String(batch._id),
        };
      });

      setMembers([...studentMembers, ...mentorMembers]);
    } catch (err) {
      console.error("Failed to load batch members:", err);
      setError(err.response?.data?.message || "Failed to load batch members.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const closeBatch = () => {
    setSelectedBatch(null);
    setMembers([]);
    setError("");
  };

  const filteredBatches = batches.filter((batch) =>
    batch.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "N/A";

    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const isCompleted = String(status || "").toLowerCase() === "completed";
    const isActive = String(status || "").toLowerCase() === "active";

    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black tracking-wider text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          ACTIVE
        </span>
      );
    }

    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E0F7FA] px-3 py-1 text-xs font-black tracking-wider text-[#008ba3]">
          <span className="h-2 w-2 rounded-full bg-[#008ba3]"></span>
          COMPLETED
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black tracking-wider text-amber-600">
        <span className="h-2 w-2 rounded-full bg-amber-500"></span>
        {String(status || "UPCOMING").toUpperCase()}
      </span>
    );
  };

  const getInitials = (name) => {
    if (!name) return "BA";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f3f7f8] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[20px] bg-[#0c2e3a] px-8 py-6 shadow-md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00a8cc] text-white shadow-sm">
                <Archive className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Batch History
              </h1>
            </div>

            <button
              type="button"
              onClick={fetchBatches}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Batches
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl pt-6">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-3xl border border-[#D0E2EB] bg-white p-3.5 shadow-md">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches by name..."
              className="w-full rounded-2xl border border-[#D0E2EB] bg-[#f8fafb] py-2.5 pl-11 pr-4 text-sm text-[#0D2A38] outline-none transition placeholder:text-slate-400 focus:border-[#00a8cc] focus:bg-white focus:ring-4 focus:ring-[#00a8cc]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-87.5 flex-col items-center justify-center rounded-3xl border border-[#D0E2EB] bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f2b34]" />
            <p className="mt-4 text-sm font-semibold text-[#0D2A38]">
              Loading batch history...
            </p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="flex min-h-87.5 flex-col items-center justify-center rounded-3xl border border-[#D0E2EB] bg-white p-10 text-center shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] text-white">
              <Archive className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-[#0D2A38]">
              No Batches Found
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-400">
              There are no batches matching your search filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden grid-cols-12 gap-4 px-8 text-[11px] font-black uppercase tracking-wider text-slate-400 lg:grid">
              <div className="col-span-3">Batch Name</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Start Date</div>
              <div className="col-span-2">End Date</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {filteredBatches.map((batch) => (
              <div
                key={batch._id}
                className="relative overflow-hidden rounded-[20px] border border-[#e1edf2] bg-white p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2.5 rounded-l-[20px] bg-[#00a8cc]" />

                <div className="grid grid-cols-1 items-center gap-4 pl-3 lg:grid-cols-12">
                  <div className="col-span-3 flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3f6f9] text-sm font-black text-[#008ba3]">
                      {getInitials(batch.name)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#0c2e3a]">
                        {batch.name}
                      </h3>
                      <span className="text-[11px] font-black tracking-wide text-[#00a8cc]">
                        COHORT
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <p className="line-clamp-2 text-xs font-medium leading-relaxed text-slate-500">
                      {batch.description || "No description provided"}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-[#00a8cc]" />
                      <span className="text-xs font-bold text-[#0c2e3a]">
                        {formatDate(batch.startDate)}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} className="text-[#00a8cc]" />
                      <span className="text-xs font-bold text-[#0c2e3a]">
                        {formatDate(batch.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-1 flex lg:justify-center">
                    {getStatusBadge(batch.status)}
                  </div>

                  <div className="col-span-1 flex lg:justify-end">
                    <button
                      type="button"
                      onClick={() => openBatch(batch)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#008ba3] transition hover:text-[#0c2e3a]"
                    >
                      View
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b23]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeBatch();
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#D0E2EB] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D0E2EB] bg-[#0c2e3a] px-6 py-4 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#92B0C0]">
                  Batch Members Overview
                </span>
                <h2 className="mt-0.5 text-lg font-bold text-white">
                  {selectedBatch.name}
                </h2>
                <p className="text-xs text-[#92B0C0]">
                  {formatDate(selectedBatch.startDate)} –{" "}
                  {formatDate(selectedBatch.endDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBatch}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              {loadingMembers ? (
                <div className="flex min-h-62.5 flex-col items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#0f2b34]" />
                  <p className="mt-3 text-xs font-semibold text-[#0D2A38]">
                    Loading batch members...
                  </p>
                </div>
              ) : members.length === 0 ? (
                <div className="flex min-h-62.5 flex-col items-center justify-center text-center">
                  <Users className="mb-2 h-8 w-8 text-slate-300" />
                  <h3 className="text-sm font-bold text-[#0D2A38]">
                    No members found
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    No users are assigned to this batch.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EBF3F6] pb-3">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#1b3c47]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0D2A38]">
                        Total Members ({members.length})
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {members.map((member) => {
                      const initials = getInitials(
                        `${member.firstName || ""} ${member.lastName || ""}`,
                      );

                      return (
                        <div
                          key={`${member.userId}-${member.joinedAt}`}
                          className="relative flex flex-col justify-between rounded-2xl border border-[#e1edf2] bg-white p-4 shadow-sm transition sm:flex-row sm:items-center"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e3f6f9] text-xs font-black text-[#008ba3]">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-[#0D2A38]">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {member.email}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-3 sm:mt-0">
                            <span className="rounded-full bg-[#E0F7FA] px-3 py-1 text-[11px] font-bold capitalize text-[#008ba3]">
                              {member.roleInBatch ||
                                member.currentRole ||
                                "N/A"}
                            </span>

                            {member.isCurrentBatch ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                                Current
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                                Previous
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBatchHistory;
