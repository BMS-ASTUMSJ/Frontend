import { useEffect, useState } from "react";

import {
  BarChart3,
  Users,
  X,
  Loader2,
  XCircle,
  FileText,
  AlertCircle,
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-5 border-b border-gray-200 bg-white px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                Attendance
              </span>
            </div>

            <h3 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
              Global Analytics
            </h3>

            <p className="mt-1 text-sm font-medium text-gray-500">
              Weighted attendance tracking for all batches
            </p>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="flex items-start gap-3 border-l-4 border-red-500 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-bold text-red-700">
                Unable to load attendance
              </p>

              <p className="mt-1 text-xs font-medium text-red-500">{error}</p>

              <button
                onClick={fetchAttendanceStats}
                className="mt-3 bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-100 flex-col items-center justify-center border border-gray-100 bg-white">
            <Loader2 size={28} className="animate-spin text-indigo-600" />

            <p className="mt-4 text-sm font-bold text-gray-600">
              Loading attendance statistics...
            </p>

            <p className="mt-1 text-xs text-gray-400">Please wait</p>
          </div>
        ) : batches.length === 0 ? (
          /* EMPTY STATE */
          <div className="flex min-h-100 flex-col items-center justify-center border border-gray-100 bg-white p-10 text-center">
            <Users size={28} className="text-gray-400" />

            <h3 className="mt-5 text-lg font-black text-gray-700">
              No batches yet
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-400">
              There are currently no batches available to display attendance
              statistics.
            </p>
          </div>
        ) : (
          /* BATCH TABLE */
          <div className="overflow-hidden border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-6 py-5">
              <h2 className="text-lg font-black text-gray-900">
                Batch Attendance
              </h2>

              <p className="mt-1 text-xs font-medium text-gray-400">
                Attendance statistics for all batches
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-275">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Batch
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Students
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Sessions
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Applicable Checks
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Overall
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Female
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Male
                    </th>

                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {batches.map((batch) => {
                    const overallRate = Number(
                      batch.overallAttendanceRate || 0,
                    );

                    const femaleRate = Number(batch.femaleAttendanceRate || 0);

                    const maleRate = Number(batch.maleAttendanceRate || 0);

                    return (
                      <tr
                        key={batch._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* BATCH */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-black text-gray-900">
                            {batch.name}
                          </p>

                          <p className="mt-0.5 text-[10px] font-medium text-gray-400">
                            Attendance overview
                          </p>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`text-[10px] font-black uppercase ${
                              batch.status === "active"
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {batch.status || "Unknown"}
                          </span>
                        </td>

                        {/* STUDENTS */}
                        <td className="px-5 py-4 text-center text-sm font-black text-gray-800">
                          {Number(batch.totalStudents || 0)}
                        </td>

                        {/* SESSIONS */}
                        <td className="px-5 py-4 text-center text-sm font-black text-gray-800">
                          {Number(batch.totalSessions || 0)}
                        </td>

                        {/* APPLICABLE CHECKS */}
                        <td className="px-5 py-4 text-center text-sm font-black text-gray-800">
                          {Number(batch.totalApplicableChecks || 0)}
                        </td>

                        {/* OVERALL */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`text-sm font-black ${
                              overallRate >= 80
                                ? "text-green-600"
                                : overallRate >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                            }`}
                          >
                            {overallRate.toFixed(1)}%
                          </span>
                        </td>

                        {/* FEMALE */}
                        <td className="px-5 py-4 text-center">
                          <p className="text-sm font-black text-pink-600">
                            {femaleRate.toFixed(1)}%
                          </p>
                        </td>

                        {/* MALE */}
                        <td className="px-5 py-4 text-center">
                          <p className="text-sm font-black text-blue-600">
                            {maleRate.toFixed(1)}%
                          </p>
                        </td>

                        {/* DETAILS */}
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleViewReport(batch)}
                            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-black text-indigo-600 transition hover:bg-indigo-50"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

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
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5 sm:px-8">
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
            className="flex h-10 w-10 items-center justify-center bg-gray-100 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <X size={19} />
          </button>
        </div>

        {/* MODAL CONTENT */}
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
              <XCircle size={25} className="text-red-500" />

              <h3 className="mt-4 font-black text-gray-700">
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

const FullReport = ({ report }) => {
  const summary = report.summary || {};
  const students = report.students || [];

  return (
    <div className="space-y-6">
      {/* SUMMARY TABLE */}
      <div className="overflow-x-auto border border-gray-200">
        <table className="w-full min-w-200">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Students
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Sessions
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Applicable Checks
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Present
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Late
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Absent
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Excused
              </th>

              <th className="px-5 py-4 text-left text-[10px] font-black uppercase tracking-wider text-gray-400">
                Attendance
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="px-5 py-4 text-sm font-black text-gray-900">
                {summary.totalStudents ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-gray-900">
                {summary.totalSessions ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-gray-900">
                {summary.totalApplicableChecks ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-green-600">
                {summary.totalPresent ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-amber-600">
                {summary.totalLate ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-red-600">
                {summary.totalAbsent ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-blue-600">
                {summary.totalExcused ?? 0}
              </td>

              <td className="px-5 py-4 text-sm font-black text-indigo-600">
                {Number(summary.overallAttendanceRate || 0).toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* STATUS LEGEND */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 pb-4">
        <span className="text-xs font-black uppercase tracking-wide text-gray-500">
          Student Status:
        </span>

        <span className="text-[10px] font-black uppercase text-green-700">
          ● Normal
        </span>

        <span className="text-[10px] font-black uppercase text-yellow-700">
          ● Warning
        </span>

        <span className="text-[10px] font-black uppercase text-red-700">
          ● At Risk
        </span>
      </div>

      {/* STUDENT TABLE */}
      <div className="overflow-hidden border border-gray-200">
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

                <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-gray-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
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
      row: "bg-white hover:bg-green-50/50",
      border: "border-l-green-500",
      badge: "text-green-700",
    },

    Warning: {
      row: "bg-yellow-50 hover:bg-yellow-100/70",
      border: "border-l-yellow-500",
      badge: "text-yellow-700",
    },

    "At Risk": {
      row: "bg-red-50 hover:bg-red-100/70",
      border: "border-l-red-500",
      badge: "text-red-700",
    },
  };

  const styles = statusStyles[riskStatus];

  return (
    <tr className={`border-l-4 transition ${styles.row} ${styles.border}`}>
      {/* STUDENT */}
      <td className="px-5 py-4">
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
      </td>

      {/* GENDER */}
      <td className="px-5 py-4">
        <span className="text-[10px] font-black uppercase text-gray-500">
          {student.gender || "-"}
        </span>
      </td>

      {/* PRESENT */}
      <td className="px-5 py-4 text-center font-black text-green-600">
        {student.presentChecks ?? 0}
      </td>

      {/* LATE */}
      <td className="px-5 py-4 text-center font-black text-amber-600">
        {student.lateChecks ?? 0}
      </td>

      {/* ABSENT */}
      <td className="px-5 py-4 text-center font-black text-red-600">
        {student.absentChecks ?? 0}
      </td>

      {/* EXCUSED */}
      <td className="px-5 py-4 text-center font-black text-blue-600">
        {student.excusedChecks ?? 0}
      </td>

      {/* ATTENDANCE */}
      <td className="px-5 py-4 text-center">
        <span
          className={`text-sm font-black ${
            attendance >= 80
              ? "text-green-600"
              : attendance >= 50
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {attendance.toFixed(1)}%
        </span>
      </td>

      {/* STATUS */}
      <td
        className={`px-5 py-4 text-center text-[10px] font-black uppercase tracking-wide ${styles.badge}`}
      >
        {riskStatus}
      </td>
    </tr>
  );
};

export default AdminAttendance;
