import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  Send,
  CheckCheck,
  Sun,
  CalendarDays,
  Layers,
  TrendingUp,
  BarChart3,
  Activity,
} from "lucide-react";
import api from "../../utils/api";

const STATUS_OPTIONS = ["Present", "Absent", "Late", "Excused"];

const DAYS_OF_WEEK = [
  { name: "Monday", short: "Mon", type: "Daily Meeting", icon: Sun },
  { name: "Tuesday", short: "Tue", type: "Daily Meeting", icon: Sun },
  { name: "Wednesday", short: "Wed", type: "Daily Meeting", icon: Sun },
  { name: "Thursday", short: "Thu", type: "Daily Meeting", icon: Sun },
  { name: "Friday", short: "Fri", type: "Daily Meeting", icon: Sun },
  { name: "Saturday", short: "Sat", type: "Daily Meeting", icon: Sun },
  {
    name: "Sunday",
    short: "Sun",
    type: "Sunday Weekly Meeting",
    icon: CalendarDays,
  },
];

const getAttendanceValue = (status) => {
  switch (status) {
    case "Present":
      return 1;
    case "Late":
      return 0.5;
    case "Absent":
      return 0;
    case "Excused":
      return null;
    default:
      return null;
  }
};

const calculatePercentage = (statuses) => {
  let totalPoints = 0;
  let countedChecks = 0;

  statuses.forEach((status) => {
    const value = getAttendanceValue(status);

    if (value === null) return;

    totalPoints += value;
    countedChecks += 1;
  });

  if (countedChecks === 0) return 0;

  return Math.round((totalPoints / countedChecks) * 100);
};

