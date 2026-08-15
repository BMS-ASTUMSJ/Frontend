import { Users, UserCheck, UserX, Megaphone, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Students",
      value: "120",
      description: "Registered students",
      icon: Users,
    },
    {
      title: "Active Mentors",
      value: "12",
      description: "Currently active",
      icon: UserCheck,
    },
    {
      title: "Pending Applications",
      value: "18",
      description: "Waiting for review",
      icon: UserX,
    },
    {
      title: "Announcements",
      value: "8",
      description: "Published announcements",
      icon: Megaphone,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <header className="border-b border-[#D6D6D6] bg-white px-8 py-6">
        <div>
          <p className="text-sm font-medium text-[#4A7FA7]">Admin Dashboard</p>

          <h1 className="mt-1 text-2xl font-bold text-[#0A1931]">
            Welcome back, Admin
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the bootcamp and keep everything running smoothly.
          </p>
        </div>
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
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
                      {stat.value}
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      {stat.description}
                    </p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  Recent Activity
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Latest activity in the bootcamp.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-[#F6FAFD] p-4">
                <p className="text-sm font-medium text-[#0A1931]">
                  New student registered
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  A new student has submitted an application.
                </p>
              </div>

              <div className="rounded-xl bg-[#F6FAFD] p-4">
                <p className="text-sm font-medium text-[#0A1931]">
                  Attendance updated
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Today's attendance has been recorded.
                </p>
              </div>

              <div className="rounded-xl bg-[#F6FAFD] p-4">
                <p className="text-sm font-medium text-[#0A1931]">
                  New announcement published
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  An announcement was shared with bootcamp members.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D6D6D6] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#0A1931]">Quick Actions</h2>

            <p className="mt-1 text-sm text-gray-500">
              Quickly access the most important admin tools.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                to="/admin/announcements"
                className="flex items-center justify-between rounded-xl bg-[#0A1931] px-5 py-4 text-white transition hover:bg-[#1A3D63]"
              >
                <div>
                  <p className="font-semibold">Create Announcement</p>

                  <p className="text-xs text-[#B3CFE5]">
                    Share an update with users
                  </p>
                </div>

                <ArrowUpRight className="h-5 w-5" />
              </Link>

              <Link
                to="/admin/users"
                className="flex items-center justify-between rounded-xl bg-[#B3CFE5]/40 px-5 py-4 text-[#0A1931] transition hover:bg-[#B3CFE5]"
              >
                <div>
                  <p className="font-semibold">Manage Students</p>

                  <p className="text-xs text-gray-600">
                    View and manage students
                  </p>
                </div>

                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
