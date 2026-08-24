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

/*
|--------------------------------------------------------------------------
| ATTENDANCE CALCULATION
|--------------------------------------------------------------------------
|
| Present = 1     -> 100%
| Late    = 0.5   -> 50%
| Absent  = 0     -> 0%
| Excused = null  -> NOT COUNTED
|
*/

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

    if (value === null) {
      return;
    }

    totalPoints += value;
    countedChecks += 1;
  });

  if (countedChecks === 0) {
    return 0;
  }

  return Math.round((totalPoints / countedChecks) * 100);
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

  /*
  |--------------------------------------------------------------------------
  | MAIN SESSION WEEKS
  |--------------------------------------------------------------------------
  */

  const availableMainWeeks = useMemo(() => {
    const weeks = [...new Set(mainSessions.map((s) => s.week))];

    return weeks.sort((a, b) => a - b);
  }, [mainSessions]);

  /*
  |--------------------------------------------------------------------------
  | MAIN SESSIONS FOR SELECTED WEEK
  |--------------------------------------------------------------------------
  */

  const mainSessionsForWeek = useMemo(() => {
    return mainSessions
      .filter((s) => Number(s.week) === Number(selectedWeek))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [mainSessions, selectedWeek]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT MAIN SESSION
  |--------------------------------------------------------------------------
  */

  const selectedMainSession = useMemo(
    () =>
      mainSessions.find(
        (s) => String(s._id) === String(selectedMainSessionId)
      ) || null,
    [mainSessions, selectedMainSessionId]
  );

  /*
  |--------------------------------------------------------------------------
  | FETCH MAIN SESSIONS
  |--------------------------------------------------------------------------
  */

  const fetchMainSessions = useCallback(async () => {
    setLoadingSessions(true);

    try {
      const res = await api.get("/sessions/my-team");

      const loaded = Array.isArray(res.data?.sessions)
        ? res.data.sessions
        : [];

      setMainSessions(loaded);

      if (loaded.length > 0) {
        const weeks = [
          ...new Set(loaded.map((s) => Number(s.week))),
        ].sort((a, b) => a - b);

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

  /*
  |--------------------------------------------------------------------------
  | FETCH MY TEAM
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | FETCH RECORDS FOR CURRENT SHEET
  |--------------------------------------------------------------------------
  */

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

      const records = Array.isArray(res.data?.records)
        ? res.data.records
        : [];

      const map = {};

      /*
       * IMPORTANT:
       *
       * We DO NOT automatically make a missing record Present.
       *
       * Missing record means there is no saved attendance yet.
       * The UI can display Present for convenience, but the percentage
       * calculation only uses SAVED records.
       */

      records.forEach((record) => {
        const studentId = String(
          record.studentId?._id || record.studentId
        );

        map[studentId] = {
          first: record.firstCheck?.status || "Present",
          second: record.secondCheck?.status || "Present",
        };
      });

      /*
       * For the attendance form only, show Present when there is
       * no saved record yet.
       *
       * This does NOT affect percentage calculation because
       * percentage calculation uses allAttendanceRecords.
       */

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

  /*
  |--------------------------------------------------------------------------
  | FETCH ALL RECORDS
  |--------------------------------------------------------------------------
  */

  const fetchAllTeamRecords = useCallback(async () => {
    try {
      const res = await api.get("/attendance/team-records");

      const records = Array.isArray(res.data?.records)
        ? res.data.records
        : [];

      setAllAttendanceRecords(records);
    } catch (err) {
      console.error("Failed to load all attendance records:", err);
      setAllAttendanceRecords([]);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchMyTeam();
    fetchMainSessions();
  }, [fetchMyTeam, fetchMainSessions]);

  /*
  |--------------------------------------------------------------------------
  | AUTO SELECT MAIN SESSION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (
      attendanceMode === "main" &&
      mainSessionsForWeek.length > 0
    ) {
      const stillValid = mainSessionsForWeek.some(
        (session) =>
          String(session._id) === String(selectedMainSessionId)
      );

      if (!stillValid) {
        setSelectedMainSessionId(mainSessionsForWeek[0]._id);
      }
    }

    if (
      attendanceMode === "main" &&
      mainSessionsForWeek.length === 0
    ) {
      setSelectedMainSessionId(null);
    }
  }, [
    attendanceMode,
    mainSessionsForWeek,
    selectedMainSessionId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LOAD ATTENDANCE
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | LOCAL STATUS CHANGE
  |--------------------------------------------------------------------------
  */

  const handleLocalChange = (
    studentId,
    checkType,
    status
  ) => {
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

  /*
  |--------------------------------------------------------------------------
  | SET ALL PRESENT
  |--------------------------------------------------------------------------
  |
  | This ONLY changes the current attendance sheet.
  | The database is NOT changed until Submit is clicked.
  |
  */

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
      "All students are set to Present. Click Submit Attendance Sheet to save."
    );

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT ATTENDANCE
  |--------------------------------------------------------------------------
  */

  const handleSubmitAttendance = async () => {
    if (teamData.students.length === 0) {
      setError("No students in your team.");
      return;
    }

    if (
      attendanceMode === "main" &&
      !selectedMainSessionId
    ) {
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

      const response = await api.post(
        "/attendance/mark-bulk",
        payload
      );

      setSuccessMessage(
        response.data?.message ||
          "Attendance sheet submitted successfully!"
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      /*
       * IMPORTANT:
       *
       * Reload database records after submitting.
       * This makes the percentage immediately use the real
       * saved attendance.
       */

      await fetchAllTeamRecords();
      await fetchRecordsForCurrentSelection();
    } catch (err) {
      console.error("Submit attendance error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to submit attendance sheet."
      );
    } finally {
      setSubmittingSheet(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | REAL ATTENDANCE SUMMARY
  |--------------------------------------------------------------------------
  */

  const summary = useMemo(() => {
    return teamData.students.map((student) => {
      const studentId = String(student._id);

      /*
       * Only records belonging to this student.
       */
      const studentRecords = allAttendanceRecords.filter(
        (record) =>
          String(
            record.studentId?._id || record.studentId
          ) === studentId
      );

      /*
       * Main Cohort statuses
       */
      const mainStatuses = [];

      /*
       * Team Meeting statuses
       */
      const teamStatuses = [];

      studentRecords.forEach((record) => {
        /*
         * Determine whether this is a main session.
         *
         * Different backends may return sessionType,
         * sessionId.type, or type.
         */

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

        /*
         * Another reliable way to detect team attendance:
         */
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

      /*
       * REAL percentages.
       *
       * If there are no records:
       * percentage = 0
       *
       * NOT 100.
       */

      const mainRate = calculatePercentage(mainStatuses);

      const teamRate = calculatePercentage(teamStatuses);

      /*
       * Combined percentage.
       *
       * We combine the actual statuses instead of averaging
       * mainRate and teamRate.
       *
       * This is important because the two sections may have
       * different numbers of attendance checks.
       */

      const allStatuses = [
        ...mainStatuses,
        ...teamStatuses,
      ];

      const overallRate =
        calculatePercentage(allStatuses);

      return {
        student,
        mainRate,
        teamRate,
        overallRate,

        /*
         * These are useful if you want to display the
         * number of actual attendance checks later.
         */
        mainChecks: mainStatuses.filter(
          (status) => status !== "Excused"
        ).length,

        teamChecks: teamStatuses.filter(
          (status) => status !== "Excused"
        ).length,

        totalChecks: allStatuses.filter(
          (status) => status !== "Excused"
        ).length,
      };
    });
  }, [teamData.students, allAttendanceRecords]);

  /*
  |--------------------------------------------------------------------------
  | REFRESH
  |--------------------------------------------------------------------------
  */

  const handleRefresh = async () => {
    setError("");

    await Promise.all([
      fetchMyTeam(),
      fetchMainSessions(),
      fetchAllTeamRecords(),
    ]);

    await fetchRecordsForCurrentSelection();
  };

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A3D63] text-white shadow-sm">
              <ClipboardCheck size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Mentor Attendance Hub
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Record attendance for Main Cohort Sessions
                and Team Meetings.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODE TABS */}
        <div className="flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200 w-fit gap-1">

          <button
            type="button"
            onClick={() => setAttendanceMode("main")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              attendanceMode === "main"
                ? "bg-[#1A3D63] text-white shadow-md"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers size={15} />
            🏛️ Main Cohort Sessions
          </button>

          <button
            type="button"
            onClick={() => setAttendanceMode("team")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition ${
              attendanceMode === "team"
                ? "bg-[#1A3D63] text-white shadow-md"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sun size={15} className="text-amber-400" />
            👥 Team Meetings
          </button>

        </div>

        {/* MAIN SESSION SELECTOR */}
        {attendanceMode === "main" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2 p-5 space-y-4">

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6FAFD] text-[#1A3D63]">
                  <Layers size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Admin Main Sessions
                  </h2>

                  <p className="text-xs text-slate-400">
                    Lectures, Experience Sharing, and Contests.
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* WEEK */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                    Week
                  </label>

                  <select
                    value={selectedWeek}
                    onChange={(e) =>
                      setSelectedWeek(
                        Number(e.target.value)
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {availableMainWeeks.length === 0 ? (
                      <option value={selectedWeek}>
                        Week {selectedWeek}
                      </option>
                    ) : (
                      availableMainWeeks.map((week) => (
                        <option key={week} value={week}>
                          Week {week}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* SESSION */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">
                    Session
                  </label>

                  <select
                    value={selectedMainSessionId ?? ""}
                    onChange={(e) =>
                      setSelectedMainSessionId(
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
                  >
                    {mainSessionsForWeek.length === 0 ? (
                      <option value="">
                        No sessions for Week{" "}
                        {selectedWeek}
                      </option>
                    ) : (
                      mainSessionsForWeek.map((session) => (
                        <option
                          key={session._id}
                          value={session._id}
                        >
                          {session.type === "Contest"
                            ? "🏆 "
                            : session.type ===
                              "Experience Sharing"
                            ? "🎤 "
                            : "📚 "}

                          {session.name} (
                          {new Date(
                            session.date
                          ).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                          )
                        </option>
                      ))
                    )}
                  </select>
                </div>

              </div>
            </div>

            {/* TEAM INFO */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">

              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6FAFD] text-[#1A3D63]">
                  <Users size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    My Team
                  </h2>

                  <p className="text-xs text-slate-400">
                    {teamData.name || "Assigned Team"}
                  </p>
                </div>

              </div>

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">

                <span className="text-xs font-semibold text-slate-500">
                  Students in Group
                </span>

                <span className="text-lg font-bold text-[#1A3D63]">
                  {teamData.students.length}
                </span>

              </div>

            </div>
          </div>
        ) : (

          /* TEAM MODE */
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">

            <div className="flex items-center justify-between border-b border-slate-100 pb-4">

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  1. Select Bootcamp Week
                </h2>

                <p className="text-xs text-slate-400">
                  Choose the week.
                </p>
              </div>

              <span className="rounded-full bg-[#1A3D63] text-white px-3 py-1 text-xs font-bold shadow-sm">
                Week {selectedWeek} Active
              </span>

            </div>

            {/* WEEKS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">

              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                (week) => (
                  <button
                    key={week}
                    type="button"
                    onClick={() =>
                      setSelectedWeek(week)
                    }
                    className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      selectedWeek === week
                        ? "bg-[#1A3D63] text-white shadow-md scale-105"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Week {week}
                  </button>
                )
              )}

            </div>

            {/* DAY */}
            <div className="border-t border-slate-100 pt-5 space-y-3">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    2. Select Day
                  </h2>

                  <p className="text-xs text-slate-400">
                    Mon–Sat = Daily Meeting | Sun = Sunday Sync
                  </p>
                </div>

                <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                  {selectedDay === "Sunday"
                    ? "Sunday Weekly Meeting"
                    : "Daily Meeting"}
                </span>

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">

                {DAYS_OF_WEEK.map(
                  ({
                    name,
                    short,
                    icon: Icon,
                  }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        setSelectedDay(name)
                      }
                      className={`rounded-2xl p-3.5 text-left border transition ${
                        selectedDay === name
                          ? "border-[#1A3D63] bg-[#F6FAFD] ring-2 ring-[#1A3D63]/20 shadow-sm"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">

                        <span className="font-black text-xs text-slate-800">
                          {short}
                        </span>

                        <Icon
                          size={14}
                          className={
                            name === "Sunday"
                              ? "text-purple-600"
                              : "text-amber-500"
                          }
                        />

                      </div>

                      <p className="mt-2 text-[11px] font-bold text-[#1A3D63] truncate">
                        {name === "Sunday"
                          ? "Sunday Sync"
                          : "Daily Meeting"}
                      </p>

                    </button>
                  )
                )}

              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TABLE */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">

            <div>

              <h2 className="text-base font-bold text-slate-900">

                {attendanceMode === "main"
                  ? selectedMainSession
                    ? `${selectedMainSession.name} (${new Date(
                        selectedMainSession.date
                      ).toDateString()})`
                    : "Select a main session above"
                  : `Week ${selectedWeek} · ${selectedDay} (${
                      selectedDay === "Sunday"
                        ? "Sunday Weekly Sync"
                        : "Daily Meeting"
                    })`}

              </h2>

              <p className="text-xs text-slate-500">
                Team: {teamData.name || "My Team"} (
                {teamData.students.length} students)
              </p>

            </div>

            {/* ALL PRESENT */}
            <button
              type="button"
              onClick={handleMarkAllPresent}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
            >
              <CheckCheck size={14} />
              Set All to Present
            </button>

          </div>

          {/* LOADING */}
          {loadingRecords ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs font-bold">

              <Loader2
                size={16}
                className="animate-spin text-[#1A3D63]"
              />

              Loading records...

            </div>
          ) : teamData.students.length === 0 ? (

            <div className="py-12 text-center text-xs text-slate-400">
              No students assigned to your team.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">

                    <th className="px-6 py-3.5 text-left">
                      Student
                    </th>

                    <th className="px-6 py-3.5 text-center">
                      First Check (Morning)
                    </th>

                    <th className="px-6 py-3.5 text-center">
                      Second Check (Afternoon)
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {teamData.students.map((student) => {
                    const studentId = String(student._id);

                    const status =
                      statusMap[studentId] || {
                        first: "Present",
                        second: "Present",
                      };

                    return (
                      <tr
                        key={studentId}
                        className="hover:bg-slate-50/60 transition"
                      >

                        {/* STUDENT */}
                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F6FAFD] text-xs font-bold text-[#1A3D63]">

                              {student.firstName?.[0]}
                              {student.lastName?.[0]}

                            </div>

                            <div>

                              <p className="font-bold text-slate-800">
                                {student.firstName}{" "}
                                {student.lastName}
                              </p>

                              {student.schoolId && (
                                <p className="text-xs text-slate-400">
                                  ID: {student.schoolId}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        {/* FIRST CHECK */}
                        <td className="px-6 py-4 text-center">

                          <select
                            value={
                              status.first || "Present"
                            }
                            onChange={(e) =>
                              handleLocalChange(
                                studentId,
                                "first",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                          >

                            {STATUS_OPTIONS.map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              )
                            )}

                          </select>

                        </td>

                        {/* SECOND CHECK */}
                        <td className="px-6 py-4 text-center">

                          <select
                            value={
                              status.second || "Present"
                            }
                            onChange={(e) =>
                              handleLocalChange(
                                studentId,
                                "second",
                                e.target.value
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold outline-none cursor-pointer"
                          >

                            {STATUS_OPTIONS.map(
                              (option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              )
                            )}

                          </select>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

          {/* SUBMIT */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">

            <span className="text-xs text-slate-500 font-medium">
              {teamData.students.length} students in sheet
            </span>

            <button
              type="button"
              onClick={handleSubmitAttendance}
              disabled={
                submittingSheet ||
                teamData.students.length === 0
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#1A3D63] px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4A7FA7] disabled:opacity-50 cursor-pointer"
            >

              {submittingSheet ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Send size={15} />
              )}

              {submittingSheet
                ? "Submitting..."
                : "Submit Attendance Sheet"}

            </button>

          </div>

        </div>

        {/* REAL ATTENDANCE OVERVIEW */}
        {summary.length > 0 && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-6 py-4">

              <h2 className="text-base font-bold text-slate-900">
                Separated Attendance Overview
              </h2>

              <p className="text-xs text-slate-500">
                Attendance is calculated from actual saved
                Present, Absent, Late, and Excused records.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] text-xs">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500">

                    <th className="px-6 py-3 text-left">
                      Student
                    </th>

                    <th className="px-6 py-3 text-center text-[#1A3D63]">
                      🏛️ Main Cohort %
                    </th>

                    <th className="px-6 py-3 text-center text-amber-600">
                      👥 Team Meetings %
                    </th>

                    <th className="px-6 py-3 text-center text-emerald-600">
                      Combined Overall %
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {summary.map((item) => (

                    <tr
                      key={String(item.student._id)}
                      className="hover:bg-slate-50/60"
                    >

                      <td className="px-6 py-3.5 font-bold text-slate-800">

                        {item.student.firstName}{" "}
                        {item.student.lastName}

                      </td>

                      <td className="px-6 py-3.5 text-center">

                        <div className="flex flex-col items-center gap-1">

                          <span className="font-bold text-[#1A3D63]">
                            {item.mainRate}%
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {item.mainChecks} checks
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-3.5 text-center">

                        <div className="flex flex-col items-center gap-1">

                          <span className="font-bold text-amber-700">
                            {item.teamRate}%
                          </span>

                          <span className="text-[10px] text-slate-400">
                            {item.teamChecks} checks
                          </span>

                        </div>

                      </td>

                      <td className="px-6 py-3.5 text-center">

                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                            item.overallRate >= 80
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.overallRate >= 50
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-red-50 text-red-700 border border-red-200"
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

      </div>
    </div>
  );
};

export default MentorAttendance; 