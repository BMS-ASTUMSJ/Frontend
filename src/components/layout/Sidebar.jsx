import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  FileText,
  Megaphone,
  UserCircle,
  LogOut,
} from "lucide-react";

function Sidebar({ role }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: `/${role}`,
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: `/${role}/students`,
      icon: Users,
    },
    {
      name: "Attendance",
      path: `/${role}/attendance`,
      icon: ClipboardCheck,
    },
    {
      name: "Progress",
      path: `/${role}/progress`,
      icon: BarChart3,
    },
    {
      name: "Assignments",
      path: `/${role}/assignments`,
      icon: FileText,
    },
    {
      name: "Announcements",
      path: `/${role}/announcements`,
      icon: Megaphone,
    },
    {
      name: "Profile",
      path: `/${role}/profile`,
      icon: UserCircle,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col bg-[#0A1931] text-white">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div>
          <h1 className="text-xl font-bold">ASTU MSJ</h1>

          <p className="text-xs tracking-[0.2em] text-[#B3CFE5]">BOOTCAMP</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.name === "Dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#4A7FA7] text-white shadow-sm"
                    : "text-[#D6D6D6] hover:bg-[#1A3D63] hover:text-white"
                }`
              }
            >
              <Icon className="h-5 w-5" />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#D6D6D6] transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5" />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
