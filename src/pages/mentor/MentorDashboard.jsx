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
} from "lucide-react";

function MentorDashboard() {
  const [mentorProfile, setMentorProfile] = useState(null);
  const [assignedStudentsProgress, setAssignedStudentsProgress] = useState([]);
  const [assignedTeam, setAssignedTeam] = useState(null);
  const [coMentor, setCoMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ============================================================
  // HELPERS
  // ============================================================

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

  // ============================================================
  // CALCULATE STUDENT COMPLETION
  // ============================================================

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

  // ============================================================
  // LOAD MENTOR DATA
  // ============================================================

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

        // ======================================================
        // MENTOR PROFILE
        // ======================================================

        let mentor = null;

        if (profileRes.status === "fulfilled") {
          mentor = profileRes.value.data?.user || null;

          setMentorProfile(mentor);
        }

        // ======================================================
        // FIND ASSIGNED TEAM
        // ======================================================

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

            // ==================================================
            // FIND CO-MENTOR
            // ==================================================

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

        // ======================================================
        // PROGRESS DATA
        // ======================================================

        if (progressRes.status === "fulfilled") {
          const responseData = progressRes.value.data || {};

          const progressData =
            responseData.data ||
            responseData.progress ||
            responseData.students ||
            responseData;

          const progressArray = Array.isArray(progressData) ? progressData : [];

          // ====================================================
          // NORMALIZE PROGRESS
          // ====================================================

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

              // Always calculate percentage
              // from completed / total.

              const completed = Math.max(Number(item?.completed) || 0, 0);

              const total = Math.max(Number(item?.total) || 0, 0);

              const safeCompleted = Math.min(completed, total);

              const completion = calculateCompletion(safeCompleted, total);

              return {
                ...item,

                student: {
                  ...student,
                  _id: studentId,
                  id: studentId,
                },

                completed: safeCompleted,
                total,
                completion,
              };
            })
            .filter(Boolean);

          // ====================================================
          // TEAM STUDENTS
          // ====================================================

          const teamStudents = Array.isArray(myTeam?.students)
            ? myTeam.students
            : [];

          if (teamStudents.length > 0) {
            const assignedStudentIds = new Set(
              teamStudents
                .map((student) => getStudentId(student))
                .filter(Boolean),
            );

            // ==================================================
            // ONLY KEEP STUDENTS FROM THIS TEAM
            // ==================================================

            const filteredProgress = normalizedProgress.filter((item) => {
              const studentId = getStudentId(item.student);

              return studentId && assignedStudentIds.has(studentId);
            });

            // ==================================================
            // CREATE PROGRESS FOR EVERY TEAM STUDENT
            // ==================================================

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

  // ============================================================
  // TOTAL STUDENTS
  // ============================================================

  const totalStudents = assignedStudentsProgress.length;

  // ============================================================
  // TOTAL TASKS EXPECTED
  // ============================================================

  const totalTasksExpected = assignedStudentsProgress.reduce(
    (acc, student) => acc + Math.max(Number(student?.total) || 0, 0),
    0,
  );

  // ============================================================
  // TOTAL COMPLETED TASKS
  // ============================================================

  const totalTasksSolved = assignedStudentsProgress.reduce(
    (acc, student) =>
      acc +
      Math.min(
        Math.max(Number(student?.completed) || 0, 0),
        Math.max(Number(student?.total) || 0, 0),
      ),
    0,
  );

  // ============================================================
  // TEAM COMPLETION
  // ============================================================

  const avgCompletion =
    totalTasksExpected > 0
      ? Math.min(Math.round((totalTasksSolved / totalTasksExpected) * 100), 100)
      : 0;

  // ============================================================
  // SORT STUDENTS BY PERFORMANCE
  // ============================================================

  const rankedStudents = [...assignedStudentsProgress]
    .map((item) => {
      const completed = Math.max(Number(item?.completed) || 0, 0);

      const total = Math.max(Number(item?.total) || 0, 0);

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

  // ============================================================
  // SEARCH
  // ============================================================

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

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center bg-[#F6FAFD]">
        <div className="flex items-center gap-3 text-[#123B46]">
          <Loader2 className="h-7 w-7 animate-spin" />

          <span className="text-sm font-bold">Loading mentor dashboard...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* ======================================================
            DASHBOARD HEADER
        ====================================================== */}

        <div className="flex min-h-[96px] items-center rounded-2xl bg-[#123B46] px-5 py-5 shadow-md sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0A7187] text-white shadow-inner">
              <Users className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                Mentor Dashboard
              </h1>

              <p className="mt-1 text-xs font-medium text-white/65">
                Manage your assigned team and track student progress.
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            WELCOME CARD
        ====================================================== */}

        <div className="rounded-2xl border border-[#D8D8D8] bg-white px-5 py-5 shadow-sm sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-[#DDF7FA] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#178AA0]">
                Mentor Portal
              </span>

              <h2 className="mt-2 text-xl font-extrabold text-[#102F38] sm:text-2xl">
                Welcome back, {mentorProfile?.firstName || "Mentor"}
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Track your assigned students, team progress, and performance.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-xl bg-[#123B46] px-4 py-3 text-white shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-sm font-extrabold">
                {mentorProfile?.firstName?.[0] || "M"}
                {mentorProfile?.lastName?.[0] || ""}
              </div>

              <div>
                <p className="text-sm font-bold">
                  {mentorProfile?.firstName || "Mentor"}{" "}
                  {mentorProfile?.lastName || ""}
                </p>

                <p className="text-[10px] font-medium text-white/60">
                  {assignedTeam?.name || "Assigned Team"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            PERFORMANCE ALERT
        ====================================================== */}

        {error ? (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="font-bold">Dashboard Alert</p>

              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        ) : avgCompletion < 50 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-[#F4E7A9] bg-[#FFFBE8] px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF1C7] text-[#D99000]">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-extrabold text-[#855B00]">
                Performance Alert
              </p>

              <p className="mt-1 text-[11px] text-[#A36E18]">
                Your team's current completion requires attention.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-[#D8F0E3] bg-[#F4FFF8] px-5 py-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#DDF6E8] text-[#219653]">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-extrabold text-[#237A48]">
                Team Performance
              </p>

              <p className="mt-1 text-[11px] text-[#4C8C66]">
                Your assigned team is progressing well.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Assigned Students */}

          <div className="flex min-h-[104px] items-center justify-between rounded-2xl border border-[#D5D5D5] bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <p className="text-xs font-medium text-[#818181]">
                Assigned Students
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-[#172F37]">
                {totalStudents}
              </h3>

              <p className="mt-1 text-[10px] font-medium text-[#818181]">
                Students in your team
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAFBFD] text-[#0798B0]">
              <Users className="h-5 w-5" />
            </div>
          </div>

          {/* Assigned Team */}

          <div className="flex min-h-[104px] items-center justify-between rounded-2xl border border-[#D5D5D5] bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#818181]">
                Assigned Team
              </p>

              <h3 className="mt-1 truncate text-lg font-extrabold text-[#172F37]">
                {assignedTeam?.name || "Team Assigned"}
              </h3>

              <p className="mt-1 truncate text-[10px] font-medium text-[#818181]">
                {assignedTeam?.batch?.name ||
                  assignedTeam?.batch?.batchName ||
                  "Active Batch"}
              </p>
            </div>

            <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EAFBFD] text-[#0798B0]">
              <Shield className="h-5 w-5" />
            </div>
          </div>

          {/* Co-Mentor */}

          <div className="flex min-h-[104px] items-center justify-between rounded-2xl border border-[#D5D5D5] bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#818181]">Co-Mentor</p>

              <h3 className="mt-1 truncate text-lg font-extrabold text-[#172F37]">
                {coMentor
                  ? `${coMentor.firstName || ""} ${
                      coMentor.lastName || ""
                    }`.trim()
                  : "2nd Mentor Pair"}
              </h3>

              <p className="mt-1 text-[10px] font-semibold text-[#2AA66A]">
                Active Co-Mentor
              </p>
            </div>

            <div className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#7666C8]">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>

          {/* Team Completion */}

          <div className="flex min-h-[104px] items-center justify-between rounded-2xl border border-[#D5D5D5] bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div>
              <p className="text-xs font-medium text-[#818181]">
                Team Completion
              </p>

              <h3 className="mt-1 text-2xl font-extrabold text-[#172F37]">
                {avgCompletion}%
              </h3>

              <p className="mt-1 text-[10px] font-medium text-[#818181]">
                {totalTasksSolved} / {totalTasksExpected} tasks
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAFBFD] text-[#0798B0]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid gap-5 xl:grid-cols-3">
          {/* ====================================================
              TEAM PROGRESS
          ==================================================== */}

          <div className="rounded-2xl border border-[#D5D5D5] bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
            <div className="flex flex-col gap-2 border-b border-[#EEEEEE] pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-extrabold text-[#17353E]">
                  Team Progress Overview
                </h2>

                <p className="mt-1 text-xs text-[#858585]">
                  Monitor the learning progress of your assigned students.
                </p>
              </div>

              <span className="w-fit rounded-full bg-[#EAFBFD] px-3 py-1 text-[10px] font-bold text-[#16899F]">
                Live Statistics
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* CP Problems */}

              <div className="rounded-2xl border border-[#E7E7E7] bg-[#FBFDFE] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8F8FB] text-[#0798B0]">
                        <Code2 className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-extrabold text-[#17353E]">
                          CP Problems
                        </p>

                        <p className="text-[10px] text-[#8A8A8A]">
                          Problems solved
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-2xl font-extrabold text-[#17353E]">
                        {totalTasksSolved}

                        <span className="ml-1 text-xs font-medium text-[#999999]">
                          / {totalTasksExpected}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-[#E8E8E8]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      <path
                        className="text-[#0798B0]"
                        strokeDasharray={`${avgCompletion}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute text-center">
                      <span className="text-sm font-extrabold text-[#17353E]">
                        {avgCompletion}%
                      </span>

                      <span className="block text-[8px] text-[#8A8A8A]">
                        Done
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Development */}

              <div className="rounded-2xl border border-[#E7E7E7] bg-[#FBFDFE] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0EDFF] text-[#7666C8]">
                        <Monitor className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-extrabold text-[#17353E]">
                          Development
                        </p>

                        <p className="text-[10px] text-[#8A8A8A]">
                          Current team progress
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-2xl font-extrabold text-[#17353E]">
                        {avgCompletion}%
                      </p>
                    </div>
                  </div>

                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        className="text-[#E8E8E8]"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      <path
                        className="text-[#7666C8]"
                        strokeDasharray={`${avgCompletion}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute text-center">
                      <span className="text-sm font-extrabold text-[#17353E]">
                        {avgCompletion}%
                      </span>

                      <span className="block text-[8px] text-[#8A8A8A]">
                        Progress
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====================================================
              TOP PERFORMERS
          ==================================================== */}

          <div className="rounded-2xl border border-[#D5D5D5] bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-[#EEEEEE] pb-4">
              <div>
                <h2 className="text-base font-extrabold text-[#17353E]">
                  Top Performers
                </h2>

                <p className="mt-1 text-[10px] text-[#858585]">
                  Best performing students
                </p>
              </div>

              <span className="rounded-full bg-[#EAFBFD] px-3 py-1 text-[10px] font-bold text-[#16899F]">
                Rankings
              </span>
            </div>

            {rankedStudents.length === 0 ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <p className="text-xs text-[#858585]">
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
                      className="flex items-center justify-between rounded-xl border border-[#EEEEEE] bg-[#FBFDFE] px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                            idx === 0
                              ? "bg-[#123B46] text-white"
                              : "bg-[#EAFBFD] text-[#16899F]"
                          }`}
                        >
                          {idx + 1}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-[#17353E]">
                            {studentName}
                          </p>

                          <p className="text-[10px] text-[#858585]">
                            {item?.completed || 0}/{item?.total || 0} tasks
                          </p>
                        </div>
                      </div>

                      <span className="ml-2 shrink-0 rounded-lg bg-[#EAFBFD] px-2 py-1 text-[10px] font-extrabold text-[#16899F]">
                        {item?.completion || 0}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================
            ASSIGNED STUDENTS
        ====================================================== */}

        <div className="rounded-2xl border border-[#D5D5D5] bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#EEEEEE] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-base font-extrabold text-[#17353E]">
                My Assigned Students
              </h2>

              <p className="mt-1 text-xs text-[#858585]">
                Only students assigned to your team are displayed.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />

              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#DDDDDD] bg-[#FBFBFB] pl-9 pr-4 text-xs text-[#333333] outline-none transition focus:border-[#0798B0] focus:bg-white focus:ring-2 focus:ring-[#0798B0]/10"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAFBFD] text-[#0798B0]">
                <Users className="h-5 w-5" />
              </div>

              <p className="mt-3 text-xs font-semibold text-[#858585]">
                No assigned students match your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="border-b border-[#EEEEEE] bg-[#F7FAFB]">
                  <tr className="text-[10px] font-extrabold uppercase tracking-wide text-[#858585]">
                    <th className="px-5 py-4 sm:px-6">Student</th>

                    <th className="px-5 py-4">Gender</th>

                    <th className="px-5 py-4">Completed / Total</th>

                    <th className="px-5 py-4">Progress</th>

                    <th className="px-5 py-4">Rank</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEEEEE]">
                  {filteredStudents.map((item, index) => {
                    const student = item?.student || {};

                    const completed = Math.max(Number(item?.completed) || 0, 0);

                    const total = Math.max(Number(item?.total) || 0, 0);

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
                        className="transition hover:bg-[#FAFCFD]"
                      >
                        {/* Student */}

                        <td className="px-5 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAFBFD] text-xs font-extrabold text-[#16899F]">
                              {student.firstName?.[0] ||
                                student.name?.[0] ||
                                "S"}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-extrabold text-[#17353E]">
                                {studentName}
                              </p>

                              <p className="truncate text-[10px] text-[#999999]">
                                {student.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Gender */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                              student.gender === "Female"
                                ? "border-pink-200 bg-pink-50 text-pink-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {student.gender === "Female" ? "Female" : "Male"}
                          </span>
                        </td>

                        {/* Completed */}

                        <td className="px-5 py-4 font-bold text-[#17353E]">
                          {safeCompleted} / {total}
                          <span className="ml-1 font-normal text-[#999999]">
                            tasks
                          </span>
                        </td>

                        {/* Progress */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-28 overflow-hidden rounded-full bg-[#EAEAEA]">
                              <div
                                className="h-full rounded-full bg-[#0798B0] transition-all duration-500"
                                style={{
                                  width: `${completion}%`,
                                }}
                              />
                            </div>

                            <span className="font-extrabold text-[#17353E]">
                              {completion}%
                            </span>
                          </div>
                        </td>

                        {/* Rank */}

                        <td className="px-5 py-4">
                          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-[#EAFBFD] px-2 font-extrabold text-[#16899F]">
                            #{item?.rank || index + 1}
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
