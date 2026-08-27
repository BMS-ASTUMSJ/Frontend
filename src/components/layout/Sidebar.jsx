import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import logo from "../../assets/ASTUMSJ-Pp.jpg";
import { useTheme } from "../../context/ThemeContext";

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
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, type: "link" },
    {
      name: "User Management",
      icon: UserCog,
      type: "group",
      children: [
        { name: "Applicants", path: "/admin/applicants", icon: Users },
        { name: "Users", path: "/admin/users", icon: UserCircle },
      ],
    },
    {
      name: "Bootcamp",
      icon: GraduationCap,
      type: "group",
      children: [
        { name: "Batch", path: "/admin/batches", icon: Users },
        { name: "Teams", path: "/admin/teams", icon: Users },
        { name: "Batch History", path: "/admin/batch-history", icon: Archive },
      ],
    },
    {
      name: "Learning",
      icon: BookOpen,
      type: "group",
      children: [
        { name: "Weekly Sessions", path: "/admin/sessions", icon: Layers },
        { name: "Progress", path: "/admin/progress", icon: BarChart3 },
        { name: "Assignments", path: "/admin/assignments", icon: FileText },
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
    { name: "Profile", path: "/admin/profile", icon: UserCircle, type: "link" },
  ];

  const mentorMenuItems = [
    { name: "Dashboard", path: "/mentor", icon: LayoutDashboard, type: "link" },
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
    { name: "My Batch", path: "/mentor/my-batch", icon: Archive, type: "link" },
  ];

  let menuItems = studentMenuItems;
  if (currentRole === "admin") {
    menuItems = adminMenuItems;
  } else if (currentRole === "mentor") {
    menuItems = mentorMenuItems;
  }

  const getActiveGroup = () => {
    if (currentRole !== "admin") return null;
    const activeGroup = adminMenuItems.find(
      (item) =>
        item.type === "group" &&
        item.children?.some((child) =>
          location.pathname.startsWith(child.path),
        ),
    );
    return activeGroup?.name || null;
  };

  const [openGroup, setOpenGroup] = useState(getActiveGroup);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const activeGroup = getActiveGroup();
    if (activeGroup) {
      setOpenGroup(activeGroup);
    }
  }, [location.pathname, currentRole]);

  // Close the drawer whenever the route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const isGroupActive = (item) => {
    return item.children?.some((child) =>
      location.pathname.startsWith(child.path),
    );
  };

  const toggleGroup = (groupName) => {
    setOpenGroup((current) => (current === groupName ? null : groupName));
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
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#293E4C] bg-[#1b3c47] px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
            <img src={logo} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight tracking-wide text-[#FFFFFF]">
              ASTU MSJ
            </h1>
            <p className="text-[9px] font-semibold tracking-[0.2em] text-[#00a6c0]">
              BOOTCAMP
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-label="Toggle sidebar"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-[#8FA3B0] hover:bg-[#293E4C]/40 hover:text-white"
        >
          {isMobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[#293E4C] bg-[#1b3c47] text-[#FFFFFF] transition-transform duration-300 ease-in-out lg:z-40 lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[#293E4C] px-6">
          <div className="w-15 h-15 rounded-full overflow-hidden">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-[#FFFFFF]">
              ASTU MSJ
            </h1>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#00a6c0]">
              BOOTCAMP
            </p>
          </div>
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-[#00A8CC] shadow-[0_0_8px_#00A8CC]" />
        </div>

        <nav className="flex-1 overflow-y-auto pl-4 py-6 pr-0 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.type === "group") {
              const active = isGroupActive(item);
              const isExpanded =
                openGroup === item.name || hoveredGroup === item.name;

              return (
                <div
                  key={item.name}
                  className="space-y-1"
                  onMouseEnter={() => setHoveredGroup(item.name)}
                  onMouseLeave={() => setHoveredGroup(null)}
                >
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.name)}
                    className={`nav-tab-item flex w-full items-center justify-between px-4 py-3 text-sm font-semibold ${
                      active ? "nav-tab-active" : "text-[#8FA3B0]"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" />
                      <span>{item.name}</span>
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isExpanded
                          ? "rotate-180 text-[#00A8CC]"
                          : "text-[#8FA3B0]"
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="ml-4 space-y-1 border-l-2 border-[#293E4C] pl-3 py-1 transition-all duration-200">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;

                        return (
                          <NavLink
                            key={child.name}
                            to={child.path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                                isActive
                                  ? "bg-[#00A8CC] text-[#FFFFFF]"
                                  : "text-[#8FA3B0] hover:bg-[#293E4C]/40 hover:text-[#00A8CC]"
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
                  `nav-tab-item flex items-center gap-3 px-4 py-3 text-sm font-semibold ${
                    isActive ? "nav-tab-active" : "text-[#8FA3B0]"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-2 border-t border-[#293E4C] p-4">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#8FA3B0] transition-all hover:bg-[#293E4C]/40 hover:text-white"
          >
            {theme === "light" ? (
              <>
                <Moon className="h-5 w-5 shrink-0 text-sky-400" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-5 w-5 shrink-0 text-amber-400" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-[#8FA3B0] transition-all hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
