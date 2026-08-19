import {
  CheckCircle2,
  Clock3,
  HelpCircle,
  PlayCircle,
} from "lucide-react";

const StudentProgressTable = ({
  students = [],
  loading = false,
}) => {
  const getName = (student) => {
    if (student.name) {
      return student.name;
    }

    const firstName = student.firstName || "";
    const lastName = student.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Unknown Student";
  };

  const getStatus = (student) => {
    return student.status || student.progressStatus || "not_started";
  };

  const getStatusLabel = (status) => {
    if (status === "done" || status === "completed") {
      return "Completed";
    }

    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "need_help") {
      return "Need Help";
    }

    return "Not Started";
  };

  const getStatusIcon = (status) => {
    if (status === "done" || status === "completed") {
      return <CheckCircle2 size={16} />;
    }

    if (status === "in_progress") {
      return <PlayCircle size={16} />;
    }

    if (status === "need_help") {
      return <HelpCircle size={16} />;
    }

    return <Clock3 size={16} />;
  };

  const getStatusClass = (status) => {
    if (status === "done" || status === "completed") {
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    }

    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }

    if (status === "need_help") {
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    }

    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  };

  const getPercentage = (student) => {
    if (student.percentage !== undefined) {
      return student.percentage;
    }

    if (student.progress !== undefined) {
      return student.progress;
    }

    if (
      student.totalContent &&
      student.completedContent !== undefined
    ) {
      return Math.round(
        (student.completedContent / student.totalContent) * 100
      );
    }

    return 0;
  };

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Student Progress
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor individual student learning progress.
        </p>
      </div>

      {students.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center px-6 text-center">
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-300">
              No student progress found
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Student progress will appear here when data is available.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Student
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Progress
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Completed
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Week
                </th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => {
                const status = getStatus(student);
                const percentage = Math.min(
                  Math.max(Number(getPercentage(student)) || 0, 0),
                  100
                );

                return (
                  <tr
                    key={student._id || student.id || index}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-5">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {getName(student)}
                        </p>

                        {student.email && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {student.email}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="w-40">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Progress
                          </span>

                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClass(
                          status
                        )}`}
                      >
                        {getStatusIcon(status)}
                        {getStatusLabel(status)}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {student.completedContent ??
                          student.completed ??
                          0}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {student.week
                          ? `Week ${student.week}`
                          : "-"}
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
  );
};

export default StudentProgressTable;