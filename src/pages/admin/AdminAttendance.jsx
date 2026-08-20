import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  UserRound,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
  AlertCircle,
  CalendarDays,
  MinusCircle,
} from "lucide-react";
import api from "../../utils/api";

const AdminAttendance = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    fetchAttendanceStats();
  }, []);

  // ============================================================
  // FETCH ATTENDANCE STATISTICS
  // ============================================================

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/admin-stats");

      setBatches(res.data.allBatches || []);
    } catch (err) {
      console.error("Failed to load attendance stats:", err);

      setError(
        err.response?.data?.message || "Failed to load attendance statistics.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // VIEW FULL REPORT
  // ============================================================

  const handleViewReport = async (batch) => {
    try {
      setSelectedBatch(batch);
      setReport(null);
      setReportError("");
      setReportLoading(true);

      const res = await api.get(`/attendance/admin-report/${batch._id}`);

      setReport(res.data);
    } catch (err) {
      console.error("Failed to load batch report:", err);

      setReportError(
        err.response?.data?.message ||
          "Failed to load the full attendance report.",
      );
    } finally {
      setReportLoading(false);
    }
  };

  // ============================================================
  // CLOSE REPORT
  // ============================================================

  const closeReport = () => {
    setSelectedBatch(null);
    setReport(null);
    setReportError("");
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ================= HEADER ================= */}

        <header className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                Attendance
              </span>

              <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-green-600">
                Live Analytics
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Global Analytics
            </h1>

            <p className="mt-1 text-sm font-medium text-gray-500">
              Weighted attendance tracking for all batches
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <BarChart3 size={30} />
          </div>
        </header>

        {/* ================= CALCULATION RULE ================= */}

        {/* ================= ERROR ================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-bold text-red-700">
                Unable to load attendance
              </p>

              <p className="mt-1 text-xs font-medium text-red-500">{error}</p>

              <button
                onClick={fetchAttendanceStats}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ================= LOADING ================= */}

        {loading ? (
          <div className="flex min-h-100 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
              <Loader2 size={25} className="animate-spin text-indigo-600" />
            </div>

            <p className="text-sm font-bold text-gray-600">
              Loading attendance statistics...
            </p>

            <p className="mt-1 text-xs text-gray-400">Please wait</p>
          </div>
        ) : batches.length === 0 ? (
          /* ================= EMPTY ================= */

          <div className="flex min-h-100 flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Users size={28} className="text-gray-400" />
            </div>

            <h3 className="text-lg font-black text-gray-700">No batches yet</h3>

            <p className="mt-2 max-w-md text-sm text-gray-400">
              There are currently no batches available to display attendance
              statistics.
            </p>
          </div>
        ) : (
          /* ================= BATCH CARDS ================= */

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <BatchCard
                key={batch._id}
                batch={batch}
                onViewReport={handleViewReport}
              />
            ))}
          </div>
        )}
      </div>

      {/* ================= REPORT MODAL ================= */}

      {selectedBatch && (
        <ReportModal
          batch={selectedBatch}
          report={report}
          loading={reportLoading}
          error={reportError}
          onClose={closeReport}
        />
      )}
    </div>
  );
};

// ============================================================
// BATCH CARD
// ============================================================

