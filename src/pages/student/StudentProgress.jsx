import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Code2,
  ExternalLink,
  Loader2,
  Monitor,
  Play,
  Send,
  TrendingUp,
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
  const [updatingId, setUpdatingId] = useState(null);

  const [selectedCpContent, setSelectedCpContent] = useState(null);
  const [submittingCp, setSubmittingCp] = useState(false);
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

        setProgressList(Array.isArray(data) ? data : []);
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
      await loadProgressData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update progress.");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitCpSolution = async (event) => {
    event.preventDefault();

    if (!selectedCpContent) return;

    if (!cpForm.submissionLink.trim()) {
      setError("Please enter your GitHub, LeetCode, or Codeforces link.");
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
      setSelectedCpContent(null);
      setCpForm({
        submissionLink: "",
        attempts: 1,
        timeSpent: 30,
      });

      await loadProgressData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit solution.");
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

  const statusLabel = {
    not_started: "Not Started",
    in_progress: "In Progress",
    needs_help: "Needs Help",
    done: "Completed",
  };

  const statusColor = {
    not_started: "bg-gray-100 text-gray-600",
    in_progress: "bg-amber-100 text-amber-700",
    needs_help: "bg-red-100 text-red-700",
    done: "bg-green-100 text-green-700",
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="font-semibold">Loading your progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[#F6FAFD] p-4 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0A1931]">
              My Progress Tracker
            </h1>
            <p className="mt-1 text-sm text-[#7A7F85]">
              Submit CP solutions and update your Dev learning progress.
            </p>
          </div>

          {dashboard?.student && (
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-2 text-xs shadow-sm">
              <p className="font-bold text-[#0A1931]">
                {dashboard.student.name}
              </p>
              <p className="text-[#7A7F85]">
                {dashboard.student.gender} Student
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex justify-between text-xs font-bold uppercase text-[#7A7F85]">
              Overall Completion
              <TrendingUp className="h-5 w-5 text-[#1A3D63]" />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
              {completion}%
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex justify-between text-xs font-bold uppercase text-[#7A7F85]">
              CP Progress
              <Code2 className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
              {cpStats.completed}/{cpStats.total}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex justify-between text-xs font-bold uppercase text-[#7A7F85]">
              Dev Progress
              <Monitor className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
              {devStats.completed}/{devStats.total}
            </h2>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex justify-between text-xs font-bold uppercase text-[#7A7F85]">
              Total Tasks Done
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="mt-3 text-3xl font-bold text-[#0A1931]">
              {totalCompleted}
              <span className="text-sm font-normal text-gray-400">
                {" "}
                / {totalItems}
              </span>
            </h2>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                Learning Tasks
              </h2>
              <p className="text-xs text-[#7A7F85]">
                Submit CP work and update your Dev lecture status.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="flex rounded-xl bg-gray-100 p-1">
                {["all", "cp", "dev"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                      selectedType === type
                        ? "bg-white text-[#1A3D63] shadow-sm"
                        : "text-[#7A7F85]"
                    }`}
                  >
                    {type === "all" ? "All" : type === "cp" ? "CP" : "Dev"}
                  </button>
                ))}
              </div>

              <select
                value={selectedWeek}
                onChange={(event) => setSelectedWeek(event.target.value)}
                className="rounded-xl border border-gray-200 px-3 text-xs font-bold"
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

          {filteredList.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#7A7F85]">
              No learning content is available.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredList.map((item, index) => {
                const content = item?.content || item;
                const progress = item?.progress || {};
                const contentId = content?._id || index;
                const isCp = content?.type === "cp";
                const status = progress.status || "not_started";
                const isUpdating = updatingId === contentId;

                return (
                  <div
                    key={contentId}
                    className="rounded-2xl border border-gray-100 p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-xs font-bold ${
                              isCp
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {isCp ? "CP PROBLEM" : "DEV LECTURE"}
                          </span>

                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                            {content.topic}
                          </span>

                          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600">
                            Week {content.week}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-xs font-bold ${
                              statusColor[status]
                            }`}
                          >
                            {statusLabel[status]}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#0A1931]">
                          {content.title}
                        </h3>

                        <a
                          href={content.link}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#1A3D63] hover:underline"
                        >
                          {isCp ? "Open CP problem" : "Open Dev lecture"}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>

                        {progress.submissionLink && (
                          <p className="mt-2 text-xs text-green-700">
                            Submitted: {progress.attempts} attempts,{" "}
                            {progress.timeSpent} minutes
                          </p>
                        )}

                        {progress.mentorNote && (
                          <p className="mt-2 rounded-lg bg-blue-50 p-2 text-xs text-[#1A3D63]">
                            Mentor note: {progress.mentorNote}
                          </p>
                        )}
                      </div>

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
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4" />
                          {progress.submissionLink
                            ? "Update Solution"
                            : "Submit Solution"}
                        </button>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateProgress(contentId, {
                                status: "in_progress",
                              })
                            }
                            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                          >
                            In Progress
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateProgress(contentId, {
                                status: "needs_help",
                              })
                            }
                            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"
                          >
                            Needs Help
                          </button>

                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              updateProgress(contentId, {
                                status: "done",
                                watched: true,
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700"
                          >
                            {isUpdating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                            Completed
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

      {selectedCpContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#0A1931]">
                  Submit CP Solution
                </h3>
                <p className="text-xs text-[#7A7F85]">
                  {selectedCpContent.title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCpContent(null)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitCpSolution} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#0A1931]">
                  Solution / Repository Link
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
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#0A1931]">
                    Number of Attempts
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
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#0A1931]">
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
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedCpContent(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingCp}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingCp && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save & Complete
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
