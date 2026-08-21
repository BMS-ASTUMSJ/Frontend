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

  const getStudentGender = (student) => {
    return student?.student?.gender || student?.gender || "";
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
        <div className="mx-auto max-w-7xl space-y-6">
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
        {/* ======================================================
            HEADER
        ====================================================== */}

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

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle size={18} />

            {error}
          </div>
        )}

        {/* ======================================================
            STAT CARDS
        ====================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* COMPLETED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
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

        {/* ======================================================
            OVERALL SUMMARY
        ====================================================== */}

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

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${overallPercentage}%`,
              }}
            />
          </div>

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

        {/* ======================================================
            STUDENTS
        ====================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assigned Students Progress
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Only students assigned to you are displayed.
            </p>
          </div>

          {progress.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <TrendingUp size={40} className="text-gray-400" />

              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                No student progress
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No progress data is available for your assigned students yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((student, index) => {
                const studentName = getStudentName(student);

                const email = getStudentEmail(student);

                const gender = getStudentGender(student);

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

                return (
                  <div
                    key={
                      student?._id ||
                      student?.student?._id ||
                      student?.student?.id ||
                      index
                    }
                    className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                  >
                    {/* STUDENT HEADER */}

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {studentName}
                        </h3>

                        {email && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {email}
                          </p>
                        )}

                        {gender && (
                          <p className="mt-1 text-xs text-gray-400">{gender}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                          {overall}%
                        </span>

                        {overall >= 100 ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
                            Completed
                          </span>
                        ) : status === "need_help" ||
                          status === "needs_help" ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
                            Need Help
                          </span>
                        ) : overall > 0 ? (
                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
                            In Progress
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            Not Started
                          </span>
                        )}
                      </div>
                    </div>

                    {/* OVERALL BAR */}

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Overall Progress
                        </span>

                        <span className="font-semibold text-gray-900 dark:text-white">
                          {overall}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${overall}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* CP + DEV */}

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* CP */}

                      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code2 size={18} className="text-blue-600" />

                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              CP Track
                            </span>
                          </div>

                          <span className="text-sm font-bold text-blue-600">
                            {cpCompletion}%
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950/60">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${cpCompletion}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {cpCompleted} / {cpTotal} questions solved
                        </p>
                      </div>

                      {/* DEV */}

                      <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-950/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor size={18} className="text-purple-600" />

                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              Dev Track
                            </span>
                          </div>

                          <span className="text-sm font-bold text-purple-600">
                            {devCompletion}%
                          </span>
                        </div>

                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950/60">
                          <div
                            className="h-full rounded-full bg-purple-600 transition-all"
                            style={{
                              width: `${devCompletion}%`,
                            }}
                          />
                        </div>

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {devCompleted} / {devTotal} videos completed
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProgress;
