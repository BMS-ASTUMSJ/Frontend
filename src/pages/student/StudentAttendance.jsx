import { useState, useEffect } from "react";

import {
  ShieldCheck,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import api from "../../utils/api";

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);

  const [summary, setSummary] = useState({
    totalSessions: 0,
    totalChecks: 0,
    attendedChecks: 0,
    absentChecks: 0,
    lateChecks: 0,
    excusedChecks: 0,
  });

  const [rate, setRate] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/attendance/my-records");

      setRecords(Array.isArray(res.data?.records) ? res.data.records : []);

      setSummary(
        res.data?.summary || {
          totalSessions: 0,
          totalChecks: 0,
          attendedChecks: 0,
          absentChecks: 0,
          lateChecks: 0,
          excusedChecks: 0,
        },
      );

      setRate(Number(res.data?.percentage || 0));
    } catch (err) {
      console.error("Failed to load student attendance:", err);

      setError(
        err.response?.data?.message || "Failed to load attendance records.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-125 items-center justify-center">
        <div className="text-center">
          <Loader2 size={35} className="mx-auto animate-spin text-indigo-600" />

          <p className="mt-3 text-sm font-semibold text-gray-500">
            Loading your attendance...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />

            <div>
              <p className="text-sm font-bold text-red-700">
                Unable to load attendance
              </p>

              <p className="mt-1 text-xs text-red-500">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-indigo-700 p-8 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-200">
                  My Attendance Percentage
                </p>

                <h2 className="mt-2 text-5xl font-black">{rate}%</h2>
              </div>

              <ShieldCheck size={40} className="text-indigo-200" />
            </div>

            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${Math.min(rate, 100)}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-indigo-200">
              Present and Late checks count as attended.
            </p>
          </div>

          <div className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex h-full items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Personal Dashboard
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  You can only see your own attendance records.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-2">
                  <SummaryItem label="Sessions" value={summary.totalSessions} />

                  <SummaryItem label="Checks" value={summary.totalChecks} />

                  <SummaryItem
                    label="Attended"
                    value={summary.attendedChecks}
                  />

                  <SummaryItem label="Absent" value={summary.absentChecks} />
                </div>
              </div>

              <User size={60} className="hidden text-gray-100 sm:block" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatusSummary
            icon={<CheckCircle2 size={18} />}
            label="Present"
            value={summary.attendedChecks - summary.lateChecks}
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

        <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h3 className="font-bold text-gray-700">Attendance History</h3>

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
            </div>
          ) : (
            <div className="divide-y">
              {records.map((record) => (
                <div
                  key={record._id}
                  className="flex flex-col gap-5 p-6 transition-colors hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                >
                  {/* DATE */}

                  <div>
                    <p className="font-bold text-gray-800">
                      {new Date(record.date).toDateString()}
                    </p>

                    <p className="mt-1 text-xs font-bold uppercase text-indigo-600">
                      {record.sessionType}
                    </p>
                  </div>

                  {/* CHECKS */}

                  <div className="flex gap-6">
                    <RecordStatus
                      label="Start Check"
                      status={record.firstCheck?.status || "Absent"}
                    />

                    <RecordStatus
                      label="End Check"
                      status={record.secondCheck?.status || "Absent"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-black text-gray-800">{value ?? 0}</p>
  </div>
);

const StatusSummary = ({ icon, label, value, className }) => (
  <div className="rounded-2xl border bg-white p-5 shadow-sm">
    <div className={`mb-2 flex items-center gap-2 ${className}`}>
      {icon}

      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </div>

    <p className="text-2xl font-black text-gray-800">{value ?? 0}</p>
  </div>
);

const RecordStatus = ({ label, status }) => {
  const styles = {
    Present: "bg-green-100 text-green-700",

    Late: "bg-amber-100 text-amber-700",

    Absent: "bg-red-100 text-red-700",

    Excused: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="text-center">
      <p className="mb-1 text-[10px] font-bold uppercase text-gray-400">
        {label}
      </p>

      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${
          styles[status] || styles.Absent
        }`}
      >
        {status}
      </span>
    </div>
  );
};

export default StudentAttendance;
