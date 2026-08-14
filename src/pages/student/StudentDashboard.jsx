import {
  CalendarCheck,
  FolderKanban,
  CheckCircle2,
  Clock,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Attendance",
      value: "94%",
      description: "Your overall attendance",
      icon: CalendarCheck,
    },
    {
      title: "Projects",
      value: "5",
      description: "Projects completed",
      icon: FolderKanban,
    },
    {
      title: "Current Status",
      value: "Active",
      description: "You are enrolled",
      icon: CheckCircle2,
    },
  ];

  const activities = [
    {
      title: "Project submitted",
      description: "Your React project was submitted successfully.",
      time: "Today",
      icon: FolderKanban,
    },
    {
      title: "Attendance marked",
      description: "You were marked present today.",
      time: "Today",
      icon: CalendarCheck,
    },
    {
      title: "New announcement",
      description: "The administration posted a new announcement.",
      time: "Yesterday",
      icon: Megaphone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="mb-8">
        <div className="rounded-3xl bg-[#2B362E] p-7 text-[#F5F0E8] shadow-sm">
          <p className="text-sm text-[#DDE4D7]">Student Dashboard</p>

          <h2 className="mt-2 text-3xl font-bold">Welcome back, Student 👋</h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#DDE4D7]">
            Keep track of your attendance, projects, announcements, and progress
            throughout the bootcamp.
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
                Your latest bootcamp activity.
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

                  <div className="flex-1">
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

          <p className="mt-1 text-sm text-slate-500">
            Quickly access important information.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate("/student/announcements")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]"
            >
              <Megaphone className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  Announcements
                </p>

                <p className="text-xs text-slate-500">View latest updates</p>
              </div>
            </button>

            <button
              onClick={() => navigate("/student/attendance")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]"
            >
              <CalendarCheck className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  My Attendance
                </p>

                <p className="text-xs text-slate-500">
                  Check attendance records
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/student/projects")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]"
            >
              <FolderKanban className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  My Projects
                </p>

                <p className="text-xs text-slate-500">View your projects</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
        <h3 className="text-lg font-semibold text-[#2B362E]">
          Bootcamp Progress
        </h3>

        <p className="mt-1 text-sm text-slate-500">Keep up the good work!</p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#2B362E]">Overall Progress</span>

            <span className="font-semibold text-[#6B8063]">72%</span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#EBE5DA]">
            <div
              className="h-full rounded-full bg-[#6B8063]"
              style={{ width: "72%" }}
            />
          </div>

          <div className="mt-3 flex justify-between text-xs text-slate-400">
            <span>5 projects completed</span>

            <span>Keep going!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
