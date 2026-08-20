import { NavLink, useNavigate } from "react-router-dom";
import api from "../../utils/api";

import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart3,
  FileText,
  Megaphone,
  UserCircle,
  Archive,
  Layers,
  LogOut,
} from "lucide-react";

function Sidebar({ role }) {
  const navigate = useNavigate();

  const currentRole = role?.toLowerCase();

  const studentMenuItems = [
    {
      name: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
    },
    {
      name: "Attendance",
      path: "/student/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: BarChart3,
    },
    {
      name: "Assignments",
      path: "/student/assignments",
      icon: FileText,
    },
    {
      name: "Announcements",
      path: "/student/announcements",
      icon: Megaphone,
    },
    {
      name: "Profile",
      path: "/student/profile",
      icon: UserCircle,
    },
  ];

  const adminMenuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Applicants",
      path: "/admin/applicants",
      icon: Users,
    },
    {
      name: "Batch",
      path: "/admin/batches",
      icon: Users,
    },
    {
      name: "Teams",
      path: "/admin/teams",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "Weekly Sessions",
      path: "/admin/sessions",
      icon: Layers,
    },
    {
      name: "Progress",
      path: "/admin/progress",
      icon: BarChart3,
    },
    {
      name: "Assignments",
      path: "/admin/assignments",
      icon: FileText,
    },
    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: Megaphone,
    },
    {
      name: "Profile",
      path: "/admin/profile",
      icon: UserCircle,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: UserCircle,
    },
    {
      name: "Batch History",
      path: "/admin/batch-history",
      icon: Archive,
    },
  ];

  const mentorMenuItems = [
    {
      name: "Dashboard",
      path: "/mentor",
      icon: LayoutDashboard,
    },
    {
      name: "My Students",
      path: "/mentor/students",
      icon: Users,
    },
    {
      name: "Attendance",
      path: "/mentor/attendance",
      icon: ClipboardCheck,
    },
    {
      name: "Progress",
      path: "/mentor/progress",
      icon: BarChart3,
    },
    {
      name: "Assignments",
      path: "/mentor/assignments",
      icon: FileText,
    },
    {
      name: "Announcements",
      path: "/mentor/announcements",
      icon: Megaphone,
    },
    {
      name: "Profile",
      path: "/mentor/profile",
      icon: UserCircle,
    },
    {
      name: "my Batch",
      path: "/mentor/my-batch",
      icon: Archive,
    },
  ];

  let menuItems = studentMenuItems;

  if (currentRole === "admin") {
    menuItems = adminMenuItems;
  } else if (currentRole === "mentor") {
    menuItems = mentorMenuItems;
  }

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    }
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
          type="button"
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
