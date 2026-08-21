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
      /*
       * Get all batches from the batch controller.
       *
       * Backend:
       * GET /api/batches
       */
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
      /*
       * Get the selected batch together with:
       *
       * students
       * mentors
       * teams
       * applicants
       *
       * Backend:
       * GET /api/batches/:id
       */

      const res = await api.get(`/batches/${batch._id}`);

      console.log("BATCH DETAILS RESPONSE:", res.data);

      const students = Array.isArray(res.data?.students)
        ? res.data.students
        : [];

      const mentors = Array.isArray(res.data?.mentors) ? res.data.mentors : [];

      /*
       * Convert students and mentors into the format
       * already expected by the table.
       */

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

      const allMembers = [...studentMembers, ...mentorMembers];

      setMembers(allMembers);
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

    if (Number.isNaN(parsed.getTime())) {
      return "N/A";
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

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#4A7FA7]">
              <Archive size={19} />

              <span className="text-xs font-bold uppercase tracking-wider">
                Administration
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#0A1931] sm:text-3xl">
              Batch History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View previous batches and the users who belonged to each batch.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchBatches}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#B3CFE5] bg-white px-4 py-2.5 text-sm font-bold text-[#1A3D63] shadow-sm transition hover:bg-[#F6FAFD] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* SEARCH */}

        <div className="mb-6 rounded-2xl border border-[#B3CFE5] bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search batches..."
              className="w-full rounded-xl border border-slate-200 bg-[#F6FAFD] py-3 pl-11 pr-4 text-sm text-[#0A1931] outline-none transition placeholder:text-slate-400 focus:border-[#4A7FA7] focus:bg-white focus:ring-4 focus:ring-[#B3CFE5]/40"
            />
          </div>
        </div>

        {/* BATCHES */}

        {loading ? (
          <div className="flex min-h-80 items-center justify-center rounded-2xl border border-[#B3CFE5] bg-white">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#1A3D63]" />

              <p className="text-sm font-semibold text-slate-500">
                Loading batch history...
              </p>
            </div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-[#B3CFE5] bg-white p-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#B3CFE5]/30">
              <Archive size={25} className="text-[#4A7FA7]" />
            </div>

            <h2 className="text-sm font-bold text-[#0A1931]">
              No batches found
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              There are no batches matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBatches.map((batch) => (
              <button
                key={batch._id}
                type="button"
                onClick={() => openBatch(batch)}
                className="group rounded-2xl border border-[#B3CFE5] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#4A7FA7] hover:shadow-md"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A1931] text-white">
                    <Archive size={20} />
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${getStatusStyle(
                      batch.status,
                    )}`}
                  >
                    {batch.status || "Unknown"}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#0A1931]">
                  {batch.name}
                </h2>

                {batch.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {batch.description}
                  </p>
                )}

                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} className="text-[#4A7FA7]" />

                    <span>
                      {formatDate(batch.startDate)} -{" "}
                      {formatDate(batch.endDate)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between text-xs font-bold text-[#1A3D63]">
                  <span>View batch members</span>

                  <ChevronRight
                    size={17}
                    className="transition group-hover:translate-x-1"
                  />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* BATCH DETAILS MODAL */}

        {selectedBatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1931]/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              {/* MODAL HEADER */}

              <div className="flex items-center justify-between bg-[#0A1931] px-5 py-5 text-white sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#B3CFE5]">
                    Batch History
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    {selectedBatch.name}
                  </h2>

                  <p className="mt-1 text-xs text-[#B3CFE5]">
                    {formatDate(selectedBatch.startDate)} -{" "}
                    {formatDate(selectedBatch.endDate)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeBatch}
                  className="rounded-xl p-2 transition hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* MEMBERS */}

              <div className="max-h-[calc(90vh-110px)] overflow-y-auto p-5 sm:p-6">
                {loadingMembers ? (
                  <div className="flex min-h-60 items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2
                        size={27}
                        className="animate-spin text-[#1A3D63]"
                      />

                      <p className="text-sm font-semibold text-slate-500">
                        Loading batch members...
                      </p>
                    </div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex min-h-60 flex-col items-center justify-center text-center">
                    <Users size={30} className="mb-3 text-slate-300" />

                    <p className="text-sm font-bold text-slate-600">
                      No members found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No users are assigned to this batch.
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* MEMBER COUNT */}

                    <div className="mb-5 flex items-center gap-2">
                      <Users size={18} className="text-[#4A7FA7]" />

                      <p className="text-sm font-bold text-[#0A1931]">
                        {members.length}{" "}
                        {members.length === 1 ? "member" : "members"}
                      </p>
                    </div>

                    {/* TABLE */}

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full min-w-187.5">
                        <thead>
                          <tr className="border-b border-slate-200 bg-[#F6FAFD]">
                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Member
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Email
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Role
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Joined
                            </th>

                            <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Status
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {members.map((member) => {
                            const initials =
                              `${member.firstName || ""}${member.lastName || ""}`
                                .trim()
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                              <tr
                                key={`${member.userId}-${member.joinedAt}`}
                                className="transition hover:bg-[#F6FAFD]"
                              >
                                {/* MEMBER */}

                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B3CFE5] text-xs font-bold text-[#0A1931]">
                                      {initials || "U"}
                                    </div>

                                    <div>
                                      <p className="text-sm font-bold text-[#0A1931]">
                                        {member.firstName} {member.lastName}
                                      </p>

                                      {member.schoolId && (
                                        <p className="text-[11px] text-slate-400">
                                          {member.schoolId}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* EMAIL */}

                                <td className="px-5 py-4 text-xs text-slate-500">
                                  {member.email}
                                </td>

                                {/* ROLE */}

                                <td className="px-5 py-4">
                                  <span className="rounded-full bg-[#E8F1F7] px-3 py-1 text-[10px] font-bold capitalize text-[#1A3D63]">
                                    {member.roleInBatch ||
                                      member.currentRole ||
                                      "N/A"}
                                  </span>
                                </td>

                                {/* JOINED */}

                                <td className="px-5 py-4 text-xs text-slate-500">
                                  {formatDate(member.joinedAt)}
                                </td>

                                {/* STATUS */}

                                <td className="px-5 py-4">
                                  {member.isCurrentBatch ? (
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                                      Current
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">
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
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBatchHistory;
