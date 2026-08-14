import { Outlet, useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  FolderKanban,
  Megaphone,
  Bell,
  LogOut,
} from "lucide-react";

function MentorLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/mentor",
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: "/mentor/students",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/mentor/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Projects",
      path: "/mentor/projects",
      icon: FolderKanban,
    },
    {
      name: "Announcements",
      path: "/mentor/announcements",
      icon: Megaphone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-[#2B362E]/10 bg-white">
        <div className="flex h-full items-center justify-between px-6">
          <button
            onClick={() => navigate("/mentor")}
            className="text-xl font-bold text-[#2B362E]"
          >
            ASTU Bootcamp
          </button>

          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 transition hover:bg-[#EBE5DA]">
              <Bell className="h-5 w-5 text-[#2B362E]" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6B8063] font-semibold text-white">
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

      <aside className="fixed bottom-0 left-0 top-16 z-20 w-64 border-r border-[#2B362E]/10 bg-white">
        <div className="flex h-full flex-col justify-between p-5">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-[#EBE5DA] font-medium text-[#2B362E]"
                      : "text-slate-600 hover:bg-[#F5F0E8] hover:text-[#2B362E]"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />

            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="ml-64 pt-16">
        <Outlet />
      </main>
    </div>
  );
}

export default MentorLayout;
