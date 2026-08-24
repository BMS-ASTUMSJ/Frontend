import { useEffect, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  BarChart3,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import api from "../../utils/api";

function StudentDashboard() {
  // ============================================================
  // STATE
  // ============================================================

  const [student, setStudent] = useState(null);

  const [risk, setRisk] = useState({
    attendanceIssues: 0,
    assignmentIssues: 0,
    totalIssues: 0,
    absenceCount: 0,
    missedAssignmentCount: 0,
    attendanceAtRisk: false,
    assignmentAtRisk: false,
    isAtRisk: false,
    reason: [],
    message: "Checking your current status...",
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // FETCH STUDENT PROFILE + RISK STATUS
  // ============================================================

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);

        // --------------------------------------------------------
        // GET LOGGED-IN STUDENT PROFILE
        // --------------------------------------------------------

        const profileResponse = await api.get("/users/profile");

        if (profileResponse.data.success) {
          setStudent(profileResponse.data.user);
        }

        // --------------------------------------------------------
        // GET STUDENT RISK STATUS
        // --------------------------------------------------------

        const riskResponse = await api.get("/at-risk/my-status");

        if (riskResponse.data.success) {
          setRisk(riskResponse.data.risk);
        }
      } catch (error) {
        console.error("Error fetching student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // ============================================================
  // STUDENT NAME
  // ============================================================

  const studentName = student
    ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
    : "Student";

  // ============================================================
  // STATUS
  // ============================================================

  const isAtRisk = risk.isAtRisk;

  const status = isAtRisk ? "Pending" : "On Track";

  // ============================================================
  // STATS
  // ============================================================

  const stats = [
    {
      title: "Attendance Issues",
      value: risk.attendanceIssues || 0,
      icon: ClipboardCheck,
    },
    {
      title: "Missed Assignments",
      value: risk.assignmentIssues || 0,
      icon: FileText,
    },
    {
      title: "Total Issues",
      value: risk.totalIssues || 0,
      icon: BarChart3,
    },
    {
      title: "Status",
      value: status,
      icon: isAtRisk ? Clock3 : CheckCircle2,
    },
  ];

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <p className="text-sm font-medium text-[#4A7FA7]">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      {/* ========================================================
          STATUS / PENDING INDICATOR
      ======================================================== */}

      {isAtRisk && (
        <div className="mx-8 mt-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-100 p-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
            </div>

            <div>
              <p className="font-semibold text-amber-800">Status: At Risk</p>

              <p className="mt-1 text-sm text-amber-700">
                Your current performance requires attention.
              </p>

              {risk.reason?.length > 0 && (
                <p className="mt-1 text-sm text-amber-700">
                  {risk.reason.join(" and ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white sm:self-auto">
            <Clock3 className="h-4 w-4" />
            At Risk
          </div>
        </div>
      )}

      {/* ========================================================
          HEADER
      ======================================================== */}

      <header className="border-b border-[#D6D6D6] bg-white px-8 py-6">
        <p className="text-sm font-medium text-[#4A7FA7]">Student Dashboard</p>

        <h1 className="mt-1 text-2xl font-bold text-[#0A1931]">
          Welcome back, {studentName}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Keep learning, complete your assignments and track your progress.
        </p>
      </header>

      {/* ========================================================
          CONTENT
      ======================================================== */}

      <div className="p-8">
        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  stat.title === "Status" && isAtRisk
                    ? "border-amber-200"
                    : "border-[#D6D6D6]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <h2
                      className={`mt-3 text-2xl font-bold ${
                        stat.title === "Status" && isAtRisk
                          ? "text-amber-600"
                          : "text-[#0A1931]"
                      }`}
                    >
                      {stat.value}
                    </h2>
                  </div>

                  <div
                    className={`rounded-xl p-3 ${
                      stat.title === "Status" && isAtRisk
                        ? "bg-amber-100"
                        : "bg-[#B3CFE5]/40"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        stat.title === "Status" && isAtRisk
                          ? "text-amber-600"
                          : "text-[#1A3D63]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================
            RISK DETAILS
        ====================================================== */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* ====================================================
              PERFORMANCE STATUS
          ==================================================== */}

          <div
            className={`rounded-2xl border bg-white p-6 shadow-sm ${
              isAtRisk ? "border-amber-200" : "border-[#D6D6D6]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  Performance Status
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Your current bootcamp performance overview.
                </p>
              </div>

              {isAtRisk ? (
                <div className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
                  At Risk
                </div>
              ) : (
                <div className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-semibold text-green-700">
                  On Track
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {/* ATTENDANCE */}

              <div className="flex items-center justify-between rounded-xl bg-[#F6FAFD] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#B3CFE5]/40 p-2">
                    <ClipboardCheck className="h-5 w-5 text-[#1A3D63]" />
                  </div>

                  <div>
                    <p className="font-semibold text-[#0A1931]">
                      Attendance Issues
                    </p>

                    <p className="text-xs text-gray-500">Absences recorded</p>
                  </div>
                </div>

                <span
                  className={`text-lg font-bold ${
                    risk.attendanceAtRisk ? "text-amber-600" : "text-[#0A1931]"
                  }`}
                >
                  {risk.attendanceIssues || 0}
                </span>
              </div>

              {/* ASSIGNMENTS */}

              <div className="flex items-center justify-between rounded-xl bg-[#F6FAFD] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#B3CFE5]/40 p-2">
                    <FileText className="h-5 w-5 text-[#1A3D63]" />
                  </div>

                  <div>
                    <p className="font-semibold text-[#0A1931]">
                      Missed Assignments
                    </p>

                    <p className="text-xs text-gray-500">
                      Past deadline without submission
                    </p>
                  </div>
                </div>

                <span
                  className={`text-lg font-bold ${
                    risk.assignmentAtRisk ? "text-amber-600" : "text-[#0A1931]"
                  }`}
                >
                  {risk.assignmentIssues || 0}
                </span>
              </div>
            </div>
          </div>

          {/* ====================================================
              ANNOUNCEMENT
          ==================================================== */}

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

        {/* ======================================================
            STATUS MESSAGE
        ====================================================== */}

        {/* ======================================================
            KEEP LEARNING
        ====================================================== */}
        <h2 className="text-lg mt-5 font-bold text-[#0A1931]">Keep Learning</h2>

        <p className="mt-1 text-sm text-gray-500">
          Stay consistent with your bootcamp activities.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {/* ATTENDANCE */}

          <div className="rounded-xl bg-[#F6FAFD] p-5">
            <h3 className="font-semibold text-[#0A1931]">Attendance</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Attend sessions regularly to maintain good progress.
            </p>
          </div>

          {/* ASSIGNMENTS */}

          <div className="rounded-xl bg-[#F6FAFD] p-5">
            <h3 className="font-semibold text-[#0A1931]">Assignments</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Complete your assignments and submit them before the deadline.
            </p>
          </div>

          {/* PROGRESS */}

          <div className="rounded-xl bg-[#F6FAFD] p-5">
            <h3 className="font-semibold text-[#0A1931]">Stay Consistent</h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Regular participation and timely submissions help you stay on
              track.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
