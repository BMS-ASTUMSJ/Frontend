import {
  Users,
  UserCheck,
  CalendarCheck,
  FolderKanban,
  Megaphone,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Students",
      value: "128",
      description: "Registered students",
      icon: Users,
    },
    {
      title: "Mentors",
      value: "8",
      description: "Active mentors",
      icon: UserCheck,
    },
    {
      title: "Attendance",
      value: "92%",
      description: "Average attendance",
      icon: CalendarCheck,
    },
    {
      title: "Projects",
      value: "24",
      description: "Projects submitted",
      icon: FolderKanban,
    },
  ];

  const activities = [
    {
      title: "New student registered",
      description: "Sara K. joined the bootcamp.",
      time: "10 min ago",
      icon: Users,
    },
    {
      title: "Attendance updated",
      description: "React track attendance was updated.",
      time: "1 hour ago",
      icon: CheckCircle2,
    },
    {
      title: "Project submitted",
      description: "Team Alpha submitted their MERN project.",
      time: "3 hours ago",
      icon: FolderKanban,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="mb-8">
        <div className="rounded-3xl bg-[#2B362E] p-7 text-[#F5F0E8] shadow-sm">
          <p className="text-sm text-[#DDE4D7]">Administration</p>

          <h2 className="mt-2 text-3xl font-bold">Welcome back, Admin 👋</h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#DDE4D7]">
            Manage students, mentors, attendance, projects, and important
            bootcamp announcements from one place.
          </p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
                Latest activity across the bootcamp.
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
            Common administrative tasks.
          </p>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => navigate("/admin/announcements")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]"
            >
              <Megaphone className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  Create Announcement
                </p>

                <p className="text-xs text-slate-500">
                  Share an update with members
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/students")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]"
            >
              <Users className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  Manage Students
                </p>

                <p className="text-xs text-slate-500">
                  View registered students
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/admin/attendance")}
              className="flex w-full items-center gap-3 rounded-2xl bg-[#EBE5DA] p-4 text-left transition hover:bg-[#DDE4D7]"
            >
              <CalendarCheck className="h-5 w-5 text-[#2B362E]" />

              <div>
                <p className="text-sm font-semibold text-[#2B362E]">
                  Attendance
                </p>

                <p className="text-xs text-slate-500">Monitor attendance</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
        <h3 className="text-lg font-semibold text-[#2B362E]">
          Bootcamp Overview
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Current bootcamp statistics.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#F5F0E8] p-5">
            <p className="text-sm text-slate-500">Active Students</p>

            <p className="mt-2 text-2xl font-bold text-[#2B362E]">128</p>
          </div>

          <div className="rounded-2xl bg-[#F5F0E8] p-5">
            <p className="text-sm text-slate-500">Active Mentors</p>

            <p className="mt-2 text-2xl font-bold text-[#2B362E]">8</p>
          </div>

          <div className="rounded-2xl bg-[#F5F0E8] p-5">
            <p className="text-sm text-slate-500">Overall Attendance</p>

            <p className="mt-2 text-2xl font-bold text-[#2B362E]">92%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
