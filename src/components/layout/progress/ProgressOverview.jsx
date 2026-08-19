import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Users,
  AlertCircle,
} from "lucide-react";

const ProgressOverview = ({
  totalStudents = 0,
  completed = 0,
  inProgress = 0,
  notStarted = 0,
  needHelp = 0,
}) => {
  const total = Math.max(totalStudents, 1);

  const completedPercentage = Math.round(
    (completed / total) * 100
  );

  const inProgressPercentage = Math.round(
    (inProgress / total) * 100
  );

  const notStartedPercentage = Math.round(
    (notStarted / total) * 100
  );

  const needHelpPercentage = Math.round(
    (needHelp / total) * 100
  );

  const items = [
    {
      label: "Completed",
      value: completed,
      percentage: completedPercentage,
      icon: CheckCircle2,
      className: "text-green-600 dark:text-green-400",
      barClass: "bg-green-500",
    },
    {
      label: "In Progress",
      value: inProgress,
      percentage: inProgressPercentage,
      icon: BarChart3,
      className: "text-blue-600 dark:text-blue-400",
      barClass: "bg-blue-500",
    },
    {
      label: "Not Started",
      value: notStarted,
      percentage: notStartedPercentage,
      icon: Clock3,
      className: "text-slate-600 dark:text-slate-300",
      barClass: "bg-slate-500",
    },
    {
      label: "Need Help",
      value: needHelp,
      percentage: needHelpPercentage,
      icon: AlertCircle,
      className: "text-orange-600 dark:text-orange-400",
      barClass: "bg-orange-500",
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Progress Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Student progress distribution
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <Users size={21} />
        </div>
      </div>

      <div className="space-y-6">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    size={18}
                    className={item.className}
                  />

                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </span>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all ${item.barClass}`}
                  style={{
                    width: `${Math.min(item.percentage, 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressOverview;