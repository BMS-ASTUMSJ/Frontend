import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers,
  Calendar,
  Plus,
  X,
} from "lucide-react";
import api from "../../utils/api";

const AdminSessions = () => {
  // ============================================================
  // DATE HELPERS
  // ============================================================

  const getTodayString = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayString();

  const formatDateForInput = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "";
    }

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const addDays = (dateString, days) => {
    if (!dateString) return "";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    date.setDate(date.getDate() + days);

    return formatDateForInput(date);
  };

  // ============================================================
  // STATE
  // ============================================================

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [week, setWeek] = useState(1);

  // Unlimited lectures.
  const [lectureCount, setLectureCount] = useState(2);

  /*
    Example:

    [
      { id: 1, date: "2026-08-25" },
      { id: 2, date: "2026-08-27" },
      { id: 3, date: "2026-08-30" }
    ]
  */

  const [lectureDates, setLectureDates] = useState([]);

  const [weekStartDate, setWeekStartDate] = useState(todayString);

  // Optional events.
  const [experienceSharingDate, setExperienceSharingDate] = useState("");

  const [contestDate, setContestDate] = useState("");

  const [sessions, setSessions] = useState([]);

  const [loadingSessions, setLoadingSessions] = useState(false);

  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ============================================================
  // CREATE DEFAULT LECTURES
  // ============================================================

  const createLectureDates = (count, startDate) => {
    const safeCount = Math.max(Number(count) || 1, 1);

    return Array.from({ length: safeCount }, (_, index) => ({
      id: Date.now() + index + Math.random(),

      date: addDays(startDate, index),
    }));
  };

  // ============================================================
  // INITIAL LECTURES
  // ============================================================

  useEffect(() => {
    setLectureDates(createLectureDates(lectureCount, todayString));

    setExperienceSharingDate("");
    setContestDate("");
  }, []);

  // ============================================================
  // FETCH BATCHES
  // ============================================================

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setError("");

        const res = await api.get("/batches");

        const list = Array.isArray(res.data?.batches)
          ? res.data.batches
          : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : [];

        setBatches(list);

        if (list.length > 0) {
          setSelectedBatch(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load batches:", err);

        setError(err.response?.data?.message || "Failed to load batches.");
      }
    };

    fetchBatches();
  }, []);

  // ============================================================
  // FETCH SESSIONS
  // ============================================================

  const fetchSessions = async () => {
    if (!selectedBatch) {
      setSessions([]);
      return;
    }

    setLoadingSessions(true);
    setError("");

    try {
      const res = await api.get(`/sessions/batch/${selectedBatch}`);

      setSessions(Array.isArray(res.data?.sessions) ? res.data.sessions : []);
    } catch (err) {
      console.error("Failed to load sessions:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load sessions for this batch.",
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedBatch]);

  // ============================================================
  // CHANGE WEEK START DATE
  // ============================================================

  const handleStartDateChange = (value) => {
    setWeekStartDate(value);

    if (!value) {
      return;
    }

    setLectureDates((previous) =>
      previous.map((lecture, index) => ({
        ...lecture,
        date: addDays(value, index),
      })),
    );

    // Optional events are not automatically
    // created.
  };

  // ============================================================
  // CHANGE LECTURE COUNT
  // ============================================================

  const handleLectureCountChange = (value) => {
    let count = Number(value);

    if (!Number.isInteger(count) || count < 1) {
      count = 1;
    }

    setLectureCount(count);

    setLectureDates((previous) => {
      // ------------------------------------------------------
      // REDUCE
      // ------------------------------------------------------

      if (count < previous.length) {
        return previous.slice(0, count);
      }

      // ------------------------------------------------------
      // ADD
      // ------------------------------------------------------

      if (count > previous.length) {
        const newLectures = [...previous];

        for (let index = previous.length; index < count; index++) {
          newLectures.push({
            id: Date.now() + index + Math.random(),

            date: addDays(weekStartDate || todayString, index),
          });
        }

        return newLectures;
      }

      return previous;
    });
  };

  // ============================================================
  // CHANGE ONE LECTURE DATE
  // ============================================================

  const handleLectureDateChange = (lectureId, value) => {
    setLectureDates((previous) =>
      previous.map((lecture) =>
        lecture.id === lectureId
          ? {
              ...lecture,
              date: value,
            }
          : lecture,
      ),
    );
  };

  // ============================================================
  // REMOVE ONE LECTURE
  // ============================================================

  const handleRemoveLecture = (lectureId) => {
    setLectureDates((previous) => {
      const updated = previous.filter((lecture) => lecture.id !== lectureId);

      if (updated.length === 0) {
        return [
          {
            id: Date.now(),
            date: weekStartDate || todayString,
          },
        ];
      }

      return updated;
    });

    setLectureCount((previous) => Math.max(previous - 1, 1));
  };

  // ============================================================
  // ADD ONE LECTURE
  // ============================================================

  const handleAddLecture = () => {
    const nextLectureNumber = lectureDates.length;

    const newLecture = {
      id: Date.now() + Math.random(),

      date: addDays(weekStartDate || todayString, nextLectureNumber),
    };

    setLectureDates((previous) => [...previous, newLecture]);

    setLectureCount((previous) => previous + 1);
  };

  // ============================================================
  // ADD EXPERIENCE SHARING
  // ============================================================

  const handleAddExperienceSharing = () => {
    if (!experienceSharingDate) {
      setExperienceSharingDate(addDays(weekStartDate || todayString, 3));
    }
  };

  // ============================================================
  // REMOVE EXPERIENCE SHARING
  // ============================================================

  const handleRemoveExperienceSharing = () => {
    setExperienceSharingDate("");
  };

  // ============================================================
  // ADD CONTEST
  // ============================================================

  const handleAddContest = () => {
    if (!contestDate) {
      setContestDate(addDays(weekStartDate || todayString, 5));
    }
  };

  // ============================================================
  // REMOVE CONTEST
  // ============================================================

  const handleRemoveContest = () => {
    setContestDate("");
  };

  // ============================================================
  // VALIDATE DATES
  // ============================================================

  const validateDates = () => {
    if (!weekStartDate) {
      return "Please select a week start date.";
    }

    if (weekStartDate < todayString) {
      return "You cannot select a past week start date.";
    }

    if (lectureDates.length === 0) {
      return "At least one lecture is required.";
    }

    for (let index = 0; index < lectureDates.length; index++) {
      const lecture = lectureDates[index];

      if (!lecture.date) {
        return `Please select a date for Lecture ${index + 1}.`;
      }

      if (lecture.date < todayString) {
        return `Lecture ${index + 1} cannot be scheduled in the past.`;
      }
    }

    if (experienceSharingDate && experienceSharingDate < todayString) {
      return "Experience Sharing cannot be scheduled in the past.";
    }

    if (contestDate && contestDate < todayString) {
      return "Contest cannot be scheduled in the past.";
    }

    return null;
  };

  // ============================================================
  // GENERATE WEEK
  // ============================================================

  const handleGenerate = async () => {
    if (!selectedBatch) {
      setError("Select a batch first.");
      return;
    }

    const validationError = validateDates();

    if (validationError) {
      setError(validationError);
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      // --------------------------------------------------------
      // BUILD LECTURE DATES
      // --------------------------------------------------------
      //
      // IMPORTANT:
      //
      // These names match the backend:
      //
      // lecture1
      // lecture2
      // lecture3
      // ...
      //
      // --------------------------------------------------------

      const lectureDateObject = {};

      lectureDates.forEach((lecture, index) => {
        lectureDateObject[`lecture${index + 1}`] = lecture.date;
      });

      // --------------------------------------------------------
      // SEND REQUEST
      // --------------------------------------------------------

      const res = await api.post("/sessions/generate-week", {
        batchId: selectedBatch,

        week: Number(week),

        lectureCount: lectureDates.length,

        weekStartDate,

        dates: {
          ...lectureDateObject,

          experienceSharing: experienceSharingDate || null,

          contest: contestDate || null,
        },
      });

      // --------------------------------------------------------
      // SUCCESS MESSAGE
      // --------------------------------------------------------

      const lecturesCreated = res.data?.lecturesCreated ?? 0;

      const experienceCreated = res.data?.experienceSharingCreated;

      const contestCreated = res.data?.contestCreated;

      let message = `Week ${week} generated successfully. `;

      message += `${lecturesCreated} lecture${
        lecturesCreated === 1 ? "" : "s"
      } created.`;

      if (experienceCreated) {
        message += " Experience Sharing created.";
      }

      if (contestCreated) {
        message += " Contest created.";
      }

      setSuccess(message);

      await fetchSessions();
    } catch (err) {
      console.error("Generate sessions error:", err);

      setError(
        err.response?.data?.message || "Failed to generate week sessions.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // ============================================================
  // DELETE CREATED SESSION
  // ============================================================

  const handleDelete = async (sessionId) => {
    if (!sessionId) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this session?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/sessions/${sessionId}`);

      setSessions((previous) =>
        previous.filter((session) => session._id !== sessionId),
      );

      setSuccess("Session removed successfully.");
    } catch (err) {
      console.error("Delete session error:", err);

      setError(err.response?.data?.message || "Failed to delete session.");
    }
  };

  // ============================================================
  // GROUP SESSIONS BY WEEK
  // ============================================================

  const sessionsByWeek = useMemo(() => {
    return sessions.reduce((acc, session) => {
      const weekNumber = session.week;

      if (!acc[weekNumber]) {
        acc[weekNumber] = [];
      }

      acc[weekNumber].push(session);

      return acc;
    }, {});
  }, [sessions]);

  const weekNumbers = Object.keys(sessionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  // ============================================================
  // SORT LECTURE CARDS
  // ============================================================

  const sortedLectureDates = [...lectureDates];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A3D63] text-white">
              <Layers size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Weekly Sessions Generator
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-500">
                Configure each lecture independently. Optional weekly events can
                be added when needed.
              </p>
            </div>
          </div>
        </header>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />

            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* ======================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <CheckCircle2 size={20} className="mt-0.5 text-emerald-500" />

            <p className="text-sm font-bold text-emerald-700">{success}</p>
          </div>
        )}

        {/* ======================================================
            GENERATOR
        ====================================================== */}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-black text-slate-900">
            Generate Week Schedule
          </h2>

          {/* ====================================================
              BASIC SETTINGS
          ==================================================== */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Batch */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Batch
              </label>

              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              >
                {batches.length === 0 && (
                  <option value="">No batches available</option>
                )}

                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Week */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Week Number
              </label>

              <input
                type="number"
                min={1}
                value={week}
                onChange={(e) =>
                  setWeek(Math.max(Number(e.target.value) || 1, 1))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              />
            </div>

            {/* Lecture Count */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Number of Lectures
              </label>

              <input
                type="number"
                min={1}
                value={lectureCount}
                onChange={(e) => handleLectureCountChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              />

              <p className="mt-1 text-[10px] font-medium text-slate-400">
                You can create 1, 2, 3, 4, 5, 6... lectures.
              </p>
            </div>

            {/* Week Start */}

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Week Start Date
              </label>

              <input
                type="date"
                min={todayString}
                value={weekStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              />
            </div>
          </div>

          {/* ====================================================
              LECTURE DATES
          ==================================================== */}

          <div className="mt-6 rounded-3xl border border-blue-100 bg-[#F6FAFD] p-5 sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-black text-[#1A3D63]">
                  Lecture Dates
                </h3>

                <p className="mt-1 text-xs font-medium text-slate-500">
                  Each lecture has an independent date. Changing one lecture
                  will NOT change another lecture.
                </p>
              </div>

              {/* Add Lecture */}

              <button
                type="button"
                onClick={handleAddLecture}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#4A7FA7]"
              >
                <Plus size={15} />
                Add Lecture
              </button>
            </div>

            {/* LECTURE CARDS */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sortedLectureDates.map((lecture, index) => (
                <div
                  key={lecture.id}
                  className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {/* Delete */}

                  <button
                    type="button"
                    onClick={() => handleRemoveLecture(lecture.id)}
                    disabled={lectureDates.length <= 1}
                    title={
                      lectureDates.length <= 1
                        ? "At least one lecture is required"
                        : `Remove Lecture ${index + 1}`
                    }
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Trash2 size={15} />
                  </button>

                  {/* Lecture Name */}

                  <div className="mb-3 pr-10">
                    <p className="text-sm font-black text-[#1A3D63]">
                      Lecture {index + 1}
                    </p>

                    <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                      Independent lecture date
                    </p>
                  </div>

                  {/* Date */}

                  <input
                    type="date"
                    min={todayString}
                    value={lecture.date || ""}
                    onChange={(e) =>
                      handleLectureDateChange(lecture.id, e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
                  />
                </div>
              ))}
            </div>

            {/* Lecture count */}

            <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3">
              <span className="text-xs font-bold text-slate-500">
                Total lectures configured
              </span>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-[#1A3D63]">
                {lectureDates.length}
              </span>
            </div>
          </div>

          {/* ====================================================
              OPTIONAL WEEKLY EVENTS
          ==================================================== */}

          <div className="mt-6 rounded-3xl border border-slate-100 bg-[#F6FAFD] p-5 sm:p-6">
            <div className="mb-5">
              <h3 className="text-lg font-black text-[#1A3D63]">
                Optional Weekly Events
              </h3>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Experience Sharing and Contest are optional. If you do not need
                one this week, leave it empty.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* EXPERIENCE SHARING */}

              <div className="relative rounded-2xl border border-slate-200 bg-white p-5">
                {experienceSharingDate ? (
                  <button
                    type="button"
                    onClick={handleRemoveExperienceSharing}
                    title="Remove Experience Sharing"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                  >
                    <X size={15} />
                  </button>
                ) : null}

                <div className="mb-3 pr-10">
                  <p className="text-sm font-black text-[#1A3D63]">
                    🎤 Experience Sharing
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                    Optional
                  </p>
                </div>

                {experienceSharingDate ? (
                  <input
                    type="date"
                    min={todayString}
                    value={experienceSharingDate}
                    onChange={(e) => setExperienceSharingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleAddExperienceSharing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#4A7FA7] bg-blue-50 px-4 py-3 text-xs font-bold text-[#1A3D63] transition hover:bg-blue-100"
                  >
                    <Plus size={15} />
                    Add Experience Sharing
                  </button>
                )}
              </div>

              {/* CONTEST */}

              <div className="relative rounded-2xl border border-slate-200 bg-white p-5">
                {contestDate ? (
                  <button
                    type="button"
                    onClick={handleRemoveContest}
                    title="Remove Contest"
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700"
                  >
                    <X size={15} />
                  </button>
                ) : null}

                <div className="mb-3 pr-10">
                  <p className="text-sm font-black text-[#1A3D63]">
                    🏆 Contest
                  </p>

                  <p className="mt-1 text-[10px] font-medium text-slate-400">
                    Optional
                  </p>
                </div>

                {contestDate ? (
                  <input
                    type="date"
                    min={todayString}
                    value={contestDate}
                    onChange={(e) => setContestDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={handleAddContest}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#4A7FA7] bg-blue-50 px-4 py-3 text-xs font-bold text-[#1A3D63] transition hover:bg-blue-100"
                  >
                    <Plus size={15} />
                    Add Contest
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ====================================================
              GENERATE
          ==================================================== */}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#1A3D63] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CalendarPlus size={15} />
            )}

            {generating ? "Generating..." : "Generate Week Schedule"}
          </button>
        </div>

        {/* ======================================================
            CONFIGURED SESSIONS
        ====================================================== */}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5">
            <h2 className="text-lg font-black text-slate-900">
              Configured Sessions Timeline
            </h2>

            <p className="mt-1 text-xs font-medium text-slate-400">
              These are sessions already created in the database. You can remove
              any session individually.
            </p>
          </div>

          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[#1A3D63]" />

              <p className="mt-3 text-xs font-semibold text-slate-400">
                Loading sessions...
              </p>
            </div>
          ) : weekNumbers.length === 0 ? (
            <p className="py-6 text-center text-sm font-medium text-slate-400">
              No sessions configured for this batch yet.
            </p>
          ) : (
            <div className="space-y-6">
              {weekNumbers.map((weekNum) => (
                <div key={weekNum}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#1A3D63]">
                    Week {weekNum}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sessionsByWeek[weekNum]
                      .sort((a, b) => {
                        const dateA = new Date(a.date).getTime();

                        const dateB = new Date(b.date).getTime();

                        if (dateA !== dateB) {
                          return dateA - dateB;
                        }

                        return Number(a.order || 0) - Number(b.order || 0);
                      })
                      .map((session) => (
                        <div
                          key={session._id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {session.name}
                            </p>

                            <p className="mt-0.5 text-[10px] font-semibold text-[#4A7FA7]">
                              {session.type}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                              <Calendar size={13} className="text-[#4A7FA7]" />

                              <span>
                                {new Date(session.date).toLocaleDateString(
                                  undefined,
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDelete(session._id)}
                            title={`Delete ${session.name}`}
                            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      ))}
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

export default AdminSessions;
