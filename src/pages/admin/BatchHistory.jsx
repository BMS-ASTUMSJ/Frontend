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

  const getStatusStyle = (status) => {
    switch (String(status || "").toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-[#e6f4f8] text-[#008ba3] border-[#bce3ed]";
      case "upcoming":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#EBF3F6] text-[#1c2c30] pb-12">
      {/* GRADIENT HERO BANNER */}
      <div className="bg-gradient-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] pb-24 pt-10 px-6 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* BRAND GRADIENT APPLIED TO MAIN HEADER ICON */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] text-white shadow-md border border-white/10">
                <Archive className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[#a3cbcf] mb-1 border border-white/10">
                  Administration
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Batch History
                </h1>
                <p className="text-sm text-[#a3cbcf] mt-0.5">
                  View past & active cohorts and inspect assigned members
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchBatches}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Batches
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAPPING MAIN CONTENT AREA */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-14">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH BAR */}
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

        {/* TABLE CONTENT */}
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-[#D0E2EB] bg-white shadow-sm">
            <Loader2 className="h-8 w-8 animate-spin text-[#0f2b34]" />
            <p className="mt-4 text-sm font-semibold text-[#0D2A38]">
              Loading batch history...
            </p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-[#D0E2EB] bg-white p-10 text-center shadow-sm">
            {/* BRAND GRADIENT APPLIED TO EMPTY STATE ICON CONTAINER */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] text-white">
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
          <div className="overflow-hidden rounded-3xl border border-[#D0E2EB] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#D0E2EB] bg-[#F4F9FB] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-3.5">Batch</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Start Date</th>
                    <th className="px-6 py-3.5">End Date</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EBF3F6]">
                  {filteredBatches.map((batch) => (
                    <tr
                      key={batch._id}
                      className="transition hover:bg-[#F4F9FB]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {/* BRAND GRADIENT APPLIED TO TABLE ROW ICON */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] text-white shadow-sm">
                            <Archive size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-[#0D2A38] text-sm">
                              {batch.name}
                            </p>
                            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                              Cohort
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-xs px-6 py-4">
                        <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                          {batch.description || "No description provided"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <CalendarDays size={14} className="text-[#1b3c47]" />
                          {formatDate(batch.startDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                          <CalendarDays size={14} className="text-[#1b3c47]" />
                          {formatDate(batch.endDate)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(
                            batch.status,
                          )}`}
                        >
                          {batch.status || "Unknown"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openBatch(batch)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[#B3E5FC] bg-[#E0F7FA] px-3.5 py-1.5 text-xs font-bold text-[#008ba3] transition hover:bg-[#0088A6] hover:text-white hover:border-[#0f2b34]"
                        >
                          View Members
                          <ChevronRight size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* BATCH MEMBERS MODAL */}
      {selectedBatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b23]/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeBatch();
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#D0E2EB]">
            {/* MODAL HEADER WITH BRAND GRADIENT */}
            <div className="flex items-center justify-between border-b border-[#D0E2EB] bg-gradient-to-r from-[#1b3c47] via-[#0f2b34] to-[#071b23] px-6 py-4 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#92B0C0]">
                  Batch Members Overview
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
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
                <div className="flex min-h-[250px] flex-col items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-[#0f2b34]" />
                  <p className="mt-3 text-xs font-semibold text-[#0D2A38]">
                    Loading batch members...
                  </p>
                </div>
              ) : members.length === 0 ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
                  <Users className="h-8 w-8 text-slate-300 mb-2" />
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

                  <div className="overflow-hidden rounded-2xl border border-[#D0E2EB] bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-[#D0E2EB] bg-[#F4F9FB] text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <th className="px-5 py-3">Member</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3 text-center">Role</th>
                            <th className="px-5 py-3 text-center">Joined</th>
                            <th className="px-5 py-3 text-center">Status</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[#EBF3F6]">
                          {members.map((member) => {
                            const initials =
                              `${member.firstName || ""}${member.lastName || ""}`
                                .trim()
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                              <tr
                                key={`${member.userId}-${member.joinedAt}`}
                                className="transition hover:bg-[#F4F9FB]"
                              >
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#1b3c47] to-[#0f2b34] text-xs font-bold text-white shadow-sm">
                                      {initials || "U"}
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#0D2A38] text-xs sm:text-sm">
                                        {member.firstName} {member.lastName}
                                      </p>
                                      {member.schoolId && (
                                        <p className="text-[10px] font-mono text-slate-400">
                                          {member.schoolId}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                                  {member.email}
                                </td>

                                <td className="px-5 py-3.5 text-center">
                                  <span className="inline-block rounded-full bg-[#E0F7FA] px-2.5 py-0.5 text-[10px] font-bold capitalize text-[#008ba3] border border-[#B3E5FC]">
                                    {member.roleInBatch ||
                                      member.currentRole ||
                                      "N/A"}
                                  </span>
                                </td>

                                <td className="px-5 py-3.5 text-center text-xs text-slate-500 font-medium">
                                  {formatDate(member.joinedAt)}
                                </td>

                                <td className="px-5 py-3.5 text-center">
                                  {member.isCurrentBatch ? (
                                    <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                      Current
                                    </span>
                                  ) : (
                                    <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
                                      Previous
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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
