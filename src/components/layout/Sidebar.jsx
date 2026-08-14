function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <h1 className="text-2xl font-bold text-blue-600">BMS</h1>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <a
          href="/dashboard"
          className="flex items-center rounded-lg bg-blue-50 px-4 py-3 font-medium text-blue-600"
        >
          Dashboard
        </a>

        <a
          href="/students"
          className="flex items-center rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        >
          Students
        </a>

        <a
          href="/attendance"
          className="flex items-center rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        >
          Attendance
        </a>

        <a
          href="/progress"
          className="flex items-center rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        >
          Progress
        </a>

        <a
          href="/assignments"
          className="flex items-center rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        >
          Assignments
        </a>

        <a
          href="/announcements"
          className="flex items-center rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        >
          Announcements
        </a>
      </nav>

      <div className="space-y-2 border-t border-slate-200 p-4">
        <a
          href="/profile"
          className="block rounded-lg px-4 py-3 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
        >
          Profile
        </a>

        <button className="w-full rounded-lg px-4 py-3 text-left text-red-600 transition hover:bg-red-50">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