const getStatusClasses = (status) => {
  switch (status) {
    case "Present":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Absent":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "Late":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Excused":
      return "border-violet-200 bg-violet-50 text-violet-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

const getInitials = (student) => {
  return (
    `${student?.firstName?.[0] || ""}${student?.lastName?.[0] || ""}`.toUpperCase() ||
    "ST"
  );
};

const MentorAttendance = () => {
  const [attendanceMode, setAttendanceMode] = useState("main");

  const [mainSessions, setMainSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [selectedMainSessionId, setSelectedMainSessionId] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");

  const [teamData, setTeamData] = useState({
    name: "",
    teamId: null,
    students: [],
  });

  const [statusMap, setStatusMap] = useState({});
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [submittingSheet, setSubmittingSheet] = useState(false);

  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const availableMainWeeks = useMemo(() => {
    const weeks = [...new Set(mainSessions.map((s) => s.week))];

    return weeks.sort((a, b) => a - b);
  }, [mainSessions]);

  const mainSessionsForWeek = useMemo(() => {
    return mainSessions
      .filter((s) => Number(s.week) === Number(selectedWeek))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [mainSessions, selectedWeek]);
  const selectedMainSession = useMemo(
    () =>
      mainSessions.find(
        (s) => String(s._id) === String(selectedMainSessionId),
      ) || null,
    [mainSessions, selectedMainSessionId],
  );

  const fetchMainSessions = useCallback(async () => {
    setLoadingSessions(true);

    try {
      const res = await api.get("/sessions/my-team");

      const loaded = Array.isArray(res.data?.sessions) ? res.data.sessions : [];

      setMainSessions(loaded);

      if (loaded.length > 0) {
        const weeks = [...new Set(loaded.map((s) => Number(s.week)))].sort(
          (a, b) => a - b,
        );

        setSelectedWeek((prev) => {
          if (weeks.includes(Number(prev))) {
            return Number(prev);
          }

          return weeks[0];
        });
      }
    } catch (err) {
      console.error("Failed to load main sessions:", err);
      setMainSessions([]);
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
        name: res.data?.teamName || "My Team",
        teamId: res.data?.teamId || null,
        students,
      });
    } catch (err) {
      console.error("Failed to load team:", err);

      setTeamData({
        name: "",
        teamId: null,
        students: [],
      });

      setError("Failed to load your assigned team.");
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const fetchRecordsForCurrentSelection = useCallback(async () => {
    if (teamData.students.length === 0) {
      setStatusMap({});
      return;
    }

    setLoadingRecords(true);
    setError("");

    try {
      let params = {};

      if (attendanceMode === "main") {
        if (!selectedMainSessionId) {
          setStatusMap({});
          setLoadingRecords(false);
          return;
        }

        params.sessionId = selectedMainSessionId;
      } else {
        params.week = selectedWeek;
        params.dayName = selectedDay;
      }

      const res = await api.get("/attendance/team-records", {
        params,
      });

      const records = Array.isArray(res.data?.records) ? res.data.records : [];

      const map = {};

      records.forEach((record) => {
        const studentId = String(record.studentId?._id || record.studentId);

        map[studentId] = {
          first: record.firstCheck?.status || "Present",
          second: record.secondCheck?.status || "Present",
        };
      });

      teamData.students.forEach((student) => {
        const studentId = String(student._id);

        if (!map[studentId]) {
          map[studentId] = {
            first: "Present",
            second: "Present",
          };
        }
      });

      setStatusMap(map);
    } catch (err) {
      console.error("Failed to load attendance records:", err);
      setStatusMap({});
    } finally {
      setLoadingRecords(false);
    }
  }, [
    attendanceMode,
    selectedMainSessionId,
    selectedWeek,
    selectedDay,
    teamData.students,
  ]);

  const fetchAllTeamRecords = useCallback(async () => {
    try {
      const res = await api.get("/attendance/team-records");

      const records = Array.isArray(res.data?.records) ? res.data.records : [];

      setAllAttendanceRecords(records);
    } catch (err) {
      console.error("Failed to load all attendance records:", err);
      setAllAttendanceRecords([]);
    }
  }, []);

  useEffect(() => {
    fetchMyTeam();
    fetchMainSessions();
  }, [fetchMyTeam, fetchMainSessions]);

  useEffect(() => {
    if (attendanceMode === "main" && mainSessionsForWeek.length > 0) {
      const stillValid = mainSessionsForWeek.some(
        (session) => String(session._id) === String(selectedMainSessionId),
      );

      if (!stillValid) {
        setSelectedMainSessionId(mainSessionsForWeek[0]._id);
      }
    }

    if (attendanceMode === "main" && mainSessionsForWeek.length === 0) {
      setSelectedMainSessionId(null);
    }
  }, [attendanceMode, mainSessionsForWeek, selectedMainSessionId]);

  useEffect(() => {
    if (teamData.students.length > 0) {
      fetchRecordsForCurrentSelection();
      fetchAllTeamRecords();
    }
  }, [
    attendanceMode,
    teamData.students.length,
    selectedWeek,
    selectedDay,
    selectedMainSessionId,
    fetchRecordsForCurrentSelection,
    fetchAllTeamRecords,
  ]);

  const handleLocalChange = (studentId, checkType, status) => {
    const sId = String(studentId);

    setStatusMap((prev) => ({
      ...prev,
      [sId]: {
        ...(prev[sId] || {
          first: "Present",
          second: "Present",
        }),
        [checkType]: status,
      },
    }));
  };

  const handleMarkAllPresent = () => {
    const newMap = {};

    teamData.students.forEach((student) => {
      const studentId = String(student._id);

      newMap[studentId] = {
        first: "Present",
        second: "Present",
      };
    });

    setStatusMap(newMap);

    setSuccessMessage(
      "All students are set to Present. Click Submit Attendance Sheet to save.",
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleSubmitAttendance = async () => {
    if (teamData.students.length === 0) {
      setError("No students in your team.");
      return;
    }

    if (attendanceMode === "main" && !selectedMainSessionId) {
      setError("Please select a valid main session first.");
      return;
    }

    try {
      setSubmittingSheet(true);
      setError("");
      setSuccessMessage("");

      const attendanceList = teamData.students.map((student) => {
        const studentId = String(student._id);

        const currentStatus = statusMap[studentId] || {
          first: "Present",
          second: "Present",
        };

        return {
          studentId,
          firstCheck: currentStatus.first || "Present",
          secondCheck: currentStatus.second || "Present",
        };
      });

      const payload =
        attendanceMode === "main"
          ? {
              sessionId: selectedMainSessionId,
              attendanceList,
            }
          : {
              week: selectedWeek,
              dayName: selectedDay,
              meetingType:
                selectedDay === "Sunday"
                  ? "Sunday Weekly Meeting"
                  : "Daily Meeting",
              attendanceList,
            };

      const response = await api.post("/attendance/mark-bulk", payload);

      setSuccessMessage(
        response.data?.message || "Attendance sheet submitted successfully!",
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      await fetchAllTeamRecords();
      await fetchRecordsForCurrentSelection();
    } catch (err) {
      console.error("Submit attendance error:", err);

      setError(
        err.response?.data?.message || "Failed to submit attendance sheet.",
      );
    } finally {
      setSubmittingSheet(false);
    }
  };

  const summary = useMemo(() => {
    return teamData.students.map((student) => {
      const studentId = String(student._id);

      const studentRecords = allAttendanceRecords.filter(
        (record) =>
          String(record.studentId?._id || record.studentId) === studentId,
      );

      const mainStatuses = [];
      const teamStatuses = [];

      studentRecords.forEach((record) => {
        const sessionType =
          record.sessionType ||
          record.sessionId?.type ||
          record.session?.type ||
          record.type ||
          "";

        const isMainSession =
          sessionType === "Lecture" ||
          sessionType === "Experience Sharing" ||
          sessionType === "Contest";

        const isTeamMeeting =
          record.meetingType === "Daily Meeting" ||
          record.meetingType === "Sunday Weekly Meeting";

        const statuses = [
          record.firstCheck?.status,
          record.secondCheck?.status,
        ].filter(Boolean);

        if (isMainSession && !isTeamMeeting) {
          mainStatuses.push(...statuses);
        } else {
          teamStatuses.push(...statuses);
        }
      });

      const mainRate = calculatePercentage(mainStatuses);
      const teamRate = calculatePercentage(teamStatuses);

      const allStatuses = [...mainStatuses, ...teamStatuses];

      const overallRate = calculatePercentage(allStatuses);

      return {
        student,
        mainRate,
        teamRate,
        overallRate,

        mainChecks: mainStatuses.filter((status) => status !== "Excused")
          .length,

        teamChecks: teamStatuses.filter((status) => status !== "Excused")
          .length,

        totalChecks: allStatuses.filter((status) => status !== "Excused")
          .length,
      };
    });
  }, [teamData.students, allAttendanceRecords]);

  const overviewStats = useMemo(() => {
    const totalStudents = teamData.students.length;

    const averageOverall =
      totalStudents > 0
        ? Math.round(
            summary.reduce((sum, item) => sum + item.overallRate, 0) /
              totalStudents,
          )
        : 0;

    const averageMain =
      totalStudents > 0
        ? Math.round(
            summary.reduce((sum, item) => sum + item.mainRate, 0) /
              totalStudents,
          )
        : 0;

    const averageTeam =
      totalStudents > 0
        ? Math.round(
            summary.reduce((sum, item) => sum + item.teamRate, 0) /
              totalStudents,
          )
        : 0;

    const atRisk = summary.filter((item) => item.overallRate < 50).length;

    return {
      totalStudents,
      averageOverall,
      averageMain,
      averageTeam,
      atRisk,
    };
  }, [summary, teamData.students.length]);
  const handleRefresh = async () => {
    setError("");

    await Promise.all([
      fetchMyTeam(),
      fetchMainSessions(),
      fetchAllTeamRecords(),
    ]);

    await fetchRecordsForCurrentSelection();
  };

  return (
    <div className="min-h-screen bg-[#EEF4F7] p-4 font-sans antialiased text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="group relative overflow-hidden rounded-2xl border border-[#293E4C]/40 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-5 shadow-xl shadow-cyan-950/20 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#00A8CC]/20 opacity-50 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/30 transition-transform duration-300 group-hover:scale-105">
                <ClipboardCheck size={22} strokeWidth={2.2} />
              </div>

              <div>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Attendance Hub
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-sm transition-all hover:border-[#00A8CC]/50 hover:bg-[#00A8CC]/20 active:scale-[0.98]"
            >
              <RefreshCw
                size={14}
                className={loadingSessions || loadingTeam ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-200/80 bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />

              <span>{error}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 shadow-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <Check size={16} />
            </div>

            <span>{successMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Team Students
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overviewStats.totalStudents}
                </h2>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Assigned to you
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#00A8CC]/30">
                <Users size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Overall Attendance
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overviewStats.averageOverall}%
                </h2>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Combined average
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#00A8CC]/40 hover:shadow-lg hover:shadow-cyan-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Main Sessions
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-[#00A8CC]">
                  {overviewStats.averageMain}%
                </h2>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Cohort attendance
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAF7FA] text-[#00A8CC] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#00A8CC] group-hover:text-white">
                <Layers size={20} />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-300/50 hover:shadow-lg hover:shadow-rose-900/5">
            <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-rose-500 transition-all duration-500 group-hover:w-full" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  At Risk
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0F172A] transition-colors duration-300 group-hover:text-rose-500">
                  {overviewStats.atRisk}
                </h2>

                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  Below 50% attendance
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500 transition-all duration-300 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white">
                <AlertCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border bg-white p-2 shadow-xl shadow-cyan-950/10">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAttendanceMode("main")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                attendanceMode === "main"
                  ? "border-[#00A8CC] border text-[#00A8CC] shadow-lg shadow-[#00A8CC]/25"
                  : "text-[#00A8CC] hover:border-[#00A8CC]"
              }`}
            >
              <Layers size={15} />

              <span>Main Cohort Sessions</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendanceMode("team")}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-bold transition-all ${
                attendanceMode === "team"
                  ? "border-[#00A8CC] border text-[#00A8CC] shadow-lg shadow-[#00A8CC]/25"
                  : "text-[#00A8CC] hover:border-[#00A8CC]"
              }`}
            >
              <Sun
                size={15}
                className={
                  attendanceMode === "team" ? "text-white" : "text-amber-300"
                }
              />

              <span>Team Meetings</span>
            </button>
          </div>
        </div>

        {attendanceMode === "main" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="group rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#00A8CC]/30 hover:shadow-md">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-transform duration-300 group-hover:scale-105">
                    <Layers size={18} />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#0F172A]">
                      Main Cohort Sessions
                    </h2>

                    <p className="mt-0.5 text-[11px] text-[#8FA3B0]">
                      Lectures, experience sharing, and contests
                    </p>
                  </div>
                </div>

                <BarChart3 size={16} className="text-[#00A8CC]" />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Bootcamp Week
                  </label>

                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition-all hover:border-[#00A8CC] focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/15"
                  >
                    {availableMainWeeks.length === 0 ? (
                      <option value={selectedWeek}>Week {selectedWeek}</option>
                    ) : (
                      availableMainWeeks.map((week) => (
                        <option key={week} value={week}>
                          Week {week}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Session
                  </label>

                  <select
                    value={selectedMainSessionId ?? ""}
                    onChange={(e) => setSelectedMainSessionId(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition-all hover:border-[#00A8CC] focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/15"
                  >
                    {mainSessionsForWeek.length === 0 ? (
                      <option value="">
                        No sessions for Week {selectedWeek}
                      </option>
                    ) : (
                      mainSessionsForWeek.map((session) => (
                        <option key={session._id} value={session._id}>
                          {session.type === "Contest"
                            ? "🏆 "
                            : session.type === "Experience Sharing"
                              ? "🎤 "
                              : "📚 "}
                          {session.name} (
                          {new Date(session.date).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                          )
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-[#293E4C]/50 bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-6 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00A8CC] text-white">
                    <Users size={18} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                      Assigned Team
                    </p>

                    <h2 className="mt-1 text-base font-bold">
                      {teamData.name || "My Team"}
                    </h2>
                  </div>
                </div>

                <Activity size={16} className="text-[#00A8CC]" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Students
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {teamData.students.length}
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Team Rate
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {overviewStats.averageTeam}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-[#0F172A]">
                    Team Meeting Schedule
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[#8FA3B0]">
                    Select the bootcamp week and meeting day
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit rounded-full border border-[#00A8CC]/20 bg-[#EAF7FA] px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#00A8CC]">
                Week {selectedWeek} Active
              </span>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Bootcamp Week
              </p>

              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((week) => (
                  <button
                    key={week}
                    type="button"
                    onClick={() => setSelectedWeek(week)}
                    className={`shrink-0 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all ${
                      selectedWeek === week
                        ? "border-[#00A8CC] bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/20"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-[#00A8CC]/40 hover:bg-[#EAF7FA] hover:text-[#00A8CC]"
                    }`}
                  >
                    Week {week}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Meeting Day
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Mon–Sat = Daily Meeting · Sun = Weekly Sync
                  </p>
                </div>

                <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                  {selectedDay === "Sunday"
                    ? "Sunday Weekly Meeting"
                    : "Daily Meeting"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
                {DAYS_OF_WEEK.map(({ name, short, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedDay(name)}
                    className={`group rounded-2xl border p-4 text-left transition-all ${
                      selectedDay === name
                        ? "border-[#00A8CC]/50 bg-[#EAF7FA] shadow-sm ring-2 ring-[#00A8CC]/10"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#00A8CC]/30 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-black ${
                          selectedDay === name
                            ? "text-[#00A8CC]"
                            : "text-slate-700"
                        }`}
                      >
                        {short}
                      </span>

                      <Icon
                        size={14}
                        className={
                          name === "Sunday"
                            ? "text-violet-500"
                            : "text-amber-500"
                        }
                      />
                    </div>

                    <p
                      className={`mt-2 truncate text-[10px] font-bold ${
                        selectedDay === name
                          ? "text-[#008BA8]"
                          : "text-slate-400"
                      }`}
                    >
                      {name === "Sunday" ? "Sunday Sync" : "Daily Meeting"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-white px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#00A8CC]" />

                  <h2 className="text-base font-bold text-[#0F172A]">
                    {attendanceMode === "main"
                      ? selectedMainSession
                        ? `${selectedMainSession.name}`
                        : "Select a main session above"
                      : `Week ${selectedWeek} · ${selectedDay}`}
                  </h2>
                </div>

                <p className="mt-1 ml-4 text-xs font-medium text-[#8FA3B0]">
                  {attendanceMode === "main"
                    ? selectedMainSession
                      ? `${selectedMainSession.type} · ${new Date(
                          selectedMainSession.date,
                        ).toLocaleDateString(undefined, {
                          weekday: "long",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "Choose a session to begin"
                    : selectedDay === "Sunday"
                      ? "Sunday Weekly Sync"
                      : "Daily Meeting"}{" "}
                  · Team: {teamData.name || "My Team"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllPresent}
                disabled={teamData.students.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition-all hover:border-emerald-300 hover:bg-emerald-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCheck size={14} />
                Set All Present
              </button>
            </div>
          </div>

          {loadingRecords ? (
            <div className="flex min-h-70 items-center justify-center">
              <div className="flex items-center gap-2.5 rounded-2xl border border-cyan-100/60 bg-white p-6 shadow-xl shadow-cyan-950/5">
                <Loader2 className="h-5 w-5 animate-spin text-[#00A8CC]" />

                <span className="text-xs font-semibold text-[#14222B]">
                  Loading attendance records...
                </span>
              </div>
            </div>
          ) : teamData.students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Users size={22} />
              </div>

              <p className="mt-3 text-xs font-bold text-slate-600">
                No students assigned to your team.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#EAF7FA] text-[10px] font-bold uppercase tracking-wider text-[#496773]">
                    <th className="px-6 py-4 text-left">Student</th>

                    <th className="px-6 py-4 text-center">First Check</th>

                    <th className="px-6 py-4 text-center">Second Check</th>

                    <th className="px-6 py-4 text-center">Current Rate</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {teamData.students.map((student) => {
                    const studentId = String(student._id);

                    const status = statusMap[studentId] || {
                      first: "Present",
                      second: "Present",
                    };

                    const currentRate = calculatePercentage([
                      status.first,
                      status.second,
                    ]);

                    return (
                      <tr
                        key={studentId}
                        className="group transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF7FA] text-xs font-black text-[#00A8CC] transition-all group-hover:bg-[#00A8CC] group-hover:text-white">
                              {getInitials(student)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#0F172A]">
                                {student.firstName} {student.lastName}
                              </p>

                              {student.schoolId && (
                                <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                                  ID: {student.schoolId}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <select
                            value={status.first || "Present"}
                            onChange={(e) =>
                              handleLocalChange(
                                studentId,
                                "first",
                                e.target.value,
                              )
                            }
                            className={`rounded-xl border px-3 py-2 text-[11px] font-bold outline-none transition-all ${getStatusClasses(
                              status.first,
                            )} focus:ring-2 focus:ring-[#00A8CC]/15`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <select
                            value={status.second || "Present"}
                            onChange={(e) =>
                              handleLocalChange(
                                studentId,
                                "second",
                                e.target.value,
                              )
                            }
                            className={`rounded-xl border px-3 py-2 text-[11px] font-bold outline-none transition-all ${getStatusClasses(
                              status.second,
                            )} focus:ring-2 focus:ring-[#00A8CC]/15`}
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex min-w-14.5 items-center justify-center rounded-full border px-2.5 py-1.5 text-[10px] font-black ${
                              currentRate >= 80
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : currentRate >= 50
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-rose-200 bg-rose-50 text-rose-700"
                            }`}
                          >
                            {currentRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#F7FAFB] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Users size={14} className="text-[#00A8CC]" />

              <span>
                {teamData.students.length} students in attendance sheet
              </span>
            </div>

            <button
              type="button"
              onClick={handleSubmitAttendance}
              disabled={submittingSheet || teamData.students.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#1A5363] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submittingSheet ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}

              {submittingSheet ? "Submitting..." : "Submit Attendance Sheet"}
            </button>
          </div>
        </div>

        {summary.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC]">
                  <ClipboardCheck size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#0F172A]">
                    Attendance Overview
                  </h2>

                  <p className="mt-0.5 text-[11px] text-[#8FA3B0]">
                    Real attendance calculated from saved records
                  </p>
                </div>
              </div>

              <TrendingUp size={16} className="text-[#00A8CC]" />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <AttendanceRateCard
                label="Main Cohort"
                value={overviewStats.averageMain}
                icon={Layers}
                description="Lecture, sharing & contest attendance"
              />

              <AttendanceRateCard
                label="Team Meetings"
                value={overviewStats.averageTeam}
                icon={Users}
                description="Daily and Sunday meetings"
              />

              <AttendanceRateCard
                label="Combined Overall"
                value={overviewStats.averageOverall}
                icon={BarChart3}
                description="All attendance records"
              />
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-200">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#EAF7FA] text-[10px] font-bold uppercase tracking-wider text-[#496773]">
                    <th className="px-5 py-4 text-left">Student</th>

                    <th className="px-5 py-4 text-center">Main Cohort</th>

                    <th className="px-5 py-4 text-center">Team Meetings</th>

                    <th className="px-5 py-4 text-center">Overall</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {summary.map((item) => (
                    <tr
                      key={String(item.student._id)}
                      className="group transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7FA] text-[10px] font-black text-[#00A8CC] transition-all group-hover:bg-[#00A8CC] group-hover:text-white">
                            {getInitials(item.student)}
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#0F172A]">
                              {item.student.firstName} {item.student.lastName}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {item.totalChecks} total checks
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-black text-[#00A8CC]">
                            {item.mainRate}%
                          </span>

                          <span className="text-[9px] font-semibold text-slate-400">
                            {item.mainChecks} checks
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-black text-amber-600">
                            {item.teamRate}%
                          </span>

                          <span className="text-[9px] font-semibold text-slate-400">
                            {item.teamChecks} checks
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex min-w-16.25 items-center justify-center rounded-full border px-3 py-1.5 text-[10px] font-black ${
                            item.overallRate >= 80
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : item.overallRate >= 50
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-rose-200 bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.overallRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="h-1 rounded-full bg-linear-to-r from-[#0F3440] via-[#00A8CC] to-[#0F3440]" />
      </div>
    </div>
  );
};

function AttendanceRateCard({ label, value, icon: Icon, description }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#00A8CC]/30 hover:shadow-md">
      <div className="pointer-events-none absolute bottom-0 left-0 h-0.75 w-0 bg-[#00A8CC] transition-all duration-500 group-hover:w-full" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9] text-[#00A8CC] transition-all duration-300 group-hover:bg-[#00A8CC] group-hover:text-white">
            <Icon size={17} />
          </div>

          <div>
            <p className="text-xs font-bold text-[#0F172A]">{label}</p>

            <p className="mt-0.5 text-[9px] text-slate-400">{description}</p>
          </div>
        </div>

        <span
          className={`text-xl font-black ${
            value >= 80
              ? "text-emerald-600"
              : value >= 50
                ? "text-amber-600"
                : "text-rose-600"
          }`}
        >
          {value}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            value >= 80
              ? "bg-emerald-500"
              : value >= 50
                ? "bg-amber-400"
                : "bg-rose-500"
          }`}
          style={{
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

export default MentorAttendance;
