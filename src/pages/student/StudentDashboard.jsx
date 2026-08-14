import {
  LayoutDashboard,
  CalendarCheck,
  ClipboardList,
  FolderKanban,
  Megaphone,
  MessageSquare,
  User,
  LogOut,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function StudentDashboard() {
  const stats = [
    {
      title: "Attendance",
      value: "92%",
      icon: CalendarCheck,
    },
    {
      title: "Assignments",
      value: "6",
      icon: ClipboardList,
    },
    {
      title: "Projects",
      value: "3",
      icon: FolderKanban,
    },
    {
      title: "Feedback",
      value: "4",
      icon: MessageSquare,
    },
  ];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b border-[#2B362E]/10 bg-white">
        <div className="flex h-full items-center justify-between px-6">
          <h1 className="text-xl font-bold text-[#2B362E]">ASTU Bootcamp</h1>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 hover:bg-[#EBE5DA]">
              <Bell className="h-5 w-5 text-[#2B362E]" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B362E] font-semibold text-[#F5F0E8]">
                S
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#2B362E]">Student</p>

                <p className="text-xs text-slate-500">Bootcamp Student</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-16 hidden w-64 border-r border-[#2B362E]/10 bg-white md:block">
        <div className="flex h-full flex-col justify-between p-5">
          <nav className="space-y-2">
            <button className="flex w-full items-center gap-3 rounded-xl bg-[#EBE5DA] px-4 py-3 text-left font-medium text-[#2B362E]">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <CalendarCheck className="h-5 w-5" />
              My Attendance
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <ClipboardList className="h-5 w-5" />
              Assignments
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <FolderKanban className="h-5 w-5" />
              Projects
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <Megaphone className="h-5 w-5" />
              Announcements
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <User className="h-5 w-5" />
              Profile
            </button>
          </nav>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="pt-16 md:ml-64">
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#2B362E]">
              Welcome back, Student 👋
            </h2>

            <p className="mt-2 text-slate-600">
              Keep track of your bootcamp progress and upcoming work.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stat.title}</p>

                      <p className="mt-2 text-3xl font-bold text-[#2B362E]">
                        {stat.value}
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

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#2B362E]">
                  Announcements
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Latest updates from the bootcamp
                </p>
              </div>

              <Megaphone className="h-5 w-5 text-[#6B8063]" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[#F5F0E8] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2B362E]">
                    Project Demo Day
                  </h4>

                  <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                    All
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Project demonstrations will be held this Friday at 2:00 PM.
                </p>
              </div>

              <div className="rounded-2xl bg-[#F5F0E8] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2B362E]">
                    Assignment Reminder
                  </h4>

                  <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                    Students
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Remember to submit your assignment before the deadline.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2B362E]">
                Upcoming Work
              </h3>

              <button className="text-sm font-medium text-[#6B8063] hover:underline">
                View all
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#EBE5DA] p-3">
                    <ClipboardList className="h-5 w-5 text-[#2B362E]" />
                  </div>

                  <div>
                    <p className="font-medium text-[#2B362E]">
                      React Assignment
                    </p>

                    <p className="text-sm text-slate-500">Due tomorrow</p>
                  </div>
                </div>

                <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                  Pending
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#EBE5DA] p-3">
                    <FolderKanban className="h-5 w-5 text-[#2B362E]" />
                  </div>

                  <div>
                    <p className="font-medium text-[#2B362E]">MERN Project</p>

                    <p className="text-sm text-slate-500">Due Friday</p>
                  </div>
                </div>

                <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
