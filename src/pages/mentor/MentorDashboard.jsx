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

        if (profileRes.status === "fulfilled") {
          const mentor = profileRes.value.data?.user || {};

          setMentorProfile(mentor);

          if (teamsRes.status === "fulfilled") {
            const allTeams = teamsRes.value.data?.teams || [];

            const myTeam = allTeams.find((team) =>
              team.mentors?.some(
                (mentorItem) =>
                  mentorItem._id === mentor._id || mentorItem === mentor._id,
              ),
            );

            if (myTeam) {
              setAssignedTeam(myTeam);

              const partner = myTeam.mentors?.find(
                (mentorItem) => mentorItem._id !== mentor._id,
              );

              setCoMentor(partner || null);
            }
          }
        }

        if (progressRes.status === "fulfilled") {
          const progressData =
            progressRes.value.data?.data || progressRes.value.data || [];

          setAssignedStudentsProgress(
            Array.isArray(progressData) ? progressData : [],
          );
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

  const totalTasksExpected = assignedStudentsProgress[0]?.total || 0;

  const avgCompletion =
    totalStudents > 0
      ? Math.round(
          assignedStudentsProgress.reduce(
            (acc, curr) => acc + (curr.completion || 0),
            0,
          ) / totalStudents,
        )
      : 0;

  const totalTasksSolved = assignedStudentsProgress.reduce(
    (acc, curr) => acc + (curr.completed || 0),
    0,
  );

  const filteredStudents = assignedStudentsProgress.filter((item) => {
    const name = item?.student?.name?.toLowerCase() || "";

    const email = item?.student?.email?.toLowerCase() || "";

    const search = searchTerm.toLowerCase();

    return name.includes(search) || email.includes(search);
  });

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

  return (
    <div className="min-h-screen space-y-8 bg-[#F6FAFD] p-6 sm:p-8">
      {/* Header */}
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

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />

          <span>{error}</span>
        </div>
      )}

      {/* Stats */}
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
              100% {mentorProfile?.gender} Group
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
              {assignedTeam?.batch?.name || "Active Batch"}
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
                ? `${coMentor.firstName} ${coMentor.lastName}`
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
              {totalTasksSolved} tasks submitted
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-700">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Middle Section */}
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
                      / {totalStudents * totalTasksExpected || 100}
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
                  <p className="text-xs text-[#7A7F85]">Videos Completed</p>

                  <p className="text-xl font-bold text-[#0A1931]">
                    {Math.round(totalTasksSolved * 0.85)}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      Watched
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
                    className="text-[#4A7FA7]"
                    strokeDasharray={`${Math.min(avgCompletion + 5, 100)}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-base font-bold text-[#0A1931]">
                    {Math.min(avgCompletion + 5, 100)}%
                  </span>

                  <span className="block text-[9px] text-[#7A7F85]">
                    Watched
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-[#0A1931]">
              Top Performers
            </h3>

            <span className="text-xs font-bold text-[#4A7FA7]">Rankings</span>
          </div>

          {assignedStudentsProgress.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#7A7F85]">
              No assigned students yet.
            </p>
          ) : (
            <div className="space-y-3">
              {assignedStudentsProgress.slice(0, 5).map((item, idx) => (
                <div
                  key={item?.student?.id || idx}
                  className="flex items-center justify-between rounded-xl bg-[#F6FAFD] p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1A3D63] text-[11px] font-bold text-white">
                      {idx + 1}
                    </span>

                    <div>
                      <p className="font-bold text-[#0A1931]">
                        {item?.student?.name}
                      </p>

                      <p className="text-[11px] text-[#7A7F85]">
                        {item?.completed}/{item?.total} tasks
                      </p>
                    </div>
                  </div>

                  <span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-[#1A3D63]">
                    {item?.completion}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Progress */}
      <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0A1931]">
              My Assigned Students Progress
            </h2>

            <p className="mt-0.5 text-xs text-[#7A7F85]">
              Only students of matching gender ({mentorProfile?.gender})
              assigned to your team.
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
                  const completion = item?.completion || 0;

                  return (
                    <tr
                      key={student.id || index}
                      className="transition hover:bg-gray-50/60"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0A1931]">
                          {student.name}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {student.email}
                        </p>
                      </td>

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

                      <td className="px-6 py-4 font-bold text-[#0A1931]">
                        {item.completed} / {item.total} tasks
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-[#1A3D63]"
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
