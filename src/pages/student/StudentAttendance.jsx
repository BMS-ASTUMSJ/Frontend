import { useEffect, useState } from "react";
import {
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
  CalendarDays,
  Trophy,
  Shield,
  TrendingUp,
  RefreshCw,
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

  useEffect(() => {
    fetchRecords();
  }, []);

  const safeOverallRate = Number.isFinite(overallRate)
    ? overallRate.toFixed(1)
    : "100.0";

  const safeGeneralRate = Number.isFinite(generalRate)
    ? generalRate.toFixed(1)
    : "100.0";

  const safeTeamRate = Number.isFinite(teamRate)
    ? teamRate.toFixed(1)
    : "100.0";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8FA] py-8">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
              <Loader2 size={30} className="animate-spin text-[#00A8CC]" />
            </div>

            <p className="mt-4 text-sm font-bold text-[#8FA3B0]">
              Loading your attendance...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] py-8">
      <div className="mx-auto max-w-7xl space-y-6 px-4">
        <div className="rounded-2xl border border-[#1b3c47] bg-linear-to-r from-[#071b23] via-[#0f2b34] to-[#1b3c47] p-6 shadow-lg md:p-8">
          <div className="flex items-center gap-5">
            <div className="rounded-xl bg-[#00A8CC] p-3 shadow-lg shadow-[#00A8CC]/20">
              <ShieldCheck size={28} className="text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                My Attendance
              </h1>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />

            <div className="flex-1">
              <p className="text-sm font-bold text-red-700">
                Unable to load attendance
              </p>

              <p className="mt-1 text-xs text-red-500">{error}</p>

              <button
                type="button"
                onClick={fetchRecords}
                className="mt-3 rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-xl">
          <div className="border-b border-[#F4F8FA] p-6 md:p-8">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-xl font-bold text-[#14222B]">
                  Attendance Performance
                </h2>
              </div>

              <button
                type="button"
                onClick={fetchRecords}
                disabled={loading}
                className="flex items-center gap-2 self-start text-[10px] font-bold uppercase tracking-widest text-[#00A8CC] transition hover:text-[#0088A6] disabled:opacity-50 md:self-auto"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh Attendance
              </button>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <AttendanceRateCard
                title="General Cohort Rate"
                value={safeGeneralRate}
                icon={<Trophy size={20} />}
                iconClass="bg-[#E3F5F9] text-[#00A8CC]"
                valueClass="text-[#14222B]"
                progressClass="bg-[#00A8CC]"
              />

              <AttendanceRateCard
                title="Team Mentorship Rate"
                value={safeTeamRate}
                icon={<Shield size={20} />}
                iconClass="bg-purple-50 text-purple-600"
                valueClass="text-purple-700"
                progressClass="bg-purple-600"
              />

              <AttendanceRateCard
                title="Overall Cumulative"
                value={safeOverallRate}
                description={
                  Number(safeOverallRate) >= 80
                    ? "Eligible for Certification"
                    : "Needs Improvement"
                }
                icon={<TrendingUp size={20} />}
                iconClass={
                  Number(safeOverallRate) >= 80
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }
                valueClass={
                  Number(safeOverallRate) >= 80
                    ? "text-emerald-600"
                    : "text-red-500"
                }
                progressClass={
                  Number(safeOverallRate) >= 80
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }
              />
            </div>
          </div>
          <div className="border-b border-[#F4F8FA] p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#14222B]">
                Checks Overview
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <SummaryItem
                label="Total Sessions"
                value={summary.totalSessions}
              />

              <SummaryItem label="Total Checks" value={summary.totalChecks} />

              <SummaryItem
                label="Attended Checks"
                value={summary.attendedChecks}
              />

              <SummaryItem label="Absent Checks" value={summary.absentChecks} />
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#14222B]">
                Attendance Directory
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-separate border-spacing-y-4 text-left">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8FA3B0]">
                    <th className="px-6 pb-2">Date</th>

                    <th className="px-6 pb-2">Session</th>

                    <th className="px-6 pb-2">Track Type</th>

                    <th className="px-6 pb-2 text-center">First Check</th>

                    <th className="px-6 pb-2 text-center">Second Check</th>

                    <th className="px-6 pb-2 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 py-20 text-center"
                      >
                        <ShieldCheck
                          size={36}
                          className="mx-auto mb-3 text-[#00A8CC]/40"
                        />

                        <p className="text-sm font-bold text-[#8FA3B0]">
                          No attendance records found.
                        </p>

                        <p className="mt-1 text-xs font-medium text-gray-400">
                          Your attendance will appear here once a session has
                          been recorded.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    records.map((record, index) => (
                      <AttendanceTableRow
                        key={record._id || index}
                        record={record}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AttendanceRateCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
  valueClass,
  progressClass,
}) => {
  const numericValue = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className="rounded-2xl border border-[#B4D7E2] bg-[#FDFEFF] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#8FA3B0]">
          {title}
        </span>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5">
        <h3 className={`text-3xl font-black ${valueClass}`}>{value}%</h3>

        <p className="mt-1 min-h-8 text-xs font-medium text-[#8FA3B0]">
          {description}
        </p>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[#EDF2F4]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${progressClass}`}
          style={{
            width: `${numericValue}%`,
          }}
        />
      </div>
    </div>
  );
};

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
    <tr className="group transition-transform hover:translate-x-1">
      <td className="rounded-l-2xl border-l-4 border-[#00A8CC] bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[#00A8CC]">
            <CalendarDays size={15} />
          </div>

          <div>
            <p className="text-[11px] font-bold text-[#14222B]">
              {isValidDate
                ? rawDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </p>

            {isValidDate && (
              <p className="mt-0.5 text-[10px] font-medium text-[#8FA3B0]">
                {rawDate.toLocaleDateString(undefined, {
                  weekday: "short",
                })}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F7F9] text-[#00A8CC]">
            <User size={13} />
          </div>

          <span className="max-w-45 truncate text-xs font-bold text-[#14222B]">
            {record?.sessionName || record?.sessionType || "Attendance Session"}
          </span>
        </div>
      </td>

      <td className="bg-white px-6 py-5 shadow-sm">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide ${
            type === "Daily Standup" || type === "Daily Meeting"
              ? "border-amber-200 bg-amber-50 text-amber-600"
              : type === "Sunday Meeting" || type === "Sunday Weekly Meeting"
                ? "border-purple-200 bg-purple-50 text-purple-600"
                : "border-[#B3E5FC] bg-[#E0F7FA] text-[#00A8CC]"
          }`}
        >
          {type}
        </span>
      </td>

      <td className="bg-white px-6 py-5 text-center shadow-sm">
        <RecordStatus status={firstStatus} />
      </td>

      <td className="bg-white px-6 py-5 text-center shadow-sm">
        <RecordStatus status={secondStatus} />
      </td>

      <td className="rounded-r-2xl bg-white px-6 py-5 text-center shadow-sm">
        <OverallStatus status={overallStatus} />
      </td>
    </tr>
  );
};

const RecordStatus = ({ status }) => {
  const styles = {
    Present: "border-emerald-200 bg-emerald-50 text-emerald-600",
    Late: "border-amber-200 bg-amber-50 text-amber-600",
    Absent: "border-red-200 bg-red-50 text-red-600",
    Excused: "border-blue-200 bg-blue-50 text-blue-600",
  };

  const displayStatus = status || "—";

  const statusStyle =
    styles[status] || "border-gray-200 bg-gray-50 text-gray-400";

  return (
    <span
      className={`inline-flex min-w-17.5 items-center justify-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide ${statusStyle}`}
    >
      {displayStatus}
    </span>
  );
};

const OverallStatus = ({ status }) => {
  const styles = {
    Present: "border-emerald-200 bg-emerald-50 text-emerald-600",
    Late: "border-amber-200 bg-amber-50 text-amber-600",
    Absent: "border-red-200 bg-red-50 text-red-600",
    Excused: "border-blue-200 bg-blue-50 text-blue-600",
    "Not Marked": "border-gray-200 bg-gray-50 text-gray-500",
  };

  return (
    <span
      className={`inline-flex min-w-21.25 items-center justify-center rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-wide ${
        styles[status] || styles["Not Marked"]
      }`}
    >
      {status}
    </span>
  );
};

const SummaryItem = ({ label, value }) => (
  <div className="rounded-2xl border border-[#B4D7E2] bg-[#F4F8FA] p-4 transition hover:border-[#00A8CC]/30">
    <p className="text-[9px] font-black uppercase tracking-wider text-[#8FA3B0]">
      {label}
    </p>

    <p className="mt-2 text-2xl font-black text-[#14222B]">{value ?? 0}</p>
  </div>
);

const StatusSummary = ({ icon, label, value, className, iconBg }) => (
  <div className="rounded-2xl border border-[#B4D7E2] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg} ${className}`}
      >
        {icon}
      </div>

      <span
        className={`text-[10px] font-black uppercase tracking-wider ${className}`}
      >
        {label}
      </span>
    </div>

    <p className="mt-4 text-2xl font-black text-[#14222B]">{value ?? 0}</p>
  </div>
);

export default StudentAttendance;
