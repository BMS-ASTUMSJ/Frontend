import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FolderKanban,
  Megaphone,
  MessageSquare,
  User,
  LogOut,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function MentorDashboard() {
  const stats = [
    {
      title: "My Students",
      value: "32",
      icon: Users,
    },
    {
      title: "Attendance Today",
      value: "29",
      icon: CalendarCheck,
    },
    {
      title: "Projects to Review",
      value: "7",
      icon: FolderKanban,
    },
    {
      title: "Messages",
      value: "5",
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
                M
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#2B362E]">Mentor</p>

                <p className="text-xs text-slate-500">Mentor</p>
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
              <Users className="h-5 w-5" />
              My Students
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <CalendarCheck className="h-5 w-5" />
              Attendance
            </button>

            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]">
              <FolderKanban className="h-5 w-5" />
              Projects
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
              Welcome back, Mentor 👋
            </h2>

            <p className="mt-2 text-slate-600">
              Here's what's happening with your students today.
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
                  Updates for mentors
                </p>
              </div>

              <Megaphone className="h-5 w-5 text-[#6B8063]" />
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-[#F5F0E8] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2B362E]">
                    Project Review
                  </h4>

                  <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                    Mentor
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Please complete the assigned project reviews before Friday.
                </p>
              </div>

              <div className="rounded-2xl bg-[#F5F0E8] p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#2B362E]">
                    Mentor Meeting
                  </h4>

                  <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                    Mentor
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  Mentor coordination meeting tomorrow at 10:00 AM.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2B362E]">
                My Students
              </h3>

              <button className="text-sm font-medium text-[#6B8063] hover:underline">
                View all
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {["Sara K.", "Abel M.", "Nathan T.", "Mahi R."].map((student) => (
                <div
                  key={student}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EBE5DA] font-semibold text-[#2B362E]">
                      {student.charAt(0)}
                    </div>

                    <div>
                      <p className="font-medium text-[#2B362E]">{student}</p>

                      <p className="text-sm text-slate-500">MERN Track</p>
                    </div>
                  </div>

                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MentorDashboard;
