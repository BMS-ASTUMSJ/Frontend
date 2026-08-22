import { NavLink, useNavigate } from "react-router-dom";
import api from "../../utils/api";

import {
  LayoutDashboard,
  Users,
  UsersRound,
  UserCog,
  ClipboardCheck,
  BarChart3,
  FileText,
  Megaphone,
  CircleUserRound,
  Layers,
  Layers3,
  History,
  LogOut,
  ChevronRight,
} from "lucide-react";

function Sidebar({ role }) {
  const navigate = useNavigate();

  const currentRole = role?.toLowerCase();

  // =========================================================
  // STUDENT MENU
  // =========================================================
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
      icon: CircleUserRound,
    },
  ];

  // =========================================================
  // ADMIN MENU
  // =========================================================
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
      icon: Layers3,
    },
    {
      name: "Teams",
      path: "/admin/teams",
      icon: UsersRound,
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
      icon: CircleUserRound,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: UserCog,
    },
    {
      name: "Batch History",
      path: "/admin/batch-history",
      icon: History,
    },
  ];

  // =========================================================
  // MENTOR MENU
  // =========================================================
  const mentorMenuItems = [
    {
      name: "Dashboard",
      path: "/mentor",
      icon: LayoutDashboard,
    },
    {
      name: "My Students",
      path: "/mentor/students",
      icon: UsersRound,
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
      icon: CircleUserRound,
    },
    {
      name: "My Batch",
      path: "/mentor/my-batch",
      icon: Layers3,
    },
  ];

  // =========================================================
  // SELECT MENU BASED ON ROLE
  // =========================================================
  let menuItems = studentMenuItems;

  if (currentRole === "admin") {
    menuItems = adminMenuItems;
  } else if (currentRole === "mentor") {
    menuItems = mentorMenuItems;
  }

  // =========================================================
  // LOGOUT
  // =========================================================
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
    <aside
      className="
        fixed left-0 top-0 z-50
        flex h-screen w-64 flex-col
        overflow-hidden
        border-r border-white/10

        bg-gradient-to-b
        from-[#061A36]
        via-[#123B5D]
        to-[#B86F4D]

        text-white

        shadow-[10px_0_40px_rgba(7,26,53,0.20)]
      "
    >
      {/* =====================================================
          SOFT BACKGROUND ORANGE GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-28
          -top-32
          h-72
          w-72
          rounded-full
          bg-[#F7A46B]/20
          blur-[70px]
        "
      />

      {/* =====================================================
          SOFT MIDDLE ORANGE GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-[35%]
          h-64
          w-64
          rounded-full
          bg-[#D98756]/10
          blur-[80px]
        "
      />

      {/* =====================================================
          SOFT BLUE GLOW
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -right-24
          h-72
          w-72
          rounded-full
          bg-[#6BB7E8]/10
          blur-[85px]
        "
      />

      {/* =====================================================
          BRAND HEADER
      ====================================================== */}

      <div
        className="
          relative
          flex
          h-24
          shrink-0
          items-center
          border-b
          border-white/10
          bg-gradient-to-r
          from-white/[0.05]
          via-white/[0.025]
          to-transparent
          px-6
        "
      >
        {/* Orange vertical accent */}

        <div
          className="
            absolute
            left-0
            top-0
            h-full
            w-[3px]
            bg-gradient-to-b
            from-[#F7A46B]
            via-[#D98756]
            to-transparent
          "
        />

        <div className="relative">
          {/* Logo glow */}

          <div
            className="
              pointer-events-none
              absolute
              -left-4
              -top-4
              h-12
              w-12
              rounded-full
              bg-[#F7A46B]/15
              blur-2xl
            "
          />

          <h1
            className="
              relative
              text-xl
              font-extrabold
              tracking-tight
              text-white
            "
          >
            ASTU MSJ
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-5 bg-[#F7A46B]" />

            <p
              className="
                text-[11px]
                font-semibold
                tracking-[0.28em]
                text-[#C9D8E6]
              "
            >
              BOOTCAMP
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <nav
        className="
          relative
          flex-1
          space-y-1.5
          overflow-y-auto
          px-3
          py-6

          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-white/10
          hover:[&::-webkit-scrollbar-thumb]:bg-white/20
        "
      >
        {/* Section title */}

        <div className="mb-4 px-3">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.22em]
              text-[#91A8BC]
            "
          >
            {currentRole === "admin"
              ? "Administration"
              : currentRole === "mentor"
                ? "Mentor Menu"
                : "Student Menu"}
          </p>
        </div>

        {/* Menu items */}

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.name === "Dashboard"}
              className={({ isActive }) => `
                group
                relative
                flex
                items-center
                gap-3
                overflow-hidden
                rounded-xl
                px-3.5
                py-3
                text-sm
                font-medium

                transition-all
                duration-300
                ease-out

                ${
                  isActive
                    ? `
                      bg-gradient-to-r
                      from-[#F39A5B]
                      via-[#D98756]
                      to-[#B96F4C]

                      text-white

                      shadow-[0_8px_25px_rgba(243,154,91,0.22)]

                      translate-x-0
                    `
                    : `
                      text-[#D0DCE7]

                      hover:bg-white/[0.055]
                      hover:text-white
                      hover:translate-x-1
                    `
                }
              `}
            >
              {({ isActive }) => (
                <>
                  {/* Active left indicator */}

                  {isActive && (
                    <span
                      className="
                        absolute
                        left-0
                        top-1/2
                        h-7
                        w-1
                        -translate-y-1/2
                        rounded-r-full
                        bg-white
                        shadow-[0_0_12px_rgba(255,255,255,0.65)]
                      "
                    />
                  )}

                  {/* Hover shine */}

                  <span
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      -translate-x-full
                      bg-gradient-to-r
                      from-transparent
                      via-white/[0.06]
                      to-transparent
                      transition-transform
                      duration-700
                      group-hover:translate-x-full
                    "
                  />

                  {/* Icon */}

                  <span
                    className={`
                      relative
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg

                      transition-all
                      duration-300

                      ${
                        isActive
                          ? `
                            bg-white/15
                            text-white
                            shadow-inner
                          `
                          : `
                            bg-white/[0.035]
                            text-[#A8BDCE]

                            group-hover:bg-[#F7A46B]/10
                            group-hover:text-[#F7A46B]
                          `
                      }
                    `}
                  >
                    <Icon
                      className={`
                        h-[18px]
                        w-[18px]

                        transition-all
                        duration-300

                        ${
                          isActive
                            ? "scale-105"
                            : "group-hover:scale-110"
                        }
                      `}
                    />
                  </span>

                  {/* Menu name */}

                  <span className="relative flex-1 truncate">
                    {item.name}
                  </span>

                  {/* Arrow */}

                  <ChevronRight
                    className={`
                      relative
                      h-4
                      w-4
                      shrink-0

                      transition-all
                      duration-300

                      ${
                        isActive
                          ? "translate-x-0 opacity-100 text-white/80"
                          : "translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-[#F7A46B]"
                      }
                    `}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* =====================================================
          LOGOUT SECTION
      ====================================================== */}

      <div
        className="
          relative
          shrink-0
          border-t
          border-white/10
          bg-gradient-to-r
          from-black/10
          via-white/[0.02]
          to-transparent
          p-4
        "
      >
        {/* Bottom orange glow */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            right-4
            h-16
            w-16
            rounded-full
            bg-[#F7A46B]/10
            blur-2xl
          "
        />

        <button
          type="button"
          onClick={handleLogout}
          className="
            group
            relative
            flex
            w-full
            items-center
            gap-3
            overflow-hidden
            rounded-xl
            border
            border-white/[0.06]
            bg-white/[0.025]
            px-3.5
            py-3

            text-sm
            font-medium
            text-[#C6D4E1]

            transition-all
            duration-300

            hover:border-red-400/30
            hover:bg-red-500/15
            hover:text-white
            hover:shadow-[0_8px_25px_rgba(239,68,68,0.15)]
          "
        >
          {/* Red hover shine */}

          <span
            className="
              pointer-events-none
              absolute
              inset-0
              -translate-x-full
              bg-gradient-to-r
              from-transparent
              via-red-400/[0.08]
              to-transparent
              transition-transform
              duration-700
              group-hover:translate-x-full
            "
          />

          {/* Logout icon */}

          <span
            className="
              relative
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-white/[0.04]

              transition-all
              duration-300

              group-hover:bg-red-500/15
            "
          >
            <LogOut
              className="
                h-[18px]
                w-[18px]

                transition-all
                duration-300

                group-hover:translate-x-0.5
                group-hover:text-red-400
              "
            />
          </span>

          {/* Logout text */}

          <span className="relative flex-1 text-left">
            Logout
          </span>

          {/* Logout arrow */}

          <ChevronRight
            className="
              relative
              h-4
              w-4

              -translate-x-1
              opacity-0

              transition-all
              duration-300

              group-hover:translate-x-0
              group-hover:opacity-100
              group-hover:text-red-400
            "
          />
        </button>

        {/* Bottom accent */}

        <div
          className="
            pointer-events-none
            absolute
            bottom-0
            left-1/2
            h-px
            w-20
            -translate-x-1/2
            bg-gradient-to-r
            from-transparent
            via-[#F7A46B]/40
            to-transparent
          "
        />
      </div>
    </aside>
  );
}

export default Sidebar;