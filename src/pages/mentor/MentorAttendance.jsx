import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalIcon,
  Users,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
} from "lucide-react";
import api from "../../utils/api";

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Excused"];

const MentorAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [selectedWeek, setSelectedWeek] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [teamData, setTeamData] = useState({
    name: "",
    teamId: null,
    students: [],
  });

  const [statusMap, setStatusMap] = useState({});
  const [savingKey, setSavingKey] = useState(null);

  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableWeeks = useMemo(() => {
    const weeks = [...new Set(sessions.map((session) => session.week))];

    return weeks.sort((a, b) => a - b);
  }, [sessions]);

  const sessionsForWeek = useMemo(() => {
    if (selectedWeek === null) {
      return [];
    }

    return sessions
      .filter((session) => session.week === selectedWeek)
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type.localeCompare(b.type);
        }

        return a.order - b.order;
      });
  }, [sessions, selectedWeek]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session._id === selectedSessionId) || null,
    [sessions, selectedSessionId],
  );

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true);
    setError("");

    try {
      const res = await api.get("/sessions/my-team");

      const loadedSessions = Array.isArray(res.data?.sessions)
        ? res.data.sessions
        : [];

      setSessions(loadedSessions);

      if (loadedSessions.length > 0) {
        const weeks = [
          ...new Set(loadedSessions.map((session) => session.week)),
        ].sort((a, b) => a - b);

        const latestWeek = weeks[weeks.length - 1];

        setSelectedWeek((prev) => (prev === null ? latestWeek : prev));
      }
    } catch (err) {
      console.error("FAILED TO LOAD SESSIONS:", err);

      setSessions([]);

      setError(
        err.response?.data?.message ||
          "Failed to load sessions for your batch.",
      );
    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const fetchMyTeam = useCallback(async () => {
    setLoadingTeam(true);
    setError("");

    try {
      const res = await api.get("/attendance/my-team");

      const students = Array.isArray(res.data?.students)
        ? res.data.students
        : [];

      setTeamData({
        name: res.data?.teamName || res.data?.team?.name || "My Team",
        teamId: res.data?.teamId || res.data?.team?._id || null,
        students,
      });
    } catch (err) {
      console.error("FAILED TO LOAD TEAM:", err);

      setTeamData({
        name: "",
        teamId: null,
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
    if (loadingTeam || !selectedSessionId) {
      setStatusMap({});
      return;
    }

    if (!teamData.teamId) {
      setStatusMap({});
      return;
    }

    setLoadingRecords(true);
    setError("");

    try {
      const res = await api.get("/attendance/team-records", {
        params: {
          sessionId: selectedSessionId,
        },
      });

      const records = Array.isArray(res.data?.records) ? res.data.records : [];

      const map = {};

      records.forEach((record) => {
        const studentId =
          typeof record.studentId === "object"
            ? record.studentId?._id
            : record.studentId;

        if (!studentId) {
          return;
        }

        map[String(studentId)] = {
          first: record.firstCheck?.status || "",
          second: record.secondCheck?.status || "",
        };
      });

      setStatusMap(map);
    } catch (err) {
      console.error("FAILED TO LOAD ATTENDANCE:", err);

      setStatusMap({});

      setError(
        err.response?.data?.message || "Failed to load attendance records.",
      );
    } finally {
      setLoadingRecords(false);
    }
  }, [selectedSessionId, loadingTeam, teamData.teamId]);

  const fetchAttendanceSummary = useCallback(async () => {
    if (
      loadingTeam ||
      loadingSessions ||
      !teamData.teamId ||
      teamData.students.length === 0 ||
      sessions.length === 0
    ) {
      setAttendanceSummary([]);
      return;
    }

    setLoadingSummary(true);

    try {
      const sessionResults = await Promise.all(
        sessions.map(async (session) => {
          try {
            const res = await api.get("/attendance/team-records", {
              params: {
                sessionId: session._id,
              },
            });

            return {
              sessionId: session._id,
              records: Array.isArray(res.data?.records) ? res.data.records : [],
            };
          } catch (err) {
            console.error(`FAILED TO LOAD SESSION ${session._id}:`, err);

            return {
              sessionId: session._id,
              records: [],
            };
          }
        }),
      );

      const summaryMap = {};

      teamData.students.forEach((student) => {
        const studentId = String(student._id);

        summaryMap[studentId] = {
          student,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          marked: 0,
          totalChecks: sessions.length * 2,
        };
      });

      sessionResults.forEach(({ records }) => {
        records.forEach((record) => {
          const studentId =
            typeof record.studentId === "object"
              ? record.studentId?._id
              : record.studentId;

          if (!studentId) {
            return;
          }

          const normalizedId = String(studentId);

          if (!summaryMap[normalizedId]) {
            return;
          }

          const statuses = [
            record.firstCheck?.status || "",
            record.secondCheck?.status || "",
          ];

          statuses.forEach((status) => {
            if (!status) {
              return;
            }

            summaryMap[normalizedId].marked += 1;

            if (status === "Present") {
              summaryMap[normalizedId].present += 1;
            }

            if (status === "Absent") {
              summaryMap[normalizedId].absent += 1;
            }

            if (status === "Late") {
              summaryMap[normalizedId].late += 1;
            }

            if (status === "Excused") {
              summaryMap[normalizedId].excused += 1;
            }
          });
        });
      });

      const summary = Object.values(summaryMap).map((item) => {
        const attendanceCount = item.present + item.late;

        const percentage =
          item.marked > 0 ? (attendanceCount / item.marked) * 100 : 0;

        return {
          ...item,
          attendanceCount,
          percentage: Number(percentage.toFixed(1)),
        };
      });

      setAttendanceSummary(summary);
    } catch (err) {
      console.error("FAILED TO LOAD ATTENDANCE SUMMARY:", err);

      setAttendanceSummary([]);
    } finally {
      setLoadingSummary(false);
    }
  }, [
    loadingTeam,
    loadingSessions,
    teamData.teamId,
    teamData.students,
    sessions,
  ]);

  useEffect(() => {
    fetchMyTeam();
    fetchSessions();
  }, [fetchMyTeam, fetchSessions]);

  useEffect(() => {
    if (sessionsForWeek.length === 0) {
      setSelectedSessionId(null);
      return;
    }

    const stillValid = sessionsForWeek.some(
      (session) => session._id === selectedSessionId,
    );

    if (!stillValid) {
      setSelectedSessionId(sessionsForWeek[0]._id);
    }
  }, [sessionsForWeek, selectedSessionId]);

  useEffect(() => {
    if (!loadingTeam && teamData.teamId && selectedSessionId) {
      fetchTeamRecords();
    }
  }, [loadingTeam, teamData.teamId, selectedSessionId, fetchTeamRecords]);

  useEffect(() => {
    if (
      !loadingTeam &&
      !loadingSessions &&
      teamData.teamId &&
      teamData.students.length > 0 &&
      sessions.length > 0
    ) {
      fetchAttendanceSummary();
    }
  }, [
    loadingTeam,
    loadingSessions,
    teamData.teamId,
    teamData.students.length,
    sessions.length,
    fetchAttendanceSummary,
  ]);

  const handleWeekChange = (value) => {
    setSelectedWeek(Number(value));
    setStatusMap({});
    setError("");
    setSuccessMessage("");
  };

  const handleSessionChange = (value) => {
    setSelectedSessionId(value);
    setStatusMap({});
    setError("");
    setSuccessMessage("");
  };

  const handleMark = async (studentId, checkType, status) => {
    if (!studentId) {
      setError("Invalid student ID.");
      return;
    }

    if (!teamData.teamId) {
      setError("Your team could not be identified.");
      return;
    }

    if (!selectedSessionId) {
      setError("Select a session first.");
      return;
    }

    if (!status) {
      return;
    }

    const normalizedStudentId = String(studentId);

    const key = `${normalizedStudentId}-${checkType}`;

    const previousStatus = statusMap[normalizedStudentId]?.[checkType] || "";

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
      const payload = {
        studentId: normalizedStudentId,
        sessionId: selectedSessionId,
        checkType,
        status,
      };

      const response = await api.post("/attendance/mark", payload);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Attendance could not be saved.",
        );
      }

      setSuccessMessage(`${status} attendance saved successfully.`);

      setTimeout(() => {
        setSuccessMessage("");
      }, 2000);

      await fetchAttendanceSummary();
    } catch (err) {
      console.error("ATTENDANCE SAVE ERROR:", err);

      setStatusMap((prev) => ({
        ...prev,
        [normalizedStudentId]: {
          ...(prev[normalizedStudentId] || {}),
          [checkType]: previousStatus,
        },
      }));

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to save attendance.",
      );
    } finally {
      setSavingKey(null);
    }
  };

  const handleRefresh = async () => {
    setError("");
    setSuccessMessage("");

    await Promise.all([fetchMyTeam(), fetchSessions()]);
  };

  const getPercentageClass = (percentage) => {
    if (percentage >= 80) {
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    }

    if (percentage >= 60) {
      return "text-amber-700 bg-amber-50 border-amber-200";
    }

    return "text-red-700 bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* PAGE HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <ClipboardCheck size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Mentor Attendance
                </h1>

                <p className="mt-0.5 text-sm text-slate-500">
                  Mark and monitor attendance for your team.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={
              loadingTeam ||
              loadingSessions ||
              loadingRecords ||
              loadingSummary ||
              savingKey !== null
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                loadingTeam ||
                loadingSessions ||
                loadingRecords ||
                loadingSummary
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-bold text-red-700">Attendance Error</p>

              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Check size={18} className="text-emerald-600" />

            <p className="text-sm font-semibold text-emerald-700">
              {successMessage}
            </p>
          </div>
        )}

        {/* SETTINGS + TEAM INFO */}
        <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* SETTINGS */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CalIcon size={19} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Attendance Session
                  </h2>

                  <p className="text-xs text-slate-400">
                    Select the week and session you want to mark.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Week
                </label>

                {loadingSessions ? (
                  <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-slate-500">
                    <Loader2 size={15} className="animate-spin" />
                    Loading weeks...
                  </div>
                ) : (
                  <select
                    value={selectedWeek ?? ""}
                    onChange={(e) => handleWeekChange(e.target.value)}
                    className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  >
                    {availableWeeks.length === 0 ? (
                      <option value="">No weeks available</option>
                    ) : (
                      availableWeeks.map((week) => (
                        <option key={week} value={week}>
                          Week {week}
                        </option>
                      ))
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Session
                </label>

                <select
                  value={selectedSessionId ?? ""}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  disabled={sessionsForWeek.length === 0}
                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sessionsForWeek.length === 0 ? (
                    <option value="">No sessions available</option>
                  ) : (
                    sessionsForWeek.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Session Type
                </p>

                <p className="mt-1 text-sm font-bold text-slate-700">
                  {selectedSession?.type || "—"}
                </p>
              </div>

              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                  Session Date
                </p>

                <p className="mt-1 text-sm font-bold text-indigo-900">
                  {selectedSession?.date
                    ? new Date(selectedSession.date).toDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* TEAM CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Users size={19} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">My Team</h2>

                  <p className="text-xs text-slate-400">
                    Your assigned students
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5">
              <p className="text-lg font-bold text-slate-900">
                {teamData.name || "My Team"}
              </p>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-semibold text-slate-500">
                  Students
                </span>

                <span className="text-lg font-bold text-indigo-600">
                  {teamData.students.length}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-xs font-semibold text-slate-500">
                  Current Session
                </span>

                <span className="max-w-32 truncate text-xs font-bold text-slate-700">
                  {selectedSession?.name || "None"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE MARKING TABLE */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Mark Attendance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedSession
                  ? `${selectedSession.name} · ${teamData.name || "My Team"}`
                  : "Select a session to begin marking attendance."}
              </p>
            </div>

            {loadingRecords && (
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                <Loader2 size={15} className="animate-spin" />
                Loading records...
              </div>
            )}
          </div>

          {loadingTeam ? (
            <div className="flex min-h-64 flex-col items-center justify-center">
              <Loader2 size={26} className="animate-spin text-indigo-600" />

              <p className="mt-3 text-sm font-semibold text-slate-500">
                Loading your team...
              </p>
            </div>
          ) : teamData.students.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6">
              <Users size={32} className="text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-600">
                No students assigned
              </p>

              <p className="mt-1 text-xs text-slate-400">
                You don't have any students assigned to your team.
              </p>
            </div>
          ) : !selectedSessionId ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6">
              <CalIcon size={32} className="text-slate-300" />

              <p className="mt-3 text-sm font-bold text-slate-600">
                No session selected
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Choose a week and session above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="w-[40%] px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="w-[30%] px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <div>
                        <p>First Check</p>
                        <p className="mt-0.5 text-[9px] font-medium normal-case tracking-normal text-slate-400">
                          Morning / First attendance
                        </p>
                      </div>
                    </th>

                    <th className="w-[30%] px-6 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <div>
                        <p>Second Check</p>
                        <p className="mt-0.5 text-[9px] font-medium normal-case tracking-normal text-slate-400">
                          Afternoon / Second attendance
                        </p>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {teamData.students.map((student, index) => {
                    const studentId = String(student._id);

                    const studentStatus = statusMap[studentId] || {};

                    return (
                      <tr
                        key={studentId}
                        className="transition hover:bg-slate-50"
                      >
                        {/* STUDENT */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                              {student.firstName?.charAt(0)?.toUpperCase() ||
                                ""}

                              {student.lastName?.charAt(0)?.toUpperCase() || ""}
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

                        {/* FIRST CHECK */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <StatusDropdown
                              value={studentStatus.first || ""}
                              saving={savingKey === `${studentId}-first`}
                              disabled={
                                loadingRecords ||
                                (savingKey !== null &&
                                  savingKey !== `${studentId}-first`)
                              }
                              onChange={(value) =>
                                handleMark(studentId, "first", value)
                              }
                            />
                          </div>
                        </td>

                        {/* SECOND CHECK */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <StatusDropdown
                              value={studentStatus.second || ""}
                              saving={savingKey === `${studentId}-second`}
                              disabled={
                                loadingRecords ||
                                (savingKey !== null &&
                                  savingKey !== `${studentId}-second`)
                              }
                              onChange={(value) =>
                                handleMark(studentId, "second", value)
                              }
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loadingTeam &&
            teamData.students.length > 0 &&
            selectedSessionId && (
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3">
                <p className="text-xs font-medium text-slate-500">
                  {teamData.students.length}{" "}
                  {teamData.students.length === 1 ? "student" : "students"}
                </p>

                <p className="text-[11px] text-slate-400">
                  Changes are saved automatically.
                </p>
              </div>
            )}
        </div>

        {/* SUMMARY TABLE */}
        {!loadingTeam && teamData.students.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Attendance Overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Overall attendance across all configured sessions.
                  </p>
                </div>

                {loadingSummary && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                    <Loader2 size={15} className="animate-spin" />
                    Updating summary...
                  </div>
                )}
              </div>
            </div>

            {loadingSummary ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={28} className="animate-spin text-indigo-600" />
              </div>
            ) : attendanceSummary.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users size={32} className="mx-auto text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  No attendance records available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                        Present
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-amber-600">
                        Late
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-red-600">
                        Absent
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Excused
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Marked
                      </th>

                      <th className="px-5 py-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Attendance
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {attendanceSummary.map((item) => {
                      const student = item.student;

                      const studentId = String(student._id);

                      return (
                        <tr
                          key={studentId}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                                {student.firstName?.charAt(0)?.toUpperCase() ||
                                  ""}

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

                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-emerald-600">
                              {item.present}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-amber-600">
                              {item.late}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-red-600">
                              {item.absent}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="font-bold text-blue-600">
                              {item.excused}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span className="font-semibold text-slate-600">
                              {item.marked}/{item.totalChecks}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex min-w-20 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold ${getPercentageClass(
                                item.percentage,
                              )}`}
                            >
                              {item.percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t border-slate-100 bg-slate-50 px-5 py-3">
              <p className="text-xs text-slate-500">
                Present and Late count as attended. Attendance percentage is
                calculated using marked checks.
              </p>
            </div>
          </div>
        )}
      </div>
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

    "": "border-slate-200 bg-slate-50 text-slate-500 focus:ring-slate-100",
  };

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`
          min-w-32
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
          ${statusStyles[value || ""] || statusStyles[""]}
        `}
      >
        <option value="">Not marked</option>

        {STATUS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="flex h-6 w-6 items-center justify-center">
        {saving && (
          <Loader2 size={15} className="animate-spin text-indigo-500" />
        )}

        {!saving && value && <Check size={15} className="text-emerald-500" />}
      </div>
    </div>
  );
};

export default MentorAttendance;
