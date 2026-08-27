import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Code2,
  Monitor,
  Loader2,
  Users,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import api from "../../utils/api";

const MentorProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMentorProgress();
  }, []);

  const loadMentorProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/progress/mentor/progress");
      const data = response?.data;

      let progressData = [];

      if (Array.isArray(data)) {
        progressData = data;
      } else if (Array.isArray(data?.data)) {
        progressData = data.data;
      } else if (Array.isArray(data?.students)) {
        progressData = data.students;
      } else if (Array.isArray(data?.progress)) {
        progressData = data.progress;
      }

      setProgress(progressData);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load mentor progress.",
      );
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (student) => {
    const data = student?.student || student;

    const firstName = data?.firstName || "";
    const lastName = data?.lastName || "";

    const fullName = `${firstName} ${lastName}`.trim();

    return data?.name || data?.fullName || fullName || "Student";
  };

  const getStudentEmail = (student) => {
    return student?.student?.email || student?.email || "";
  };

  const getCpCompleted = (student) =>
    Number(
      student?.cp?.completed ?? student?.competitiveProgramming?.completed ?? 0,
    );

  const getCpTotal = (student) =>
    Number(student?.cp?.total ?? student?.competitiveProgramming?.total ?? 0);

  const getCpNeedsHelp = (student) =>
    Number(
      student?.cp?.needsHelp ??
        student?.cp?.needHelp ??
        student?.competitiveProgramming?.needsHelp ??
        student?.competitiveProgramming?.needHelp ??
        0,
    );

  const getCpInProgress = (student) =>
    Number(
      student?.cp?.inProgress ??
        student?.competitiveProgramming?.inProgress ??
        0,
    );

  const getCpNotStarted = (student) =>
    Number(
      student?.cp?.notStarted ??
        student?.competitiveProgramming?.notStarted ??
        0,
    );

  const getDevCompleted = (student) =>
    Number(student?.dev?.completed ?? student?.development?.completed ?? 0);

  const getDevTotal = (student) =>
    Number(student?.dev?.total ?? student?.development?.total ?? 0);

  const getDevNeedsHelp = (student) =>
    Number(
      student?.dev?.needsHelp ??
        student?.dev?.needHelp ??
        student?.development?.needsHelp ??
        student?.development?.needHelp ??
        0,
    );

  const getDevInProgress = (student) =>
    Number(student?.dev?.inProgress ?? student?.development?.inProgress ?? 0);

  const getDevNotStarted = (student) =>
    Number(student?.dev?.notStarted ?? student?.development?.notStarted ?? 0);

  const getCpCompletion = (student) => {
    const value =
      student?.cp?.completion ?? student?.competitiveProgramming?.completion;

    if (value !== undefined && value !== null && !Number.isNaN(Number(value))) {
      return Math.min(Math.max(Number(value), 0), 100);
    }

    const completed = getCpCompleted(student);
    const total = getCpTotal(student);

    return total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;
  };

  const getDevCompletion = (student) => {
    const value = student?.dev?.completion ?? student?.development?.completion;

    if (value !== undefined && value !== null && !Number.isNaN(Number(value))) {
      return Math.min(Math.max(Number(value), 0), 100);
    }

    const completed = getDevCompleted(student);
    const total = getDevTotal(student);

    return total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0;
  };

  const getOverallCompletion = (student) => {
    const cpCompleted = getCpCompleted(student);
    const cpTotal = getCpTotal(student);

    const devCompleted = getDevCompleted(student);
    const devTotal = getDevTotal(student);

    const total = cpTotal + devTotal;
    const completed = cpCompleted + devCompleted;

    if (total === 0) return 0;

    return Math.min(Math.round((completed / total) * 100), 100);
  };

  const getOverallNeedsHelp = (student) =>
    getCpNeedsHelp(student) + getDevNeedsHelp(student);

  const getOverallInProgress = (student) =>
    getCpInProgress(student) + getDevInProgress(student);

  const getOverallNotStarted = (student) =>
    getCpNotStarted(student) + getDevNotStarted(student);

  const completedItems = progress.reduce(
    (total, student) =>
      total + getCpCompleted(student) + getDevCompleted(student),
    0,
  );

  const inProgressItems = progress.reduce(
    (total, student) =>
      total + getCpInProgress(student) + getDevInProgress(student),
    0,
  );

  const needHelpItems = progress.reduce(
    (total, student) =>
      total + getCpNeedsHelp(student) + getDevNeedsHelp(student),
    0,
  );

  const totalCpCompleted = progress.reduce(
    (total, student) => total + getCpCompleted(student),
    0,
  );

  const totalCpExpected = progress.reduce(
    (total, student) => total + getCpTotal(student),
    0,
  );

  const totalDevCompleted = progress.reduce(
    (total, student) => total + getDevCompleted(student),
    0,
  );

  const totalDevExpected = progress.reduce(
    (total, student) => total + getDevTotal(student),
    0,
  );

  const totalExpected = totalCpExpected + totalDevExpected;

  const totalCompleted = totalCpCompleted + totalDevCompleted;

  const overallPercentage =
    totalExpected > 0
      ? Math.min(Math.round((totalCompleted / totalExpected) * 100), 100)
      : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF4F7]">
        <div className="flex items-center gap-3 text-[#00A8CC]">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-sm font-semibold text-[#14222B]">
            Loading student progress...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .page-enter {
          animation: pageEnter 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .fade-up {
          animation: fadeUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      <div className="page-enter min-h-screen bg-[#EEF4F7] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-337.5 space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-[#113E52]/40 bg-[#092B3A] px-5 py-5 text-white shadow-sm sm:px-7 sm:py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-[#061E27] via-[#0B303A] to-[#173F49] text-white shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                    Students Progress
                  </h1>

                  <p className="truncate text-xs font-medium text-slate-300 sm:text-sm">
                    Track the progress of your assigned students
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2.5">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                  <Users size={14} />
                  <span>{progress.length} Assigned</span>
                </div>

                <button
                  type="button"
                  onClick={loadMentorProgress}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
                  title="Refresh"
                >
                  <RefreshCw size={15} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="fade-up flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-sm">
              <AlertCircle size={17} className="text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div
              className="fade-up rounded-2xl border border-[#D5E5EE] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: "60ms" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                    COMPLETED
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#14222B]">
                    {completedItems}
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                    Completed Tasks
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>

            <div
              className="fade-up rounded-2xl border border-[#D5E5EE] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: "120ms" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                    IN PROGRESS
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#14222B]">
                    {inProgressItems}
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-amber-600">
                    Actively Learning
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Clock size={24} />
                </div>
              </div>
            </div>

            <div
              className="fade-up rounded-2xl border border-[#D5E5EE] bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                    NEED HELP
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-[#14222B]">
                    {needHelpItems}
                  </p>

                  <p className="mt-1 text-[11px] font-semibold text-rose-600">
                    Assistance Required
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle size={24} />
                </div>
              </div>
            </div>
          </div>

          <div
            className="fade-up rounded-2xl border border-[#D5E5EE] bg-white p-6 shadow-sm transition hover:shadow-md md:p-8"
            style={{ animationDelay: "240ms" }}
          >
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#14222B]">
                  Overall Progress
                </h2>

                <p className="mt-0.5 text-xs text-[#8FA3B0]">
                  Combined CP and Development progress
                </p>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-3xl font-extrabold text-[#00A8CC]">
                  {overallPercentage}%
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                  COHORT COMPLETION
                </p>
              </div>
            </div>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#00A8CC] transition-all duration-1000"
                style={{
                  width: `${overallPercentage}%`,
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-[#00A8CC]" />

                  <span className="text-xs font-bold text-slate-600">
                    CP Solved
                  </span>
                </div>

                <p className="mt-2 text-base font-bold text-[#14222B]">
                  {totalCpCompleted}
                  <span className="text-xs font-normal text-slate-400">
                    {" "}
                    / {totalCpExpected}
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-purple-600" />

                  <span className="text-xs font-bold text-slate-600">
                    Dev Completed
                  </span>
                </div>

                <p className="mt-2 text-base font-bold text-[#14222B]">
                  {totalDevCompleted}
                  <span className="text-xs font-normal text-slate-400">
                    {" "}
                    / {totalDevExpected}
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#14222B]" />

                  <span className="text-xs font-bold text-slate-600">
                    Students
                  </span>
                </div>

                <p className="mt-2 text-base font-bold text-[#14222B]">
                  {progress.length} Assigned
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />

                  <span className="text-xs font-bold text-slate-600">
                    Finished
                  </span>
                </div>

                <p className="mt-2 text-base font-bold text-emerald-600">
                  {completedItems} Completed
                </p>
              </div>
            </div>
          </div>

          <div
            className="fade-up rounded-2xl border border-[#D5E5EE] bg-white p-6 shadow-sm md:p-8"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-[#14222B]">
                  Assigned Students Progress
                </h2>

                <p className="text-xs text-[#8FA3B0]">
                  Only students assigned to you are displayed
                </p>
              </div>

              <span className="rounded-xl border border-[#B4D7E2]/50 bg-[#F4F8FA] px-3.5 py-1.5 text-xs font-semibold text-[#14222B]">
                {progress.length} Students
              </span>
            </div>

            <div className="mt-6">
              <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                <span>STUDENT</span>
                <span>CP PROGRESS</span>
                <span>DEV PROGRESS</span>
                <span>OVERALL RATE</span>
                <span className="text-right">STATUS</span>
              </div>

              {progress.length === 0 ? (
                <div className="flex min-h-60 flex-col items-center justify-center p-8 text-center">
                  <TrendingUp size={36} className="text-slate-300" />

                  <h3 className="mt-3 text-sm font-bold text-[#14222B]">
                    No student progress
                  </h3>

                  <p className="mt-1 text-xs text-[#8FA3B0]">
                    No progress data is available for your assigned students
                    yet.
                  </p>
                </div>
              ) : (
                <div className="mt-2 space-y-3.5">
                  {progress.map((student, index) => {
                    const studentName = getStudentName(student);

                    const email = getStudentEmail(student);

                    const cpCompleted = getCpCompleted(student);

                    const cpTotal = getCpTotal(student);

                    const cpCompletion = getCpCompletion(student);

                    const devCompleted = getDevCompleted(student);

                    const devTotal = getDevTotal(student);

                    const devCompletion = getDevCompletion(student);

                    const overall = getOverallCompletion(student);

                    const studentNeedsHelp = getOverallNeedsHelp(student);

                    const studentInProgress = getOverallInProgress(student);

                    const initials = studentName
                      .split(" ")
                      .filter(Boolean)
                      .map((name) => name[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    let status = "NOT STARTED";

                    if (studentNeedsHelp > 0) {
                      status = "NEED HELP";
                    } else if (studentInProgress > 0) {
                      status = "IN PROGRESS";
                    } else if (overall >= 100) {
                      status = "COMPLETED";
                    }

                    return (
                      <div
                        key={
                          student?._id ||
                          student?.student?._id ||
                          student?.student?.id ||
                          index
                        }
                        className="fade-up grid grid-cols-1 items-center gap-4 rounded-2xl border border-slate-200 border-l-[5px] border-l-[#00A8CC] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[1.5fr_1fr_1fr_1fr_120px]"
                        style={{
                          animationDelay: `${350 + index * 50}ms`,
                        }}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9] text-xs font-bold text-[#00A8CC]">
                            {initials || "ST"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#0F172A]">
                              {studentName}
                            </p>

                            <p className="truncate text-[11px] text-[#8FA3B0]">
                              {email || "No email"}
                            </p>
                          </div>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 md:hidden">
                            CP Progress
                          </span>

                          <div className="w-full max-w-35">
                            <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-500">
                                {cpCompleted}/{cpTotal}
                              </span>

                              <span className="text-[#00A8CC]">
                                {cpCompletion}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#00A8CC] transition-all duration-700"
                                style={{
                                  width: `${cpCompletion}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 md:hidden">
                            Dev Progress
                          </span>

                          <div className="w-full max-w-35">
                            <div className="mb-1 flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-500">
                                {devCompleted}/{devTotal}
                              </span>

                              <span className="text-purple-600">
                                {devCompletion}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-purple-600 transition-all duration-700"
                                style={{
                                  width: `${devCompletion}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400 md:hidden">
                            Overall
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="min-w-8 text-xs font-bold text-[#14222B]">
                              {overall}%
                            </span>

                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  overall >= 80
                                    ? "bg-emerald-500"
                                    : overall >= 50
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                }`}
                                style={{
                                  width: `${overall}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="mb-1 block text-left text-[10px] font-bold uppercase text-slate-400 md:hidden">
                            Status
                          </span>

                          {status === "COMPLETED" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              COMPLETED
                            </span>
                          )}

                          {status === "NEED HELP" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              NEED HELP
                            </span>
                          )}

                          {status === "IN PROGRESS" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              IN PROGRESS
                            </span>
                          )}

                          {status === "NOT STARTED" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              NOT STARTED
                            </span>
                          )}
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
    </>
  );
};

export default MentorProgress;
