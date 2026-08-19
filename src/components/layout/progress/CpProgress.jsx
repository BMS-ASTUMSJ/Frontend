import { useEffect, useState } from "react";
import {
  Code2,
  ExternalLink,
  CheckCircle2,
  Clock3,
  HelpCircle,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import progressService from "../../../services/progressService";

const CpProgress = ({ studentView = false, selectedWeek = "" }) => {
  const [content, setContent] = useState([]);
  const [progress, setProgress] = useState({});
  const [week, setWeek] = useState(selectedWeek);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const contentResponse =
          await progressService.getProgressContent(
            "cp",
            week || undefined
          );

        if (cancelled) return;

        const contentItems = contentResponse?.data || [];
        setContent(contentItems);

        if (studentView) {
          const progressResponse =
            await progressService.getStudentProgress(
              "cp",
              week || undefined
            );

          if (cancelled) return;

          const progressItems = progressResponse?.data || [];
          const progressMap = {};

          progressItems.forEach((item) => {
            const contentId =
              item.content?._id || item.content;

            if (contentId) {
              progressMap[contentId] = item;
            }
          });

          setProgress(progressMap);
        } else {
          setProgress({});
        }

        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Failed to load CP progress"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [week, studentView]);

  const updateProgress = async (contentId, status) => {
    try {
      setUpdatingId(contentId);
      setError("");

      const existing = progress[contentId] || {};

      const response =
        await progressService.updateStudentProgress(
          contentId,
          {
            status,
            watched: true,
            attempts:
              status === "done"
                ? Math.max(existing.attempts || 0, 1)
                : existing.attempts || 0,
          }
        );

      const updated = response?.data;

      setProgress((current) => ({
        ...current,
        [contentId]: updated,
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update progress"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatus = (contentId) => {
    return progress[contentId]?.status || "not_started";
  };

  const getStatusLabel = (status) => {
    if (status === "done") return "Completed";
    if (status === "in_progress") return "In Progress";
    if (status === "need_help") return "Need Help";
    return "Not Started";
  };

  const getStatusIcon = (status) => {
    if (status === "done") {
      return <CheckCircle2 size={17} />;
    }

    if (status === "in_progress") {
      return <PlayCircle size={17} />;
    }

    if (status === "need_help") {
      return <HelpCircle size={17} />;
    }

    return <Clock3 size={17} />;
  };

  const getStatusClasses = (status) => {
    if (status === "done") {
      return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
    }

    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
    }

    if (status === "need_help") {
      return "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300";
    }

    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  };

  const completedCount = content.filter(
    (item) => getStatus(item._id) === "done"
  ).length;

  const progressPercentage =
    content.length > 0
      ? Math.round(
          (completedCount / content.length) * 100
        )
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
              <Code2 size={25} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Competitive Programming
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Weekly CP learning content and progress.
              </p>
            </div>
          </div>

          <select
            value={week}
            onChange={(event) => setWeek(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">All Weeks</option>

            {Array.from({ length: 20 }, (_, index) => (
              <option
                key={index + 1}
                value={index + 1}
              >
                Week {index + 1}
              </option>
            ))}
          </select>
        </div>

        {studentView && (
          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-300">
                Your CP Progress
              </span>

              <span className="font-semibold text-slate-900 dark:text-white">
                {progressPercentage}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="m-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-slate-500"
            />
          </div>
        ) : content.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <Code2
              size={42}
              className="mb-3 text-slate-400"
            />

            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              No CP content found
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              There is no CP content available for this week.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((item) => {
              const status = getStatus(item._id);

              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-200 p-5 transition hover:shadow-sm dark:border-slate-800"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          CP
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Week {item.week}
                        </span>

                        {studentView && (
                          <span
                            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                              status
                            )}`}
                          >
                            {getStatusIcon(status)}
                            {getStatusLabel(status)}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      )}

                      {item.publishedAt && (
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Published{" "}
                          {new Date(
                            item.publishedAt
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => {
                            if (
                              studentView &&
                              status === "not_started"
                            ) {
                              updateProgress(
                                item._id,
                                "in_progress"
                              );
                            }
                          }}
                          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          Open
                          <ExternalLink size={16} />
                        </a>
                      )}

                      {studentView && (
                        <>
                          {status !== "done" && (
                            <button
                              type="button"
                              disabled={
                                updatingId === item._id
                              }
                              onClick={() =>
                                updateProgress(
                                  item._id,
                                  "done"
                                )
                              }
                              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {updatingId === item._id ? (
                                <RefreshCw
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}

                              Complete
                            </button>
                          )}

                          {status !== "need_help" &&
                            status !== "done" && (
                              <button
                                type="button"
                                disabled={
                                  updatingId === item._id
                                }
                                onClick={() =>
                                  updateProgress(
                                    item._id,
                                    "need_help"
                                  )
                                }
                                className="flex items-center gap-2 rounded-lg border border-orange-300 px-4 py-2.5 text-sm font-medium text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-800 dark:text-orange-300 dark:hover:bg-orange-950/30"
                              >
                                <HelpCircle size={16} />
                                Need Help
                              </button>
                            )}
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
  );
};

export default CpProgress;