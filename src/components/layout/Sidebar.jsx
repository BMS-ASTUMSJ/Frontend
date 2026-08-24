import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  ChevronDown,
  UserCog,
  GraduationCap,
  BookOpen,
} from "lucide-react";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();

  const currentRole = role?.toLowerCase();

  const studentMenuItems = [
    {
      name: "Dashboard",
      path: "/student",
      icon: LayoutDashboard,
      type: "link",
    },
    {
      name: "Attendance",
      path: "/student/attendance",
      icon: ClipboardCheck,
      type: "link",
    },
    {
      name: "Progress",
      path: "/student/progress",
      icon: BarChart3,
      type: "link",
    },
    {
      name: "Assignments",
      path: "/student/assignments",
      icon: FileText,
      type: "link",
    },
    {
      name: "Announcements",
      path: "/student/announcements",
      icon: Megaphone,
      type: "link",
    },
    {
      name: "Profile",
      path: "/student/profile",
      icon: UserCircle,
      type: "link",
    },
  ];

  const adminMenuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      type: "link",
    },

    {
      name: "User Management",
      icon: UserCog,
      type: "group",
      children: [
        {
          name: "Applicants",
          path: "/admin/applicants",
          icon: Users,
        },
        {
          name: "Users",
          path: "/admin/users",
          icon: UserCircle,
        },
      ],
    },

    {
      name: "Bootcamp",
      icon: GraduationCap,
      type: "group",
      children: [
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
          name: "Batch History",
          path: "/admin/batch-history",
          icon: Archive,
        },
      ],
    },

    {
      name: "Learning",
      icon: BookOpen,
      type: "group",
      children: [
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
      ],
    },

    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: ClipboardCheck,
      type: "link",
    },

    {
      name: "Announcements",
      path: "/admin/announcements",
      icon: Megaphone,
      type: "link",
    },

    {
      name: "Profile",
      path: "/admin/profile",
      icon: UserCircle,
      type: "link",
    },
  ];

  const mentorMenuItems = [
    {
      name: "Dashboard",
      path: "/mentor",
      icon: LayoutDashboard,
      type: "link",
    },
    {
      name: "My Students",
      path: "/mentor/students",
      icon: Users,
      type: "link",
    },
    {
      name: "Attendance",
      path: "/mentor/attendance",
      icon: ClipboardCheck,
      type: "link",
    },
    {
      name: "Progress",
      path: "/mentor/progress",
      icon: BarChart3,
      type: "link",
    },
    {
      name: "Assignments",
      path: "/mentor/assignments",
      icon: FileText,
      type: "link",
    },
    {
      name: "Announcements",
      path: "/mentor/announcements",
      icon: Megaphone,
      type: "link",
    },
    {
      name: "Profile",
      path: "/mentor/profile",
      icon: UserCircle,
      type: "link",
    },
    {
      name: "My Batch",
      path: "/mentor/my-batch",
      icon: Archive,
      type: "link",
    },
  ];

  let menuItems = studentMenuItems;

  if (currentRole === "admin") {
    menuItems = adminMenuItems;
  } else if (currentRole === "mentor") {
    menuItems = mentorMenuItems;
  }

  const getActiveGroup = () => {
    if (currentRole !== "admin") {
      return null;
    }

    const activeGroup = adminMenuItems.find(
      (item) =>
        item.type === "group" &&
        item.children?.some((child) =>
          location.pathname.startsWith(child.path)
        )
    );

    return activeGroup?.name || null;
  };

  const [openGroup, setOpenGroup] = useState(getActiveGroup);

  useEffect(() => {
    const activeGroup = getActiveGroup();

    if (activeGroup) {
      setOpenGroup(activeGroup);
    }
  }, [location.pathname, currentRole]);

  const isGroupActive = (item) => {
    return item.children?.some((child) =>
      location.pathname.startsWith(child.path)
    );
  };

  const toggleGroup = (groupName) => {
    setOpenGroup((current) =>
      current === groupName ? null : groupName
    );
  };

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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#0A1931] text-white">
      <div className="flex h-20 shrink-0 items-center border-b border-white/10 px-6">
        <div>
          <h1 className="text-xl font-bold">ASTU MSJ</h1>

          <p className="text-xs tracking-[0.2em] text-[#B3CFE5]">
            BOOTCAMP
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.type === "group") {
              const active = isGroupActive(item);
              const isOpen = openGroup === item.name;

              return (
                <div key={item.name}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.name)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-[#1A3D63] text-white"
                        : "text-[#D6D6D6] hover:bg-[#1A3D63] hover:text-white"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />

                      <span>{item.name}</span>
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                                isActive
                                  ? "bg-[#4A7FA7] text-white"
                                  : "text-[#BFC8D4] hover:bg-[#1A3D63] hover:text-white"
                              }`
                            }
                          >
                            <ChildIcon className="h-4 w-4 shrink-0" />

                            <span>{child.name}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

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
                <Icon className="h-5 w-5 shrink-0" />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#D6D6D6] transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-5 w-5 shrink-0" />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;