const BatchCard = ({ batch, onViewReport }) => {
  const overallRate = Number(batch.overallAttendanceRate || 0);

  const femaleRate = Number(batch.femaleAttendanceRate || 0);

  const maleRate = Number(batch.maleAttendanceRate || 0);

  const totalStudents = Number(batch.totalStudents || 0);

  const femaleStudents = Number(batch.femaleStudents || 0);

  const maleStudents = Number(batch.maleStudents || 0);

  const totalSessions = Number(batch.totalSessions || 0);

  const totalApplicableChecks = Number(batch.totalApplicableChecks || 0);

  const totalEarnedPoints = Number(batch.totalEarnedPoints || 0);

  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* ================= CARD TOP ================= */}

      <div className="border-b border-gray-100 p-6">
        <div className="mb-5 flex items-center justify-between">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              batch.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {batch.status || "Unknown"}
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500 transition group-hover:bg-indigo-600 group-hover:text-white">
            <TrendingUp size={19} />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900">{batch.name}</h2>

        <p className="mt-1 text-xs font-medium text-gray-400">
          Attendance overview
        </p>
      </div>

      {/* ================= OVERALL PERCENTAGE ================= */}

      <div className="border-b border-gray-100 bg-linear-to-br from-indigo-50 to-white p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Overall Attendance
            </p>

            <p className="mt-1 text-4xl font-black text-indigo-700">
              {overallRate.toFixed(1)}%
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-gray-400">
              Students
            </p>

            <p className="text-xl font-black text-gray-800">{totalStudents}</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-indigo-100">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${Math.min(Math.max(overallRate, 0), 100)}%`,
            }}
          />
        </div>
      </div>

      {/* ================= STATISTICS ================= */}

      <div className="space-y-4 p-6">
        <StatItem
          icon={<Users size={16} />}
          label="Total Students"
          value={totalStudents}
        />

        <StatItem
          icon={<CalendarDays size={16} />}
          label="Actual Sessions"
          value={totalSessions}
        />

        <StatItem
          icon={<CheckCircle2 size={16} />}
          label="Applicable Checks"
          value={totalApplicableChecks}
        />

        <StatItem
          icon={<TrendingUp size={16} />}
          label="Earned Points"
          value={totalEarnedPoints.toFixed(1)}
        />

        <div className="my-2 border-t border-gray-100" />

        <StatItem
          icon={<UserRound size={16} />}
          label="Female Students"
          value={femaleStudents}
        />

        <StatItem
          icon={<CheckCircle2 size={16} />}
          label="Female Attendance"
          value={`${femaleRate.toFixed(1)}%`}
          valueClass="text-pink-600"
        />

        <StatItem
          icon={<UserRound size={16} />}
          label="Male Students"
          value={maleStudents}
        />

        <StatItem
          icon={<CheckCircle2 size={16} />}
          label="Male Attendance"
          value={`${maleRate.toFixed(1)}%`}
          valueClass="text-blue-600"
        />

        {/* ================= BUTTON ================= */}

        <div className="pt-3">
          <button
            onClick={() => onViewReport(batch)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-indigo-600 active:scale-[0.98]"
          >
            <FileText size={15} />
            View Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STAT ITEM
// ============================================================

const StatItem = ({ icon, label, value, valueClass = "text-gray-800" }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-gray-400">{icon}</span>

      <span className="text-[10px] font-black uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>

    <span className={`text-sm font-black ${valueClass}`}>{value ?? 0}</span>
  </div>
);

// ============================================================
// REPORT MODAL
// ============================================================

const ReportModal = ({ batch, report, loading, error, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* ================= MODAL HEADER ================= */}

        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={19} className="text-indigo-600" />

              <h2 className="text-xl font-black text-gray-900">
                {batch.name} Report
              </h2>
            </div>

            <p className="mt-1 text-xs font-medium text-gray-400">
              Detailed weighted attendance report
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={19} />
          </button>
        </div>

        {/* ================= MODAL CONTENT ================= */}

        <div className="overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex min-h-75 flex-col items-center justify-center">
              <Loader2 size={28} className="animate-spin text-indigo-600" />

              <p className="mt-4 text-sm font-bold text-gray-500">
                Loading full report...
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-75 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                <XCircle size={25} className="text-red-500" />
              </div>

              <h3 className="font-black text-gray-700">
                Failed to load report
              </h3>

              <p className="mt-2 max-w-md text-sm text-gray-400">{error}</p>
            </div>
          ) : report ? (
            <FullReport report={report} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// FULL REPORT
// ============================================================

const FullReport = ({ report }) => {
  const summary = report.summary || {};
  const students = report.students || [];

  return (
    <div className="space-y-6">
      {/* ================= SUMMARY ================= */}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <ReportStat
          label="Students"
          value={summary.totalStudents ?? 0}
          icon={<Users size={18} />}
        />

        <ReportStat
          label="Sessions"
          value={summary.totalSessions ?? 0}
          icon={<CalendarDays size={18} />}
        />

        <ReportStat
          label="Applicable Checks"
          value={summary.totalApplicableChecks ?? 0}
          icon={<CheckCircle2 size={18} />}
        />

        <ReportStat
          label="Attendance"
          value={`${Number(summary.overallAttendanceRate || 0).toFixed(1)}%`}
          icon={<TrendingUp size={18} />}
        />
      </div>

      {/* ================= CALCULATION SUMMARY ================= */}

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniStat
            label="Present"
            value={summary.totalPresent}
            className="text-green-600"
          />

          <MiniStat
            label="Late"
            value={summary.totalLate}
            className="text-amber-600"
          />

          <MiniStat
            label="Absent"
            value={summary.totalAbsent}
            className="text-red-600"
          />

          <MiniStat
            label="Excused"
            value={summary.totalExcused}
            className="text-blue-600"
          />
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-212.5">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Student
                </th>

                <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Gender
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Present
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Late
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Absent
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Excused
                </th>

                <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-sm font-medium text-gray-400"
                  >
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <StudentReportRow
                    key={student._id || student.studentId}
                    student={student}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// STUDENT REPORT ROW
// ============================================================

const StudentReportRow = ({ student }) => {
  const attendance = Number(student.percentage ?? student.attendanceRate ?? 0);

  return (
    <tr className="transition hover:bg-gray-50">
      {/* STUDENT */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-xs font-black text-indigo-600">
            {student.firstName?.charAt(0) || "S"}
            {student.lastName?.charAt(0) || ""}
          </div>

          <div>
            <p className="text-sm font-bold text-gray-800">
              {student.fullName ||
                `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
                "Unknown Student"}
            </p>

            {student.schoolId && (
              <p className="mt-0.5 text-[10px] font-medium text-gray-400">
                {student.schoolId}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* GENDER */}

      <td className="px-5 py-4">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase text-gray-500">
          {student.gender || "-"}
        </span>
      </td>

      {/* PRESENT */}

      <td className="px-5 py-4 text-center">
        <span className="font-black text-green-600">
          {student.presentChecks ?? 0}
        </span>
      </td>

      {/* LATE */}

      <td className="px-5 py-4 text-center">
        <span className="font-black text-amber-600">
          {student.lateChecks ?? 0}
        </span>
      </td>

      {/* ABSENT */}

      <td className="px-5 py-4 text-center">
        <span className="font-black text-red-600">
          {student.absentChecks ?? 0}
        </span>
      </td>

      {/* EXCUSED */}

      <td className="px-5 py-4 text-center">
        <span className="font-black text-blue-600">
          {student.excusedChecks ?? 0}
        </span>
      </td>

      {/* ATTENDANCE */}

      <td className="px-5 py-4 text-center">
        <span
          className={`rounded-full px-3 py-1 text-xs font-black ${
            attendance >= 80
              ? "bg-green-100 text-green-700"
              : attendance >= 50
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
          }`}
        >
          {attendance.toFixed(1)}%
        </span>
      </td>
    </tr>
  );
};

// ============================================================
// REPORT STAT
// ============================================================

const ReportStat = ({ label, value, icon }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-500 shadow-sm">
      {icon}
    </div>

    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
      {label}
    </p>

    <p className="mt-1 text-2xl font-black text-gray-900">{value}</p>
  </div>
);

// ============================================================
// MINI STAT
// ============================================================

const MiniStat = ({ label, value, className }) => (
  <div>
    <p className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
      {label}
    </p>

    <p className={`mt-1 text-xl font-black ${className}`}>{value ?? 0}</p>
  </div>
);

export default AdminAttendance;
