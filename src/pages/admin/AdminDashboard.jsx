import {
  LayoutDashboard,
  Users,
  UserCheck,
  CalendarCheck,
  FolderKanban,
  Megaphone,
  Bell,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };
  const stats = [
    { title: "Students", value: "128", icon: Users },
    { title: "Mentors", value: "8", icon: UserCheck },
    { title: "Attendance", value: "92%", icon: CalendarCheck },
    { title: "Projects", value: "24", icon: FolderKanban },
  ];
  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {" "}
      <header className="border-b border-[#2B362E]/10 bg-white">
        {" "}
        <div className="flex items-center justify-between px-6 py-4">
          {" "}
          <div>
            {" "}
            <h1 className="text-xl font-bold text-[#2B362E]">
              {" "}
              Admin Dashboard{" "}
            </h1>{" "}
            <p className="text-sm text-slate-500"> Welcome back, Admin </p>{" "}
          </div>{" "}
          <button className="rounded-full border border-slate-200 p-2 hover:bg-slate-50">
            {" "}
            <Bell className="h-5 w-5 text-slate-600" />{" "}
          </button>{" "}
        </div>{" "}
      </header>{" "}
      <div className="flex">
        {" "}
        <aside className="hidden w-64 border-r border-[#2B362E]/10 bg-white p-5 md:block">
          {" "}
          <nav className="space-y-2">
            {" "}
            <button className="flex w-full items-center gap-3 rounded-xl bg-[#EBE5DA] px-4 py-3 text-left text-[#2B362E]">
              {" "}
              <LayoutDashboard className="h-5 w-5" />{" "}
              <span className="font-medium">Dashboard</span>{" "}
            </button>{" "}
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-50">
              {" "}
              <Users className="h-5 w-5" /> <span>Students</span>{" "}
            </button>{" "}
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-50">
              {" "}
              <UserCheck className="h-5 w-5" /> <span>Mentors</span>{" "}
            </button>{" "}
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-50">
              {" "}
              <CalendarCheck className="h-5 w-5" /> <span>Attendance</span>{" "}
            </button>{" "}
            <button
              onClick={() => navigate("/admin/announcements")}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 transition hover:bg-[#F5F0E8] hover:text-[#2B362E]"
            >
              <Megaphone className="h-5 w-5" />
              Announcements
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-600 hover:bg-slate-50">
              {" "}
              <FolderKanban className="h-5 w-5" /> <span>Projects</span>{" "}
            </button>{" "}
          </nav>{" "}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </aside>{" "}
        <main className="flex-1 p-6">
          {" "}
          <div className="mb-8">
            {" "}
            <h2 className="text-3xl font-bold text-[#2B362E]">
              {" "}
              Overview{" "}
            </h2>{" "}
            <p className="mt-2 text-slate-600">
              {" "}
              Monitor students, mentors, attendance, and projects.{" "}
            </p>{" "}
          </div>{" "}
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {" "}
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5"
                >
                  {" "}
                  <div className="flex items-center justify-between">
                    {" "}
                    <div>
                      {" "}
                      <p className="text-sm text-slate-500">
                        {" "}
                        {stat.title}{" "}
                      </p>{" "}
                      <p className="mt-2 text-3xl font-bold text-[#2B362E]">
                        {" "}
                        {stat.value}{" "}
                      </p>{" "}
                    </div>{" "}
                    <div className="rounded-2xl bg-[#EBE5DA] p-3">
                      {" "}
                      <Icon className="h-6 w-6 text-[#2B362E]" />{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              );
            })}{" "}
          </div>{" "}
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
            {" "}
            <div className="flex items-center justify-between">
              {" "}
              <h3 className="text-lg font-semibold text-[#2B362E]">
                {" "}
                Recent Activity{" "}
              </h3>{" "}
              <button className="text-sm font-medium text-[#6B8063] hover:underline">
                {" "}
                View all{" "}
              </button>{" "}
            </div>{" "}
            <div className="mt-6 space-y-4">
              {" "}
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
                {" "}
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#6B8063]" />{" "}
                <div>
                  {" "}
                  <p className="font-medium text-[#2B362E]">
                    {" "}
                    Applications{" "}
                  </p>{" "}
                  <p className="text-sm text-slate-500">
                    {" "}
                    Sara K. submitted a bootcamp application.{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
                {" "}
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#6B8063]" />{" "}
                <div>
                  {" "}
                  <p className="font-medium text-[#2B362E]">
                    {" "}
                    Attendance updated{" "}
                  </p>{" "}
                  <p className="text-sm text-slate-500">
                    {" "}
                    React track attendance was marked by mentors.{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 p-4">
                {" "}
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#6B8063]" />{" "}
                <div>
                  {" "}
                  <p className="font-medium text-[#2B362E]">
                    {" "}
                    Project submitted{" "}
                  </p>{" "}
                  <p className="text-sm text-slate-500">
                    {" "}
                    Team Alpha submitted their MERN project.{" "}
                  </p>{" "}
                </div>{" "}
              </div>{" "}
            </div>{" "}
          </div>{" "}
        </main>{" "}
      </div>{" "}
    </div>
  );
}
export default AdminDashboard;
