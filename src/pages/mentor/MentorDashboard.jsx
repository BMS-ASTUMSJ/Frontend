import {
  Users,
  CalendarCheck,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function MentorDashboard() {
  const stats = [
    {
      title: "My Students",
      value: "32",
      description: "Students assigned to you",
      icon: Users,
    },
    {
      title: "Attendance",
      value: "94%",
      description: "Average attendance",
      icon: CalendarCheck,
    },
    {
      title: "Projects",
      value: "8",
      description: "Projects being monitored",
      icon: FolderKanban,
    },
  ];

  const activities = [
    {
      title: "Attendance updated",
      description: "React track attendance was updated.",
      time: "10 min ago",
      icon: CheckCircle2,
    },
    {
      title: "Project submitted",
      description: "Team Alpha submitted their project.",
      time: "1 hour ago",
      icon: FolderKanban,
    },
    {
      title: "Student needs attention",
      description: "A student has missed two sessions.",
      time: "3 hours ago",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="mb-8">
        <div className="rounded-3xl bg-[#2B362E] p-7 text-[#F5F0E8] shadow-sm">
          <p className="text-sm text-[#DDE4D7]">Mentor Dashboard</p>

          <h2 className="mt-2 text-3xl font-bold">Welcome back, Mentor 👋</h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#DDE4D7]">
            Keep track of your students, monitor attendance, review projects,
            and stay updated with important bootcamp activities.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>

                  <p className="mt-2 text-3xl font-bold text-[#2B362E]">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#EBE5DA] p-3">
                  <Icon className="h-6 w-6 text-[#2B362E]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#2B362E]">
                Recent Activity
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Latest activity from your students.
              </p>
            </div>

            <button className="flex items-center gap-1 text-sm font-medium text-[#6B8063] hover:underline">
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.title}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-[#F5F0E8]"
                >
                  <div className="rounded-xl bg-[#EBE5DA] p-3">
                    <Icon className="h-5 w-5 text-[#2B362E]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#2B362E]">
                      {activity.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {activity.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {activity.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
          <h3 className="text-lg font-semibold text-[#2B362E]">
            Quick Actions
          </h3>

          <p className="mt-1 text-sm text-slate-500">Common mentor tasks.</p>

          <div className="mt-6 space-y-3">
            <button className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]">
              <Users className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  View Students
                </p>

                <p className="text-xs text-slate-500">
                  Check your assigned students
                </p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]">
              <CalendarCheck className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  Mark Attendance
                </p>

                <p className="text-xs text-slate-500">
                  Update today's attendance
                </p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]">
              <FolderKanban className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  Review Projects
                </p>

                <p className="text-xs text-slate-500">
                  Check student submissions
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
        <div>
          <h3 className="text-lg font-semibold text-[#2B362E]">
            Today's Overview
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            A quick look at your students' current progress.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#F5F0E8] p-5">
            <p className="text-sm text-slate-500">Present Today</p>

            <p className="mt-2 text-2xl font-bold text-[#2B362E]">29</p>

            <p className="mt-1 text-xs text-[#6B8063]">out of 32 students</p>
          </div>

          <div className="rounded-2xl bg-[#F5F0E8] p-5">
            <p className="text-sm text-slate-500">Projects Submitted</p>

            <p className="mt-2 text-2xl font-bold text-[#2B362E]">6</p>

            <p className="mt-1 text-xs text-[#6B8063]">this week</p>
          </div>

          <div className="rounded-2xl bg-[#F5F0E8] p-5">
            <p className="text-sm text-slate-500">Students Needing Attention</p>

            <p className="mt-2 text-2xl font-bold text-[#2B362E]">3</p>

            <p className="mt-1 text-xs text-slate-500">Check their progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;
