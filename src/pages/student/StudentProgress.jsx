import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  CheckCircle2,
  Clock,
  TrendingUp,
  Code2,
  Monitor,
  ExternalLink,
  Loader2,
  Trophy,
  AlertCircle,
  Play,
  Send,
  X,
} from "lucide-react";

function StudentProgress() {
  const [dashboard, setDashboard] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal State for CP Submission
  const [selectedCpContent, setSelectedCpContent] = useState(null);
  const [submittingCp, setSubmittingCp] = useState(false);
  const [cpForm, setCpForm] = useState({
    submissionLink: "",
    attempts: 1,
    timeSpent: 30,
  });

  const [updatingId, setUpdatingId] = useState(null);

  // Load dashboard metrics & progress checklist
  const loadProgressData = async () => {
    try {
      setError("");
      const [dashRes, progRes] = await Promise.allSettled([
        api.get("/progress/student/dashboard"),
        api.get("/progress/student/progress"),
      ]);

      if (dashRes.status === "fulfilled") {
        setDashboard(dashRes.value.data?.data || dashRes.value.data || {});
      }

      if (progRes.status === "fulfilled") {
        const progData = progRes.value.data?.data || progRes.value.data || [];
        setProgressList(Array.isArray(progData) ? progData : []);
      }
    } catch (err) {
      console.error("Failed to load progress:", err);
      setError("Failed to load your learning progress.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        setLoading(true);
        const [dashRes, progRes] = await Promise.allSettled([
          api.get("/progress/student/dashboard"),
          api.get("/progress/student/progress"),
        ]);

        if (isMounted) {
          if (dashRes.status === "fulfilled") {
            setDashboard(dashRes.value.data?.data || dashRes.value.data || {});
          }

          if (progRes.status === "fulfilled") {
            const progData = progRes.value.data?.data || progRes.value.data || [];
            setProgressList(Array.isArray(progData) ? progData : []);
          }
        }
      } catch (err) {
        console.error("Failed to load progress:", err);
        if (isMounted) {
          setError("Failed to load your learning progress.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Quick Status Update
  const handleQuickUpdate = async (contentId, updatePayload) => {
    try {
      setUpdatingId(contentId);
      setError("");
      setSuccess("");

      await api.patch(`/progress/student/progress/${contentId}`, updatePayload);
      setSuccess("Progress updated successfully!");
      await loadProgressData();
    } catch (err) {
      console.error("Update progress error:", err);
      setError(err?.response?.data?.message || "Failed to update progress.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit CP Solution Modal Form
  const handleSubmitCpSolution = async (e) => {
    e.preventDefault();
    if (!selectedCpContent) return;

    if (!cpForm.submissionLink.trim()) {
      setError("Please provide your LeetCode, Codeforces, or GitHub submission link.");
      return;
    }

    try {
      setSubmittingCp(true);
      setError("");
      setSuccess("");

      await api.patch(`/progress/student/progress/${selectedCpContent._id}`, {
        submissionLink: cpForm.submissionLink.trim(),
        attempts: Number(cpForm.attempts) || 1,
        timeSpent: Number(cpForm.timeSpent) || 0,
        status: "done",
      });

      setSuccess("Solution submitted and marked as completed!");
      setSelectedCpContent(null);
      setCpForm({ submissionLink: "", attempts: 1, timeSpent: 30 });
      await loadProgressData();
    } catch (err) {
      console.error("CP submit error:", err);
      setError(err?.response?.data?.message || "Failed to submit solution.");
    } finally {
      setSubmittingCp(false);
    }
  };

  // Filtering
  const filteredList = progressList.filter((item) => {
    const content = item?.content || item;
    const typeMatch = selectedType === "all" || content?.type === selectedType;
    const weekMatch = selectedWeek === "all" || String(content?.week) === String(selectedWeek);
    return typeMatch && weekMatch;
  });

  const cpStats = dashboard?.cp || { total: 0, completed: 0, completion: 0, rank: null, totalStudents: 0 };
  const devStats = dashboard?.dev || { total: 0, completed: 0, completion: 0, rank: null, totalStudents: 0 };

  const totalItems = cpStats.total + devStats.total;
  const totalCompleted = cpStats.completed + devStats.completed;
  const overallPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  const uniqueWeeks = Array.from(
    new Set(progressList.map((item) => item?.content?.week || item?.week).filter(Boolean))
  ).sort((a, b) => a - b);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-base font-semibold">Loading your learning progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-8 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A1931]">My Progress Tracker</h1>
            <p className="text-sm text-[#7A7F85] mt-1">
              Track your weekly Competitive Programming questions and Web Development lectures.
            </p>
          </div>

          {dashboard?.student && (
            <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 shadow-sm border border-gray-100">
              <div className="h-8 w-8 rounded-full bg-[#1A3D63] text-white flex items-center justify-center font-bold text-xs">
                {dashboard.student.name?.[0]}
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#0A1931]">{dashboard.student.name}</p>
                <p className="text-[#7A7F85]">{dashboard.student.gender} Student</p>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
                Overall Completion
              </span>
              <TrendingUp className="h-5 w-5 text-[#1A3D63]" />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">{overallPercentage}%</h2>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#1A3D63] transition-all"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
                CP Solved & Rank
              </span>
              <Code2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h2 className="text-3xl font-bold text-[#0A1931]">
                {cpStats.completed}/{cpStats.total}
              </h2>
              {cpStats.rank && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  <Trophy className="h-3.5 w-3.5 text-blue-600" />
                  Rank #{cpStats.rank}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-[#7A7F85]">{cpStats.completion}% CP milestones done</p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
                Dev Videos & Rank
              </span>
              <Monitor className="h-5 w-5 text-purple-600" />
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <h2 className="text-3xl font-bold text-[#0A1931]">
                {devStats.completed}/{devStats.total}
              </h2>
              {devStats.rank && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                  <Trophy className="h-3.5 w-3.5 text-purple-600" />
                  Rank #{devStats.rank}
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-[#7A7F85]">{devStats.completion}% Dev content completed</p>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A7F85]">
                Total Tasks Done
              </span>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
              {totalCompleted} <span className="text-sm font-normal text-gray-400">/ {totalItems}</span>
            </h2>
            <p className="mt-2 text-xs text-[#7A7F85]">Total tasks completed so far</p>
          </div>
        </div>

        {/* Content Tasks Section */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">Learning Tasks & Problems</h2>
              <p className="text-xs text-[#7A7F85] mt-0.5">
                Complete your weekly assignments and update your progress.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedType === "all" ? "bg-white text-[#1A3D63] shadow-sm" : "text-[#7A7F85]"
                  }`}
                >
                  All Tasks
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("cp")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedType === "cp" ? "bg-blue-600 text-white shadow-sm" : "text-[#7A7F85]"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  CP Problems
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedType("dev")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    selectedType === "dev" ? "bg-purple-600 text-white shadow-sm" : "text-[#7A7F85]"
                  }`}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  Dev Lectures
                </button>
              </div>

              {uniqueWeeks.length > 0 && (
                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0A1931] outline-none focus:border-[#4A7FA7]"
                >
                  <option value="all">All Weeks</option>
                  {uniqueWeeks.map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {filteredList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <Code2 className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-base font-bold text-[#0A1931]">No Learning Content Available</h3>
              <p className="mt-1 text-xs text-[#7A7F85]">
                Your mentors or admins haven't published content for this selection yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((item, index) => {
                const content = item?.content || item;
                const studentProg = item?.progress || {};
                const contentId = content?._id || `task-${index}`;
                const isCp = content?.type === "cp";
                const isCompleted =
                  studentProg?.status === "done" ||
                  Boolean(studentProg?.completedAt) ||
                  studentProg?.watched === true ||
                  Boolean(studentProg?.submissionLink);

                const isInProgress = studentProg?.status === "in_progress";
                const isUpdating = updatingId === contentId;

                return (
                  <div
                    key={contentId}
                    className={`rounded-2xl border p-5 transition-all ${
                      isCompleted
                        ? "border-green-200 bg-green-50/20"
                        : "border-gray-100 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase ${
                              isCp
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-purple-50 text-purple-700 border border-purple-200"
                            }`}
                          >
                            {isCp ? "CP Problem" : "Dev Lecture"}
                          </span>

                          {content.week && (
                            <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600">
                              Week {content.week}
                            </span>
                          )}

                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed
                            </span>
                          )}

                          {isInProgress && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                              <Clock className="h-3 w-3" />
                              In Progress
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#0A1931]">{content.title}</h3>

                        {content.link && (
                          <a
                            href={content.link.startsWith("http") ? content.link : `https://${content.link}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1A3D63] hover:text-[#4A7FA7] hover:underline"
                          >
                            {isCp ? "Open Problem on Codeforces / LeetCode" : "Watch Lecture Video"}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}

                        {studentProg?.submissionLink && (
                          <div className="pt-1 text-xs text-[#7A7F85] flex items-center gap-2">
                            <span className="font-semibold text-[#0A1931]">My Submission:</span>
                            <a
                              href={
                                studentProg.submissionLink.startsWith("http")
                                  ? studentProg.submissionLink
                                  : `https://${studentProg.submissionLink}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline truncate max-w-xs"
                            >
                              {studentProg.submissionLink}
                            </a>
                            {studentProg.attempts > 0 && <span>({studentProg.attempts} attempts)</span>}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        {isCp ? (
                          <>
                            {!isCompleted && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleQuickUpdate(contentId, { status: "in_progress" })}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                  isInProgress
                                    ? "bg-amber-100 text-amber-700"
                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "In Progress"}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCpContent(content);
                                setCpForm({
                                  submissionLink: studentProg.submissionLink || "",
                                  attempts: studentProg.attempts || 1,
                                  timeSpent: studentProg.timeSpent || 30,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                            >
                              <Send className="h-3.5 w-3.5" />
                              {isCompleted ? "Update Submission" : "Submit Solution"}
                            </button>
                          </>
                        ) : (
                          <>
                            {!isCompleted && (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleQuickUpdate(contentId, { status: "in_progress" })}
                                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                  isInProgress
                                    ? "bg-amber-100 text-amber-700"
                                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "In Progress"}
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleQuickUpdate(contentId, {
                                  watched: !isCompleted,
                                  status: isCompleted ? "not_started" : "done",
                                })
                              }
                              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                                isCompleted
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-purple-600 text-white hover:bg-purple-700"
                              }`}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : isCompleted ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Watched
                                </>
                              ) : (
                                <>
                                  <Play className="h-3.5 w-3.5" />
                                  Mark as Watched
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Submit CP Solution */}
      {selectedCpContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0A1931]">Submit Problem Solution</h3>
                <p className="text-xs text-[#7A7F85] mt-0.5">{selectedCpContent.title}</p>
              </div>

              <button
                onClick={() => setSelectedCpContent(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCpSolution} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                  Submission / Repo Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://leetcode.com/submissions/... or Codeforces URL"
                  value={cpForm.submissionLink}
                  onChange={(e) => setCpForm({ ...cpForm, submissionLink: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-xs outline-none focus:border-[#4A7FA7]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                    Attempts / Submissions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cpForm.attempts}
                    onChange={(e) => setCpForm({ ...cpForm, attempts: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                    Time Spent (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cpForm.timeSpent}
                    onChange={(e) => setCpForm({ ...cpForm, timeSpent: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedCpContent(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-[#7A7F85] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCp}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingCp && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {submittingCp ? "Submitting..." : "Save & Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProgress;