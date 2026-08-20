import { useEffect, useState } from "react";
import {
  CalendarPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Layers,
} from "lucide-react";
import api from "../../utils/api";

// ============================================================
// ADMIN SESSIONS
// ============================================================
//
// Admins configure each week's sessions here — how many
// lectures that week has (2, 4, or any number), plus the
// Contest and Experience Sharing sessions, each with a date.
//
// Mentors never create sessions; they only see and mark
// attendance against whatever is generated here.
// ============================================================

const AdminSessions = () => {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");

  const [week, setWeek] = useState(1);
  const [lectureCount, setLectureCount] = useState(2);
  const [defaultDate, setDefaultDate] = useState("");

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD BATCHES
  // ==========================================================

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
        console.error("Failed to load batches:", err);
        setError("Failed to load batches.");
      }
    };

    fetchBatches();
  }, []);

  // ==========================================================
  // LOAD SESSIONS FOR SELECTED BATCH
  // ==========================================================

  const fetchSessions = async () => {
    if (!selectedBatch) return;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatch]);

  // ==========================================================
  // GENERATE WEEK
  // ==========================================================

  const handleGenerate = async () => {
    if (!selectedBatch) {
      setError("Select a batch first.");
      return;
    }

    if (!defaultDate) {
      setError("Pick a default date for this week's sessions.");
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
        dates: { default: defaultDate },
      });

      setSuccess(res.data?.message || "Sessions generated successfully.");

      await fetchSessions();
    } catch (err) {
      console.error("Failed to generate sessions:", err);
      setError(
        err.response?.data?.message || "Failed to generate week sessions.",
      );
    } finally {
      setGenerating(false);
    }
  };

  // ==========================================================
  // DELETE SESSION
  // ==========================================================

  const handleDelete = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
    } catch (err) {
      console.error("Failed to delete session:", err);
      setError(err.response?.data?.message || "Failed to delete session.");
    }
  };

  // ==========================================================
  // GROUP SESSIONS BY WEEK
  // ==========================================================

  const sessionsByWeek = sessions.reduce((acc, session) => {
    acc[session.week] = acc[session.week] || [];
    acc[session.week].push(session);
    return acc;
  }, {});

  const weekNumbers = Object.keys(sessionsByWeek)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}

        <header className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Layers size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                Weekly Sessions
              </h1>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Configure how many lectures each week has, plus Contest and
                Experience Sharing. Mentors mark attendance against these.
              </p>
            </div>
          </div>
        </header>

        {/* ERROR / SUCCESS */}

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

        {/* GENERATE FORM */}

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-black text-gray-900">
            Generate a Week
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              >
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Week Number
              </label>
              <input
                type="number"
                min={1}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Lectures This Week
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={lectureCount}
                onChange={(e) => setLectureCount(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                e.g. 2 for a normal week, 4 for a heavier week
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                Default Date
              </label>
              <input
                type="date"
                value={defaultDate}
                onChange={(e) => setDefaultDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-400">
            This creates {lectureCount} Lecture session(s), 1 Contest and 1
            Experience Sharing session for the selected week. Regenerating a
            week replaces its existing sessions.
          </p>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CalendarPlus size={15} />
            )}
            Generate Week
          </button>
        </div>

        {/* EXISTING SESSIONS */}

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 text-lg font-black text-gray-900">
            Configured Sessions
          </h2>

          {loadingSessions ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
            </div>
          ) : weekNumbers.length === 0 ? (
            <p className="py-6 text-center text-sm font-medium text-gray-400">
              No sessions configured for this batch yet.
            </p>
          ) : (
            <div className="space-y-6">
              {weekNumbers.map((weekNum) => (
                <div key={weekNum}>
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-500">
                    Week {weekNum}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sessionsByWeek[weekNum].map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {session.name}
                          </p>
                          <p className="text-[10px] font-semibold uppercase text-gray-400">
                            {session.type} ·{" "}
                            {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDelete(session._id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Remove session"
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
