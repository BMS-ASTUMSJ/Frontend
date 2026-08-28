import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Users,
  XCircle,
} from "lucide-react";

const ProgressStats = ({
  totalStudents = 0,
  completed = 0,
  inProgress = 0,
  notStarted = 0,
  needHelp = 0,
}) => {
  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      iconClass:
        "bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      iconClass:
        "bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: BarChart3,
      iconClass:
        "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
    },
    {
      label: "Not Started",
      value: notStarted,
      icon: Clock3,
      iconClass:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    },
    {
      label: "Need Help",
      value: needHelp,
      icon: XCircle,
      iconClass:
        "bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-lg ${stat.iconClass}`}
            >
              <Icon size={21} />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStats;