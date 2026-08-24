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

        // ========================================================
        // MENTOR PROFILE
        // ========================================================

        let mentor = null;

        if (profileRes.status === "fulfilled") {
          mentor = profileRes.value.data?.user || null;

          setMentorProfile(mentor);
        }

        // ========================================================
        // FIND ASSIGNED TEAM
        // ========================================================

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

            // ====================================================
            // FIND CO-MENTOR
            // ====================================================

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

        // ========================================================
        // PROGRESS DATA
        // ========================================================

        if (progressRes.status === "fulfilled") {
          const responseData = progressRes.value.data || {};

          const progressData =
            responseData.data ||
            responseData.progress ||
            responseData.students ||
            responseData;

          const progressArray = Array.isArray(progressData) ? progressData : [];

          // ======================================================
          // NORMALIZE PROGRESS
          // ======================================================

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

              // IMPORTANT:
              // Always calculate the percentage from completed / total.
              // Do NOT trust item.completion from the backend.

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

          // ======================================================
          // TEAM STUDENTS
          // ======================================================

          const teamStudents = Array.isArray(myTeam?.students)
            ? myTeam.students
            : [];

          if (teamStudents.length > 0) {
            const assignedStudentIds = new Set(
              teamStudents
                .map((student) => getStudentId(student))
                .filter(Boolean),
            );

            // ====================================================
            // ONLY KEEP STUDENTS FROM THIS TEAM
            // ====================================================

            const filteredProgress = normalizedProgress.filter((item) => {
              const studentId = getStudentId(item.student);

              return studentId && assignedStudentIds.has(studentId);
            });

            // ====================================================
            // CREATE PROGRESS FOR EVERY TEAM STUDENT
            // ====================================================

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

                // Student exists in team but has no progress yet.

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
            // ====================================================
            // FALLBACK
            // ====================================================

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
  //
  // completed tasks / total tasks
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
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-7 w-7 animate-spin" />

          <span className="text-base font-semibold">
            Loading assigned team progress...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="min-h-screen space-y-8 bg-[#F6FAFD] p-6 sm:p-8">
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#1A3D63]/10 px-3 py-0.5 text-xs font-bold text-[#1A3D63]">
              {mentorProfile?.gender === "Female"
                ? "👩 Female Mentor Portal"
                : "👨 Male Mentor Portal"}
            </span>

            <span className="text-xs text-[#7A7F85]">
              • Assigned Students Only
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-bold text-[#0A1931] sm:text-3xl">
            Welcome back, {mentorProfile?.firstName || "Mentor"}!
          </h1>

          <p className="text-sm text-[#7A7F85]">
            Track your assigned {mentorProfile?.gender?.toLowerCase()} students'
            weekly learning milestones and ranking.
          </p>
        </div>

        {/* Mentor Avatar */}

        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 pr-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#1A3D63] to-[#4A7FA7] text-sm font-bold text-white shadow">
            {mentorProfile?.firstName?.[0]}
            {mentorProfile?.lastName?.[0]}
          </div>

          <div className="text-xs">
            <p className="font-bold text-[#0A1931]">
              {mentorProfile?.firstName} {mentorProfile?.lastName}
            </p>

            <p className="font-semibold text-[#4A7FA7]">
              {mentorProfile?.role?.toUpperCase()} • {mentorProfile?.gender}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* ========================================================
          STATS
      ======================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Assigned Students */}

        <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
              Assigned Students
            </span>

            <h3 className="mt-1 text-3xl font-bold text-[#0A1931]">
              {totalStudents}
            </h3>

            <p className="mt-1 text-[11px] font-semibold text-blue-600">
              {mentorProfile?.gender === "Female"
                ? "100% Female Group"
                : mentorProfile?.gender === "Male"
                  ? "100% Male Group"
                  : "Assigned Group"}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1A3D63]">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Assigned Team */}

        <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
              Assigned Team
            </span>

            <h3 className="mt-1 max-w-37.5 truncate text-xl font-bold text-[#0A1931]">
              {assignedTeam?.name || "Team Assigned"}
            </h3>

            <p className="mt-1 text-[11px] text-[#7A7F85]">
              {assignedTeam?.batch?.name ||
                assignedTeam?.batch?.batchName ||
                "Active Batch"}
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6FAFD] text-[#4A7FA7]">
            <Shield className="h-6 w-6" />
          </div>
        </div>

        {/* Co-Mentor */}

        <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
              Assigned Co-Mentor
            </span>

            <h3 className="mt-1 max-w-37.5 truncate text-lg font-bold text-[#0A1931]">
              {coMentor
                ? `${coMentor.firstName || ""} ${
                    coMentor.lastName || ""
                  }`.trim()
                : "2nd Mentor Pair"}
            </h3>

            <p className="mt-1 text-[11px] font-semibold text-green-600">
              Active Co-Pilot
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Average Performance */}

        <div className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
              Team Avg Completion
            </span>

            <h3 className="mt-1 text-3xl font-bold text-[#1A3D63]">
              {avgCompletion}%
            </h3>

            <p className="mt-1 text-[11px] font-semibold text-green-600">
              {totalTasksSolved} tasks completed
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ========================================================
          MIDDLE SECTION
      ======================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Progress Overview */}

        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                Assigned Team Progress Overview
              </h2>

              <p className="mt-0.5 text-xs text-[#7A7F85]">
                Real-time metrics for your assigned{" "}
                {mentorProfile?.gender?.toLowerCase()} students.
              </p>
            </div>

            <span className="rounded-full bg-[#1A3D63]/10 px-3 py-1 text-xs font-bold text-[#1A3D63]">
              Live Stats
            </span>
          </div>

          <div className="grid gap-6 pt-2 sm:grid-cols-2">
            {/* CP */}

            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#F6FAFD]/60 p-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#1A3D63]">
                    <Code2 className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-bold text-[#0A1931]">
                    CP Problems
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-[#7A7F85]">Problems Solved</p>

                  <p className="text-xl font-bold text-[#0A1931]">
                    {totalTasksSolved}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      / {totalTasksExpected}
                    </span>
                  </p>
                </div>
              </div>

              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  <path
                    className="text-[#1A3D63]"
                    strokeDasharray={`${avgCompletion}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-base font-bold text-[#0A1931]">
                    {avgCompletion}%
                  </span>

                  <span className="block text-[9px] text-[#7A7F85]">
                    Avg. Done
                  </span>
                </div>
              </div>
            </div>

            {/* Development */}

            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-[#F6FAFD]/60 p-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                    <Monitor className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-bold text-[#0A1931]">
                    Dev Lectures
                  </span>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-[#7A7F85]">Current Progress</p>

                  <p className="text-xl font-bold text-[#0A1931]">
                    {avgCompletion}%
                  </p>
                </div>
              </div>

              <div className="relative flex h-24 w-24 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  <path
                    className="text-[#4A7FA7]"
                    strokeDasharray={`${avgCompletion}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-base font-bold text-[#0A1931]">
                    {avgCompletion}%
                  </span>

                  <span className="block text-[9px] text-[#7A7F85]">
                    Progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================
            TOP PERFORMERS
        ====================================================== */}

        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#0A1931]">
              Top Performers
            </h3>

            <span className="text-xs font-bold text-[#4A7FA7]">Rankings</span>
          </div>

          {rankedStudents.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#7A7F85]">
              No assigned students yet.
            </p>
          ) : (
            <div className="space-y-3">
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
                    className="flex items-center justify-between rounded-xl bg-[#F6FAFD] p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A3D63] text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>

                      <div>
                        <p className="font-bold text-[#0A1931]">
                          {studentName}
                        </p>

                        <p className="text-[11px] text-[#7A7F85]">
                          {item?.completed || 0}/{item?.total || 0} tasks
                        </p>
                      </div>
                    </div>

                    <span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-[#1A3D63]">
                      {item?.completion || 0}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          DETAILED PROGRESS
      ======================================================== */}

      <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0A1931]">
              My Assigned Students Progress
            </h2>

            <p className="mt-0.5 text-xs text-[#7A7F85]">
              Only students assigned to your team.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-4 text-xs outline-none focus:border-[#4A7FA7]"
            />
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7A7F85]">
            No assigned students match your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 bg-[#F6FAFD] text-[11px] font-bold uppercase text-[#7A7F85]">
                <tr>
                  <th className="px-6 py-4">Student</th>

                  <th className="px-6 py-4">Gender</th>

                  <th className="px-6 py-4">Completed / Total</th>

                  <th className="px-6 py-4">Completion Bar</th>

                  <th className="px-6 py-4">Team Rank</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((item, index) => {
                  const student = item?.student || {};

                  // Recalculate here as well so the displayed
                  // percentage can never depend on stale data.

                  const completed = Math.max(Number(item?.completed) || 0, 0);

                  const total = Math.max(Number(item?.total) || 0, 0);

                  const safeCompleted = Math.min(completed, total);

                  const completion = calculateCompletion(safeCompleted, total);

                  const studentName =
                    student.name ||
                    `${student.firstName || ""} ${
                      student.lastName || ""
                    }`.trim() ||
                    "Unknown Student";

                  return (
                    <tr
                      key={getStudentId(student) || index}
                      className="transition hover:bg-gray-50/60"
                    >
                      {/* Student */}

                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0A1931]">
                          {studentName}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {student.email || "No email"}
                        </p>
                      </td>

                      {/* Gender */}

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                            student.gender === "Female"
                              ? "border-pink-200 bg-pink-50 text-pink-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }`}
                        >
                          {student.gender === "Female"
                            ? "👩 Female"
                            : "👨 Male"}
                        </span>
                      </td>

                      {/* Completed / Total */}

                      <td className="px-6 py-4 font-bold text-[#0A1931]">
                        {safeCompleted} / {total} tasks
                      </td>

                      {/* Completion */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#1A3D63] transition-all duration-500"
                              style={{
                                width: `${completion}%`,
                              }}
                            />
                          </div>

                          <span className="font-bold text-[#0A1931]">
                            {completion}%
                          </span>
                        </div>
                      </td>

                      {/* Rank */}

                      <td className="px-6 py-4 font-bold text-[#1A3D63]">
                        #{item?.rank || index + 1}
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
  );
}

export default MentorDashboard;
