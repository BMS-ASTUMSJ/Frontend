import React, { useState, useEffect, useCallback } from "react";

import Calendar from "react-calendar";

import {
  Calendar as CalIcon,
  Users,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import "react-calendar/dist/Calendar.css";

import api from "../../utils/api";

const STATUS_OPTIONS = ["Absent", "Present", "Late", "Excused"];

const formatDate = (date) => {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const MentorAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [sessionType, setSessionType] = useState("Contest");

  const [teamData, setTeamData] = useState({
    name: "",
    students: [],
  });

  const [statusMap, setStatusMap] = useState({});

  const [savingKey, setSavingKey] = useState(null);

  const [loadingTeam, setLoadingTeam] = useState(true);

  const [loadingRecords, setLoadingRecords] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const dateKey = formatDate(selectedDate);

  const fetchMyTeam = useCallback(async () => {
    setLoadingTeam(true);
    setError("");

    try {
      const res = await api.get("/attendance/my-team");

      setTeamData({
        name: res.data?.teamName || "",

        students: Array.isArray(res.data?.students) ? res.data.students : [],
      });
    } catch (err) {
      console.error("Failed to load mentor team:", err);

      setTeamData({
        name: "",
        students: [],
      });

      setError(
        err.response?.data?.message || "Failed to load your assigned team.",
      );
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const fetchTeamRecords = useCallback(async () => {
    if (loadingTeam) {
      return;
    }

    if (!teamData.students.length) {
      setStatusMap({});
      return;
    }

    setLoadingRecords(true);
    setError("");

    try {
      const res = await api.get("/attendance/team-records", {
        params: {
          date: dateKey,
          sessionType,
        },
      });

      const map = {};

      const records = Array.isArray(res.data?.records) ? res.data.records : [];

      records.forEach((record) => {
        const studentId =
          typeof record.studentId === "object"
            ? record.studentId?._id
            : record.studentId;

        if (!studentId) {
          return;
        }

        map[String(studentId)] = {
          first: record.firstCheck?.status || "Absent",

          second: record.secondCheck?.status || "Absent",
        };
      });

      setStatusMap(map);
    } catch (err) {
      console.error("Failed to load attendance records:", err);

      setStatusMap({});

      setError(
        err.response?.data?.message || "Failed to load attendance records.",
      );
    } finally {
      setLoadingRecords(false);
    }
  }, [dateKey, sessionType, loadingTeam, teamData.students.length]);

  useEffect(() => {
    fetchMyTeam();
  }, [fetchMyTeam]);

  useEffect(() => {
    if (!loadingTeam) {
      fetchTeamRecords();
    }
  }, [fetchTeamRecords, loadingTeam]);

  const handleMark = async (studentId, checkType, status) => {
    const normalizedStudentId = String(studentId);

    const key = `${normalizedStudentId}-${checkType}`;

    const previousStatus =
      statusMap[normalizedStudentId]?.[checkType] || "Absent";

    setError("");
    setSuccessMessage("");

    setStatusMap((prev) => ({
      ...prev,

      [normalizedStudentId]: {
        ...(prev[normalizedStudentId] || {}),

        [checkType]: status,
      },
    }));

    setSavingKey(key);

    try {
      await api.post("/attendance/mark", {
        studentId: normalizedStudentId,

        date: dateKey,

        sessionType,

        checkType,

        status,
      });

      setSuccessMessage("Attendance saved successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (err) {
      console.error("Failed to save attendance:", err);

      setStatusMap((prev) => ({
        ...prev,

        [normalizedStudentId]: {
          ...(prev[normalizedStudentId] || {}),

          [checkType]: previousStatus,
        },
      }));

      setError(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleRefresh = () => {
    setError("");
    fetchTeamRecords();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Mentor Attendance
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage attendance for students assigned to your team.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs font-semibold text-slate-600">
                Mentor Access
              </span>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-bold text-red-700">Attendance Error</p>

              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <Check size={18} className="text-emerald-600" />

            <p className="text-sm font-semibold text-emerald-700">
              {successMessage}
            </p>
          </div>
        )}

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}

          <div className="lg:col-span-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <CalIcon size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Attendance Settings
                    </h3>

                    <p className="text-xs text-slate-400">
                      Select date and session
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {/* CALENDAR */}

                <div className="attendance-calendar-wrapper">
                  <Calendar
                    onChange={(date) => {
                      setSelectedDate(date);
                      setError("");
                      setSuccessMessage("");
                    }}
                    value={selectedDate}
                  />
                </div>

                {/* SESSION */}

                <div className="mt-6">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Session Type
                  </label>

                  <select
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                    value={sessionType}
                    onChange={(e) => {
                      setSessionType(e.target.value);

                      setError("");
                      setSuccessMessage("");
                    }}
                  >
                    <option value="Contest">Weekly Contest</option>

                    <option value="Experience Sharing">
                      Experience Sharing
                    </option>
                  </select>
                </div>

                {/* DATE */}

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Selected Date
                  </p>

                  <p className="mt-1 text-sm font-bold text-indigo-900">
                    {selectedDate.toDateString()}
                  </p>

                  <p className="mt-1 text-xs text-indigo-500">{dateKey}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* TEAM HEADER */}

              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-5 text-white sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <Users size={21} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold sm:text-xl">
                        {teamData.name || "My Team"}
                      </h2>

                      <p className="mt-1 text-xs font-medium text-indigo-100">
                        Only mentors assigned to this team can mark attendance.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loadingRecords}
                    className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    <RefreshCw
                      size={14}
                      className={loadingRecords ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {/* TEAM LOADING */}

              {loadingTeam ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-10">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
                    <Loader2
                      size={22}
                      className="animate-spin text-indigo-600"
                    />
                  </div>

                  <p className="text-sm font-semibold text-slate-500">
                    Loading your team...
                  </p>
                </div>
              ) : teamData.students.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center p-10">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <Users size={24} className="text-slate-400" />
                  </div>

                  <p className="text-sm font-bold text-slate-600">
                    No team assigned
                  </p>

                  <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                    You don't have a team assigned yet. Contact an administrator
                    if you believe this is a mistake.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Student
                        </th>

                        <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          First 30m
                        </th>

                        <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          End 30m
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {teamData.students.map((student) => {
                        const studentId = String(student._id);

                        const studentStatus = statusMap[studentId] || {};

                        return (
                          <tr
                            key={studentId}
                            className="group transition hover:bg-slate-50/80"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                                  {student.firstName
                                    ?.charAt(0)
                                    ?.toUpperCase() || ""}

                                  {student.lastName?.charAt(0)?.toUpperCase() ||
                                    ""}
                                </div>

                                <div>
                                  <p className="font-bold text-slate-800">
                                    {student.firstName} {student.lastName}
                                  </p>

                                  {student.schoolId && (
                                    <p className="mt-0.5 text-xs text-slate-400">
                                      {student.schoolId}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-5 text-center">
                              <StatusDropdown
                                value={studentStatus.first || "Absent"}
                                saving={savingKey === `${studentId}-first`}
                                disabled={loadingRecords || savingKey !== null}
                                onChange={(value) =>
                                  handleMark(studentId, "first", value)
                                }
                              />
                            </td>

                            <td className="px-6 py-5 text-center">
                              <StatusDropdown
                                value={studentStatus.second || "Absent"}
                                saving={savingKey === `${studentId}-second`}
                                disabled={loadingRecords || savingKey !== null}
                                onChange={(value) =>
                                  handleMark(studentId, "second", value)
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {!loadingTeam && teamData.students.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-400">
                      {teamData.students.length}{" "}
                      {teamData.students.length === 1 ? "student" : "students"}{" "}
                      assigned
                    </p>

                    {loadingRecords && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
                        <Loader2 size={13} className="animate-spin" />
                        Loading attendance...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .attendance-calendar-wrapper {
          width: 100%;
        }

        .attendance-calendar-wrapper .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: transparent;
        }

        .attendance-calendar-wrapper .react-calendar__navigation {
          margin-bottom: 10px;
        }

        .attendance-calendar-wrapper .react-calendar__navigation button {
          min-width: 40px;
          border-radius: 10px;
          font-weight: 700;
          color: #334155;
          transition: all 0.2s ease;
        }

        .attendance-calendar-wrapper .react-calendar__navigation button:hover {
          background: #eef2ff;
          color: #4f46e5;
        }

        .attendance-calendar-wrapper .react-calendar__month-view__weekdays {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .attendance-calendar-wrapper .react-calendar__month-view__weekdays__weekday {
          padding: 10px 4px;
        }

        .attendance-calendar-wrapper .react-calendar__month-view__days button {
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          padding: 11px 5px;
          color: #475569;
          transition: all 0.2s ease;
        }

        .attendance-calendar-wrapper .react-calendar__month-view__days button:hover {
          background: #eef2ff;
          color: #4f46e5;
        }

        .attendance-calendar-wrapper .react-calendar__tile--now {
          background: #f1f5f9;
          color: #4f46e5;
          font-weight: 800;
        }

        .attendance-calendar-wrapper .react-calendar__tile--active {
          background: #4f46e5 !important;
          color: white !important;
          border-radius: 10px;
          font-weight: 800;
        }

        .attendance-calendar-wrapper .react-calendar__tile--active:hover {
          background: #4338ca !important;
        }

        .attendance-calendar-wrapper .react-calendar__month-view__days button:disabled {
          color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

const StatusDropdown = ({ value, onChange, saving, disabled }) => {
  const statusStyles = {
    Present:
      "border-emerald-200 bg-emerald-50 text-emerald-700 focus:ring-emerald-100",

    Absent: "border-red-200 bg-red-50 text-red-700 focus:ring-red-100",

    Late: "border-amber-200 bg-amber-50 text-amber-700 focus:ring-amber-100",

    Excused: "border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-100",
  };

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`
          min-w-[105px]
          cursor-pointer
          rounded-lg
          border
          px-3
          py-2
          text-xs
          font-bold
          outline-none
          transition
          focus:ring-4
          disabled:cursor-not-allowed
          disabled:opacity-50
          ${statusStyles[value] || statusStyles.Absent}
        `}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="flex h-6 w-6 items-center justify-center">
        {saving ? (
          <Loader2 size={15} className="animate-spin text-indigo-500" />
        ) : (
          <Check size={15} className="text-emerald-500" />
        )}
      </div>
    </div>
  );
};

export default MentorAttendance;
