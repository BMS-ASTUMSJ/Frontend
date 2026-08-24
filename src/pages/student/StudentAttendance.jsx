import { useEffect, useState } from "react";
import {
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  CalendarDays,
  Trophy,
  Shield,
  TrendingUp,
} from "lucide-react";
import api from "../../utils/api";

const EMPTY_SUMMARY = {
  totalSessions: 0,
  totalChecks: 0,
  attendedChecks: 0,
  presentChecks: 0,
  absentChecks: 0,
  lateChecks: 0,
  excusedChecks: 0,
};

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [generalRate, setGeneralRate] = useState(100);
  const [teamRate, setTeamRate] = useState(100);
  const [overallRate, setOverallRate] = useState(100);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH ATTENDANCE RECORDS
  // ============================================================

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/my-records");
      const data = res.data || {};

      const loadedRecords = Array.isArray(data.records) ? data.records : [];

      setRecords(loadedRecords);

      setSummary({
        ...EMPTY_SUMMARY,
        ...(data.summary || {}),
      });

      const gen =
        data.generalPercentage ??
        data.summary?.generalTrack?.attendanceRate ??
        100;

      const tm =
        data.teamPercentage ?? data.summary?.teamTrack?.attendanceRate ?? 100;

      const ov = data.percentage ?? data.summary?.attendanceRate ?? 100;

      setGeneralRate(Number(gen) || 100);
      setTeamRate(Number(tm) || 100);
      setOverallRate(Number(ov) || 100);
    } catch (err) {
      console.error("Attendance fetch error:", err);

      setError(
        err.response?.data?.message || "Failed to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchRecords();
  }, []);

  // ============================================================
  // SAFE RATES
  // ============================================================

  const safeOverallRate = Number.isFinite(overallRate)
    ? overallRate.toFixed(1)
    : "100.0";

  const safeGeneralRate = Number.isFinite(generalRate)
    ? generalRate.toFixed(1)
    : "100.0";

  const safeTeamRate = Number.isFinite(teamRate)
    ? teamRate.toFixed(1)
    : "100.0";

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <Loader2 size={30} className="animate-spin text-[#1A3D63]" />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading your attendance portfolio...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RETURN
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div>
          <h1 className="text-2xl font-bold text-[#0A1931] sm:text-3xl">
            My Attendance Portfolio
          </h1>

          <p className="mt-1 text-sm text-[#7A7F85]">
            Separate tracking for General Cohort Sessions and Team Mentorship
            Meetings.
          </p>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />

            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">
                Unable to load attendance
              </p>

              <p className="mt-1 text-xs text-red-500">{error}</p>

              <button
                type="button"
                onClick={fetchRecords}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            ATTENDANCE RATES
        ====================================================== */}

        <div className="grid gap-5 sm:grid-cols-3">
          {/* GENERAL */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
                General Cohort Rate
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#1A3D63]">
                <Trophy size={20} />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-3xl font-black text-[#0A1931]">
                {safeGeneralRate}%
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">
                Experience Sharing, Contest & Lectures
              </p>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#1A3D63] transition-all duration-500"
                style={{
                  width: `${Math.min(
                    Math.max(Number(safeGeneralRate), 0),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* TEAM */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
                Team Mentorship Rate
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
                <Shield size={20} />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-3xl font-black text-purple-700">
                {safeTeamRate}%
              </h2>

              <p className="mt-1 text-xs text-[#7A7F85]">
                Daily Standups & Sunday Syncs
              </p>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(Number(safeTeamRate), 0), 100)}%`,
                }}
              />
            </div>
          </div>

          {/* OVERALL */}
          <div className="flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
                Overall Cumulative
              </span>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-50 text-green-700">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="mt-3">
              <h2 className="text-3xl font-black text-[#1A3D63]">
                {safeOverallRate}%
              </h2>

              <p className="mt-1 text-xs font-semibold text-green-600">
                {Number(safeOverallRate) >= 80
                  ? "Eligible for Certification"
                  : "Needs Improvement"}
              </p>
            </div>

            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  Number(safeOverallRate) >= 80 ? "bg-green-600" : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(
                    Math.max(Number(safeOverallRate), 0),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            CHECKS OVERVIEW
        ====================================================== */}

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <User size={18} className="text-[#1A3D63]" />

            <h3 className="text-base font-bold text-[#0A1931]">
              Checks Overview
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryItem label="Total Sessions" value={summary.totalSessions} />

            <SummaryItem label="Total Checks" value={summary.totalChecks} />

            <SummaryItem
              label="Attended Checks"
              value={summary.attendedChecks}
            />

            <SummaryItem label="Absent Checks" value={summary.absentChecks} />
          </div>
        </div>

        {/* ======================================================
            STATUS SUMMARY
        ====================================================== */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatusSummary
            icon={<CheckCircle2 size={18} />}
            label="Present"
            value={summary.presentChecks}
            className="text-green-600"
          />

          <StatusSummary
            icon={<Clock3 size={18} />}
            label="Late"
            value={summary.lateChecks}
            className="text-amber-600"
          />

          <StatusSummary
            icon={<XCircle size={18} />}
            label="Absent"
            value={summary.absentChecks}
            className="text-red-600"
          />

          <StatusSummary
            icon={<ShieldCheck size={18} />}
            label="Excused"
            value={summary.excusedChecks}
            className="text-blue-600"
          />
        </div>

        {/* ======================================================
            ATTENDANCE LOG
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 p-6">
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-[#1A3D63]" />

              <div>
                <h3 className="font-bold text-slate-800">Attendance Log</h3>

                <p className="text-xs text-gray-400">
                  All recorded checks across both tracks
                </p>
              </div>
            </div>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck size={35} className="mx-auto text-gray-200" />

              <p className="mt-3 text-sm font-semibold text-gray-500">
                No attendance records yet.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Your records will appear here after your mentor or admin marks
                attendance.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase text-gray-500">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Session Name</th>
                    <th className="px-6 py-4">Track Type</th>
                    <th className="px-6 py-4 text-center">First Check</th>
                    <th className="px-6 py-4 text-center">Second Check</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-xs">
                  {records.map((record, index) => (
                    <AttendanceTableRow
                      key={record._id || index}
                      record={record}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ATTENDANCE TABLE ROW
// ============================================================

const AttendanceTableRow = ({ record }) => {
  const rawDate = record?.date ? new Date(record.date) : null;

  const isValidDate = rawDate && !Number.isNaN(rawDate.getTime());

  const firstStatus = record?.firstCheck?.status || null;

  const secondStatus = record?.secondCheck?.status || null;

  let overallStatus = "Not Marked";

  if (firstStatus === "Absent" || secondStatus === "Absent") {
    overallStatus = "Absent";
  } else if (firstStatus === "Late" || secondStatus === "Late") {
    overallStatus = "Late";
  } else if (firstStatus === "Excused" || secondStatus === "Excused") {
    overallStatus = "Excused";
  } else if (firstStatus === "Present" || secondStatus === "Present") {
    overallStatus = "Present";
  }

  const type = record?.sessionType || "General Session";

  return (
    <tr className="transition-colors hover:bg-gray-50/80">
      {/* DATE */}
      <td className="whitespace-nowrap px-6 py-4">
        <div className="font-bold text-[#0A1931]">
          {isValidDate
            ? rawDate.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </div>

        {isValidDate && (
          <div className="font-medium text-[11px] text-gray-400">
            {rawDate.toLocaleDateString(undefined, {
              weekday: "long",
            })}
          </div>
        )}
      </td>

      {/* SESSION NAME */}
      <td className="px-6 py-4 font-bold text-slate-800">
        {record?.sessionName || record?.sessionType || "Attendance Session"}
      </td>

      {/* TRACK TYPE */}
      <td className="px-6 py-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            type === "Daily Standup" || type === "Daily Meeting"
              ? "bg-amber-100 text-amber-800"
              : type === "Sunday Meeting" || type === "Sunday Weekly Meeting"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-[#1A3D63]"
          }`}
        >
          {type}
        </span>
      </td>

      {/* FIRST CHECK */}
      <td className="px-6 py-4 text-center">
        <RecordStatus status={firstStatus} />
      </td>

      {/* SECOND CHECK */}
      <td className="px-6 py-4 text-center">
        <RecordStatus status={secondStatus} />
      </td>

      {/* OVERALL STATUS */}
      <td className="px-6 py-4 text-center">
        <OverallStatus status={overallStatus} />
      </td>
    </tr>
  );
};

// ============================================================
// RECORD STATUS
// ============================================================

const RecordStatus = ({ status }) => {
  const styles = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-amber-100 text-amber-700",
    Absent: "bg-red-100 text-red-700",
    Excused: "bg-blue-100 text-blue-700",
  };

  const displayStatus = status || "—";

  const statusStyle = styles[status] || "bg-gray-100 text-gray-400";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusStyle}`}
    >
      {displayStatus}
    </span>
  );
};

// ============================================================
// OVERALL STATUS
// ============================================================

const OverallStatus = ({ status }) => {
  const styles = {
    Present: "bg-green-100 text-green-700 border border-green-200",
    Late: "bg-amber-100 text-amber-700 border border-amber-200",
    Absent: "bg-red-100 text-red-700 border border-red-200",
    Excused: "bg-blue-100 text-blue-700 border border-blue-200",
    "Not Marked": "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
        styles[status] || styles["Not Marked"]
      }`}
    >
      {status}
    </span>
  );
};

// ============================================================
// SUMMARY ITEM
// ============================================================

const SummaryItem = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-[#F6FAFD] p-3.5">
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {label}
    </p>

    <p className="mt-1 text-xl font-black text-[#0A1931]">{value ?? 0}</p>
  </div>
);

// ============================================================
// STATUS SUMMARY
// ============================================================

const StatusSummary = ({ icon, label, value, className }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className={`mb-2 flex items-center gap-2 ${className}`}>
      {icon}

      <span className="text-xs font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>

    <p className="text-2xl font-black text-[#0A1931]">{value ?? 0}</p>
  </div>
);

export default StudentAttendance;
