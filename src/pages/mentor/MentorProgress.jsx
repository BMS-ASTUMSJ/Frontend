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
} from "lucide-react";

import api from "../../utils/api";

const MentorProgress = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD MENTOR PROGRESS
  // ============================================================

  useEffect(() => {
    loadMentorProgress();
  }, []);

  const loadMentorProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/progress/mentor/progress");

      console.log("MENTOR PROGRESS RESPONSE:", response.data);

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
      console.error("Failed to load mentor progress:", err);

      setError(
        err?.response?.data?.message || "Failed to load mentor progress.",
      );

      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getCpCompleted = (student) => {
    return Number(student?.cp?.completed ?? student?.completed ?? 0);
  };

  const getCpTotal = (student) => {
    return Number(student?.cp?.total ?? student?.total ?? 0);
  };

  const getCpCompletion = (student) => {
    const completion = student?.cp?.completion ?? student?.completion;

    if (completion !== undefined && completion !== null) {
      return Math.min(Math.max(Number(completion), 0), 100);
    }

    const completed = getCpCompleted(student);
    const total = getCpTotal(student);

    if (total > 0) {
      return Math.min(Math.round((completed / total) * 100), 100);
    }

    return 0;
  };

  const getDevCompleted = (student) => {
    return Number(student?.dev?.completed ?? 0);
  };

  const getDevTotal = (student) => {
    return Number(student?.dev?.total ?? 0);
  };

  const getDevCompletion = (student) => {
    const completion = student?.dev?.completion;

    if (completion !== undefined && completion !== null) {
      return Math.min(Math.max(Number(completion), 0), 100);
    }

    const completed = getDevCompleted(student);
    const total = getDevTotal(student);

    if (total > 0) {
      return Math.min(Math.round((completed / total) * 100), 100);
    }

    return 0;
  };

  const getOverallCompletion = (student) => {
    const cpCompletion = getCpCompletion(student);

    const devCompletion = getDevCompletion(student);

    const cpTotal = getCpTotal(student);

    const devTotal = getDevTotal(student);

    if (cpTotal > 0 && devTotal > 0) {
      return Math.round((cpCompletion + devCompletion) / 2);
    }

    if (cpTotal > 0) {
      return cpCompletion;
    }

    if (devTotal > 0) {
      return devCompletion;
    }

    return 0;
  };

  const getStudentName = (student) => {
    return (
      student?.student?.name ||
      student?.student?.fullName ||
      `${student?.student?.firstName || ""} ${
        student?.student?.lastName || ""
      }`.trim() ||
      student?.name ||
      student?.fullName ||
      `${student?.firstName || ""} ${student?.lastName || ""}`.trim() ||
      "Student"
    );
  };

  const getStudentEmail = (student) => {
    return student?.student?.email || student?.email || "";
  };

  // ============================================================
  // STATISTICS
  // ============================================================

  const completed = progress.filter(
    (student) => getOverallCompletion(student) >= 100,
  ).length;

  const inProgress = progress.filter((student) => {
    const percentage = getOverallCompletion(student);

    return percentage > 0 && percentage < 100;
  }).length;

  const needHelp = progress.filter((student) => {
    const status =
      student?.status || student?.progressStatus || student?.overallStatus;

    return status === "need_help" || status === "needs_help";
  }).length;

  // ============================================================
  // TOTALS
  // ============================================================

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

  const overallPercentage =
    totalCpExpected + totalDevExpected > 0
      ? Math.min(
          Math.round(
            ((totalCpCompleted + totalDevCompleted) /
              (totalCpExpected + totalDevExpected)) *
              100,
          ),
          100,
        )
      : 0;

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-32">
            <div className="flex items-center gap-3 text-blue-600">
              <Loader2 className="h-7 w-7 animate-spin" />

              <span className="font-semibold">Loading student progress...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}

        <div>
          <div className="flex items-center gap-3">
            <BarChart3 size={30} className="text-blue-600" />

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              Students Progress
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track the progress of your assigned students.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle size={18} />

            {error}
          </div>
        )}

        {/* STATISTICS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* COMPLETED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed
              </p>

              <CheckCircle size={24} className="text-green-600" />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {completed}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Students with 100% progress
            </p>
          </div>

          {/* IN PROGRESS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                In Progress
              </p>

              <Clock size={24} className="text-yellow-600" />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {inProgress}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Currently learning
            </p>
          </div>

          {/* NEED HELP */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Need Help
              </p>

              <AlertCircle size={24} className="text-red-600" />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {needHelp}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Students needing assistance
            </p>
          </div>
        </div>

        {/* OVERALL SUMMARY */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Overall Progress
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Combined CP and Dev progress of your assigned students.
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">
                {overallPercentage}%
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Overall completion
              </p>
            </div>
          </div>

          {/* PROGRESS BAR */}

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${overallPercentage}%`,
              }}
            />
          </div>

          {/* SUMMARY */}

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Code2 size={16} className="text-blue-600" />

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  CP Solved
                </span>
              </div>

              <p className="mt-1 font-bold text-gray-900 dark:text-white">
                {totalCpCompleted} / {totalCpExpected}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <Monitor size={16} className="text-purple-600" />

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Dev Done
                </span>
              </div>

              <p className="mt-1 font-bold text-gray-900 dark:text-white">
                {totalDevCompleted} / {totalDevExpected}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Students
              </span>

              <p className="mt-1 font-bold text-gray-900 dark:text-white">
                {progress.length}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Completed
              </span>

              <p className="mt-1 font-bold text-green-600">{completed}</p>
            </div>
          </div>
        </div>

        {/* ASSIGNED STUDENTS */}

        <div>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assigned Students Progress
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Only students assigned to you are displayed.
            </p>
          </div>

          {progress.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white text-center dark:border-gray-800 dark:bg-gray-900">
              <TrendingUp size={40} className="text-gray-400" />

              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                No student progress
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No progress data is available for your assigned students yet.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  {/* TABLE HEADER */}

                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/60">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Student
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-blue-600">
                        CP
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-purple-600">
                        Development
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                        Overall
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}

                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
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

                      const status =
                        student?.status ||
                        student?.progressStatus ||
                        student?.overallStatus;

                      const initials = studentName
                        .split(" ")
                        .filter(Boolean)
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase();

                      return (
                        <tr
                          key={
                            student?._id ||
                            student?.student?._id ||
                            student?.student?.id ||
                            index
                          }
                          className="transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        >
                          {/* STUDENT */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                                {initials}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {studentName}
                                </p>

                                {email && (
                                  <p className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500 dark:text-gray-400">
                                    {email}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* CP */}

                          <td className="px-5 py-5">
                            <div className="mx-auto w-32">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {cpCompleted}/{cpTotal}
                                </span>

                                <span className="text-xs font-bold text-blue-600">
                                  {cpCompletion}%
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950/50">
                                <div
                                  className="h-full rounded-full bg-blue-600 transition-all"
                                  style={{
                                    width: `${cpCompletion}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* DEVELOPMENT */}

                          <td className="px-5 py-5">
                            <div className="mx-auto w-32">
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {devCompleted}/{devTotal}
                                </span>

                                <span className="text-xs font-bold text-purple-600">
                                  {devCompletion}%
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950/50">
                                <div
                                  className="h-full rounded-full bg-purple-600 transition-all"
                                  style={{
                                    width: `${devCompletion}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* OVERALL */}

                          <td className="px-5 py-5 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {overall}%
                              </span>

                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    overall >= 80
                                      ? "bg-green-500"
                                      : overall >= 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{
                                    width: `${overall}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5 text-center">
                            {overall >= 100 ? (
                              <span className="inline-flex rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
                                Completed
                              </span>
                            ) : status === "need_help" ||
                              status === "needs_help" ? (
                              <span className="inline-flex rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                                Need Help
                              </span>
                            ) : overall > 0 ? (
                              <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
                                In Progress
                              </span>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                Not Started
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* FOOTER */}

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-800 dark:bg-gray-800/40">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  CP shows solved questions, Development shows completed videos,
                  and Overall combines both tracks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProgress;
