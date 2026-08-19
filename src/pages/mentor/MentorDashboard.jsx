import { useEffect } from "react";
import { Users, ClipboardCheck, FileText, Megaphone } from "lucide-react";
import toast from "react-hot-toast";

function MentorDashboard() {
  useEffect(() => {
    toast.success("Welcome back, Mentor!");
  }, []);

  const stats = [
    {
      title: "My Students",
      value: "24",
      icon: Users,
    },
    {
      title: "Attendance",
      value: "92%",
      icon: ClipboardCheck,
    },
    {
      title: "Assignments",
      value: "16",
      icon: FileText,
    },
    {
      title: "Announcements",
      value: "5",
      icon: Megaphone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <header className="border-b border-[#D6D6D6] bg-white px-8 py-6">
        <p className="text-sm font-medium text-[#4A7FA7]">
          Mentor Dashboard
        </p>

        <h1 className="mt-1 text-2xl font-bold text-[#0A1931]">
          Welcome back, Mentor
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Keep track of your students, attendance and assignments.
        </p>
      </header>

      <div className="p-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#D6D6D6] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
                      {stat.value}
                    </h2>
                  </div>

                  <div className="rounded-xl bg-[#B3CFE5]/40 p-3">
                    <Icon className="h-5 w-5 text-[#1A3D63]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[#D6D6D6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0A1931]">
            Today's Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Here is what needs your attention today.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#F6FAFD] p-5">
              <p className="text-sm font-medium text-[#0A1931]">
                Attendance
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Make sure today's attendance is recorded.
              </p>
            </div>

            <div className="rounded-xl bg-[#F6FAFD] p-5">
              <p className="text-sm font-medium text-[#0A1931]">
                Assignments
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Review submitted assignments from your students.
              </p>
            </div>

            <div className="rounded-xl bg-[#F6FAFD] p-5">
              <p className="text-sm font-medium text-[#0A1931]">
                Announcements
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Check the latest bootcamp announcements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MentorDashboard;