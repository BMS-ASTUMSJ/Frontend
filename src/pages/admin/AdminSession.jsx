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
  RefreshCw,
} from "lucide-react";
import api from "../../utils/api";

const AdminSessions = () => {
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

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [week, setWeek] = useState(1);
  const [lectureCount, setLectureCount] = useState(2);
  const [lectureDates, setLectureDates] = useState([]);

  const [weekStartDate, setWeekStartDate] = useState(todayString);

  const [experienceSharingDate, setExperienceSharingDate] = useState("");
  const [contestDate, setContestDate] = useState("");

  const [sessions, setSessions] = useState([]);

  const [loadingSessions, setLoadingSessions] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full rounded-xl border border-[#D9E4EA] bg-[#F7FAFC] px-3.5 py-2.5 text-sm text-[#14222B] outline-none transition placeholder:text-[#9AAAB4] focus:border-[#00A8CC] focus:bg-white focus:ring-4 focus:ring-[#00A8CC]/10";

  const labelClass =
    "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#14222B]";

  const cardClass =
    "rounded-2xl border border-[#DCE7EC] bg-white shadow-[0_2px_8px_rgba(20,34,43,0.035)]";

  const createLectureDates = (count, startDate) => {
    const safeCount = Math.max(Number(count) || 1, 1);

    return Array.from({ length: safeCount }, (_, index) => ({
      id: Date.now() + index + Math.random(),
      date: addDays(startDate, index),
    }));
  };

  useEffect(() => {
    setLectureDates(createLectureDates(lectureCount, todayString));
    setExperienceSharingDate("");
    setContestDate("");
  }, []);

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
  };

  const handleLectureCountChange = (value) => {
    let count = Number(value);

    if (!Number.isInteger(count) || count < 1) {
      count = 1;
    }

    setLectureCount(count);

    setLectureDates((previous) => {
      if (count < previous.length) {
        return previous.slice(0, count);
      }

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

  const handleAddLecture = () => {
    const nextLectureNumber = lectureDates.length;

    const newLecture = {
      id: Date.now() + Math.random(),
      date: addDays(weekStartDate || todayString, nextLectureNumber),
    };

    setLectureDates((previous) => [...previous, newLecture]);

    setLectureCount((previous) => previous + 1);
  };

  const handleAddExperienceSharing = () => {
    if (!experienceSharingDate) {
      setExperienceSharingDate(addDays(weekStartDate || todayString, 3));
    }
  };

  const handleRemoveExperienceSharing = () => {
    setExperienceSharingDate("");
  };

  const handleAddContest = () => {
    if (!contestDate) {
      setContestDate(addDays(weekStartDate || todayString, 5));
    }
  };

  const handleRemoveContest = () => {
    setContestDate("");
  };

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
      const lectureDateObject = {};

      lectureDates.forEach((lecture, index) => {
        lectureDateObject[`lecture${index + 1}`] = lecture.date;
      });

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

  const handleDelete = async (sessionId) => {
    if (!sessionId) return;

    try {
      setDeletingId(sessionId);
      setError("");
      setSuccess("");

      await api.delete(`/sessions/${sessionId}`);

      setSessions((previous) =>
        previous.filter((session) => session._id !== sessionId),
      );

      setSuccess("Session removed successfully.");
    } catch (err) {
      console.error("Delete session error:", err);

      setError(err.response?.data?.message || "Failed to delete session.");
    } finally {
      setDeletingId(null);
    }
  };

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

  const sortedLectureDates = [...lectureDates];

  const formatDisplayDate = (date) => {
    if (!date) return "No date";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "Invalid date";
    }

    return parsed.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="mx-3 mt-0 sm:mx-4 lg:mx-6">
        <div className="overflow-hidden rounded-b-2xl rounded-t-none bg-[#0E2933] shadow-[0_4px_12px_rgba(20,34,43,0.12)]">
          <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] shadow-[0_4px_12px_rgba(0,168,204,0.25)] sm:h-14 sm:w-14">
                  <CalendarPlus className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    Weekly Sessions
                  </h1>

                  <p className="mt-1 text-xs font-medium text-[#B4D7E2] sm:text-sm">
                    Create and manage weekly lectures, contests and experience
                    sharing sessions
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-[10px] font-bold text-white backdrop-blur-sm">
                <Layers className="h-3.5 w-3.5 text-[#00A8CC]" />
                {sessions.length} Session
                {sessions.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-red-800">
                Something went wrong
              </p>

              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto shrink-0 rounded-lg p-1.5 text-red-400 transition hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-800">Success</p>

              <p className="mt-0.5 text-xs text-emerald-700">{success}</p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto shrink-0 rounded-lg p-1.5 text-emerald-400 transition hover:bg-emerald-100 hover:text-emerald-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14222B]">
              Generate Week Schedule
            </h2>

            <p className="mt-0.5 text-xs text-[#71838E]">
              Configure lectures and optional weekly events.
            </p>
          </div>

          <div className={`${cardClass} overflow-hidden`}>
            <div className="border-b border-[#DCE7EC] bg-[#F7FAFC] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <CalendarPlus className="h-5 w-5 text-[#00A8CC]" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#14222B]">
                    Schedule Information
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#71838E]">
                    Select the batch, week and lecture schedule.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6 p-5">
              <div>
                <div className="mb-4">
                  <h3 className="text-xs font-bold text-[#14222B]">
                    Schedule Details
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#71838E]">
                    Set the basic information for this weekly schedule.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClass}>Batch</label>

                    <select
                      value={selectedBatch}
                      onChange={(e) => setSelectedBatch(e.target.value)}
                      className={inputClass}
                    >
                      {batches.length === 0 && (
                        <option value="">No batches available</option>
                      )}

                      {batches.map((batchItem) => (
                        <option key={batchItem._id} value={batchItem._id}>
                          {batchItem.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Week Number</label>

                    <input
                      type="number"
                      min={1}
                      value={week}
                      onChange={(e) =>
                        setWeek(Math.max(Number(e.target.value) || 1, 1))
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Number of Lectures</label>

                    <input
                      type="number"
                      min={1}
                      value={lectureCount}
                      onChange={(e) => handleLectureCountChange(e.target.value)}
                      className={inputClass}
                    />

                    <p className="mt-1.5 text-[10px] text-[#8FA3B0]">
                      Add as many lectures as needed.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Week Start Date</label>

                    <input
                      type="date"
                      min={todayString}
                      value={weekStartDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC]">
                <div className="flex flex-col gap-3 border-b border-[#DCE7EC] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                      <Calendar className="h-4 w-4 text-[#00A8CC]" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#14222B]">
                        Lecture Dates
                      </h3>

                      <p className="mt-0.5 text-[10px] text-[#71838E]">
                        Each lecture can have its own date.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLecture}
                    className="inline-flex w-fit items-center justify-center gap-1.5 rounded-xl bg-[#00A8CC] px-4 py-2.5 text-[10px] font-bold text-white transition hover:bg-[#0088A6]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Lecture
                  </button>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedLectureDates.map((lecture, index) => (
                    <div
                      key={lecture.id}
                      className="relative rounded-xl border border-[#DCE7EC] bg-white p-4 transition hover:border-[#B4D7E2] hover:shadow-[0_2px_8px_rgba(20,34,43,0.04)]"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveLecture(lecture.id)}
                        disabled={lectureDates.length <= 1}
                        title={
                          lectureDates.length <= 1
                            ? "At least one lecture is required"
                            : `Remove Lecture ${index + 1}`
                        }
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-[#8FA3B0] transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="mb-4 pr-9">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white border-[#00A8CC]">
                            <span className="text-[10px] font-extrabold text-[#00A8CC]">
                              {index + 1}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#14222B]">
                              Lecture {index + 1}
                            </p>

                            <p className="mt-0.5 text-[10px] text-[#8FA3B0]">
                              Independent date
                            </p>
                          </div>
                        </div>
                      </div>

                      <label className={labelClass}>Date</label>

                      <input
                        type="date"
                        min={todayString}
                        value={lecture.date || ""}
                        onChange={(e) =>
                          handleLectureDateChange(lecture.id, e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[#DCE7EC] bg-white px-5 py-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA3B0]">
                    Total lectures
                  </span>

                  <span className="rounded-full bg-[#E3F5F9] px-3 py-1 text-[10px] font-bold text-[#0088A6]">
                    {lectureDates.length}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC]">
                <div className="border-b border-[#DCE7EC] bg-white p-5">
                  <h3 className="text-sm font-bold text-[#14222B]">
                    Optional Weekly Events
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#71838E]">
                    Add Experience Sharing or a Contest when needed.
                  </p>
                </div>

                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <div className="relative rounded-xl border border-[#DCE7EC] bg-white p-4">
                    {experienceSharingDate && (
                      <button
                        type="button"
                        onClick={handleRemoveExperienceSharing}
                        title="Remove Experience Sharing"
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-[#8FA3B0] transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <div className="mb-4 pr-9">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                          <span className="text-sm">🎤</span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#14222B]">
                            Experience Sharing
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#8FA3B0]">
                            Optional weekly event
                          </p>
                        </div>
                      </div>
                    </div>

                    {experienceSharingDate ? (
                      <>
                        <label className={labelClass}>Event Date</label>

                        <input
                          type="date"
                          min={todayString}
                          value={experienceSharingDate}
                          onChange={(e) =>
                            setExperienceSharingDate(e.target.value)
                          }
                          className={inputClass}
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddExperienceSharing}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#B4D7E2] bg-[#E3F5F9] px-3 py-3 text-[10px] font-bold text-[#0088A6] transition hover:border-[#00A8CC] hover:bg-[#D8F2F7]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Experience Sharing
                      </button>
                    )}
                  </div>

                  <div className="relative rounded-xl border border-[#DCE7EC] bg-white p-4">
                    {contestDate && (
                      <button
                        type="button"
                        onClick={handleRemoveContest}
                        title="Remove Contest"
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-[#8FA3B0] transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <div className="mb-4 pr-9">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                          <span className="text-sm">🏆</span>
                        </div>

                        <div>
                          <p className="text-xs font-bold text-[#14222B]">
                            Contest
                          </p>

                          <p className="mt-0.5 text-[10px] text-[#8FA3B0]">
                            Optional weekly event
                          </p>
                        </div>
                      </div>
                    </div>

                    {contestDate ? (
                      <>
                        <label className={labelClass}>Event Date</label>

                        <input
                          type="date"
                          min={todayString}
                          value={contestDate}
                          onChange={(e) => setContestDate(e.target.value)}
                          className={inputClass}
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddContest}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#B4D7E2] bg-[#E3F5F9] px-3 py-3 text-[10px] font-bold text-[#0088A6] transition hover:border-[#00A8CC] hover:bg-[#D8F2F7]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Contest
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-[#DCE7EC] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold text-[#14222B]">
                    Week {week} Schedule
                  </p>

                  <p className="mt-1 text-[10px] text-[#71838E]">
                    {lectureDates.length} lecture
                    {lectureDates.length !== 1 ? "s" : ""}
                    {experienceSharingDate ? " · Experience Sharing" : ""}
                    {contestDate ? " · Contest" : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CalendarPlus className="h-4 w-4" />
                  )}

                  {generating ? "Generating..." : "Generate Week Schedule"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14222B]">
              Configured Sessions
            </h2>

            <p className="mt-0.5 text-xs text-[#71838E]">
              View and manage sessions already created for this batch.
            </p>
          </div>
          <section className={cardClass}>
            <div className="flex flex-col gap-3 border-b border-[#DCE7EC] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <Layers className="h-4 w-4 text-[#00A8CC]" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#14222B]">
                    Session Timeline
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#71838E]">
                    Sessions grouped by their scheduled week.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchSessions}
                disabled={loadingSessions}
                className="inline-flex w-fit items-center justify-center gap-1.5 rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] px-3 py-2 text-[10px] font-bold text-[#0088A6] transition hover:border-[#B4D7E2] hover:bg-[#E3F5F9] disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    loadingSessions ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
            <div className="mx-5 mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] px-4 py-3">
              <Calendar className="h-3.5 w-3.5 text-[#00A8CC]" />

              <span className="text-[10px] text-[#71838E]">Showing</span>

              <span className="text-[10px] font-extrabold text-[#14222B]">
                {sessions.length}
              </span>

              <span className="text-[10px] text-[#71838E]">
                session
                {sessions.length !== 1 ? "s" : ""}
              </span>

              {selectedBatch && (
                <>
                  <span className="text-[#B4D7E2]">•</span>

                  <span className="truncate text-[10px] font-bold text-[#293E4C]">
                    {batches.find((item) => item._id === selectedBatch)?.name ||
                      "Selected batch"}
                  </span>
                </>
              )}
            </div>
            {loadingSessions ? (
              <div className="flex min-h-75 flex-col items-center justify-center p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
                  <Loader2 className="h-6 w-6 animate-spin text-[#00A8CC]" />
                </div>

                <p className="mt-4 text-sm font-bold text-[#14222B]">
                  Loading sessions
                </p>

                <p className="mt-1 text-xs text-[#71838E]">
                  Fetching configured sessions...
                </p>
              </div>
            ) : weekNumbers.length === 0 ? (
              <div className="flex min-h-75 flex-col items-center justify-center px-5 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
                  <Calendar className="h-6 w-6 text-[#B4D7E2]" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#14222B]">
                  No sessions configured
                </h3>

                <p className="mt-1 max-w-sm text-xs text-[#71838E]">
                  Generate a weekly schedule using the form above.
                </p>
              </div>
            ) : (
              <div className="space-y-7 p-5">
                {weekNumbers.map((weekNum) => (
                  <div key={weekNum}>
                    {/* WEEK HEADER */}

                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-white border-[#00A8CC]">
                        <span className="text-[10px] font-extrabold text-[#00A8CC]">
                          {weekNum}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#14222B]">
                          Week {weekNum}
                        </p>

                        <p className="mt-0.5 text-[10px] text-[#71838E]">
                          Weekly session timeline
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                            className="group rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-4 transition hover:border-[#B4D7E2] hover:bg-white hover:shadow-[0_2px_8px_rgba(20,34,43,0.04)]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9]">
                                    <Calendar className="h-4 w-4 text-[#00A8CC]" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="break-words text-xs font-bold text-[#14222B]">
                                      {session.name}
                                    </p>

                                    <span className="mt-1.5 inline-flex rounded-full bg-[#E3F5F9] px-2.5 py-1 text-[9px] font-bold text-[#0088A6]">
                                      {session.type}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-4 rounded-xl border border-[#DCE7EC] bg-white px-3 py-3">
                                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA3B0]">
                                    Scheduled Date
                                  </p>

                                  <p className="mt-1 text-xs font-bold text-[#14222B]">
                                    {formatDisplayDate(session.date)}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDelete(session._id)}
                                disabled={deletingId === session._id}
                                title={`Delete ${session.name}`}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8FA3B0] transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === session._id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
};

export default AdminSessions;
