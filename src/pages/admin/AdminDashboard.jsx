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
  BarChart3,
  // Added icons for new graphs
  FileText,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/batches/dashboard-stats");

        if (!mounted) return;

        setStatsData(response.data);
      } catch (err) {
        console.error("Dashboard API error:", err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Failed to load dashboard statistics.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const currentBatch =
    statsData?.currentBatch && typeof statsData.currentBatch === "object"
      ? statsData.currentBatch
      : {};

  const previousBatches = Array.isArray(statsData?.previousBatches)
    ? statsData.previousBatches
    : [];

  const overallStats =
    statsData?.overallStats && typeof statsData.overallStats === "object"
      ? statsData.overallStats
      : {};

  const activeBatch =
    currentBatch?.batch && typeof currentBatch.batch === "object"
      ? currentBatch.batch
      : null;

  const totalStudents = Number(overallStats?.totalStudentsAllTime) || 0;

  const totalMentors = Number(overallStats?.totalMentors) || 0;

  const totalBatches = Number(overallStats?.totalBatches) || 0;

  const applicantCount = Number(currentBatch?.applicantCount) || 0;

  const studentCount = Number(currentBatch?.studentCount) || 0;

  const mentorCount = Number(currentBatch?.mentorCount) || 0;

  const teamCount = Number(currentBatch?.teamCount) || 0;

  const femaleStudents = Number(currentBatch?.femaleStudents) || 0;

  const maleStudents = Number(currentBatch?.maleStudents) || 0;

  // --- NEW: FETCH DATA FOR ASSIGNMENTS AND ATTENDANCE ---
  const assignmentData = Array.isArray(currentBatch?.assignmentStats)
    ? currentBatch.assignmentStats
    : [];

  const attendanceData = Array.isArray(currentBatch?.attendanceStats)
    ? currentBatch.attendanceStats
    : [];

  const statCards = [
    {
      label: "TOTAL STUDENTS",
      value: totalStudents,
      description: "Registered students",
      icon: Users,
    },
    {
      label: "ACTIVE MENTORS",
      value: totalMentors,
      description: "Currently active",
      icon: Shield,
    },
    {
      label: "PENDING APPLICATIONS",
      value: applicantCount,
      description: "Waiting for review",
      icon: UserCheck,
    },
    {
      label: "BOOTCAMP COHORTS",
      value: totalBatches,
      description: "Published cohorts",
      icon: Layers,
    },
  ];

  const activeStats = [
    {
      label: "Enrolled Students",
      value: studentCount,
      extra: `(${femaleStudents} female / ${maleStudents} male)`,
    },
    {
      label: "Active Teams",
      value: teamCount,
      extra: "Teams formed",
    },
    {
      label: "Available Mentors",
      value: mentorCount,
      extra: "Active mentors",
    },
    {
      label: "Cohort Applicants",
      value: applicantCount,
      extra: "Applications received",
    },
  ];

  const genderData = [
    {
      name: "Female",
      value: femaleStudents,
    },
    {
      name: "Male",
      value: maleStudents,
    },
  ];

  const cohortData = previousBatches.map((batch) => {
    const batchName = batch?.name ? String(batch.name) : "Cohort";

    return {
      name:
        batchName.length > 14 ? `${batchName.substring(0, 14)}...` : batchName,
      students: Number(batch?.totalStudents) || 0,
      teams: Number(batch?.totalTeams) || 0,
    };
  });

  const overviewData = [
    {
      name: "Students",
      value: studentCount,
    },
    {
      name: "Teams",
      value: teamCount,
    },
    {
      name: "Applicants",
      value: applicantCount,
    },
    {
      name: "Mentors",
      value: mentorCount,
    },
  ];

  const genderColors = ["#00A8CC", "#14222B"];

  if (loading) {
    return (
      <>
        <style>{`
          @keyframes loaderPulse {
            0%, 100% {
              transform: scale(1);
              opacity: .35;
            }
            50% {
              transform: scale(1.35);
              opacity: .8;
            }
          }

          @keyframes loaderSpin {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes loaderText {
            0%, 100% {
              opacity: .45;
            }
            50% {
              opacity: 1;
            }
          }

          .loader-pulse {
            animation: loaderPulse 1.8s ease-in-out infinite;
          }

          .loader-spin {
            animation: loaderSpin 1s linear infinite;
          }

          .loader-text {
            animation: loaderText 1.5s ease-in-out infinite;
          }
        `}</style>

        <div className="flex min-h-[600px] items-center justify-center bg-[#F4F8FA] px-4">
          <div className="flex flex-col items-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="loader-pulse absolute inset-0 rounded-full bg-[#00A8CC]/20" />

              <div className="absolute h-20 w-20 rounded-full border border-[#B4D7E2]" />

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#14222B] shadow-xl">
                <Loader2 className="loader-spin h-7 w-7 text-[#00A8CC]" />
              </div>
            </div>

            <p className="loader-text mt-5 text-sm font-semibold text-[#14222B]">
              Loading dashboard overview...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{`
          @keyframes errorSlide {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .error-slide {
            animation: errorSlide .5s ease-out both;
          }
        `}</style>

        <div className="min-h-full bg-[#F4F8FA] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="error-slide rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div>
                  <h2 className="font-bold text-red-800">
                    Unable to load dashboard
                  </h2>

                  <p className="mt-1 text-sm text-red-700">{error}</p>

                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes dashboardFadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardFadeDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardScale {
          from {
            opacity: 0;
            transform: scale(.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes dashboardFloat {
          0%, 100% {
            transform: translate3d(0,0,0);
          }
          50% {
            transform: translate3d(0,-14px,0);
          }
        }

        @keyframes dashboardFloatTwo {
          0%, 100% {
            transform: translate3d(0,0,0);
          }
          50% {
            transform: translate3d(14px,-10px,0);
          }
        }

        @keyframes dashboardGlow {
          0%, 100% {
            opacity: .25;
            transform: scale(1);
          }
          50% {
            opacity: .65;
            transform: scale(1.12);
          }
        }

        @keyframes dashboardRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes dashboardShimmer {
          0% {
            transform: translateX(-130%);
          }
          50%, 100% {
            transform: translateX(130%);
          }
        }

        @keyframes dashboardPulse {
          0%, 100% {
            opacity: .4;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        @keyframes dashboardProgress {
          from {
            width: 0;
          }
        }

        .dashboard-fade-up {
          animation: dashboardFadeUp .7s cubic-bezier(.22,1,.36,1) both;
        }

        .dashboard-fade-down {
          animation: dashboardFadeDown .6s cubic-bezier(.22,1,.36,1) both;
        }

        .dashboard-scale {
          animation: dashboardScale .7s cubic-bezier(.22,1,.36,1) both;
        }

        .dashboard-float {
          animation: dashboardFloat 5s ease-in-out infinite;
        }

        .dashboard-float-two {
          animation: dashboardFloatTwo 7s ease-in-out infinite;
        }

        .dashboard-glow {
          animation: dashboardGlow 4s ease-in-out infinite;
        }

        .dashboard-rotate {
          animation: dashboardRotate 20s linear infinite;
        }

        .dashboard-shimmer {
          animation: dashboardShimmer 4s ease-in-out infinite;
        }

        .dashboard-pulse {
          animation: dashboardPulse 2s ease-in-out infinite;
        }

        .dashboard-progress {
          animation: dashboardProgress 1.4s cubic-bezier(.22,1,.36,1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="min-h-full overflow-hidden bg-[#F4F8FA] px-4 py-6 sm:px-6 lg:px-8">
        <div className="pointer-events-none fixed right-0 top-20 h-80 w-80 rounded-full bg-[#00A8CC]/5 blur-3xl" />

        <div className="pointer-events-none fixed bottom-0 left-0 h-96 w-96 rounded-full bg-[#B4D7E2]/20 blur-3xl" />

        <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
          {/* HEADER */}

          <div
            className="dashboard-fade-down flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
            style={{ animationDelay: ".05s" }}
          >
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="dashboard-pulse h-2 w-2 rounded-full bg-[#00A8CC]" />

                <p className="text-sm font-bold tracking-[.15em] text-[#00A8CC]">
                  ADMIN DASHBOARD
                </p>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#14222B] sm:text-3xl">
                Welcome back, Admin
              </h1>

              <p className="mt-2 text-sm text-[#8FA3B0]">
                Manage the bootcamp and keep everything running smoothly.
              </p>
            </div>

            <Link
              to="/admin/applicants"
              className="group relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-xl bg-[#00A8CC] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#00A8CC]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#0088A6]"
            >
              <span className="dashboard-shimmer absolute inset-0 -translate-x-full bg-white/20" />

              <UserCheck className="relative h-4 w-4" />

              <span className="relative">
                Review Applicants ({applicantCount})
              </span>

              <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* STAT CARDS */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="dashboard-fade-up group relative overflow-hidden rounded-2xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A8CC]/50 hover:shadow-xl"
                  style={{
                    animationDelay: `${0.15 + index * 0.1}s`,
                  }}
                >
                  <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00A8CC]/15 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />

                  <div className="dashboard-glow pointer-events-none absolute right-4 top-4 h-2 w-2 rounded-full bg-[#00A8CC]" />

                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold tracking-wider text-[#8FA3B0]">
                        {card.label}
                      </p>

                      <h2 className="mt-2 text-3xl font-bold text-[#14222B] transition-all duration-300 group-hover:text-[#00A8CC]">
                        {card.value}
                      </h2>

                      <p className="mt-1 text-xs text-[#8FA3B0]">
                        {card.description}
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3F5F9] text-[#00A8CC] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
                </div>
              );
            })}
          </div>

          {/* ACTIVE BOOTCAMP */}

          <div
            className="dashboard-scale relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C2E3A] via-[#14222B] to-[#0E171E] text-white shadow-2xl"
            style={{ animationDelay: ".55s" }}
          >
            <div className="dashboard-glow pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#00A8CC]/20 blur-3xl" />

            <div className="dashboard-float pointer-events-none absolute right-24 top-16 h-24 w-24 rounded-full border border-[#00A8CC]/20" />

            <div className="dashboard-float-two pointer-events-none absolute bottom-10 right-12 h-12 w-12 rounded-full bg-[#00A8CC]/10" />

            <div className="pointer-events-none absolute left-1/3 top-0 h-52 w-52 rounded-full bg-[#00A8CC]/5 blur-3xl" />

            <div className="dashboard-rotate pointer-events-none absolute -bottom-28 -left-28 h-56 w-56 rounded-full border border-[#293E4C]" />

            <div className="relative border-b border-white/10 p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#00A8CC]/15">
                      <Sparkles className="h-4 w-4 text-[#00A8CC]" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-[.18em] text-[#B4D7E2]">
                      Current Active Bootcamp
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                    {activeBatch?.name || "No Active Batch Selected"}
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8FA3B0]">
                    {activeBatch?.description ||
                      "No active bootcamp is currently selected."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {activeBatch ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#00A8CC]/30 bg-[#00A8CC]/10 px-4 py-2 text-xs font-bold text-[#67C7E8]">
                      <span className="dashboard-pulse h-2 w-2 rounded-full bg-[#00A8CC]" />
                      ACTIVE
                    </span>
                  ) : (
                    <span className="rounded-full border border-[#293E4C] bg-[#293E4C]/40 px-4 py-2 text-xs font-bold text-[#8FA3B0]">
                      NO ACTIVE BATCH
                    </span>
                  )}

                  {activeBatch && (
                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold ${
                        activeBatch?.isRegistrationOpen
                          ? "border border-[#00A8CC]/30 bg-[#00A8CC]/10 text-[#67C7E8]"
                          : "border border-[#293E4C] bg-[#293E4C]/40 text-[#8FA3B0]"
                      }`}
                    >
                      {activeBatch?.isRegistrationOpen
                        ? "REGISTRATION OPEN"
                        : "REGISTRATION CLOSED"}
                    </span>
                  )}

                  <Link
                    to="/admin/batches"
                    className="rounded-xl border border-[#293E4C] bg-[#293E4C]/50 px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-1 hover:border-[#00A8CC]/50"
                  >
                    Batch Settings
                  </Link>
                </div>
              </div>
            </div>

            {activeBatch ? (
              <div className="relative grid gap-4 p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
                {activeStats.map((item, index) => {
                  const value = Number(item.value) || 0;
                  const progress = Math.min(Math.max(value * 5, 8), 100);

                  return (
                    <div
                      key={item.label}
                      className="dashboard-fade-up group rounded-2xl border border-white/5 bg-white/[.06] p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A8CC]/30 hover:bg-white/[.1]"
                      style={{
                        animationDelay: `${0.7 + index * 0.12}s`,
                      }}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#B4D7E2]">
                        {item.label}
                      </p>

                      <div className="mt-2 flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl font-bold transition-colors group-hover:text-[#67C7E8]">
                          {value}
                        </span>

                        <span className="text-xs text-[#8FA3B0]">
                          {item.extra}
                        </span>
                      </div>

                      <div className="mt-5 h-1 overflow-hidden rounded-full bg-[#293E4C]">
                        <div
                          className="dashboard-progress h-full rounded-full bg-[#00A8CC]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="mt-2 flex justify-between text-[9px] uppercase tracking-wider text-[#8FA3B0]">
                        <span>Current</span>
                        <span>{value} total</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="relative p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#293E4C]/50">
                  <Layers className="h-8 w-8 text-[#8FA3B0]" />
                </div>

                <p className="mt-4 text-sm font-semibold text-[#B4D7E2]">
                  No Active Batch Selected
                </p>

                <p className="mt-1 text-xs text-[#8FA3B0]">
                  Activate a batch from Batch Management to see it here.
                </p>

                <Link
                  to="/admin/batches"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#00A8CC] px-4 py-2 text-xs font-bold text-white transition-all hover:-translate-y-1 hover:bg-[#0088A6]"
                >
                  Manage Batches
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* ANALYTICS */}

          <div className="dashboard-fade-up" style={{ animationDelay: ".8s" }}>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#00A8CC]" />

                <h2 className="text-lg font-bold text-[#14222B]">
                  Bootcamp Analytics
                </h2>
              </div>

              <p className="mt-1 text-xs text-[#8FA3B0]">
                Visual overview of students, teams, applicants and cohort
                performance.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {/* GENDER */}

              <div className="group rounded-3xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#14222B]">Student Gender</h3>

                    <p className="mt-1 text-xs text-[#8FA3B0]">
                      Current active cohort
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <Users className="h-4 w-4 text-[#00A8CC]" />
                  </div>
                </div>

                <div className="mt-3 h-[170px]">
                  {genderData.some((item) => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderData}
                          cx="50%"
                          cy="45%"
                          innerRadius={42}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {genderData.map((entry, index) => (
                            <Cell
                              key={`gender-${index}`}
                              fill={genderColors[index]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #B4D7E2",
                            boxShadow: "0 10px 30px rgba(20,34,43,.12)",
                            fontSize: "12px",
                          }}
                        />

                        <Legend
                          verticalAlign="bottom"
                          height={25}
                          wrapperStyle={{ fontSize: "11px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <Users className="h-8 w-8 text-[#B4D7E2]" />

                      <p className="mt-2 text-sm font-semibold text-[#14222B]">
                        No gender data
                      </p>

                      <p className="mt-1 text-xs text-[#8FA3B0]">
                        Student gender statistics will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-[#F4F8FA] p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                      Female
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#00A8CC]">
                      {femaleStudents}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[#F4F8FA] p-2.5">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                      Male
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#14222B]">
                      {maleStudents}
                    </p>
                  </div>
                </div>
              </div>

              {/* COHORT PERFORMANCE */}

              <div className="group rounded-3xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#14222B]">
                      Cohort Performance
                    </h3>

                    <p className="mt-1 text-xs text-[#8FA3B0]">
                      Students and teams by cohort
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <Layers className="h-4 w-4 text-[#00A8CC]" />
                  </div>
                </div>

                <div className="mt-3 h-[170px]">
                  {cohortData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cohortData}
                        margin={{
                          top: 5,
                          right: 5,
                          left: -25,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E3EDF1" />

                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 9,
                            fill: "#8FA3B0",
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 9,
                            fill: "#8FA3B0",
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #B4D7E2",
                            boxShadow: "0 10px 30px rgba(20,34,43,.12)",
                            fontSize: "12px",
                          }}
                        />

                        <Legend wrapperStyle={{ fontSize: "11px" }} />

                        <Bar
                          dataKey="students"
                          name="Students"
                          fill="#00A8CC"
                          radius={[5, 5, 0, 0]}
                        />

                        <Bar
                          dataKey="teams"
                          name="Teams"
                          fill="#14222B"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <Layers className="h-8 w-8 text-[#B4D7E2]" />

                      <p className="mt-2 text-sm font-semibold text-[#14222B]">
                        No cohort history
                      </p>

                      <p className="mt-1 text-xs text-[#8FA3B0]">
                        Previous cohort data will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* CURRENT BOOTCAMP */}

              <div className="group rounded-3xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#14222B]">
                      Current Bootcamp
                    </h3>

                    <p className="mt-1 text-xs text-[#8FA3B0]">
                      Current cohort statistics
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <BarChart3 className="h-4 w-4 text-[#00A8CC]" />
                  </div>
                </div>

                <div className="mt-3 h-[170px]">
                  {overviewData.some((item) => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={overviewData}
                        margin={{
                          top: 5,
                          right: 5,
                          left: -25,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E3EDF1" />

                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 9,
                            fill: "#8FA3B0",
                          }}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 9,
                            fill: "#8FA3B0",
                          }}
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #B4D7E2",
                            boxShadow: "0 10px 30px rgba(20,34,43,.12)",
                            fontSize: "12px",
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Total"
                          stroke="#00A8CC"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            fill: "#00A8CC",
                            strokeWidth: 2,
                            stroke: "#FFFFFF",
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <BarChart3 className="h-8 w-8 text-[#B4D7E2]" />

                      <p className="mt-2 text-sm font-semibold text-[#14222B]">
                        No statistics available
                      </p>

                      <p className="mt-1 text-xs text-[#8FA3B0]">
                        Current bootcamp data will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  {overviewData.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-xl bg-[#F4F8FA] p-2.5"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                        {item.name}
                      </p>

                      <p className="mt-1 text-lg font-bold text-[#14222B]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* NEW: ASSIGNMENT SUBMISSIONS GRAPH */}

              <div className="group rounded-3xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#14222B]">Assignments</h3>

                    <p className="mt-1 text-xs text-[#8FA3B0]">
                      Submission status per task
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <FileText className="h-4 w-4 text-[#00A8CC]" />
                  </div>
                </div>

                <div className="mt-3 h-[170px]">
                  {assignmentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={assignmentData}
                        margin={{ left: -25, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E3EDF1" />
                        <XAxis dataKey="title" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #B4D7E2",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px" }} />
                        <Bar
                          dataKey="submitted"
                          name="Turned In"
                          fill="#00A8CC"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="pending"
                          name="Pending"
                          fill="#14222B"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <FileText className="h-8 w-8 text-[#B4D7E2]" />
                      <p className="mt-2 text-sm font-semibold text-[#14222B]">
                        No assignment stats
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* NEW: ATTENDANCE TREND GRAPH */}

              <div className="group rounded-3xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-[#14222B]">Attendance</h3>

                    <p className="mt-1 text-xs text-[#8FA3B0]">
                      Daily student attendance %
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <TrendingUp className="h-4 w-4 text-[#00A8CC]" />
                  </div>
                </div>

                <div className="mt-3 h-[170px]">
                  {attendanceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={attendanceData}
                        margin={{ left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorAtt"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#00A8CC"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#00A8CC"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E3EDF1" />
                        <XAxis dataKey="day" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} unit="%" />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="rate"
                          name="Attendance Rate"
                          stroke="#00A8CC"
                          fillOpacity={1}
                          fill="url(#colorAtt)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-[#B4D7E2]" />
                      <p className="mt-2 text-sm font-semibold text-[#14222B]">
                        No attendance stats
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PREVIOUS COHORTS */}

          <div
            className="dashboard-fade-up rounded-3xl border border-[#B4D7E2]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-8"
            style={{ animationDelay: ".95s" }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#14222B]">
                  Previous Bootcamp Cohorts
                </h2>

                <p className="mt-1 text-xs text-[#8FA3B0]">
                  Historical student enrollment and team records.
                </p>
              </div>

              <Link
                to="/admin/batches"
                className="group inline-flex items-center gap-2 text-xs font-bold text-[#00A8CC] transition-colors hover:text-[#0088A6]"
              >
                Manage All Batches
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="mt-6 overflow-x-auto">
              {previousBatches.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#B4D7E2] bg-[#F4F8FA] p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Layers className="h-7 w-7 text-[#8FA3B0]" />
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#14222B]">
                    No previous cohorts found
                  </p>

                  <p className="mt-1 text-xs text-[#8FA3B0]">
                    Past bootcamp cohorts will appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-[#B4D7E2]/60 bg-[#F4F8FA]">
                      <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#8FA3B0]">
                        Cohort
                      </th>

                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-[#8FA3B0]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-[#8FA3B0]">
                        Students
                      </th>

                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-[#8FA3B0]">
                        Teams
                      </th>

                      <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-[#8FA3B0]">
                        Year
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {previousBatches.map((batch, index) => (
                      <tr
                        key={batch?._id || index}
                        className="dashboard-fade-up group border-b border-[#B4D7E2]/30 transition-all duration-300 hover:bg-[#E3F5F9]/50"
                        style={{
                          animationDelay: `${1.05 + index * 0.08}s`,
                        }}
                      >
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#14222B] transition-colors duration-300 group-hover:text-[#00A8CC]">
                            {batch?.name || "Unnamed Batch"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex rounded-full bg-[#E3F5F9] px-3 py-1 text-[10px] font-bold text-[#0088A6]">
                            {batch?.status?.toUpperCase() || "COMPLETED"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-[#14222B]">
                            {Number(batch?.totalStudents) || 0}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-[#14222B]">
                            {Number(batch?.totalTeams) || 0}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center gap-2 text-xs text-[#8FA3B0]">
                            <Clock className="h-4 w-4 text-[#00A8CC]" />

                            {batch?.startDate
                              ? new Date(batch.startDate).getFullYear()
                              : "Past Cohort"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div
            className="dashboard-fade-up"
            style={{ animationDelay: "1.15s" }}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#14222B]">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-[#8FA3B0]">
                Quickly access the most important admin tools.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Link
                to="/admin/applicants"
                className="group relative overflow-hidden rounded-2xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A8CC]/50 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00A8CC]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <UserCheck className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-[#8FA3B0] transition-all duration-300 group-hover:translate-x-2 group-hover:text-[#00A8CC]" />
                </div>

                <h3 className="relative mt-4 font-bold text-[#14222B] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  Applicant Reviews
                </h3>

                <p className="relative mt-1 text-xs leading-5 text-[#8FA3B0]">
                  Accept or reject registered students and review their
                  applications.
                </p>

                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
              </Link>

              <Link
                to="/admin/teams"
                className="group relative overflow-hidden rounded-2xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A8CC]/50 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00A8CC]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Users2 className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-[#8FA3B0] transition-all duration-300 group-hover:translate-x-2 group-hover:text-[#00A8CC]" />
                </div>

                <h3 className="relative mt-4 font-bold text-[#14222B] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  Team Formations
                </h3>

                <p className="relative mt-1 text-xs leading-5 text-[#8FA3B0]">
                  Group students into teams and assign mentors.
                </p>

                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
              </Link>

              <Link
                to="/admin/batches"
                className="group relative overflow-hidden rounded-2xl border border-[#B4D7E2]/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-[#00A8CC]/50 hover:shadow-xl"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-[#00A8CC]/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
                    <Calendar className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-[#8FA3B0] transition-all duration-300 group-hover:translate-x-2 group-hover:text-[#00A8CC]" />
                </div>

                <h3 className="relative mt-4 font-bold text-[#14222B] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  Cohort Management
                </h3>

                <p className="relative mt-1 text-xs leading-5 text-[#8FA3B0]">
                  Manage batches and control public registration.
                </p>

                <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
