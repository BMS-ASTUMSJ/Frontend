import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalIcon,
  Users,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
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
        const weeks = [...new Set(loadedSessions.map((s) => s.week))].sort(
          (a, b) => a - b,
        );

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

      setStatusMap((prev) => ({
        ...prev,
        [normalizedStudentId]: {
          ...(prev[normalizedStudentId] || {}),
          [checkType]: status,
        },
      }));

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
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    }

    if (percentage >= 60) {
      return "text-amber-600 bg-amber-50 border-amber-200";
    }

    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
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

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

            <div>
              <p className="text-sm font-bold text-red-700">Attendance Error</p>

              <p className="mt-1 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <Check size={18} className="text-emerald-600" />

            <p className="text-sm font-semibold text-emerald-700">
              {successMessage}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
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
                      Select week and session
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                {loadingSessions ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Loader2
                      size={22}
                      className="animate-spin text-indigo-600"
                    />

                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      Loading sessions...
                    </p>
                  </div>
                ) : availableWeeks.length === 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-xs font-bold text-amber-700">
                      No sessions configured yet
                    </p>

                    <p className="mt-1 text-xs text-amber-600">
                      Ask an admin to set up sessions for your batch.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Week
                      </label>

                      <select
                        value={selectedWeek ?? ""}
                        onChange={(e) => handleWeekChange(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      >
                        {availableWeeks.map((week) => (
                          <option key={week} value={week}>
                            Week {week}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                        Session
                      </label>

                      <select
                        value={selectedSessionId ?? ""}
                        onChange={(e) => handleSessionChange(e.target.value)}
                        className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                      >
                        {sessionsForWeek.map((session) => (
                          <option key={session._id} value={session._id}>
                            {session.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Session Type
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {selectedSession?.type || "—"}
                      </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                        Session Date
                      </p>

                      <p className="mt-1 text-sm font-bold text-indigo-900">
                        {selectedSession?.date
                          ? new Date(selectedSession.date).toDateString()
                          : "—"}
                      </p>
                    </div>
                  </>
                )}

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Team
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-700">
                    {teamData.name || "My Team"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-linear-to-r from-indigo-600 to-indigo-700 px-5 py-5 text-white sm:px-6">
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
                        {teamData.students.length}{" "}
                        {teamData.students.length === 1
                          ? "student"
                          : "students"}{" "}
                        assigned
                        {selectedSession ? ` · ${selectedSession.name}` : ""}
                      </p>
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
                    className="flex items-center justify-center gap-2 self-start rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
                  >
                    <RefreshCw
                      size={14}
                      className={
                        loadingTeam ||
                        loadingRecords ||
                        loadingSessions ||
                        loadingSummary
                          ? "animate-spin"
                          : ""
                      }
                    />
                    Refresh
                  </button>
                </div>
              </div>

              {loadingTeam ? (
                <div className="flex min-h-75 flex-col items-center justify-center p-10">
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
                <div className="flex min-h-75 flex-col items-center justify-center p-10">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <Users size={24} className="text-slate-400" />
                  </div>

                  <p className="text-sm font-bold text-slate-600">
                    No team assigned
                  </p>

                  <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                    You don't have a team assigned yet.
                  </p>
                </div>
              ) : !selectedSessionId ? (
                <div className="flex min-h-75 flex-col items-center justify-center p-10">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                    <CalIcon size={24} className="text-slate-400" />
                  </div>

                  <p className="text-sm font-bold text-slate-600">
                    No session selected
                  </p>

                  <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
                    Choose a week and session to mark attendance.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-175">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Student
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
                            </td>

                            <td className="px-6 py-5 text-center">
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

        {!loadingTeam && teamData.students.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    All Students Attendance
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Overall attendance for all students assigned to your team.
                  </p>
                </div>

                {loadingSummary && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500">
                    <Loader2 size={15} className="animate-spin" />
                    Loading attendance summary...
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
                <Users size={34} className="mx-auto text-slate-300" />

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  No attendance records available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
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
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
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

            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
              <p className="text-xs text-slate-500">
                Attendance percentage is calculated from marked checks, with
                Present and Late counted as attended.
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
