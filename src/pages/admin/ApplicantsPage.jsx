import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  RefreshCw,
  Check,
  X,
  Users,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Mail,
  Layers,
  Search,
  SlidersHorizontal,
  ChevronDown,
  MoreHorizontal,
  GraduationCap,
  CalendarDays,
  Sparkles,
  RotateCcw,
} from "lucide-react";

import api from "../../utils/api";

function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // Filters
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [approvalMessage, setApprovalMessage] = useState(null);

  // Action menu
  const [openActionId, setOpenActionId] = useState(null);

  // ============================================================
  // FETCH BATCHES
  // ============================================================

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const response = await api.get("/batches");
      setBatches(response.data?.batches || []);
    } catch (err) {
      console.error("FAILED TO FETCH BATCHES:", err);
      toast.error(err.response?.data?.message || "Failed to load batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  // ============================================================
  // FETCH APPLICANTS
  // ============================================================

  const fetchApplicants = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");
      const response = await api.get("/applicants");
      setApplicants(response.data?.applicants || []);
    } catch (err) {
      console.error("FAILED TO FETCH APPLICANTS:", err);
      const message =
        err.response?.data?.message || "Failed to load applicants.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchBatches();
    fetchApplicants();
  }, []);

  // ============================================================
  // FRONTEND FILTERING
  // ============================================================

  const filteredApplicants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return applicants.filter((applicant) => {
      const applicantGender =
        applicant.gender?.toString().trim().toLowerCase() || "";
      const selectedGender = gender?.toString().trim().toLowerCase() || "";
      const matchesGender =
        !selectedGender || applicantGender === selectedGender;

      const applicantStatus =
        applicant.status?.toString().trim().toLowerCase() || "";
      const selectedStatus = status?.toString().trim().toLowerCase() || "";
      const matchesStatus =
        !selectedStatus || applicantStatus === selectedStatus;

      const searchableText = [
        applicant.fullName,
        applicant.email,
        applicant.schoolId,
        applicant.department,
        applicant.experienceLevel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesGender && matchesStatus && matchesSearch;
    });
  }, [applicants, gender, status, search]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    return {
      total: filteredApplicants.length,
      pending: filteredApplicants.filter(
        (applicant) => applicant.status === "pending"
      ).length,
      approved: filteredApplicants.filter(
        (applicant) => applicant.status === "passed"
      ).length,
      rejected: filteredApplicants.filter(
        (applicant) => applicant.status === "rejected"
      ).length,
    };
  }, [filteredApplicants]);

  // ============================================================
  // UPDATE STATUS
  // ============================================================

  const updateStatus = async (applicantId, newStatus) => {
    try {
      setProcessingId(applicantId);
      setError("");
      setOpenActionId(null);

      const response = await api.patch(`/applicants/${applicantId}/status`, {
        status: newStatus,
      });

      const updatedApplicant = response.data?.applicant;
      const student = response.data?.student;

      setApplicants((previous) =>
        previous.map((applicant) =>
          applicant._id === applicantId
            ? {
                ...applicant,
                ...updatedApplicant,
              }
            : applicant
        )
      );

      if (newStatus === "passed") {
        const email = student?.email || updatedApplicant?.email || "";
        setApprovalMessage({ email });
        toast.success("Applicant approved successfully.");
      } else {
        toast.success("Applicant rejected successfully.");
      }

      setSelectedApplicant(null);
    } catch (err) {
      console.error("FAILED TO UPDATE APPLICANT:", err);
      const message =
        err.response?.data?.message || "Failed to update applicant status.";
      setError(message);
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (value) => {
    switch (value) {
      case "passed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/70 px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-sm">
            <CheckCircle2 size={13} className="text-emerald-700" />
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-100/70 px-3 py-1 text-[11px] font-bold text-rose-800 shadow-sm">
            <XCircle size={13} className="text-rose-700" />
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-100/70 px-3 py-1 text-[11px] font-bold text-orange-800 shadow-sm">
            <AlertCircle size={13} className="text-orange-700" />
            Pending
          </span>
        );
    }
  };

  // ============================================================
  // GET BATCH NAME & STATUS
  // ============================================================

  const getBatchName = (applicant, batchList = batches) => {
    if (!applicant?.batch) return "No batch";
    if (typeof applicant.batch === "object") {
      return applicant.batch.name || "Unknown batch";
    }
    const batch = batchList.find((item) => item._id === applicant.batch);
    return batch?.name || "Unknown batch";
  };

  const getBatchStatus = (applicant) => {
    if (!applicant?.batch || typeof applicant.batch !== "object") return null;
    return applicant.batch.status;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString();
  };

  const resetFilters = () => {
    setGender("");
    setStatus("");
    setSearch("");
  };

  const hasFilters = Boolean(search || gender || status);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    if (openActionId) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "14px",
            background: "#FAF4EB",
            color: "#16344E",
            border: "1px solid #E8DCB8",
            fontWeight: "600",
            boxShadow: "0 10px 30px rgba(22,52,78,0.1)",
          },
        }}
      />

      {/* ============================================================
          ANIMATION STYLES
      ============================================================ */}
      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.08); }
        }

        @keyframes menuIn {
          from {
            opacity: 0;
            transform: translateY(-6px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .page-enter {
          animation: pageEnter 0.65s cubic-bezier(.2,.8,.2,1) both;
        }

        .fade-up {
          animation: fadeUp 0.55s ease-out both;
        }

        .float-slow {
          animation: floatSlow 5s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .menu-in {
          animation: menuIn 0.18s ease-out both;
        }

        .applicant-row {
          animation: fadeUp 0.4s ease-out both;
        }

        .applicant-row:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(22,52,78,0.08);
        }

        .smooth-transition {
          transition:
            transform 220ms ease,
            background-color 220ms ease,
            border-color 220ms ease,
            box-shadow 220ms ease,
            opacity 220ms ease;
        }

        .hide-scrollbar::-webkit-scrollbar {
          height: 6px;
        }

        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(226, 109, 44, 0.3);
          border-radius: 999px;
        }
      `}</style>

      {/* ============================================================
          PAGE BACKGROUND (BOLD Gradient: Rich Ice Blue -> Cream -> Bold Sunset Peach)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* BOLD Ambient Glow Layers */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-40 left-1/4 h-[500px] w-[650px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[550px] w-[550px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        {/* ========================================================
            MAIN CONTAINER
        ======================================================== */}
        <div className="page-enter relative z-10 mx-auto max-w-[1500px]">

          {/* ======================================================
              TOP HEADER CARD (Bold Navy Banner with Cream/Orange)
          ====================================================== */}
          <section className="relative mb-6 overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.25)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex items-center gap-5">
                {/* Icon */}
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <Users size={28} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Applicants
                  </h1>

                  <p className="mt-1.5 max-w-xl text-sm text-[#D7E8F7]">
                    Review applications, monitor candidates and manage admission decisions.
                  </p>
                </div>
              </div>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={() => fetchApplicants(false)}
                disabled={refreshing}
                className="smooth-transition group flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={`text-[#F38744] ${refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh data"}</span>
              </button>
            </div>
          </section>

          {/* ======================================================
              ERROR ALERT
          ====================================================== */}
          {error && (
            <div className="fade-up mb-5 flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-100/90 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <div className="rounded-xl bg-rose-200 p-2 text-rose-700">
                <AlertCircle size={18} />
              </div>
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto rounded-xl p-2 transition hover:bg-rose-200"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* ======================================================
              SEARCH & FILTER BAR (Warm Creamy Card)
          ====================================================== */}
          <section
            className="fade-up mb-5 rounded-[26px] border border-[#E8DBCA] bg-[#FAF4EB]/90 p-3 shadow-[0_12px_35px_rgba(22,52,78,0.08)] backdrop-blur-xl"
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex flex-col gap-3 lg:flex-row">
              {/* Search */}
              <div className="group relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#173854]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicant, email, school ID or department..."
                  className="h-14 w-full rounded-[18px] border border-[#DFCBB5] bg-[#F5ECE0]/90 pl-12 pr-11 text-sm font-medium text-[#16344E] placeholder-slate-400 outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Gender */}
              <div className="relative lg:w-52">
                <SlidersHorizontal
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E26D2C]"
                />

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="h-14 w-full appearance-none rounded-[18px] border border-[#DFCBB5] bg-[#F5ECE0]/90 pl-11 pr-10 text-sm font-semibold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                >
                  <option value="">All genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Status */}
              <div className="relative lg:w-52">
                <CheckCircle2
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E26D2C]"
                />

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-14 w-full appearance-none rounded-[18px] border border-[#DFCBB5] bg-[#F5ECE0]/90 pl-11 pr-10 text-sm font-semibold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="passed">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>

                <ChevronDown
                  size={17}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              {/* Reset */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="smooth-transition flex h-14 items-center justify-center gap-2 rounded-[18px] border border-[#DFCBB5] bg-[#EDE1D1] px-5 text-sm font-bold text-slate-700 hover:-translate-y-0.5 hover:bg-[#E5D7C4]"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              )}
            </div>
          </section>

          {/* ======================================================
              STATISTICS BAR (Warm Creamy Vanilla Container)
          ====================================================== */}
          <section
            className="fade-up mb-6 overflow-hidden rounded-[26px] border border-[#E8DBCA] bg-[#FAF4EB]/90 shadow-[0_12px_35px_rgba(22,52,78,0.08)] backdrop-blur-xl"
            style={{ animationDelay: "140ms" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4">
              <StatItem
                icon={<Users size={19} />}
                label="Total Applicants"
                value={statistics.total}
                iconClass="bg-[#DCEBF6] text-[#1E6FA3]"
                valueClass="text-[#16344E]"
              />
              <StatItem
                icon={<AlertCircle size={19} />}
                label="Pending"
                value={statistics.pending}
                iconClass="bg-[#FDE2D2] text-[#E26D2C]"
                valueClass="text-[#E26D2C]"
              />
              <StatItem
                icon={<CheckCircle2 size={19} />}
                label="Approved"
                value={statistics.approved}
                iconClass="bg-[#D5F2E3] text-[#0E9F6E]"
                valueClass="text-[#0E9F6E]"
              />
              <StatItem
                icon={<XCircle size={19} />}
                label="Rejected"
                value={statistics.rejected}
                iconClass="bg-[#FCD8D8] text-[#E02424]"
                valueClass="text-[#E02424]"
              />
            </div>
          </section>

          {/* ======================================================
              TABLE SECTION (Creamy Alabaster Table)
          ====================================================== */}
          <section
            className="fade-up overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(22,52,78,0.1)] backdrop-blur-xl"
            style={{ animationDelay: "200ms" }}
          >
            {/* Table Top Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#EBDCC8] px-5 py-5 md:flex-row md:items-center md:px-7">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-[#1E6FA3] shadow-sm">
                  <GraduationCap size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-[#16344E]">
                      Applicant Directory
                    </h2>
                    <span className="rounded-full bg-[#FDE2D2] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#E26D2C]">
                      Live
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {filteredApplicants.length} applicant
                    {filteredApplicants.length !== 1 ? "s" : ""} displayed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 py-1.5 text-xs font-semibold text-slate-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#34D399]" />
                Live applicant data
              </div>
            </div>

            {/* Loading Spinner */}
            {loading ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-[#E26D2C]/25" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDE2D2] text-[#E26D2C]">
                    <Loader2 size={28} className="animate-spin" />
                  </div>
                </div>
                <p className="mt-5 text-sm font-bold text-[#16344E]">
                  Loading applicants...
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Preparing your applicant directory
                </p>
              </div>
            ) : filteredApplicants.length === 0 ? (
              /* Empty state */
              <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
                <div className="float-slow flex h-20 w-20 items-center justify-center rounded-[26px] bg-[#E1F0FA] text-[#1E6FA3]">
                  <Users size={32} />
                </div>
                <h3 className="mt-6 text-lg font-black text-[#16344E]">
                  No applicants found
                </h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
                  We couldn't find any applicants matching your current search or filters.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-5 flex items-center gap-2 rounded-xl bg-[#173854] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#1f4a70]"
                  >
                    <RotateCcw size={15} />
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              /* ====================================================
                 CREAMY DATA TABLE
              ==================================================== */
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95 text-left">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Applicant
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        School ID
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Gender
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Department
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Batch
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Experience
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplicants.map((applicant, index) => (
                      <tr
                        key={applicant._id}
                        className="applicant-row smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* APPLICANT */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#DCE4EC] bg-[#E1F0FA] text-sm font-black text-[#173854] shadow-sm">
                              {applicant.fullName?.charAt(0)?.toUpperCase() || "A"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-[#16344E]">
                                {applicant.fullName}
                              </p>
                              <div className="mt-1 flex items-center gap-1.5">
                                <Mail size={11} className="text-slate-500" />
                                <p className="max-w-[220px] truncate text-[11px] text-slate-600">
                                  {applicant.email}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SCHOOL ID */}
                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-xl bg-[#F0E6D8] px-3 py-1.5 text-xs font-bold text-[#4B6378]">
                            {applicant.schoolId || "-"}
                          </span>
                        </td>

                        {/* GENDER */}
                        <td className="px-5 py-5">
                          <span className="text-sm font-semibold capitalize text-slate-700">
                            {applicant.gender || "-"}
                          </span>
                        </td>

                        {/* DEPARTMENT */}
                        <td className="px-5 py-5">
                          <div className="flex max-w-[210px] items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E1F0FA] text-[#1E6FA3]">
                              <GraduationCap size={15} />
                            </div>
                            <span className="truncate text-sm font-semibold capitalize text-slate-700">
                              {applicant.department || "-"}
                            </span>
                          </div>
                        </td>

                        {/* BATCH */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F0E6D8] text-[#173854]">
                              <Layers size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#16344E]">
                                {getBatchName(applicant)}
                              </p>
                              {getBatchStatus(applicant) && (
                                <p className="mt-0.5 text-[10px] capitalize text-[#E26D2C]">
                                  {getBatchStatus(applicant)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EXPERIENCE */}
                        <td className="px-5 py-5">
                          <span className="inline-flex rounded-full bg-[#EDE1D1] px-3 py-1 text-[11px] font-bold capitalize text-slate-700">
                            {applicant.experienceLevel || "-"}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-5">
                          {getStatusBadge(applicant.status)}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">
                          <div className="relative flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionId(
                                  openActionId === applicant._id
                                    ? null
                                    : applicant._id
                                );
                              }}
                              className="smooth-transition group flex items-center gap-2 rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] px-3.5 py-2.5 text-xs font-bold text-[#16344E] shadow-sm hover:-translate-y-0.5 hover:border-[#E26D2C] hover:bg-[#F3E7D5]"
                            >
                              <MoreHorizontal
                                size={16}
                                className="transition group-hover:scale-110"
                              />
                              <span>Actions</span>
                              <ChevronDown
                                size={13}
                                className={`transition ${
                                  openActionId === applicant._id
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </button>

                            {openActionId === applicant._id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="menu-in absolute right-0 top-[46px] z-30 w-48 overflow-hidden rounded-2xl border border-[#E2D2BC] bg-[#FAF4EB] p-1.5 shadow-[0_20px_45px_rgba(22,52,78,0.14)] backdrop-blur-2xl"
                              >
                                {/* VIEW */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedApplicant(applicant);
                                    setOpenActionId(null);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-[#16344E] transition hover:bg-[#EFE2CE]"
                                >
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E0F2FE] text-[#1E6FA3]">
                                    <Eye size={14} />
                                  </span>
                                  View details
                                </button>

                                {/* APPROVE */}
                                {applicant.status !== "passed" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(applicant._id, "passed")
                                    }
                                    disabled={processingId === applicant._id}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-emerald-800 transition hover:bg-emerald-100/70 disabled:opacity-50"
                                  >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-200 text-emerald-800">
                                      {processingId === applicant._id ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : (
                                        <Check size={14} />
                                      )}
                                    </span>
                                    Approve applicant
                                  </button>
                                )}

                                {/* REJECT */}
                                {applicant.status !== "rejected" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateStatus(applicant._id, "rejected")
                                    }
                                    disabled={processingId === applicant._id}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-bold text-rose-800 transition hover:bg-rose-100/70 disabled:opacity-50"
                                  >
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-200 text-rose-800">
                                      <X size={14} />
                                    </span>
                                    Reject applicant
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            {!loading && filteredApplicants.length > 0 && (
              <div className="flex flex-col justify-between gap-3 border-t border-[#EBDCC8] bg-[#F3E7D5] px-6 py-4 sm:flex-row sm:items-center">
                <p className="text-xs font-semibold text-slate-600">
                  Showing{" "}
                  <span className="font-black text-[#16344E]">
                    {filteredApplicants.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-black text-[#16344E]">
                    {applicants.length}
                  </span>{" "}
                  applicants
                </p>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  <CalendarDays size={14} />
                  Updated automatically from server
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ============================================================
          APPLICANT DETAILS MODAL (Creamy Alabaster)
      ============================================================ */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/45 p-4 backdrop-blur-md">
          <div className="page-enter max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_80px_rgba(22,52,78,0.22)]">
            {/* Modal Header */}
            <div className="relative overflow-hidden border-b border-[#EBDCC8] px-6 py-6 md:px-8">
              <div className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-[#F38744]/20 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1F0FA] text-[#1E6FA3]">
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#16344E]">
                      Applicant Details
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedApplicant.fullName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedApplicant(null)}
                  className="rounded-xl bg-[#EDE1D1] p-2.5 text-slate-600 transition hover:bg-[#E5D7C4] hover:text-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
              <Detail label="Full Name" value={selectedApplicant.fullName} />
              <Detail label="Email" value={selectedApplicant.email} />
              <Detail label="Phone" value={selectedApplicant.phone} />
              <Detail label="School ID" value={selectedApplicant.schoolId} />
              <Detail label="Gender" value={selectedApplicant.gender} />
              <Detail label="Year" value={selectedApplicant.year} />
              <Detail label="Department" value={selectedApplicant.department} />
              <Detail label="Experience" value={selectedApplicant.experienceLevel} />
              <Detail label="Batch" value={getBatchName(selectedApplicant)} />
              <Detail label="GitHub" value={selectedApplicant.githubUrl} />
              <Detail label="LeetCode" value={selectedApplicant.leetcodeUrl} />
              <Detail label="Codeforces" value={selectedApplicant.codeforcesUrl} />
              <Detail label="Applied" value={formatDate(selectedApplicant.createdAt)} />

              <div className="md:col-span-2">
                <Detail label="About" value={selectedApplicant.about} />
              </div>

              <div className="md:col-span-2">
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                  Status
                </p>
                {getStatusBadge(selectedApplicant.status)}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col gap-3 border-t border-[#EBDCC8] bg-[#F3E7D5] p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#EDE1D1]"
              >
                Close
              </button>

              {selectedApplicant.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() => updateStatus(selectedApplicant._id, "rejected")}
                  disabled={processingId === selectedApplicant._id}
                  className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:opacity-50"
                >
                  <X size={17} />
                  Reject
                </button>
              )}

              {selectedApplicant.status !== "passed" && (
                <button
                  type="button"
                  onClick={() => updateStatus(selectedApplicant._id, "passed")}
                  disabled={processingId === selectedApplicant._id}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-600 disabled:opacity-50"
                >
                  <Check size={17} />
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          APPROVAL CONFIRMATION MODAL
      ============================================================ */}
      {approvalMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md">
          <div className="page-enter w-full max-w-md overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(22,52,78,0.25)]">
            <div className="relative h-2 bg-gradient-to-r from-[#F38744] via-[#7EC8F5] to-emerald-500" />

            <div className="p-8">
              <div className="pulse-glow mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[26px] bg-emerald-200 text-emerald-800">
                <CheckCircle2 size={38} />
              </div>

              <h2 className="text-center text-xl font-black text-[#16344E]">
                Applicant Approved
              </h2>

              <p className="mt-2 text-center text-sm text-slate-600">
                The applicant has been successfully approved.
              </p>

              <div className="mt-6 rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#E1F0FA] p-2.5 text-[#1E6FA3]">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#16344E]">
                      Confirmation email
                    </p>
                    <p className="mt-1 break-all text-xs leading-5 text-slate-600">
                      {approvalMessage.email || "Applicant email"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setApprovalMessage(null)}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#173854] to-[#224A6D] py-3.5 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(23,56,84,0.25)]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// STAT ITEM COMPONENT
// ============================================================
function StatItem({ icon, label, value, iconClass, valueClass }) {
  return (
    <div className="smooth-transition group border-b border-[#EBDCC8] p-5 last:border-b-0 hover:bg-[#F3E7D5]/70 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="flex items-center gap-4">
        <div
          className={`smooth-transition flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${iconClass} group-hover:scale-105`}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>
          <p className={`mt-1 text-2xl font-black ${valueClass}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DETAIL COMPONENT
// ============================================================
function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#DFCBB5] bg-[#F3E7D5] p-4 transition hover:border-[#E26D2C]">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-[#16344E]">
        {value || "-"}
      </p>
    </div>
  );
}

export default ApplicantsPage;