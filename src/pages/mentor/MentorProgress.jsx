import { useEffect, useState } from "react";
import {
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
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

      if (Array.isArray(data)) {
        setProgress(data);
      } else if (Array.isArray(data?.data)) {
        setProgress(data.data);
      } else if (Array.isArray(data?.students)) {
        setProgress(data.students);
      } else {
        setProgress([]);
      }
    } catch (err) {
      console.error("Failed to load mentor progress:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load mentor progress."
      );

      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (student) => {
    return (
      student?.status ||
      student?.progressStatus ||
      "not_started"
    );
  };

  const getPercentage = (student) => {
    const value =
      student?.progressPercentage ??
      student?.percentage ??
      student?.progress;

    if (typeof value === "number") {
      return Math.min(Math.max(value, 0), 100);
    }

    if (getStatus(student) === "done") {
      return 100;
    }

    return 0;
  };

  const completed = progress.filter(
    (student) => getStatus(student) === "done"
  ).length;

  const inProgress = progress.filter(
    (student) => getStatus(student) === "in_progress"
  ).length;

  const needHelp = progress.filter(
    (student) => getStatus(student) === "need_help"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl animate-pulse space-y-6">
          <div className="h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-800" />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
            <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
          </div>

          <div className="h-96 rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div>
          <div className="flex items-center gap-3">
            <BarChart3
              size={30}
              className="text-blue-600"
            />

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
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* COMPLETED */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </p>

              <CheckCircle
                size={24}
                className="text-green-600"
              />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {completed}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Completed learning items
            </p>
          </div>

          {/* IN PROGRESS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                In Progress
              </p>

              <Clock
                size={24}
                className="text-yellow-600"
              />
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

              <AlertCircle
                size={24}
                className="text-red-600"
              />
            </div>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">
              {needHelp}
            </h2>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Students needing assistance
            </p>
          </div>
        </div>

        {/* STUDENTS */}
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

              <TrendingUp
                size={40}
                className="text-gray-400"
              />

              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                No student progress
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No progress data is available for your students yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {progress.map((student, index) => {
                const percentage =
                  getPercentage(student);

                const status =
                  getStatus(student);

                const studentName =
                  student?.student?.name ||
                  student?.student?.fullName ||
                  student?.name ||
                  student?.fullName ||
                  "Student";

                const email =
                  student?.student?.email ||
                  student?.email ||
                  "";

                return (
                  <div
                    key={
                      student?._id ||
                      student?.student?._id ||
                      index
                    }
                    className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div className="min-w-0 flex-1">

                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {studentName}
                        </h3>

                        {email && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {email}
                          </p>
                        )}

                        <div className="mt-4">

                          <div className="mb-2 flex justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              Progress
                            </span>

                            <span className="font-semibold text-gray-900 dark:text-white">
                              {percentage}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                          status === "done"
                            ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                            : status === "in_progress"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400"
                            : status === "need_help"
                            ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {status === "done"
                          ? "Completed"
                          : status === "in_progress"
                          ? "In Progress"
                          : status === "need_help"
                          ? "Need Help"
                          : "Not Started"}
                      </span>

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