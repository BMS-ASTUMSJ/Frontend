import { ClipboardCheck, FileText, BarChart3, Megaphone } from "lucide-react";

function StudentDashboard() {
  const stats = [
    {
      title: "Attendance",
      value: "94%",
      icon: ClipboardCheck,
    },
    {
      title: "Assignments",
      value: "12",
      icon: FileText,
    },
    {
      title: "Progress",
      value: "78%",
      icon: BarChart3,
    },
    {
      title: "Announcements",
      value: "4",
      icon: Megaphone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <header className="border-b border-[#D6D6D6] bg-white px-8 py-6">
        <p className="text-sm font-medium text-[#4A7FA7]">Student Dashboard</p>

        <h1 className="mt-1 text-2xl font-bold text-[#0A1931]">
          Welcome back, Student
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Keep learning, complete your assignments and track your progress.
        </p>
      </header>

      <div className="p-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-[#D6D6D6] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#D6D6D6] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0A1931]">Your Progress</h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep working toward completing the bootcamp.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-[#0A1931]">
                  Overall Progress
                </span>

                <span className="font-semibold text-[#4A7FA7]">78%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#D6D6D6]">
                <div className="h-full w-[78%] rounded-full bg-[#4A7FA7]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D6D6D6] bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[#B3CFE5]/40 p-3">
                <Megaphone className="h-5 w-5 text-[#1A3D63]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  Latest Announcement
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Check the announcements section regularly for important
                  updates from the bootcamp administration.
                </p>

                <button className="mt-4 rounded-xl bg-[#0A1931] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1A3D63]">
                  View Announcements
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D6D6D6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#0A1931]">Keep Learning</h2>

          <p className="mt-1 text-sm text-gray-500">
            Stay consistent with your bootcamp activities.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[#F6FAFD] p-5">
              <h3 className="font-semibold text-[#0A1931]">Attendance</h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Attend sessions regularly to maintain good progress.
              </p>
            </div>

            <div className="rounded-xl bg-[#F6FAFD] p-5">
              <h3 className="font-semibold text-[#0A1931]">Assignments</h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Complete your assignments and submit them on time.
              </p>
            </div>

            <div className="rounded-xl bg-[#F6FAFD] p-5">
              <h3 className="font-semibold text-[#0A1931]">Progress</h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Track your learning progress throughout the bootcamp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
