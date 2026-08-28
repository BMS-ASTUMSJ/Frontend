import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  Users,
  Shield,
  Code2,
  Monitor,
  UserCheck,
  TrendingUp,
  Search,
  AlertCircle,
  Loader2,
  Award,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";

function MentorDashboard() {
  const [mentorProfile, setMentorProfile] = useState(null);
  const [assignedStudentsProgress, setAssignedStudentsProgress] = useState([]);
  const [assignedTeam, setAssignedTeam] = useState(null);
  const [coMentor, setCoMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      return value;
    }

    if (value._id) {
      return String(value._id);
    }

    if (value.id) {
      return String(value.id);
    }

    return null;
  };

  const getStudentId = (student) => {
    if (!student) return null;

    return getId(student._id) || getId(student.id) || getId(student.userId);
  };

  const calculateCompletion = (completed, total) => {
    const completedNumber = Math.max(Number(completed) || 0, 0);
    const totalNumber = Math.max(Number(total) || 0, 0);

    if (totalNumber <= 0) {
      return 0;
    }

    const safeCompleted = Math.min(completedNumber, totalNumber);

    return Math.min(
      Math.max(Math.round((safeCompleted / totalNumber) * 100), 0),
      100,
    );
  };

  useEffect(() => {
    let isMounted = true;

    async function loadMentorData() {
      try {
        setLoading(true);
        setError("");

        const [profileRes, progressRes, teamsRes] = await Promise.allSettled([
          api.get("/users/profile"),
          api.get("/progress/mentor/progress"),
          api.get("/teams"),
        ]);

        if (!isMounted) return;

        let mentor = null;

        if (profileRes.status === "fulfilled") {
          mentor = profileRes.value.data?.user || null;

          setMentorProfile(mentor);
        }

        let myTeam = null;

        if (mentor && teamsRes.status === "fulfilled") {
          const teamsData = teamsRes.value.data || {};

          const allTeams = Array.isArray(teamsData.teams)
            ? teamsData.teams
            : Array.isArray(teamsData.data)
              ? teamsData.data
              : Array.isArray(teamsData)
                ? teamsData
                : [];

          const mentorId = getId(mentor._id || mentor.id);

          myTeam = allTeams.find((team) => {
            if (!Array.isArray(team?.mentors)) {
              return false;
            }

            return team.mentors.some((mentorItem) => {
              const mentorItemId = getId(mentorItem);

              return mentorItemId === mentorId;
            });
          });

          if (myTeam) {
            setAssignedTeam(myTeam);

            const partner = Array.isArray(myTeam.mentors)
              ? myTeam.mentors.find((mentorItem) => {
                  return getId(mentorItem) !== mentorId;
                })
              : null;

            setCoMentor(partner || null);
          } else {
            setAssignedTeam(null);
            setCoMentor(null);
          }
        }

        if (progressRes.status === "fulfilled") {
          const responseData = progressRes.value.data || {};

          const progressData =
            responseData.data ||
            responseData.progress ||
            responseData.students ||
            responseData;

          const progressArray = Array.isArray(progressData) ? progressData : [];

          const normalizedProgress = progressArray
            .map((item) => {
              const student = item?.student || {};

              const studentId =
                getStudentId(student) ||
                getId(item?.studentId) ||
                getId(item?.userId);

              if (!studentId) {
                return null;
              }

              const cpCompleted = Math.max(Number(item?.cp?.completed) || 0, 0);
              const cpTotal = Math.max(Number(item?.cp?.total) || 0, 0);
              const cpSafeCompleted = Math.min(cpCompleted, cpTotal);

              const devCompleted = Math.max(
                Number(item?.dev?.completed) || 0,
                0,
              );
              const devTotal = Math.max(Number(item?.dev?.total) || 0, 0);
              const devSafeCompleted = Math.min(devCompleted, devTotal);

              const overallCompleted =
                item?.overall?.completed !== undefined
                  ? Math.max(Number(item?.overall?.completed) || 0, 0)
                  : Math.max(Number(item?.completed) || 0, 0);

              const overallTotal =
                item?.overall?.total !== undefined
                  ? Math.max(Number(item?.overall?.total) || 0, 0)
                  : Math.max(Number(item?.total) || 0, 0);

              const overallSafeCompleted = Math.min(
                overallCompleted,
                overallTotal,
              );

              return {
                ...item,

                student: {
                  ...student,
                  _id: studentId,
                  id: studentId,
                },

                cp: {
                  completed: cpSafeCompleted,
                  total: cpTotal,
                  completion: calculateCompletion(cpSafeCompleted, cpTotal),
                },

                dev: {
                  completed: devSafeCompleted,
                  total: devTotal,
                  completion: calculateCompletion(devSafeCompleted, devTotal),
                },

                overall: {
                  completed: overallSafeCompleted,
                  total: overallTotal,
                  completion: calculateCompletion(
                    overallSafeCompleted,
                    overallTotal,
                  ),
                },

                completed: overallSafeCompleted,
                total: overallTotal,
                completion: calculateCompletion(
                  overallSafeCompleted,
                  overallTotal,
                ),
              };
            })
            .filter(Boolean);

          const teamStudents = Array.isArray(myTeam?.students)
            ? myTeam.students
            : [];

          if (teamStudents.length > 0) {
            const assignedStudentIds = new Set(
              teamStudents
                .map((student) => getStudentId(student))
                .filter(Boolean),
            );

            const filteredProgress = normalizedProgress.filter((item) => {
              const studentId = getStudentId(item.student);

              return studentId && assignedStudentIds.has(studentId);
            });

            const mergedProgress = teamStudents
              .map((teamStudent) => {
                const studentId = getStudentId(teamStudent);

                if (!studentId) {
                  return null;
                }

                const existing = filteredProgress.find(
                  (item) => getStudentId(item.student) === studentId,
                );

                if (existing) {
                  return existing;
                }

                return {
                  student: {
                    ...teamStudent,
                    _id: studentId,
                    id: studentId,
                  },

                  cp: {
                    completed: 0,
                    total: 0,
                    completion: 0,
                  },

                  dev: {
                    completed: 0,
                    total: 0,
                    completion: 0,
                  },

                  overall: {
                    completed: 0,
                    total: 0,
                    completion: 0,
                  },

                  completed: 0,
                  total: 0,
                  completion: 0,
                  rank: null,
                };
              })
              .filter(Boolean);

            setAssignedStudentsProgress(mergedProgress);
          } else {
            setAssignedStudentsProgress(normalizedProgress);
          }
        }
      } catch (err) {
        console.error("Mentor dashboard load error:", err);

        if (isMounted) {
          setError(
            err.response?.data?.message ||
              "Failed to load assigned students' progress.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadMentorData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalStudents = assignedStudentsProgress.length;

  const cpCompleted = assignedStudentsProgress.reduce(
    (sum, s) => sum + (s.cp?.completed || 0),
    0,
  );

  const cpTotal = assignedStudentsProgress.reduce(
    (sum, s) => sum + (s.cp?.total || 0),
    0,
  );

  const cpCompletion = calculateCompletion(cpCompleted, cpTotal);

  const devCompleted = assignedStudentsProgress.reduce(
    (sum, s) => sum + (s.dev?.completed || 0),
    0,
  );

  const devTotal = assignedStudentsProgress.reduce(
    (sum, s) => sum + (s.dev?.total || 0),
    0,
  );

  const devCompletion = calculateCompletion(devCompleted, devTotal);

  const overallCompleted = assignedStudentsProgress.reduce(
    (sum, s) => sum + (s.overall?.completed || 0),
    0,
  );

  const overallTotal = assignedStudentsProgress.reduce(
    (sum, s) => sum + (s.overall?.total || 0),
    0,
  );

  const overallCompletion = calculateCompletion(overallCompleted, overallTotal);

  const rankedStudents = [...assignedStudentsProgress]
    .map((item) => {
      const completed = Math.max(
        Number(item?.overall?.completed ?? item?.completed) || 0,
        0,
      );

      const total = Math.max(
        Number(item?.overall?.total ?? item?.total) || 0,
        0,
      );

      const safeCompleted = Math.min(completed, total);

      return {
        ...item,
        completed: safeCompleted,
        total,
        completion: calculateCompletion(safeCompleted, total),
      };
    })
    .sort((a, b) => {
      const completionA = Number(a?.completion) || 0;
      const completionB = Number(b?.completion) || 0;

      if (completionB !== completionA) {
        return completionB - completionA;
      }

      return (Number(b?.completed) || 0) - (Number(a?.completed) || 0);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const filteredStudents = rankedStudents.filter((item) => {
    const name = item?.student?.name?.toLowerCase() || "";
    const email = item?.student?.email?.toLowerCase() || "";
    const firstName = item?.student?.firstName?.toLowerCase() || "";
    const lastName = item?.student?.lastName?.toLowerCase() || "";

    const search = searchTerm.toLowerCase().trim();

    return (
      name.includes(search) ||
      email.includes(search) ||
      firstName.includes(search) ||
      lastName.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF4F7]">
        <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-100/60 bg-white p-6 shadow-xl shadow-cyan-950/5">
          <Loader2 className="h-6 w-6 animate-spin text-[#00A8CC]" />

          <span className="text-sm font-semibold tracking-wide text-[#14222B]">
            Loading assigned team progress...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF4F7] p-4 font-sans antialiased text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="group relative overflow-hidden rounded-2xl border border-[#293E4C]/40 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-5 shadow-xl shadow-cyan-950/20 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00A8CC]/20 opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/30 transition-transform duration-300 group-hover:scale-105">
                <Shield size={23} strokeWidth={2.2} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A8CC]" />

                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                    Mentor Portal
                  </span>
                </div>

                <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Welcome back, {mentorProfile?.firstName || "Mentor"}!
                </h1>

                <p className="mt-0.5 text-xs text-slate-300">
                  Track your assigned students' progress and performance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-2.5 pr-4 shadow-lg backdrop-blur-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A8CC] text-sm font-bold text-white shadow-md shadow-[#00A8CC]/20">
                {mentorProfile?.firstName?.[0] || "M"}
                {mentorProfile?.lastName?.[0] || ""}
              </div>

              <div className="text-xs">
                <p className="font-bold text-white">
                  {mentorProfile?.firstName || "Mentor"}{" "}
                  {mentorProfile?.lastName || ""}
                </p>

                <p className="mt-0.5 font-semibold text-cyan-300">
                  {mentorProfile?.role?.toUpperCase() || "MENTOR"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 shadow-sm">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />

            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assigned Students
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {totalStudents}
                </h2>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Students in your team
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Assigned Team
                </p>

                <h2 className="mt-2 max-w-40 truncate text-xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {assignedTeam?.name || "Team Assigned"}
                </h2>

                <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                  {assignedTeam?.batch?.name ||
                    assignedTeam?.batch?.batchName ||
                    "Active Batch"}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <Shield size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Co-Mentor
                </p>

                <h2 className="mt-2 max-w-40 truncate text-lg font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {coMentor
                    ? `${coMentor.firstName || ""} ${
                        coMentor.lastName || ""
                      }`.trim()
                    : "2nd Mentor Pair"}
                </h2>

                <p className="mt-1 text-[11px] font-semibold text-emerald-500">
                  Active Co-Pilot
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <UserCheck size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Team Completion
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overallCompletion}%
                </h2>

                <p className="mt-1 text-[11px] font-semibold text-emerald-500">
                  {overallCompleted} tasks completed
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md sm:p-7 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-transform duration-300 group-hover:scale-105">
                  <BarChart3 size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Assigned Team Progress Overview
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[#8FA3B0]">
                    Real-time metrics for your assigned students.
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live Stats
              </span>
            </div>

            <div className="grid gap-5 pt-5 sm:grid-cols-2">
              <div className="group/cp relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[#F8FBFC] p-5 transition-all duration-300 hover:border-[#00A8CC]/30 hover:bg-white hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3F5F9] text-[#00A8CC]">
                        <Code2 size={16} />
                      </div>

                      <span className="text-sm font-bold text-[#0F172A]">
                        CP Problems
                      </span>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                      Problems Solved
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-[#0F172A]">
                      {cpCompleted}
                      <span className="text-xs font-normal text-slate-400">
                        {" "}
                        / {cpTotal}
                      </span>
                    </p>
                  </div>

                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      <path
                        className="text-[#00A8CC]"
                        strokeDasharray={`${cpCompletion}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute text-center">
                      <span className="text-sm font-extrabold text-[#0F172A]">
                        {cpCompletion}%
                      </span>

                      <span className="block text-[8px] font-medium text-slate-400">
                        AVG DONE
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#00A8CC] transition-all duration-700"
                    style={{
                      width: `${cpCompletion}%`,
                    }}
                  />
                </div>
              </div>

              <div className="group/dev relative overflow-hidden rounded-2xl border border-slate-200/80 bg-[#F8FBFC] p-5 transition-all duration-300 hover:border-[#00A8CC]/30 hover:bg-white hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3F5F9] text-[#00A8CC]">
                        <Monitor size={16} />
                      </div>

                      <span className="text-sm font-bold text-[#0F172A]">
                        Dev Lectures
                      </span>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                      Current Progress
                    </p>

                    <p className="mt-1 text-xl font-extrabold text-[#0F172A]">
                      {devCompleted}
                      <span className="text-xs font-normal text-slate-400">
                        {" "}
                        / {devTotal}
                      </span>
                    </p>
                  </div>

                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-slate-200"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      <path
                        className="text-[#00A8CC]"
                        strokeDasharray={`${devCompletion}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute text-center">
                      <span className="text-sm font-extrabold text-[#0F172A]">
                        {devCompletion}%
                      </span>

                      <span className="block text-[8px] font-medium text-slate-400">
                        PROGRESS
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-[#00A8CC] transition-all duration-700"
                    style={{
                      width: `${devCompletion}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                  <Award size={18} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    Top Performers
                  </h3>

                  <p className="text-[10px] text-[#8FA3B0]">
                    Best team rankings
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-[#00A8CC]">
                Rankings
              </span>
            </div>

            {rankedStudents.length === 0 ? (
              <div className="py-10 text-center">
                <Award className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-2 text-xs font-bold text-slate-500">
                  No assigned students yet.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5">
                {rankedStudents.slice(0, 5).map((item, idx) => {
                  const student = item?.student || {};

                  const studentName =
                    student.name ||
                    `${student.firstName || ""} ${
                      student.lastName || ""
                    }`.trim() ||
                    "Unknown Student";

                  return (
                    <div
                      key={getStudentId(student) || idx}
                      className="group/item flex items-center justify-between rounded-xl border border-transparent bg-[#F6FAFD] p-3 transition-all duration-300 hover:border-[#00A8CC]/20 hover:bg-white hover:shadow-sm"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${
                            idx === 0
                              ? "bg-[#00A8CC] text-white shadow-sm shadow-[#00A8CC]/30"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-[11px] font-bold text-[#0F172A] group-hover/item:text-[#00A8CC]">
                            {studentName}
                          </p>

                          <p className="text-[10px] text-[#8FA3B0]">
                            {item?.completed || 0}/{item?.total || 0} tasks
                          </p>
                        </div>
                      </div>

                      <span className="ml-2 shrink-0 rounded-lg bg-[#EAF7FA] px-2 py-1 text-[10px] font-extrabold text-[#00A8CC]">
                        {item?.completion || 0}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md sm:p-7">
          <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                <Users size={18} />
              </div>

              <div>
                <h2 className="text-base font-bold text-[#0F172A]">
                  My Assigned Students Progress
                </h2>

                <p className="mt-0.5 text-[11px] text-[#8FA3B0]">
                  Only students assigned to your team.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />

              <input
                type="text"
                placeholder="Search student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-[#F8FBFC] py-2.5 pl-9 pr-4 text-xs font-medium text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/10"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-2 text-xs font-bold text-slate-500">
                No assigned students match your search.
              </p>
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-[#F8FBFC] text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                  <tr>
                    <th className="rounded-l-xl px-5 py-4">Student</th>

                    <th className="px-5 py-4">Gender</th>

                    <th className="px-5 py-4">Completed / Total</th>

                    <th className="px-5 py-4">Completion</th>

                    <th className="rounded-r-xl px-5 py-4 text-right">
                      Team Rank
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((item, index) => {
                    const student = item?.student || {};

                    const completed = Number(
                      item?.overall?.completed ?? item?.completed ?? 0,
                    );

                    const total = Number(
                      item?.overall?.total ?? item?.total ?? 0,
                    );

                    const safeCompleted = Math.min(completed, total);

                    const completion = calculateCompletion(
                      safeCompleted,
                      total,
                    );

                    const studentName =
                      student.name ||
                      `${student.firstName || ""} ${
                        student.lastName || ""
                      }`.trim() ||
                      "Unknown Student";

                    return (
                      <tr
                        key={getStudentId(student) || index}
                        className="group/row transition-all duration-200 hover:bg-[#F8FBFC]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FA] text-[10px] font-black text-[#00A8CC] transition-all duration-200 group-hover/row:bg-[#00A8CC] group-hover/row:text-white">
                              {(
                                student.firstName?.[0] ||
                                student.name?.[0] ||
                                "S"
                              ).toUpperCase()}
                              {(student.lastName?.[0] || "").toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-bold text-[#0F172A] transition-colors group-hover/row:text-[#00A8CC]">
                                {studentName}
                              </p>

                              <p className="truncate text-[10px] text-slate-400">
                                {student.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              student.gender === "Female"
                                ? "border-pink-100 bg-pink-50 text-pink-600"
                                : "border-blue-100 bg-blue-50 text-blue-600"
                            }`}
                          >
                            {student.gender === "Female"
                              ? "👩 Female"
                              : "👨 Male"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-[#0F172A]">
                            {safeCompleted}
                          </span>

                          <span className="text-slate-400"> / {total}</span>

                          <p className="mt-0.5 text-[9px] uppercase tracking-wider text-slate-400">
                            tasks
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex min-w-40 items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-[#00A8CC] transition-all duration-700"
                                style={{
                                  width: `${completion}%`,
                                }}
                              />
                            </div>

                            <span className="w-9 text-right text-[10px] font-extrabold text-[#0F172A]">
                              {completion}%
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                              item?.rank === 1
                                ? "bg-[#EAF7FA] text-[#00A8CC]"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            #{item?.rank || index + 1}
                            {item?.rank === 1 && <ArrowUpRight size={11} />}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
