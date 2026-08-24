import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers,
  Calendar,
} from "lucide-react";
import api from "../../utils/api";

const AdminSessions = () => {
  const todayString = new Date().toISOString().split("T")[0];

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [week, setWeek] = useState(1);
  const [lectureCount, setLectureCount] = useState(2);
  const [weekStartDate, setWeekStartDate] = useState(todayString);

  const [experienceSharingDate, setExperienceSharingDate] = useState("");
  const [contestDate, setContestDate] = useState("");

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await api.get("/batches");
        const list = Array.isArray(res.data?.batches)
          ? res.data.batches
          : res.data || [];

        setBatches(list);

        if (list.length > 0) {
          setSelectedBatch(list[0]._id);
        }
      } catch (err) {
        setError("Failed to load batches.");
      }
    };

    fetchBatches();
  }, []);

  const fetchSessions = async () => {
    if (!selectedBatch) return;

    setLoadingSessions(true);
    setError("");

    try {
      const res = await api.get(`/sessions/batch/${selectedBatch}`);
      setSessions(Array.isArray(res.data?.sessions) ? res.data.sessions : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load sessions for this batch."
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedBatch]);

  const handleStartDateChange = (val) => {
    setWeekStartDate(val);
    if (!val) return;

    const base = new Date(val);
    if (Number.isNaN(base.getTime())) return;

    const addD = (d, days) => {
      const r = new Date(d);
      r.setDate(r.getDate() + days);
      return r.toISOString().split("T")[0];
    };

    setExperienceSharingDate(addD(base, 3));
    setContestDate(addD(base, 5));
  };

  useEffect(() => {
    if (weekStartDate) {
      handleStartDateChange(weekStartDate);
    }
  }, []);

  const handleGenerate = async () => {
    if (!selectedBatch) {
      setError("Select a batch first.");
      return;
    }

    if (!weekStartDate) {
      setError("Pick a valid week start date.");
      return;
    }

    if (weekStartDate < todayString) {
      setError("You cannot pick a past date. Please select today or a future date.");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/sessions/generate-week", {
        batchId: selectedBatch,
        week,
        lectureCount,
        weekStartDate,
        dates: {
          default: weekStartDate,
          experienceSharing: experienceSharingDate || undefined,
          contest: contestDate || undefined,
        },
      });

      setSuccess(res.data?.message || "Sessions generated successfully across future days.");
      await fetchSessions();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate week sessions."
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete session.");
    }
  };

  const sessionsByWeek = sessions.reduce((acc, session) => {
    acc[session.week] = acc[session.week] || [];
    acc[session.week].push(session);
    return acc;
  }, {});

  const weekNumbers = Object.keys(sessionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
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
                Configure schedule for current and upcoming dates. Past dates are locked.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-500"
            />
            <p className="text-sm font-bold text-emerald-700">{success}</p>
          </div>
        )}

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-black text-slate-900">
            Generate Week Schedule
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              >
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Week Number
              </label>
              <input
                type="number"
                min={1}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                Lectures Count
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={lectureCount}
                onChange={(e) => setLectureCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#4A7FA7] focus:bg-white"
              />
            </div>

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

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl bg-[#F6FAFD] p-4 border border-slate-100">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1A3D63]">
                🎤 Experience Sharing Date (Mid-Week)
              </label>
              <input
                type="date"
                min={todayString}
                value={experienceSharingDate}
                onChange={(e) => setExperienceSharingDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1A3D63]">
                🏆 Contest Date (Weekend)
              </label>
              <input
                type="date"
                min={todayString}
                value={contestDate}
                onChange={(e) => setContestDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 flex items-center gap-2 rounded-xl bg-[#1A3D63] px-6 py-3 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CalendarPlus size={15} />
            )}
            Generate Staggered Week
          </button>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-black text-slate-900">
            Configured Sessions Timeline
          </h2>

          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-[#1A3D63]" />
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
                    {sessionsByWeek[weekNum].map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {session.name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <Calendar size={13} className="text-[#4A7FA7]" />
                            <span>
                              {new Date(session.date).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(session._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
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