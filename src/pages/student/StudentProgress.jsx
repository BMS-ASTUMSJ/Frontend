import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  ExternalLink,
  Loader2,
  Monitor,
  Send,
  TrendingUp,
  X,
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function StudentProgress() {
  const [dashboard, setDashboard] = useState(null);
  const [progressList, setProgressList] = useState([]);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedCpContent, setSelectedCpContent] = useState(null);
  const [submittingCp, setSubmittingCp] = useState(false);

  const [devStatuses, setDevStatuses] = useState({});

  const [cpForm, setCpForm] = useState({
    submissionLink: "",
    attempts: 1,
    timeSpent: 30,
  });

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardResponse, progressResponse] = await Promise.allSettled([
        api.get("/progress/student/dashboard"),
        api.get("/progress/student/progress"),
      ]);

      if (dashboardResponse.status === "fulfilled") {
        setDashboard(
          dashboardResponse.value.data?.data ||
            dashboardResponse.value.data ||
            {},
        );
      }

      if (progressResponse.status === "fulfilled") {
        const data =
          progressResponse.value.data?.data ||
          progressResponse.value.data ||
          [];

        const list = Array.isArray(data) ? data : [];

        setProgressList(list);

        const statuses = {};

        list.forEach((item) => {
          const content = item?.content || item;

          if (content?.type === "dev") {
            const contentId = content?._id;

            if (contentId) {
              statuses[contentId] = item?.progress?.status || "not_started";
            }
          }
        });

        setDevStatuses(statuses);
      } else {
        setError(
          progressResponse.reason?.response?.data?.message ||
            "Failed to load your learning content.",
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load your learning progress.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressData();
  }, []);

  const updateProgress = async (contentId, data) => {
    try {
      setUpdatingId(contentId);
      setError("");
      setSuccess("");

      await api.patch(`/progress/student/progress/${contentId}`, data);

      setSuccess("Progress updated successfully.");
      toast.success("Progress updated successfully.");

      await loadProgressData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update progress.");
      toast.error(err?.response?.data?.message || "Failed to update progress.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDevStatusUpdate = async (contentId) => {
    const selectedStatus = devStatuses[contentId];

    if (!selectedStatus || selectedStatus === "not_started") {
      setError("Please select a progress status.");
      toast.error("Please select a progress status.");
      return;
    }

    await updateProgress(contentId, {
      status: selectedStatus,
      ...(selectedStatus === "done" ? { watched: true } : {}),
    });
  };

  const submitCpSolution = async (event) => {
    event.preventDefault();

    if (!selectedCpContent) return;

    if (!cpForm.submissionLink.trim()) {
      setError("Please enter your GitHub, LeetCode, or Codeforces link.");
      toast.error("Please enter a valid submission link.");
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

      setSuccess("Solution submitted successfully.");
      toast.success("Solution submitted successfully.");

      setSelectedCpContent(null);

      setCpForm({
        submissionLink: "",
        attempts: 1,
        timeSpent: 30,
      });

      await loadProgressData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit solution.");
      toast.error(err?.response?.data?.message || "Failed to submit solution.");
    } finally {
      setSubmittingCp(false);
    }
  };

  const filteredList = progressList.filter((item) => {
    const content = item?.content || item;

    const typeMatches =
      selectedType === "all" || content?.type === selectedType;

    const weekMatches =
      selectedWeek === "all" || String(content?.week) === String(selectedWeek);

    return typeMatches && weekMatches;
  });

  const cpStats = dashboard?.cp || {
    total: 0,
    completed: 0,
    completion: 0,
  };

  const devStats = dashboard?.dev || {
    total: 0,
    completed: 0,
    completion: 0,
  };

  const totalItems = cpStats.total + devStats.total;
  const totalCompleted = cpStats.completed + devStats.completed;

  const completion =
    dashboard?.overall?.completion ||
    (totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0);

  const uniqueWeeks = Array.from(
    new Set(
      progressList
        .map((item) => item?.content?.week || item?.week)
        .filter(Boolean),
    ),
  ).sort((a, b) => a - b);

  const getStatusBadge = (status) => {
    switch (status) {
      case "done":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ACTIVE / DONE
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            IN PROGRESS
          </span>
        );
      case "needs_help":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            NEEDS HELP
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            NOT STARTED
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF4F7]">
        <div className="flex items-center gap-2 text-[#00A8CC]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm font-medium text-[#14222B]">
            Loading your progress...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "13px",
          },
        }}
      />

      <div className="min-h-screen bg-[#EEF4F7] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-337.5 space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] text-white shadow-sm shadow-[#00A8CC]/20">
                <Code2 size={22} strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                  My Progress Tracker
                </h1>
              </div>
            </div>

            {dashboard?.student && (
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[#00A8CC]" />
                <span>{dashboard.student.name}</span>
                <span className="text-slate-300">
                  • {dashboard.student.gender}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-500" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 hover:bg-rose-100"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>{success}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccess("")}
                className="rounded-lg p-1 hover:bg-emerald-100"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 border-l-[5px] border-l-[#00A8CC] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                  Overall Completion
                </p>
                <TrendingUp size={16} className="text-[#00A8CC]" />
              </div>
              <h3 className="mt-2 text-2xl font-black text-[#0F172A]">
                {completion}%
              </h3>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#00A8CC]"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 border-l-[5px] border-l-blue-500 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                  CP Progress
                </p>
                <Code2 size={16} className="text-blue-500" />
              </div>
              <h3 className="mt-2 text-2xl font-black text-[#0F172A]">
                {cpStats.completed}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  / {cpStats.total}
                </span>
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-blue-600">
                {cpStats.completion || 0}% completed
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 border-l-[5px] border-l-purple-500 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                  Dev Progress
                </p>
                <Monitor size={16} className="text-purple-500" />
              </div>
              <h3 className="mt-2 text-2xl font-black text-[#0F172A]">
                {devStats.completed}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  / {devStats.total}
                </span>
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-purple-600">
                {devStats.completion || 0}% completed
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 border-l-[5px] border-l-emerald-500 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0]">
                  Total Tasks Done
                </p>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <h3 className="mt-2 text-2xl font-black text-[#0F172A]">
                {totalCompleted}{" "}
                <span className="text-xs font-semibold text-slate-400">
                  / {totalItems}
                </span>
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                Combined deliverables
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#14222B]">
                  Learning Tasks
                </h2>
                <p className="text-xs text-[#8FA3B0]">
                  Submit CP solutions and update your Dev lecture status
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 text-xs">
                  {["all", "cp", "dev"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`rounded-lg px-3 py-1.5 font-bold uppercase transition ${
                        selectedType === type
                          ? "bg-white text-[#00A8CC] shadow-sm"
                          : "text-[#8FA3B0] hover:text-[#14222B]"
                      }`}
                    >
                      {type === "all"
                        ? "All"
                        : type === "cp"
                          ? "CP Problems"
                          : "Dev Lectures"}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 text-xs">
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="h-8 rounded-lg bg-transparent px-2.5 font-bold text-[#14222B] outline-none"
                  >
                    <option value="all">All Weeks</option>
                    {uniqueWeeks.map((week) => (
                      <option key={week} value={week}>
                        Week {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="hidden md:grid grid-cols-[1.8fr_1fr_1fr_1fr_140px] gap-4 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                <span>DELIVERABLE</span>
                <span>TOPIC / WEEK</span>
                <span>RESOURCE</span>
                <span>STATUS</span>
                <span className="text-right">OPERATIONAL ACTION</span>
              </div>

              {filteredList.length === 0 ? (
                <div className="p-12 text-center text-xs font-semibold text-[#8FA3B0]">
                  No learning tasks available for the selected filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredList.map((item, index) => {
                    const content = item?.content || item;
                    const progress = item?.progress || {};
                    const contentId = content?._id || index;
                    const isCp = content?.type === "cp";
                    const status = progress.status || "not_started";
                    const isUpdating = updatingId === contentId;

                    const initials = isCp ? "CP" : "RE";

                    return (
                      <div
                        key={contentId}
                        className="grid grid-cols-1 md:grid-cols-[1.8fr_1fr_1fr_1fr_140px] items-center gap-4 rounded-2xl border border-slate-200 border-l-[5px] border-l-[#00A8CC] bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9] font-bold text-[#00A8CC] text-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-xs text-[#0F172A]">
                              {content.title}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#00A8CC]">
                              WEEK {content.week} •{" "}
                              {isCp ? "PROBLEM" : "LECTURE"}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs font-semibold text-slate-600">
                          <span className="md:hidden text-[10px] text-slate-400 block font-bold uppercase">
                            Topic
                          </span>
                          {content.topic}
                        </div>

                        <div>
                          <span className="md:hidden text-[10px] text-slate-400 block font-bold uppercase mb-1">
                            Resource
                          </span>
                          {content.link ? (
                            <a
                              href={content.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#00A8CC] hover:underline"
                            >
                              <span>
                                {isCp ? "Open Problem" : "Open Lecture"}
                              </span>
                              <ExternalLink size={12} />
                            </a>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>

                        <div>
                          <span className="md:hidden text-[10px] text-slate-400 block font-bold uppercase mb-1">
                            Status
                          </span>
                          {getStatusBadge(status)}
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          {isCp ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCpContent(content);
                                setCpForm({
                                  submissionLink: progress.submissionLink || "",
                                  attempts: progress.attempts || 1,
                                  timeSpent: progress.timeSpent || 30,
                                });
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#B4D7E2] bg-white px-3 py-1.5 text-xs font-semibold text-[#14222B] transition hover:bg-[#E3F5F9]"
                            >
                              <Send size={12} className="text-[#00A8CC]" />
                              <span>
                                {progress.submissionLink
                                  ? "Edit Solution"
                                  : "Submit"}
                              </span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <select
                                value={devStatuses[contentId] || status}
                                onChange={(event) =>
                                  setDevStatuses((prev) => ({
                                    ...prev,
                                    [contentId]: event.target.value,
                                  }))
                                }
                                disabled={isUpdating}
                                className="h-8 rounded-lg border border-slate-200 bg-[#F4F8FA] px-2 text-xs font-semibold text-[#14222B] outline-none"
                              >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="needs_help">Needs Help</option>
                                <option value="done">Completed</option>
                              </select>

                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleDevStatusUpdate(contentId)}
                                className="inline-flex items-center justify-center rounded-lg bg-[#00A8CC] px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Check size={12} />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedCpContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#B4D7E2]/60 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#14222B]">
                  Submit CP Solution
                </h3>
                <p className="text-xs text-[#8FA3B0]">
                  {selectedCpContent.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCpContent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={submitCpSolution} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#14222B]">
                  Solution / Repository Link *
                </label>
                <input
                  type="url"
                  required
                  value={cpForm.submissionLink}
                  onChange={(event) =>
                    setCpForm({
                      ...cpForm,
                      submissionLink: event.target.value,
                    })
                  }
                  placeholder="https://github.com/... or LeetCode link"
                  className="h-10 w-full rounded-xl border border-[#B4D7E2]/70 bg-[#F4F8FA] px-3 text-xs outline-none focus:border-[#00A8CC] focus:bg-white"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#14222B]">
                    Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cpForm.attempts}
                    onChange={(event) =>
                      setCpForm({
                        ...cpForm,
                        attempts: event.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-[#B4D7E2]/70 bg-[#F4F8FA] px-3 text-xs outline-none focus:border-[#00A8CC] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#14222B]">
                    Time Spent (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={cpForm.timeSpent}
                    onChange={(event) =>
                      setCpForm({
                        ...cpForm,
                        timeSpent: event.target.value,
                      })
                    }
                    className="h-10 w-full rounded-xl border border-[#B4D7E2]/70 bg-[#F4F8FA] px-3 text-xs outline-none focus:border-[#00A8CC] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCpContent(null)}
                  className="rounded-xl border border-[#B4D7E2] bg-white px-4 py-2 text-xs font-bold text-[#14222B] hover:bg-[#E3F5F9]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCp}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#00A8CC] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:opacity-50"
                >
                  {submittingCp && (
                    <Loader2 size={13} className="animate-spin" />
                  )}
                  <span>Save & Complete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default StudentProgress;
