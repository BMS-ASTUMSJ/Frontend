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
  BookOpen,
} from "lucide-react";

import api from "../../utils/api";

const EMPTY_SUMMARY = {
  totalSessions: 0,
  totalChecks: 0,
  attendedChecks: 0,
  absentChecks: 0,
  lateChecks: 0,
  excusedChecks: 0,
};

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);

  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [rate, setRate] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  // ============================================================
  // FETCH MY ATTENDANCE
  // ============================================================

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/my-records");

      const data = res.data || {};

      setRecords(Array.isArray(data.records) ? data.records : []);

      setSummary({
        ...EMPTY_SUMMARY,
        ...(data.summary || {}),
      });

      setRate(Number(data.percentage || 0));
    } catch (err) {
      console.error("Failed to load student attendance:", err);

      setError(
        err.response?.data?.message || "Failed to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-125 items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
            <Loader2 size={30} className="animate-spin text-indigo-600" />
          </div>

          <p className="mt-4 text-sm font-semibold text-gray-500">
            Loading your attendance...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
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
                onClick={fetchRecords}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ======================================================
            TOP SECTION
        ====================================================== */}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Attendance percentage */}

          <div className="rounded-3xl bg-indigo-700 p-8 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                  My Attendance Percentage
                </p>

                <h2 className="mt-2 text-5xl font-black">{rate.toFixed(1)}%</h2>
              </div>

              <ShieldCheck size={40} className="text-indigo-200" />
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${Math.min(Math.max(rate, 0), 100)}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-indigo-200">
              Present and Late checks count as attended.
            </p>
          </div>

          {/* Personal dashboard */}

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex h-full items-center justify-between">
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-indigo-600" />

                  <h3 className="text-lg font-bold text-gray-800">
                    Personal Dashboard
                  </h3>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  You can only see your own attendance records.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <SummaryItem label="Sessions" value={summary.totalSessions} />

                  <SummaryItem label="Checks" value={summary.totalChecks} />

                  <SummaryItem
                    label="Attended"
                    value={summary.attendedChecks}
                  />

                  <SummaryItem label="Absent" value={summary.absentChecks} />
                </div>
              </div>

              <User
                size={60}
                className="ml-5 hidden shrink-0 text-gray-100 sm:block"
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            STATUS SUMMARY
        ====================================================== */}

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatusSummary
            icon={<CheckCircle2 size={18} />}
            label="Present"
            value={Math.max(0, summary.attendedChecks - summary.lateChecks)}
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
            ATTENDANCE HISTORY
        ====================================================== */}

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-6">
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-indigo-600" />

              <h3 className="font-bold text-gray-700">Attendance History</h3>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Your personal attendance records
            </p>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck size={35} className="mx-auto text-gray-200" />

              <p className="mt-3 text-sm font-semibold text-gray-500">
                No attendance records yet.
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Your attendance will appear here after your mentor records it.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {records.map((record) => (
                <AttendanceRecord key={record._id} record={record} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ATTENDANCE RECORD
// ============================================================

const AttendanceRecord = ({ record }) => {
  const date = record.date ? new Date(record.date) : null;

  const firstStatus = record.firstCheck?.status || null;

  const secondStatus = record.secondCheck?.status || null;

  return (
    <div className="p-6 transition-colors hover:bg-gray-50">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        {/* Session information */}

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={19} />
            </div>

            <div>
              <p className="font-bold text-gray-800">
                {record.sessionName ||
                  record.sessionType ||
                  "Attendance Session"}
              </p>

              <p className="mt-1 text-xs font-medium text-gray-400">
                {date
                  ? date.toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown date"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {record.sessionType && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-indigo-600">
                {record.sessionType}
              </span>
            )}

            {record.gender && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-gray-500">
                {record.gender}
              </span>
            )}
          </div>
        </div>

        {/* Checks */}

        <div className="flex gap-6">
          <RecordStatus label="First Check" status={firstStatus} />

          <RecordStatus label="Second Check" status={secondStatus} />
        </div>
      </div>
    </div>
  );
};

// ============================================================
// SUMMARY ITEM
// ============================================================

const SummaryItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-black text-gray-800">{value ?? 0}</p>
  </div>
);

// ============================================================
// STATUS SUMMARY
// ============================================================

const StatusSummary = ({ icon, label, value, className }) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
    <div className={`mb-2 flex items-center gap-2 ${className}`}>
      {icon}

      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </div>

    <p className="text-2xl font-black text-gray-800">{value ?? 0}</p>
  </div>
);

// ============================================================
// RECORD STATUS
// ============================================================

const RecordStatus = ({ label, status }) => {
  const styles = {
    Present: "bg-green-100 text-green-700",
    Late: "bg-amber-100 text-amber-700",
    Absent: "bg-red-100 text-red-700",
    Excused: "bg-blue-100 text-blue-700",
  };

  const displayStatus = status || "Not Marked";

  const statusStyle = styles[status] || "bg-gray-100 text-gray-500";

  return (
    <div className="min-w-20 text-center">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusStyle}`}
      >
        {displayStatus}
      </span>
    </div>
  );
};

export default StudentAttendance;
