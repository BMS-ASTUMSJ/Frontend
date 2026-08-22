import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

import {
  Users,
  Shield,
  Layers,
  UserCheck,
  Calendar,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Sparkles,
  Users2,
  TrendingUp,
  Activity,
  CheckCircle2,
  CircleDot,
} from "lucide-react";

function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/batches/dashboard-stats");

        if (isMounted) {
          setStatsData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load dashboard statistics."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#DDF4FF] via-[#FFE5D0] to-[#BFE8FF]">
        <div className="rounded-3xl border border-white/50 bg-white/30 px-8 py-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 text-[#17324D]">
            <Loader2 className="h-7 w-7 animate-spin text-[#F28C45]" />

            <span className="text-base font-semibold">
              Loading dashboard overview...
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#DDF4FF] via-[#FFE5D0] to-[#BFE8FF] p-6 sm:p-8">
        <div className="flex items-center gap-3 rounded-3xl border border-red-200/60 bg-red-50/80 p-5 text-sm text-red-700 shadow-lg backdrop-blur-xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const currentBatch = statsData?.currentBatch || {};
  const previousBatches = statsData?.previousBatches || [];
  const overallStats = statsData?.overallStats || {};
  const activeBatch = currentBatch?.batch || null;

  /* =========================================================
     STAT CARD
  ========================================================= */

  const StatCard = ({
    title,
    value,
    description,
    icon: Icon,
    iconBg,
    iconColor,
    delay,
  }) => {
    return (
      <div
        style={{ animationDelay: `${delay}ms` }}
        className="
          group relative overflow-hidden
          rounded-3xl
          border border-white/60
          bg-white/55
          p-6
          shadow-[0_15px_45px_rgba(70,90,110,0.12)]
          backdrop-blur-xl
          transition-all duration-500
          hover:-translate-y-2
          hover:shadow-[0_25px_55px_rgba(70,90,110,0.18)]
          animate-[fadeUp_0.7s_ease-out_both]
        "
      >
        {/* Decorative glow */}
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/30 blur-2xl transition-all duration-500 group-hover:scale-150" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
              {title}
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#172B3A] transition-transform duration-300 group-hover:scale-105 group-hover:origin-left">
              {value}
            </h2>

            <p className="mt-2 text-xs font-medium text-[#718096]">
              {description}
            </p>
          </div>

          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-sm transition-all duration-500 group-hover:rotate-6 group-hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 h-1 w-0 bg-linear-to-r from-[#F28C45] to-[#8DD8FF] transition-all duration-500 group-hover:w-full" />
      </div>
    );
  };

  return (
    <div
      className="
        min-h-screen
        overflow-hidden
        bg-linear-to-br
        from-[#CDEEFF]
        via-[#FFE4D0]
        via-55%
        to-[#AEE1FA]
        p-4
        sm:p-6
        lg:p-8
      "
    >
      {/* =====================================================
          BACKGROUND DECORATIONS
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#8DD8FF]/30 blur-3xl animate-pulse" />

        <div
          className="absolute right-[-120px] top-[15%] h-[420px] w-[420px] rounded-full bg-[#FFB16F]/30 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div
          className="absolute bottom-[-150px] left-[30%] h-[400px] w-[400px] rounded-full bg-[#FFD2B3]/30 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-[1600px] space-y-7">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="animate-[fadeUp_0.6s_ease-out_both]">
          <div
            className="
              relative overflow-hidden
              rounded-3xl
              border border-white/60
              bg-white/45
              p-6
              shadow-[0_15px_45px_rgba(70,90,110,0.10)]
              backdrop-blur-xl
              sm:p-8
            "
          >
            {/* Header glow */}
            <div className="absolute right-[-60px] top-[-80px] h-56 w-56 rounded-full bg-[#FFAA68]/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                

                <h1 className="text-3xl font-black tracking-tight text-[#172B3A] sm:text-4xl lg:text-5xl">
                  Welcome back,{" "}
                  <span className="bg-linear-to-r from-[#E97832] to-[#4CA8D8] bg-clip-text text-transparent">
                    Admin
                  </span>
                  <span className="ml-2 inline-block animate-bounce">👋</span>
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#64748B] sm:text-base">
                  Manage your bootcamp, monitor applications, organize teams,
                  and keep everything running smoothly.
                </p>
              </div>

              <Link
                to="/admin/applicants"
                className="
                  group
                  inline-flex
                  w-fit
                  items-center
                  gap-3
                  rounded-2xl
                  bg-linear-to-r
                  from-[#F28C45]
                  to-[#FFAA68]
                  px-6
                  py-4
                  text-sm
                  font-bold
                  text-white
                  shadow-[0_12px_30px_rgba(242,140,69,0.30)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_18px_40px_rgba(242,140,69,0.40)]
                "
              >
                <UserCheck className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

                Review Applicants

                <span className="rounded-full bg-white/25 px-2 py-1 text-xs">
                  {currentBatch?.applicantCount || 0}
                </span>

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ====================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Students"
            value={overallStats?.totalStudentsAllTime || 0}
            description="Registered students"
            icon={Users}
            iconBg="bg-[#DDF3FF]"
            iconColor="text-[#3D9BC8]"
            delay={100}
          />

          <StatCard
            title="Active Mentors"
            value={overallStats?.totalMentors || 0}
            description="Currently active"
            icon={Shield}
            iconBg="bg-[#E7F8F2]"
            iconColor="text-[#28A879]"
            delay={180}
          />

          <StatCard
            title="Pending Applications"
            value={currentBatch?.applicantCount || 0}
            description="Waiting for review"
            icon={UserCheck}
            iconBg="bg-[#FFF0E4]"
            iconColor="text-[#E9853E]"
            delay={260}
          />

          <StatCard
            title="Bootcamp Cohorts"
            value={overallStats?.totalBatches || 0}
            description="Published cohorts"
            icon={Layers}
            iconBg="bg-[#E4F3FF]"
            iconColor="text-[#4B9BC7]"
            delay={340}
          />
        </div>

        {/* =====================================================
            CURRENT ACTIVE BOOTCAMP
        ====================================================== */}

        <div
          className="
            group
            overflow-hidden
            rounded-[2rem]
            border border-white/40
            bg-[#263B4D]/90
            shadow-[0_25px_60px_rgba(38,59,77,0.20)]
            backdrop-blur-xl
            animate-[fadeUp_0.8s_ease-out_both]
          "
          style={{ animationDelay: "400ms" }}
        >
          {/* Top section */}
          <div className="relative overflow-hidden border-b border-white/10 p-6 sm:p-8">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#FF9E5E]/10 blur-3xl transition-all duration-700 group-hover:scale-125" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F28C45]/15">
                    <Sparkles className="h-4 w-4 text-[#FFB276] animate-pulse" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#9EDBFA]">
                    Current Active Bootcamp
                  </span>
                </div>

                <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                  {activeBatch?.name || "No Active Batch Selected"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#B9CAD6]">
                  {activeBatch?.description ||
                    "No active bootcamp is currently selected."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {activeBatch ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    ACTIVE
                  </span>
                ) : (
                  <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-gray-300">
                    NO ACTIVE BATCH
                  </span>
                )}

                {activeBatch && (
                  <span
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      activeBatch?.isRegistrationOpen
                        ? "border border-[#8DD8FF]/20 bg-[#8DD8FF]/10 text-[#A7E1FA]"
                        : "border border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    {activeBatch?.isRegistrationOpen
                      ? "REGISTRATION OPEN"
                      : "REGISTRATION CLOSED"}
                  </span>
                )}

                <Link
                  to="/admin/batches"
                  className="
                    rounded-xl
                    border border-white/10
                    bg-white/10
                    px-4 py-2
                    text-xs font-bold text-white
                    transition-all duration-300
                    hover:bg-[#F28C45]/20
                    hover:border-[#F28C45]/30
                  "
                >
                  Batch Settings
                </Link>
              </div>
            </div>
          </div>

          {/* Batch statistics */}
          {activeBatch ? (
            <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
              {/* Students */}
              <div className="group/stat rounded-2xl border border-white/10 bg-white/8 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9EDBFA]">
                    Enrolled Students
                  </p>

                  <Users className="h-4 w-4 text-[#FFB276]" />
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {currentBatch?.studentCount || 0}
                  </span>

                  <span className="text-xs text-[#B9CAD6]">
                    ({currentBatch?.femaleStudents || 0} female /{" "}
                    {currentBatch?.maleStudents || 0} male)
                  </span>
                </div>
              </div>

              {/* Teams */}
              <div className="group/stat rounded-2xl border border-white/10 bg-white/8 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9EDBFA]">
                    Active Teams
                  </p>

                  <Users2 className="h-4 w-4 text-[#FFB276]" />
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {currentBatch?.teamCount || 0}
                </div>

                <p className="mt-1 text-xs text-[#B9CAD6]">
                  Teams formed
                </p>
              </div>

              {/* Mentors */}
              <div className="group/stat rounded-2xl border border-white/10 bg-white/8 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9EDBFA]">
                    Available Mentors
                  </p>

                  <Shield className="h-4 w-4 text-[#FFB276]" />
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {currentBatch?.mentorCount || 0}
                </div>

                <p className="mt-1 text-xs text-[#B9CAD6]">
                  Active mentors
                </p>
              </div>

              {/* Applicants */}
              <div className="group/stat rounded-2xl border border-white/10 bg-white/8 p-5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/12">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9EDBFA]">
                    Cohort Applicants
                  </p>

                  <TrendingUp className="h-4 w-4 text-[#FFB276]" />
                </div>

                <div className="mt-3 text-3xl font-black text-white">
                  {currentBatch?.applicantCount || 0}
                </div>

                <p className="mt-1 text-xs text-[#B9CAD6]">
                  Applications received
                </p>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center">
              <Layers className="mx-auto h-10 w-10 text-gray-400" />

              <p className="mt-3 text-sm font-semibold text-gray-300">
                No Active Batch Selected
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Activate a batch from Batch Management to see it here.
              </p>
            </div>
          )}
        </div>

        {/* =====================================================
            PREVIOUS COHORTS
        ====================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[2rem]
            border border-white/60
            bg-white/50
            p-6
            shadow-[0_15px_45px_rgba(70,90,110,0.12)]
            backdrop-blur-xl
            sm:p-8
            animate-[fadeUp_0.8s_ease-out_both]
          "
          style={{ animationDelay: "500ms" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF3FF] text-[#3D9BC8]">
                  <Clock className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-[#172B3A]">
                    Previous Bootcamp Cohorts
                  </h2>

                  <p className="mt-1 text-xs text-[#718096]">
                    Historical student enrollment and team records.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/admin/batches"
              className="
                group
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#E6F6FF]
                px-4 py-2.5
                text-xs font-bold
                text-[#3D89B2]
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-[#D4F0FF]
              "
            >
              Manage All Batches

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-white/70 bg-white/35">
            {previousBatches.length === 0 ? (
              <div className="p-10 text-center">
                <Layers className="mx-auto h-8 w-8 text-[#A8B8C5]" />

                <p className="mt-3 text-sm font-semibold text-[#718096]">
                  No previous cohorts found
                </p>

                <p className="mt-1 text-xs text-[#94A3B8]">
                  Past bootcamp cohorts will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="bg-linear-to-r from-[#E6F6FF] to-[#FFF0E4]">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">
                        Cohort
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">
                        Status
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">
                        Students
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">
                        Teams
                      </th>

                      <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#64748B]">
                        Year
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {previousBatches.map((batch, index) => (
                      <tr
                        key={batch._id}
                        style={{
                          animationDelay: `${index * 100}ms`,
                        }}
                        className="
                          group
                          border-t border-white/70
                          transition-all duration-300
                          hover:bg-white/50
                          animate-[fadeUp_0.5s_ease-out_both]
                        "
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DDF3FF] text-[#3D9BC8] transition-all duration-300 group-hover:scale-110">
                              <Layers className="h-4 w-4" />
                            </div>

                            <span className="font-bold text-[#243B4D]">
                              {batch.name || "Unnamed Batch"}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border border-[#8DD8FF]/30
                              bg-[#E6F7FF]
                              px-3
                              py-1.5
                              text-[10px]
                              font-black
                              uppercase
                              tracking-wide
                              text-[#3988B2]
                            "
                          >
                            <CircleDot className="h-3 w-3" />

                            {batch.status?.toUpperCase() || "COMPLETED"}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="font-black text-[#243B4D]">
                            {batch.totalStudents || 0}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="font-black text-[#243B4D]">
                            {batch.totalTeams || 0}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#718096]">
                            <Clock className="h-4 w-4 text-[#F28C45]" />

                            {batch.startDate
                              ? new Date(batch.startDate).getFullYear()
                              : "Past Cohort"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <div
          className="animate-[fadeUp_0.8s_ease-out_both]"
          style={{ animationDelay: "600ms" }}
        >
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-linear-to-b from-[#F28C45] to-[#75C9EF]" />

              <div>
                <h2 className="text-xl font-black text-[#172B3A]">
                  Quick Actions
                </h2>

                <p className="mt-1 text-xs font-medium text-[#718096]">
                  Quickly access the most important admin tools.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Applicant Reviews */}
            <Link
              to="/admin/applicants"
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border border-white/60
                bg-white/50
                p-6
                shadow-[0_15px_40px_rgba(70,90,110,0.10)]
                backdrop-blur-xl
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-[0_25px_55px_rgba(70,90,110,0.17)]
              "
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FFB77D]/20 blur-2xl transition-all duration-500 group-hover:scale-150" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E4] text-[#E57D32] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <UserCheck className="h-6 w-6" />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#94A3B8] transition-all duration-300 group-hover:bg-[#F28C45] group-hover:text-white">
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>

              <h3 className="relative mt-5 text-lg font-black text-[#172B3A]">
                Applicant Reviews
              </h3>

              <p className="relative mt-2 text-xs leading-5 text-[#718096]">
                Accept or reject registered students and review their
                applications.
              </p>

              <div className="relative mt-5 flex items-center gap-2 text-[11px] font-bold text-[#D96F27]">
                <CheckCircle2 className="h-4 w-4" />
                Review applications
              </div>
            </Link>

            {/* Team Formation */}
            <Link
              to="/admin/teams"
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border border-white/60
                bg-white/50
                p-6
                shadow-[0_15px_40px_rgba(70,90,110,0.10)]
                backdrop-blur-xl
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-[0_25px_55px_rgba(70,90,110,0.17)]
              "
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#8DD8FF]/25 blur-2xl transition-all duration-500 group-hover:scale-150" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E4F6FF] text-[#3C98C4] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Users2 className="h-6 w-6" />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#94A3B8] transition-all duration-300 group-hover:bg-[#4BA6D4] group-hover:text-white">
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>

              <h3 className="relative mt-5 text-lg font-black text-[#172B3A]">
                Team Formations
              </h3>

              <p className="relative mt-2 text-xs leading-5 text-[#718096]">
                Group students into teams and assign mentors.
              </p>

              <div className="relative mt-5 flex items-center gap-2 text-[11px] font-bold text-[#3988B2]">
                <Users2 className="h-4 w-4" />
                Manage teams
              </div>
            </Link>

            {/* Cohort Management */}
            <Link
              to="/admin/batches"
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border border-white/60
                bg-white/50
                p-6
                shadow-[0_15px_40px_rgba(70,90,110,0.10)]
                backdrop-blur-xl
                transition-all duration-500
                hover:-translate-y-2
                hover:shadow-[0_25px_55px_rgba(70,90,110,0.17)]
              "
            >
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FFD0AF]/25 blur-2xl transition-all duration-500 group-hover:scale-150" />

              <div className="relative flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF0E4] text-[#E57D32] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <Calendar className="h-6 w-6" />
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-[#94A3B8] transition-all duration-300 group-hover:bg-[#F28C45] group-hover:text-white">
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>

              <h3 className="relative mt-5 text-lg font-black text-[#172B3A]">
                Cohort Management
              </h3>

              <p className="relative mt-2 text-xs leading-5 text-[#718096]">
                Manage batches and control public registration.
              </p>

              <div className="relative mt-5 flex items-center gap-2 text-[11px] font-bold text-[#D96F27]">
                <Calendar className="h-4 w-4" />
                Manage cohorts
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          ANIMATION KEYFRAMES
      ====================================================== */}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;