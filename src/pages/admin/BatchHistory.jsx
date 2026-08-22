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
  Sparkles,
  Clock3,
  CheckCircle2,
  ArrowUpRight,
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

  // ============================================================
  // FETCH BATCHES
  // ============================================================

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/batches");

      setBatches(
        Array.isArray(res.data?.batches) ? res.data.batches : []
      );
    } catch (err) {
      console.error("Failed to load batches:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load batch history."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  // ============================================================
  // OPEN BATCH
  // ============================================================

  const openBatch = async (batch) => {
    setSelectedBatch(batch);
    setMembers([]);
    setLoadingMembers(true);
    setError("");

    try {
      const res = await api.get(`/batches/${batch._id}`);

      console.log("BATCH DETAILS RESPONSE:", res.data);

      const students = Array.isArray(res.data?.students)
        ? res.data.students
        : [];

      const mentors = Array.isArray(res.data?.mentors)
        ? res.data.mentors
        : [];

      // --------------------------------------------------------
      // STUDENTS
      // --------------------------------------------------------

      const studentMembers = students.map((student) => {
        const historyEntry = Array.isArray(student.batchHistory)
          ? student.batchHistory.find(
              (item) =>
                item.batch &&
                String(item.batch._id || item.batch) ===
                  String(batch._id)
            )
          : null;

        return {
          ...student,

          userId: student._id,

          roleInBatch:
            historyEntry?.role ||
            (student.role === "student"
              ? "student"
              : student.role),

          currentRole: student.role,

          joinedAt:
            historyEntry?.joinedAt ||
            student.createdAt,

          isCurrentBatch:
            student.batch &&
            String(student.batch._id || student.batch) ===
              String(batch._id),
        };
      });

      // --------------------------------------------------------
      // MENTORS
      // --------------------------------------------------------

      const mentorMembers = mentors.map((mentor) => {
        const historyEntry = Array.isArray(mentor.batchHistory)
          ? mentor.batchHistory.find(
              (item) =>
                item.batch &&
                String(item.batch._id || item.batch) ===
                  String(batch._id)
            )
          : null;

        return {
          ...mentor,

          userId: mentor._id,

          roleInBatch:
            historyEntry?.role ||
            (mentor.role === "mentor"
              ? "mentor"
              : mentor.role),

          currentRole: mentor.role,

          joinedAt:
            historyEntry?.joinedAt ||
            mentor.createdAt,

          isCurrentBatch:
            mentor.batch &&
            String(mentor.batch._id || mentor.batch) ===
              String(batch._id),
        };
      });

      setMembers([
        ...studentMembers,
        ...mentorMembers,
      ]);
    } catch (err) {
      console.error(
        "Failed to load batch members:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load batch members."
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeBatch = () => {
    setSelectedBatch(null);
    setMembers([]);
    setError("");
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredBatches = batches.filter((batch) =>
    batch.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // ============================================================
  // DATE FORMAT
  // ============================================================

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

  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (status) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "active":
        return {
          wrapper:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: <CheckCircle2 size={12} />,
        };

      case "completed":
        return {
          wrapper:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: <CheckCircle2 size={12} />,
        };

      case "upcoming":
        return {
          wrapper:
            "border-[#F5C96A] bg-[#FFF7DF] text-[#B77900]",
          icon: <Clock3 size={12} />,
        };

      default:
        return {
          wrapper:
            "border-slate-200 bg-slate-50 text-slate-600",
          icon: <Clock3 size={12} />,
        };
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F4F8FA] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            CREATIVE HEADER
        ====================================================== */}

        <section className="relative mb-7 overflow-hidden rounded-[30px] bg-gradient-to-br from-[#153D60] via-[#1D4B70] to-[#374C62] px-6 py-7 text-white shadow-[0_20px_50px_rgba(16,46,70,0.18)] sm:px-8 sm:py-8">

          {/* Decorative circles */}

          <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full border-[30px] border-white/5" />

          <div className="pointer-events-none absolute -right-5 bottom-[-90px] h-64 w-64 rounded-full border-[25px] border-[#F47B35]/10" />

          <div className="pointer-events-none absolute left-[42%] top-[-50px] h-28 w-28 rounded-full bg-white/5" />

          {/* Orange glow */}

          <div className="pointer-events-none absolute left-[45%] top-8 h-3 w-3 rounded-full bg-[#F47B35] shadow-[0_0_20px_#F47B35]" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            {/* LEFT */}

            <div className="flex items-start gap-5">

              {/* Icon */}

              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 shadow-inner backdrop-blur-md sm:h-[74px] sm:w-[74px]">

                <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-[#244B6B] bg-[#F47B35]" />

                <Archive
                  size={31}
                  strokeWidth={1.8}
                  className="text-white"
                />
              </div>

              {/* TEXT */}

              <div>

                <div className="mb-2 flex items-center gap-2 text-[#FFC39D]">

                  <Sparkles size={15} />

                  <span className="text-[11px] font-extrabold uppercase tracking-[0.22em]">
                    Administration
                  </span>

                </div>

                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  Batch History
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100/80 sm:text-[15px]">
                  Explore previous bootcamp cohorts and
                  discover the students and mentors who
                  were part of each journey.
                </p>

              </div>
            </div>

            {/* RIGHT */}

            <div className="flex items-center gap-3">

              {/* Total batches */}

              <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-md sm:block">

                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100/60">
                  Total Batches
                </p>

                <div className="mt-1 flex items-center gap-2">

                  <Archive size={15} className="text-[#FF9A61]" />

                  <span className="text-xl font-black">
                    {batches.length}
                  </span>

                </div>
              </div>

              {/* Refresh */}

              <button
                type="button"
                onClick={fetchBatches}
                disabled={loading}
                className="group flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-3 text-sm font-extrabold text-[#173D5E] shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-[#FFF8EF] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : "transition group-hover:rotate-180"
                  }
                />

                Refresh
              </button>

            </div>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 shadow-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
              !
            </div>

            {error}
          </div>
        )}

        {/* =====================================================
            SEARCH CARD
        ====================================================== */}

        <section className="mb-6 rounded-[24px] border border-[#E5D8C7] bg-[#FFFDF8] p-4 shadow-[0_8px_30px_rgba(28,54,72,0.06)] sm:p-5">

          <div className="mb-3 flex items-center justify-between px-1">

            <div>

              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#244C6B]">
                Find a cohort
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                Search your bootcamp batches
              </p>

            </div>

            <Archive
              size={19}
              className="text-[#F47B35]"
            />

          </div>

          <div className="relative">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7391A8]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search batches..."
              className="w-full rounded-2xl border border-[#E4D8C8] bg-[#F9F5EE] py-3.5 pl-12 pr-4 text-sm font-medium text-[#173B5B] outline-none transition placeholder:text-[#A8A8A0] focus:border-[#F0A06F] focus:bg-white focus:ring-4 focus:ring-[#F47B35]/10"
            />

          </div>
        </section>

        {/* =====================================================
            BATCH TABLE
        ====================================================== */}

        {loading ? (

          <div className="flex min-h-[420px] items-center justify-center rounded-[26px] border border-[#E5D8C7] bg-[#FFFDF8] shadow-sm">

            <div className="flex flex-col items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3F8]">

                <Loader2
                  size={27}
                  className="animate-spin text-[#1D4B70]"
                />

              </div>

              <p className="text-sm font-bold text-slate-500">
                Loading batch history...
              </p>

            </div>

          </div>

        ) : filteredBatches.length === 0 ? (

          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[26px] border border-[#E5D8C7] bg-[#FFFDF8] p-8 text-center shadow-sm">

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3F8]">

              <Archive
                size={28}
                className="text-[#3C6685]"
              />

            </div>

            <h2 className="text-lg font-extrabold text-[#173B5B]">
              No batches found
            </h2>

            <p className="mt-2 max-w-sm text-sm text-slate-400">
              There are no batches matching your
              current search.
            </p>

          </div>

        ) : (

          <section className="overflow-hidden rounded-[26px] border border-[#E3D6C6] bg-[#FFFDF8] shadow-[0_12px_40px_rgba(29,57,76,0.07)]">

            {/* TABLE HEADER */}

            <div className="flex flex-col gap-2 border-b border-[#E7DDCF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-black text-[#173B5B]">
                  All Batches
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Previous and current bootcamp cohorts
                </p>

              </div>

              <div className="flex items-center gap-2 rounded-full bg-[#F4EDE3] px-3 py-1.5">

                <span className="h-2 w-2 rounded-full bg-[#F47B35]" />

                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7C7469]">
                  {filteredBatches.length}{" "}
                  {filteredBatches.length === 1
                    ? "Batch"
                    : "Batches"}
                </span>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] border-collapse">

                {/* THEAD */}

                <thead>

                  <tr className="border-b border-[#E5DCCF] bg-[#F7F1E8]">

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#637B8D]">
                      Batch
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#637B8D]">
                      Description
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#637B8D]">
                      Start Date
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#637B8D]">
                      End Date
                    </th>

                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#637B8D]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.14em] text-[#637B8D]">
                      Action
                    </th>

                  </tr>

                </thead>

                {/* TBODY */}

                <tbody>

                  {filteredBatches.map((batch, index) => {

                    const statusStyle =
                      getStatusStyle(batch.status);

                    return (
                      <tr
                        key={batch._id}
                        className={`group border-b border-[#EDE5DA] transition duration-200 last:border-b-0 hover:bg-[#FBF4EA] ${
                          index % 2 === 1
                            ? "bg-[#FFFCF7]"
                            : "bg-[#FFFDF8]"
                        }`}
                      >

                        {/* BATCH */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#10233D] text-white shadow-md transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg">

                              <Archive
                                size={20}
                                strokeWidth={1.8}
                              />

                              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#FFFDF8] bg-[#F47B35]" />

                            </div>

                            <div>

                              <p className="text-sm font-black text-[#102C49]">
                                {batch.name}
                              </p>

                              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9BA8B1]">
                                Bootcamp Batch
                              </p>

                            </div>

                          </div>

                        </td>

                        {/* DESCRIPTION */}

                        <td className="max-w-[260px] px-6 py-5">

                          <p className="line-clamp-2 text-xs leading-5 text-[#748493]">
                            {batch.description ||
                              "No description available"}
                          </p>

                        </td>

                        {/* START DATE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2.5 text-xs font-medium text-[#657C8E]">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3F8]">

                              <CalendarDays
                                size={14}
                                className="text-[#397095]"
                              />

                            </div>

                            {formatDate(
                              batch.startDate
                            )}

                          </div>

                        </td>

                        {/* END DATE */}

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2.5 text-xs font-medium text-[#657C8E]">

                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF3F8]">

                              <CalendarDays
                                size={14}
                                className="text-[#397095]"
                              />

                            </div>

                            {formatDate(
                              batch.endDate
                            )}

                          </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${statusStyle.wrapper}`}
                          >
                            {statusStyle.icon}

                            {batch.status ||
                              "Unknown"}
                          </span>

                        </td>

                        {/* ACTION */}

                        <td className="px-6 py-5 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              openBatch(batch)
                            }
                            className="group/button inline-flex items-center gap-2 rounded-xl bg-[#173F63] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#F07832] hover:shadow-md"
                          >

                            View Members

                            <ChevronRight
                              size={15}
                              className="transition group-hover/button:translate-x-0.5"
                            />

                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          </section>
        )}

        {/* =====================================================
            MEMBERS MODAL
        ====================================================== */}

        {selectedBatch && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#081B2D]/60 p-4 backdrop-blur-md">

            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-[#FFFDF8] shadow-[0_30px_80px_rgba(5,24,40,0.3)]">

              {/* MODAL HEADER */}

              <div className="relative overflow-hidden bg-gradient-to-br from-[#153D60] via-[#1D4B70] to-[#394C61] px-6 py-6 text-white">

                <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full border-[25px] border-white/5" />

                <div className="pointer-events-none absolute right-24 bottom-[-50px] h-36 w-36 rounded-full border-[18px] border-[#F47B35]/10" />

                <div className="relative z-10 flex items-center justify-between">

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">

                      <Archive size={25} />

                    </div>

                    <div>

                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FFC19B]">
                        Batch History
                      </p>

                      <h2 className="mt-1 text-xl font-black sm:text-2xl">
                        {selectedBatch.name}
                      </h2>

                      <p className="mt-1 text-xs text-blue-100/70">
                        {formatDate(
                          selectedBatch.startDate
                        )}{" "}
                        —{" "}
                        {formatDate(
                          selectedBatch.endDate
                        )}
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={closeBatch}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 transition hover:bg-[#F47B35]"
                  >
                    <X size={19} />
                  </button>

                </div>

              </div>

              {/* MODAL CONTENT */}

              <div className="max-h-[calc(90vh-112px)] overflow-y-auto p-5 sm:p-6">

                {loadingMembers ? (

                  <div className="flex min-h-60 items-center justify-center">

                    <div className="flex flex-col items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF3F8]">

                        <Loader2
                          size={27}
                          className="animate-spin text-[#173F63]"
                        />

                      </div>

                      <p className="text-sm font-bold text-slate-500">
                        Loading batch members...
                      </p>

                    </div>

                  </div>

                ) : members.length === 0 ? (

                  <div className="flex min-h-60 flex-col items-center justify-center text-center">

                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3F8]">

                      <Users
                        size={28}
                        className="text-[#3C6685]"
                      />

                    </div>

                    <p className="text-base font-black text-[#173B5B]">
                      No members found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      No users are assigned to this batch.
                    </p>

                  </div>

                ) : (

                  <div>

                    {/* MEMBER SUMMARY */}

                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E5]">

                          <Users
                            size={18}
                            className="text-[#F07832]"
                          />

                        </div>

                        <div>

                          <p className="text-sm font-black text-[#173B5B]">
                            {members.length}{" "}
                            {members.length === 1
                              ? "Member"
                              : "Members"}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            People connected to this batch
                          </p>

                        </div>

                      </div>

                      <div className="rounded-full bg-[#F5EDE2] px-4 py-2 text-[10px] font-black uppercase tracking-wider text-[#7D766D]">
                        Batch Members
                      </div>

                    </div>

                    {/* MEMBER TABLE */}

                    <div className="overflow-hidden rounded-2xl border border-[#E3D8C9]">

                      <div className="overflow-x-auto">

                        <table className="w-full min-w-[800px]">

                          <thead>

                            <tr className="border-b border-[#E2D7C9] bg-[#F7F0E6]">

                              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-[#657B8D]">
                                Member
                              </th>

                              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-[#657B8D]">
                                Email
                              </th>

                              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-[#657B8D]">
                                Role
                              </th>

                              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-[#657B8D]">
                                Joined
                              </th>

                              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.13em] text-[#657B8D]">
                                Status
                              </th>

                            </tr>

                          </thead>

                          <tbody>

                            {members.map((member) => {

                              const initials =
                                `${member.firstName || ""}${member.lastName || ""}`
                                  .trim()
                                  .slice(0, 2)
                                  .toUpperCase();

                              return (

                                <tr
                                  key={`${member.userId}-${member.joinedAt}`}
                                  className="border-b border-[#EEE5DA] bg-[#FFFDF8] transition last:border-0 hover:bg-[#FBF3E8]"
                                >

                                  {/* MEMBER */}

                                  <td className="px-5 py-4">

                                    <div className="flex items-center gap-3">

                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E5EFF5] text-xs font-black text-[#173F63]">

                                        {initials || "U"}

                                      </div>

                                      <div>

                                        <p className="text-sm font-black text-[#173B5B]">

                                          {member.firstName}{" "}
                                          {member.lastName}

                                        </p>

                                        {member.schoolId && (

                                          <p className="mt-0.5 text-[10px] font-medium text-slate-400">

                                            {member.schoolId}

                                          </p>

                                        )}

                                      </div>

                                    </div>

                                  </td>

                                  {/* EMAIL */}

                                  <td className="px-5 py-4 text-xs font-medium text-[#718292]">
                                    {member.email}
                                  </td>

                                  {/* ROLE */}

                                  <td className="px-5 py-4">

                                    <span className="inline-flex rounded-full border border-[#CFE0EA] bg-[#EDF5F9] px-3 py-1.5 text-[10px] font-black capitalize text-[#245375]">
                                      {member.roleInBatch ||
                                        member.currentRole ||
                                        "N/A"}
                                    </span>

                                  </td>

                                  {/* JOINED */}

                                  <td className="px-5 py-4">

                                    <div className="flex items-center gap-2 text-xs font-medium text-[#718292]">

                                      <CalendarDays
                                        size={14}
                                        className="text-[#477694]"
                                      />

                                      {formatDate(
                                        member.joinedAt
                                      )}

                                    </div>

                                  </td>

                                  {/* STATUS */}

                                  <td className="px-5 py-4">

                                    {member.isCurrentBatch ? (

                                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">

                                        <CheckCircle2 size={12} />

                                        Current

                                      </span>

                                    ) : (

                                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-500">

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
    </div>
  );
};

export default AdminBatchHistory;