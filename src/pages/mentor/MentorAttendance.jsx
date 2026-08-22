import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar as CalIcon,
  Users,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  ClipboardCheck,
  Sparkles,
  UserCheck,
  Clock,
  CalendarDays,
  ShieldCheck,
  ChevronDown,
  Activity,
  CheckCircle2,
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
    if (selectedWeek === null) return [];
    return sessions
      .filter((session) => session.week === selectedWeek)
      .sort((a, b) => {
        if (a.type !== b.type) return a.type.localeCompare(b.type);
        return a.order - b.order;
      });
  }, [sessions, selectedWeek]);

  const selectedSession = useMemo(
    () => sessions.find((session) => session._id === selectedSessionId) || null,
    [sessions, selectedSessionId]
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
        err.response?.data?.message || "Failed to load sessions for your batch."
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
        err.response?.data?.message || "Failed to load your assigned team."
      );
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const fetchTeamRecords = useCallback(async () => {
    if (loadingTeam || !selectedSessionId || !teamData.teamId) {
      setStatusMap({});
      return;
    }

    setLoadingRecords(true);
    setError("");

    try {
      const res = await api.get("/attendance/team-records", {
        params: { sessionId: selectedSessionId },
      });

      const records = Array.isArray(res.data?.records) ? res.data.records : [];
      const map = {};

      records.forEach((record) => {
        const studentId =
          typeof record.studentId === "object"
            ? record.studentId?._id
            : record.studentId;

        if (!studentId) return;

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
        err.response?.data?.message || "Failed to load attendance records."
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
              params: { sessionId: session._id },
            });
            return {
              sessionId: session._id,
              records: Array.isArray(res.data?.records) ? res.data.records : [],
            };
          } catch (err) {
            console.error(`FAILED TO LOAD SESSION ${session._id}:`, err);
            return { sessionId: session._id, records: [] };
          }
        })
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

          if (!studentId) return;
          const normalizedId = String(studentId);
          if (!summaryMap[normalizedId]) return;

          const statuses = [
            record.firstCheck?.status || "",
            record.secondCheck?.status || "",
          ];

          statuses.forEach((status) => {
            if (!status) return;
            summaryMap[normalizedId].marked += 1;
            if (status === "Present") summaryMap[normalizedId].present += 1;
            if (status === "Absent") summaryMap[normalizedId].absent += 1;
            if (status === "Late") summaryMap[normalizedId].late += 1;
            if (status === "Excused") summaryMap[normalizedId].excused += 1;
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
  }, [loadingTeam, loadingSessions, teamData.teamId, teamData.students, sessions]);

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
      (session) => session._id === selectedSessionId
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
  }, [loadingTeam, loadingSessions, teamData.teamId, teamData.students.length, sessions.length, fetchAttendanceSummary]);

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
    if (!studentId || !teamData.teamId || !selectedSessionId || !status) return;

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
        throw new Error(response.data?.message || "Attendance could not be saved.");
      }

      setSuccessMessage(`${status} attendance marked successfully.`);
      setTimeout(() => setSuccessMessage(""), 2000);
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
          "Failed to save attendance."
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
    if (percentage >= 80) return "text-emerald-800 bg-emerald-100/80 border-emerald-300";
    if (percentage >= 60) return "text-amber-800 bg-amber-100/80 border-amber-300";
    return "text-rose-800 bg-rose-100/80 border-rose-300";
  };

  return (
    <>
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .smooth-transition { transition: all 220ms ease; }
        
        .heading-gradient {
          background: linear-gradient(90deg, #FFFFFF 0%, #FCD8BF 50%, #7EC8F5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hide-scrollbar::-webkit-scrollbar { height: 6px; }
        .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: rgba(226, 109, 44, 0.3); border-radius: 999px; }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach Gradient)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Moving Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        <div className="page-enter relative z-10 mx-auto max-w-[1500px] space-y-7">

          {/* ======================================================
              1. TOP HEADER WITH VIBRANT GRADIENT TEXT
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <ClipboardCheck size={28} className="text-[#F38744]" strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-gradient-to-r from-[#F38744] to-[#7EC8F5]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Roll Call & Session Log
                    </span>
                  </div>

                  {/* Gradient Text Main Heading */}
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight heading-gradient">
                    Mentor Attendance & Team Verification
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Mark and monitor real-time checkpoint attendance for your assigned students.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={loadingTeam || loadingSessions || loadingRecords || loadingSummary || savingKey !== null}
                  className="smooth-transition flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-50"
                >
                  <RefreshCw
                    size={16}
                    className={`text-[#F38744] ${loadingTeam || loadingSessions || loadingRecords || loadingSummary ? "animate-spin" : ""}`}
                  />
                  <span>Sync Attendance</span>
                </button>
              </div>
            </div>
          </header>

          {/* ======================================================
              ALERTS
          ====================================================== */}
          {error && (
            <div className="flex items-start gap-3.5 rounded-2xl border border-rose-300 bg-rose-100/90 p-4.5 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-600" />
              <div>
                <p className="font-bold">Attendance Notification</p>
                <p className="mt-0.5 text-xs text-rose-700">{error}</p>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-100/90 px-5 py-4 text-sm font-bold text-emerald-800 shadow-sm backdrop-blur-md">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ======================================================
              2. ATTENDANCE CONTROLS & TEAM CARD
          ====================================================== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* SESSION CONTROLS */}
            <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl lg:col-span-2">
              <div className="border-b border-[#EBDCC8] bg-[#F5ECE0]/80 px-6 py-4.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                    <CalIcon size={19} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#16344E]">
                      Attendance Session Setup
                    </h2>
                    <p className="text-xs text-slate-500">
                      Choose the week and target session to start marking
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4.5 p-6 sm:grid-cols-2">
                {/* WEEK SELECT */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Curriculum Week
                  </label>
                  {loadingSessions ? (
                    <div className="flex h-12 items-center gap-2 rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] px-4 text-xs font-semibold text-slate-500">
                      <Loader2 size={14} className="animate-spin text-[#E26D2C]" />
                      Loading weeks...
                    </div>
                  ) : (
                    <select
                      value={selectedWeek ?? ""}
                      onChange={(e) => handleWeekChange(e.target.value)}
                      className="h-12 w-full cursor-pointer rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 text-xs font-bold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9]"
                    >
                      {availableWeeks.length === 0 ? (
                        <option value="">No weeks available</option>
                      ) : (
                        availableWeeks.map((w) => (
                          <option key={w} value={w}>
                            Week {w}
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>

                {/* SESSION SELECT */}
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Target Session
                  </label>
                  <select
                    value={selectedSessionId ?? ""}
                    onChange={(e) => handleSessionChange(e.target.value)}
                    disabled={sessionsForWeek.length === 0}
                    className="h-12 w-full cursor-pointer rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 text-xs font-bold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] disabled:opacity-50"
                  >
                    {sessionsForWeek.length === 0 ? (
                      <option value="">No sessions available</option>
                    ) : (
                      sessionsForWeek.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.type})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* SESSION TYPE PILL */}
                <div className="rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Session Format
                  </p>
                  <p className="mt-1 text-sm font-black text-[#16344E]">
                    {selectedSession?.type || "—"}
                  </p>
                </div>

                {/* SESSION DATE PILL */}
                <div className="rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Scheduled Date
                  </p>
                  <p className="mt-1 text-sm font-black text-[#E26D2C]">
                    {selectedSession?.date ? new Date(selectedSession.date).toDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* MY TEAM SUMMARY CARD */}
            <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
              <div className="border-b border-[#EBDCC8] bg-[#F5ECE0]/80 px-6 py-4.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0F0FA] text-[#1E6FA3]">
                    <Users size={19} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-[#16344E]">
                      Assigned Team
                    </h2>
                    <p className="text-xs text-slate-500">
                      Roster under your supervision
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Team Name
                  </p>
                  <p className="text-lg font-black text-[#16344E]">
                    {teamData.name || "Assigned Team"}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                  <span className="text-xs font-bold text-slate-600">Assigned Students</span>
                  <span className="rounded-xl bg-[#173854] px-3 py-1 text-sm font-black text-white">
                    {teamData.students.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4">
                  <span className="text-xs font-bold text-slate-600">Active Checkpoint</span>
                  <span className="max-w-[150px] truncate text-xs font-black text-[#E26D2C]">
                    {selectedSession?.name || "None Selected"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================
              3. ATTENDANCE MARKING TABLE (Creamy Alabaster)
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            
            {/* Table Header Control */}
            <div className="flex flex-col gap-3 border-b border-[#EBDCC8] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Mark Student Attendance
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {selectedSession
                    ? `${selectedSession.name} • ${teamData.name || "My Team"}`
                    : "Select a week & session above to begin taking roll call."}
                </p>
              </div>

              {loadingRecords && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#E0F0FA] px-3.5 py-1.5 text-xs font-bold text-[#1E6FA3]">
                  <Loader2 size={14} className="animate-spin" />
                  Loading records...
                </div>
              )}
            </div>

            {loadingTeam ? (
              <div className="flex min-h-60 flex-col items-center justify-center p-10">
                <Loader2 size={32} className="animate-spin text-[#E26D2C]" />
                <p className="mt-3 text-xs font-bold text-slate-500">Loading student roster...</p>
              </div>
            ) : teamData.students.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-3 text-base font-black text-[#16344E]">No students assigned</h3>
                <p className="mt-1 text-xs text-slate-500">
                  You don't have any students assigned to your team yet.
                </p>
              </div>
            ) : !selectedSessionId ? (
              <div className="p-12 text-center">
                <CalIcon className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-3 text-base font-black text-[#16344E]">No Session Selected</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Please choose a week and session from the controls above.
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95">
                      <th className="w-[40%] px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Student
                      </th>
                      <th className="w-[30%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        <div>First Check (Morning)</div>
                      </th>
                      <th className="w-[30%] px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        <div>Second Check (Afternoon)</div>
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {teamData.students.map((student) => {
                      const studentId = String(student._id);
                      const studentStatus = statusMap[studentId] || {};

                      return (
                        <tr
                          key={studentId}
                          className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                        >
                          {/* STUDENT */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-xs font-black text-[#173854]">
                                {student.firstName?.charAt(0)?.toUpperCase()}
                                {student.lastName?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-black text-[#16344E]">
                                  {student.firstName} {student.lastName}
                                </p>
                                {student.schoolId && (
                                  <p className="text-[11px] font-semibold text-slate-500">
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
                                disabled={loadingRecords || (savingKey !== null && savingKey !== `${studentId}-first`)}
                                onChange={(value) => handleMark(studentId, "first", value)}
                              />
                            </div>
                          </td>

                          {/* SECOND CHECK */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center">
                              <StatusDropdown
                                value={studentStatus.second || ""}
                                saving={savingKey === `${studentId}-second`}
                                disabled={loadingRecords || (savingKey !== null && savingKey !== `${studentId}-second`)}
                                onChange={(value) => handleMark(studentId, "second", value)}
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

            {!loadingTeam && teamData.students.length > 0 && selectedSessionId && (
              <div className="flex items-center justify-between border-t border-[#EBDCC8] bg-[#F5ECE0]/60 px-6 py-3.5 text-xs font-semibold text-slate-600">
                <span>{teamData.students.length} students in roster</span>
                <span className="text-[#E26D2C]">⚡ Changes persist automatically</span>
              </div>
            )}
          </div>

          {/* ======================================================
              4. SUMMARY OVERVIEW TABLE
          ====================================================== */}
          {!loadingTeam && teamData.students.length > 0 && (
            <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
              <div className="flex flex-col gap-2 border-b border-[#EBDCC8] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-[#16344E]">
                    Cohort Attendance Overview
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Cumulative metrics across all checkpoints
                  </p>
                </div>

                {loadingSummary && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#E26D2C]">
                    <Loader2 size={14} className="animate-spin" />
                    Updating rates...
                  </div>
                )}
              </div>

              {loadingSummary ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-[#E26D2C]" />
                </div>
              ) : attendanceSummary.length === 0 ? (
                <div className="p-10 text-center text-xs font-semibold text-slate-500">
                  No attendance records logged yet.
                </div>
              ) : (
                <div className="hide-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[850px] text-xs">
                    <thead>
                      <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95 text-left">
                        <th className="px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Student
                        </th>
                        <th className="px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800">
                          Present
                        </th>
                        <th className="px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
                          Late
                        </th>
                        <th className="px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-rose-800">
                          Absent
                        </th>
                        <th className="px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-blue-800">
                          Excused
                        </th>
                        <th className="px-4 py-3.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Logged
                        </th>
                        <th className="px-6 py-3.5 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Attendance Rate
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EBDCC8]">
                      {attendanceSummary.map((item) => {
                        const student = item.student;
                        const studentId = String(student._id);

                        return (
                          <tr
                            key={studentId}
                            className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                          >
                            <td className="px-6 py-3.5 font-bold text-[#16344E]">
                              {student.firstName} {student.lastName}
                            </td>

                            <td className="px-4 py-3.5 text-center font-black text-emerald-700">
                              {item.present}
                            </td>

                            <td className="px-4 py-3.5 text-center font-black text-amber-700">
                              {item.late}
                            </td>

                            <td className="px-4 py-3.5 text-center font-black text-rose-700">
                              {item.absent}
                            </td>

                            <td className="px-4 py-3.5 text-center font-black text-blue-700">
                              {item.excused}
                            </td>

                            <td className="px-4 py-3.5 text-center font-bold text-slate-600">
                              {item.marked}/{item.totalChecks}
                            </td>

                            <td className="px-6 py-3.5 text-right">
                              <span
                                className={`inline-flex min-w-[70px] justify-center rounded-full border px-3 py-1 text-xs font-black ${getPercentageClass(
                                  item.percentage
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

              <div className="border-t border-[#EBDCC8] bg-[#F5ECE0]/60 p-4 text-[11px] font-medium text-slate-600">
                💡 Present and Late check-ins count toward cumulative attendance percentages.
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

// ============================================================
// STATUS DROPDOWN SELECTOR (Creamy Glass)
// ============================================================
const StatusDropdown = ({ value, onChange, saving, disabled }) => {
  const statusStyles = {
    Present: "border-emerald-300 bg-emerald-100/80 text-emerald-800",
    Absent: "border-rose-300 bg-rose-100/80 text-rose-800",
    Late: "border-amber-300 bg-amber-100/80 text-amber-800",
    Excused: "border-blue-300 bg-blue-100/80 text-blue-800",
    "": "border-[#DFCBB5] bg-[#F5ECE0] text-slate-500",
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
          rounded-xl
          border
          px-3
          py-2
          text-xs
          font-bold
          outline-none
          transition
          focus:ring-2
          focus:ring-[#DE7E4A]/20
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

      <div className="flex h-5 w-5 items-center justify-center">
        {saving && <Loader2 size={14} className="animate-spin text-[#DE7E4A]" />}
        {!saving && value && <Check size={14} className="text-emerald-600" />}
      </div>
    </div>
  );
};

export default MentorAttendance;