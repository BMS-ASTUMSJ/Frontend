import { useEffect, useState } from "react";
import {
  Users,
  X,
  Loader2,
  XCircle,
  FileText,
  AlertCircle,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  ShieldAlert,
  RefreshCw,
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

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/admin-stats");

      setBatches(res.data?.allBatches || []);
    } catch (err) {
      console.error("Failed to load attendance stats:", err);

      setError(
        err.response?.data?.message || "Failed to load attendance statistics.",
      );
    } finally {
      setLoading(false);
    }
  };

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

  const closeReport = () => {
    setSelectedBatch(null);
    setReport(null);
    setReportError("");
    setReportLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-8">
      <div className="mx-auto max-w-7xl px-4 space-y-6">
        {/* =========================================================
            TOP DARK THEME BANNER
        ========================================================= */}
        <div className="rounded-2xl bg-gradient-to-r from-[#071b23] via-[#0f2b34] to-[#1b3c47] p-6 shadow-lg border border-[#1b3c47] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-lg shadow-[#00A8CC]/20">
                <BarChart3 size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">
                  Attendance Management
                </h1>
              </div>
            </div>

            <button
              onClick={fetchAttendanceStats}
              disabled={loading}
              className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 md:self-center"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* =========================================================
            MAIN WHITE CARD
        ========================================================= */}
        <div className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-xl">
          {/* =======================================================
              SECTION HEADER
          ======================================================= */}
          <div className="border-b border-[#F4F8FA] p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  Attendance Analytics
                </h2>

                <p className="mt-1 text-sm font-medium text-[#8FA3B0]">
                  Review attendance metrics and detailed student performance by
                  batch
                </p>
              </div>

              {!loading && !error && (
                <div className="flex items-center gap-2 rounded-xl border border-[#B4D7E2] bg-[#E3F5F9] px-4 py-2">
                  <Users size={16} className="text-[#00A8CC]" />

                  <span className="text-xs font-bold uppercase tracking-wider text-[#14222B]">
                    {batches.length}{" "}
                    {batches.length === 1 ? "Batch" : "Batches"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* =======================================================
              CONTENT
          ======================================================= */}
          <div className="p-8">
            {/* =====================================================
                ERROR STATE
            ===================================================== */}
            {error && (
              <div className="mb-6 flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <AlertCircle size={20} className="text-red-600" />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-900">
                    Unable to load attendance statistics
                  </h4>

                  <p className="mt-1 text-xs leading-relaxed text-red-700">
                    {error}
                  </p>

                  <button
                    onClick={fetchAttendanceStats}
                    className="mt-4 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-600"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* =====================================================
                LOADING STATE
            ===================================================== */}
            {loading ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#B4D7E2] bg-[#F4F8FA]">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <Loader2 size={28} className="animate-spin text-[#00A8CC]" />
                </div>

                <p className="mt-5 text-sm font-bold text-[#14222B]">
                  Loading attendance statistics...
                </p>

                <p className="mt-1 text-xs font-medium text-[#8FA3B0]">
                  Please wait while the attendance data is being retrieved
                </p>
              </div>
            ) : batches.length === 0 && !error ? (
              /* ===================================================
                 EMPTY STATE
              =================================================== */
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#B4D7E2] bg-[#F4F8FA] p-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                  <Users size={26} />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#14222B]">
                  No Batches Found
                </h3>

                <p className="mt-2 max-w-md text-sm leading-relaxed text-[#8FA3B0]">
                  There are currently no batches available to aggregate
                  attendance metrics.
                </p>
              </div>
            ) : !error ? (
              /* ===================================================
                 BATCH DIRECTORY
              =================================================== */
              <div>
                {/* TABLE */}
                <div className="overflow-x-auto">
                  <table className="w-full border-separate border-spacing-y-4 text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8FA3B0]">
                        <th className="px-5 pb-2">Batch</th>

                        <th className="px-5 pb-2 text-center">Status</th>

                        <th className="px-5 pb-2 text-center">Students</th>

                        <th className="px-5 pb-2 text-center">Sessions</th>

                        <th className="px-5 pb-2 text-center">Checks</th>

                        <th className="px-5 pb-2 text-center">Overall</th>

                        <th className="px-5 pb-2 text-center">Female</th>

                        <th className="px-5 pb-2 text-center">Male</th>

                        <th className="px-5 pb-2 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {batches.map((batch) => {
                        const overallRate = Number(
                          batch.overallAttendanceRate || 0,
                        );

                        const femaleRate = Number(
                          batch.femaleAttendanceRate || 0,
                        );

                        const maleRate = Number(batch.maleAttendanceRate || 0);

                        return (
                          <BatchRow
                            key={batch._id}
                            batch={batch}
                            overallRate={overallRate}
                            femaleRate={femaleRate}
                            maleRate={maleRate}
                            onViewReport={handleViewReport}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================================
          REPORT MODAL
      ========================================================= */}
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

/* ================================================================
   BATCH ROW
================================================================ */

const BatchRow = ({
  batch,
  overallRate,
  femaleRate,
  maleRate,
  onViewReport,
}) => {
  const getRateStyle = (rate) => {
    if (rate >= 80) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }

    if (rate >= 50) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-red-50 text-red-700 border-red-200";
  };

  const getInitials = (name) => {
    if (!name) return "BA";

    return name
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <tr className="group transition-transform hover:translate-x-1">
      {/* BATCH */}
      <td className="rounded-l-2xl border-l-4 border-[#00A8CC] bg-white px-5 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[11px] font-bold text-[#00A8CC] shadow-inner">
            {getInitials(batch.name)}
          </div>

          <div>
            <p className="text-sm font-bold leading-tight text-[#14222B]">
              {batch.name || "Unknown Batch"}
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-[#00A8CC]">
              Attendance Analytics
            </p>
          </div>
        </div>
      </td>

      {/* STATUS */}
      <td className="bg-white px-5 py-5 text-center shadow-sm">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
            batch.status === "active"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-gray-200 bg-gray-50 text-gray-500"
          }`}
        >
          {batch.status || "Unknown"}
        </span>
      </td>

      {/* STUDENTS */}
      <td className="bg-white px-5 py-5 text-center text-sm font-black text-[#14222B] shadow-sm">
        {Number(batch.totalStudents || 0)}
      </td>

      {/* SESSIONS */}
      <td className="bg-white px-5 py-5 text-center text-sm font-bold text-gray-600 shadow-sm">
        {Number(batch.totalSessions || 0)}
      </td>

      {/* CHECKS */}
      <td className="bg-white px-5 py-5 text-center text-sm font-bold text-gray-600 shadow-sm">
        {Number(batch.totalApplicableChecks || 0)}
      </td>

      {/* OVERALL RATE */}
      <td className="bg-white px-5 py-5 text-center shadow-sm">
        <span
          className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-black ${getRateStyle(
            overallRate,
          )}`}
        >
          {overallRate.toFixed(1)}%
        </span>
      </td>

      {/* FEMALE RATE */}
      <td className="bg-white px-5 py-5 text-center shadow-sm">
        <span className="text-xs font-bold text-pink-600">
          {femaleRate.toFixed(1)}%
        </span>
      </td>

      {/* MALE RATE */}
      <td className="bg-white px-5 py-5 text-center shadow-sm">
        <span className="text-xs font-bold text-blue-600">
          {maleRate.toFixed(1)}%
        </span>
      </td>

      {/* ACTION */}
      <td className="rounded-r-2xl bg-white px-5 py-5 text-right shadow-sm">
        <button
          onClick={() => onViewReport(batch)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#00A8CC] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-[#00A8CC]/20 transition hover:bg-[#0088A6]"
        >
          <FileText size={14} />
          View Report
        </button>
      </td>
    </tr>
  );
};

/* ================================================================
   REPORT MODAL
================================================================ */

const ReportModal = ({ batch, report, loading, error, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#14222B]/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[#B4D7E2] bg-white shadow-2xl">
        {/* =======================================================
            MODAL HEADER
        ======================================================= */}
        <div className="flex items-center justify-between bg-gradient-to-r from-[#071b23] via-[#0f2b34] to-[#1b3c47] px-6 py-5 text-white md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] shadow-lg shadow-[#00A8CC]/20">
              <FileText size={21} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white md:text-xl">
                {batch.name} Attendance Report
              </h2>

              <p className="mt-0.5 text-xs font-medium text-[#A3CBCF]">
                Detailed attendance performance and student metrics
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>

        {/* =======================================================
            MODAL BODY
        ======================================================= */}
        <div className="overflow-y-auto bg-[#F4F8FA] p-6 md:p-8">
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-[#B4D7E2] bg-white">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E3F5F9]">
                <Loader2 size={27} className="animate-spin text-[#00A8CC]" />
              </div>

              <p className="mt-5 text-sm font-bold text-[#14222B]">
                Loading attendance report...
              </p>

              <p className="mt-1 text-xs font-medium text-[#8FA3B0]">
                Fetching detailed student attendance records
              </p>
            </div>
          ) : error ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-red-200 bg-white p-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-red-50">
                <XCircle size={28} className="text-red-500" />
              </div>

              <h3 className="mt-5 text-base font-bold text-[#14222B]">
                Report Loading Failed
              </h3>

              <p className="mt-2 max-w-md text-xs leading-relaxed text-[#8FA3B0]">
                {error}
              </p>
            </div>
          ) : report ? (
            <FullReport report={report} />
          ) : null}
        </div>
      </div>
    </div>
  );
};

/* ================================================================
   FULL REPORT
================================================================ */

const FullReport = ({ report }) => {
  const summary = report.summary || {};
  const students = report.students || [];

  return (
    <div className="space-y-6">
      {/* =========================================================
          SUMMARY
      ========================================================= */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#14222B]">
            Attendance Summary
          </h3>

          <p className="mt-1 text-xs font-medium text-[#8FA3B0]">
            Overall attendance statistics for this batch
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          <StatCard
            title="Students"
            value={summary.totalStudents ?? 0}
            icon={Users}
            color="teal"
          />

          <StatCard
            title="Sessions"
            value={summary.totalSessions ?? 0}
            icon={TrendingUp}
            color="teal"
          />

          <StatCard
            title="Checks"
            value={summary.totalApplicableChecks ?? 0}
            icon={BarChart3}
            color="teal"
          />

          <StatCard
            title="Present"
            value={summary.totalPresent ?? 0}
            icon={UserCheck}
            color="emerald"
          />

          <StatCard
            title="Late"
            value={summary.totalLate ?? 0}
            icon={Clock}
            color="amber"
          />

          <StatCard
            title="Absent"
            value={summary.totalAbsent ?? 0}
            icon={UserX}
            color="red"
          />

          <StatCard
            title="Excused"
            value={summary.totalExcused ?? 0}
            icon={ShieldAlert}
            color="blue"
          />

          <StatCard
            title="Rate"
            value={`${Number(summary.overallAttendanceRate || 0).toFixed(1)}%`}
            icon={TrendingUp}
            color="cyan"
            highlight
          />
        </div>
      </div>

      {/* =========================================================
          STATUS LEGEND
      ========================================================= */}
      <div className="rounded-2xl border border-[#B4D7E2] bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#14222B]">
              Student Performance
            </h3>

            <p className="mt-1 text-xs font-medium text-[#8FA3B0]">
              Attendance risk classification
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Normal ≥80%
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Warning 50-79%
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-700">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              At Risk &lt;50%
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          STUDENT DIRECTORY
      ========================================================= */}
      <div className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-sm">
        <div className="border-b border-[#F4F8FA] p-6">
          <h3 className="text-lg font-bold text-[#14222B]">
            Student Attendance Directory
          </h3>

          <p className="mt-1 text-xs font-medium text-[#8FA3B0]">
            Individual attendance performance for students in this batch
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F4F8FA] text-[10px] font-bold uppercase tracking-[0.16em] text-[#8FA3B0]">
                <th className="px-5 py-4">Student</th>

                <th className="px-5 py-4">Gender</th>

                <th className="px-5 py-4 text-center">Present</th>

                <th className="px-5 py-4 text-center">Late</th>

                <th className="px-5 py-4 text-center">Absent</th>

                <th className="px-5 py-4 text-center">Excused</th>

                <th className="px-5 py-4 text-center">Rate</th>

                <th className="px-5 py-4 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F0F4F6]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                        <Users size={22} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-[#14222B]">
                        No Student Records
                      </p>

                      <p className="mt-1 text-xs text-[#8FA3B0]">
                        No individual attendance records were found.
                      </p>
                    </div>
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

/* ================================================================
   STAT CARD
================================================================ */

const StatCard = ({ title, value, icon: Icon, color, highlight }) => {
  const colorStyles = {
    teal: "bg-[#F0F7F9] text-[#184E5A] border-[#D2E7EC]",
    cyan: "bg-[#E6F4F8] text-[#008BA3] border-[#BCE3ED]",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
  };

  return (
    <div
      className={`flex min-h-[85px] flex-col justify-between rounded-xl border p-3 ${
        colorStyles[color]
      } ${highlight ? "ring-2 ring-[#00A8CC]/30" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">
          {title}
        </span>

        <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
      </div>

      <span className="mt-2 text-lg font-black tracking-tight">{value}</span>
    </div>
  );
};

/* ================================================================
   STUDENT REPORT ROW
================================================================ */

const StudentReportRow = ({ student }) => {
  const attendance = Number(student.percentage ?? student.attendanceRate ?? 0);

  const getRiskStatus = (value) => {
    if (value < 50) return "At Risk";
    if (value < 80) return "Warning";
    return "Normal";
  };

  const riskStatus = getRiskStatus(attendance);

  const statusStyles = {
    Normal: {
      row: "hover:bg-[#F8FAFB]",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },

    Warning: {
      row: "bg-amber-50/30 hover:bg-amber-50/60",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    },

    "At Risk": {
      row: "bg-red-50/30 hover:bg-red-50/60",
      badge: "bg-red-50 text-red-700 border-red-200",
    },
  };

  const styles = statusStyles[riskStatus];

  const studentName =
    student.fullName ||
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    "Unknown Student";

  const initials = studentName
    .split(" ")
    .slice(0, 2)
    .map((name) => name.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <tr className={`transition ${styles.row}`}>
      {/* STUDENT */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[10px] font-bold text-[#00A8CC]">
            {initials}
          </div>

          <div>
            <p className="text-xs font-bold text-[#14222B] sm:text-sm">
              {studentName}
            </p>

            {student.schoolId && (
              <p className="mt-0.5 font-mono text-[9px] text-[#8FA3B0]">
                {student.schoolId}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* GENDER */}
      <td className="px-5 py-4 text-xs font-semibold text-gray-500">
        {student.gender || "-"}
      </td>

      {/* PRESENT */}
      <td className="px-5 py-4 text-center">
        <span className="text-xs font-black text-emerald-600">
          {student.presentChecks ?? 0}
        </span>
      </td>

      {/* LATE */}
      <td className="px-5 py-4 text-center">
        <span className="text-xs font-black text-amber-600">
          {student.lateChecks ?? 0}
        </span>
      </td>

      {/* ABSENT */}
      <td className="px-5 py-4 text-center">
        <span className="text-xs font-black text-red-600">
          {student.absentChecks ?? 0}
        </span>
      </td>

      {/* EXCUSED */}
      <td className="px-5 py-4 text-center">
        <span className="text-xs font-black text-blue-600">
          {student.excusedChecks ?? 0}
        </span>
      </td>

      {/* RATE */}
      <td className="px-5 py-4 text-center">
        <span className="text-xs font-black text-[#14222B]">
          {attendance.toFixed(1)}%
        </span>
      </td>

      {/* STATUS */}
      <td className="px-5 py-4 text-center">
        <span
          className={`inline-block rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${styles.badge}`}
        >
          {riskStatus}
        </span>
      </td>
    </tr>
  );
};

export default AdminAttendance;
