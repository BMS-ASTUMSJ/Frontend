import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  Users,
  Shield,
  Code2,
  Monitor,
  ExternalLink,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  Copy,
  Check,
  Flame,
  BookOpen,
  BarChart3,
  ChevronDown,
  GraduationCap,
} from "lucide-react";

function AdminProgress() {
  const [statsData, setStatsData] = useState(null);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [performerTab, setPerformerTab] = useState("cp");

  const [cpWeek, setCpWeek] = useState(1);
  const [cpTitle, setCpTitle] = useState("");
  const [cpLink, setCpLink] = useState("");
  const [cpDifficulty, setCpDifficulty] = useState("Medium");
  const [cpTopic, setCpTopic] = useState("JavaScript");
  const [publishingCp, setPublishingCp] = useState(false);

  const [devWeek, setDevWeek] = useState(1);
  const [devTitle, setDevTitle] = useState("");
  const [devLink, setDevLink] = useState("");
  const [devDuration, setDevDuration] = useState("45 mins");
  const [devTopic, setDevTopic] = useState("React");
  const [publishingDev, setPublishingDev] = useState(false);

  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const TOPICS = [
    "HTML / CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Git / GitHub",
  ];

  const inputClass =
    "w-full rounded-xl border border-[#D9E4EA] bg-[#F7FAFC] px-3.5 py-2.5 text-sm text-[#14222B] outline-none transition placeholder:text-[#9AAAB4] focus:border-[#00A8CC] focus:bg-white focus:ring-4 focus:ring-[#00A8CC]/10";

  const labelClass =
    "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#14222B]";

  const cardClass =
    "rounded-2xl border border-[#DCE7EC] bg-white shadow-[0_2px_8px_rgba(20,34,43,0.035)]";

  const fetchCurrentBatch = async () => {
    try {
      const res = await api.get("/batches/dashboard-stats");

      const batch =
        res.data?.currentBatch?.batch || res.data?.currentBatch || null;

      if (!batch?._id) {
        setCurrentBatch(null);

        throw new Error(
          "No current batch available. Please activate a batch first.",
        );
      }

      setCurrentBatch(batch);

      return batch;
    } catch (err) {
      console.error("Current batch error:", err);

      setCurrentBatch(null);

      throw error(
        err?.response?.data?.message ||
          err?.message ||
          "No current batch available. Please activate a batch first.",
      );
    }
  };

  const loadProgressData = async () => {
    try {
      setError("");

      const batch = await fetchCurrentBatch();
      const batchId = batch._id;

      const [statsRes, progRes, contentRes] = await Promise.allSettled([
        api.get("/batches/dashboard-stats"),

        api.get("/progress/students/progress", {
          params: { batchId },
        }),

        api.get("/progress/content", {
          params: { batchId },
        }),
      ]);

      if (statsRes.status === "fulfilled") {
        setStatsData(statsRes.value.data || {});
      } else {
        console.error("Batch statistics error:", statsRes.reason);
        setStatsData(null);
      }

      if (progRes.status === "fulfilled") {
        const data = progRes.value.data?.data || progRes.value.data || [];

        setStudentsProgress(Array.isArray(data) ? data : []);
      } else {
        console.error("Student progress error:", progRes.reason);
        setStudentsProgress([]);
      }

      if (contentRes.status === "fulfilled") {
        const data = contentRes.value.data?.data || contentRes.value.data || [];

        setContentList(Array.isArray(data) ? data : []);
      } else {
        console.error("Progress content error:", contentRes.reason);
        setContentList([]);
      }
    } catch (err) {
      console.error("Load progress data error:", err);

      setError(err?.message || "Failed to load current batch progress.");
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialLoad = async () => {
      try {
        setLoading(true);
        setError("");

        await loadProgressData();
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCopyLink = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedId(id);

      toast.success("Link copied!");

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Copy error:", err);
      toast.error("Failed to copy link.");
    }
  };

  const handlePublishCp = async (e) => {
    e.preventDefault();

    if (!currentBatch?._id) {
      setError("No current batch is available. Please activate a batch first.");
      return;
    }

    if (!cpTitle.trim()) {
      setError("Please provide a question title.");
      return;
    }

    if (!cpLink.trim()) {
      setError("Please provide the problem link.");
      return;
    }

    if (!cpTopic) {
      setError("Please select a topic.");
      return;
    }

    try {
      setPublishingCp(true);
      setError("");

      await api.post("/progress/content", {
        batch: currentBatch._id,
        type: "cp",
        topic: cpTopic,
        week: Number(cpWeek),
        title: `${cpTitle.trim()} [${cpDifficulty}]`,
        link: cpLink.trim(),
      });

      toast.success(`Week ${cpWeek} CP problem published successfully.`);

      setCpTitle("");
      setCpLink("");

      await loadProgressData();
    } catch (err) {
      console.error("Publish CP error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish CP question.",
      );
    } finally {
      setPublishingCp(false);
    }
  };

  const handlePublishDev = async (e) => {
    e.preventDefault();

    if (!currentBatch?._id) {
      setError("No current batch is available. Please activate a batch first.");
      return;
    }

    if (!devTitle.trim()) {
      setError("Please provide a lecture title.");
      return;
    }

    if (!devLink.trim()) {
      setError("Please provide the lecture link.");
      return;
    }

    if (!devTopic) {
      setError("Please select a topic.");
      return;
    }

    try {
      setPublishingDev(true);
      setError("");

      await api.post("/progress/content", {
        batch: currentBatch._id,
        type: "dev",
        topic: devTopic,
        week: Number(devWeek),
        title: `${devTitle.trim()} (${devDuration})`,
        link: devLink.trim(),
      });

      toast.success(`Week ${devWeek} Dev lecture published successfully.`);

      setDevTitle("");
      setDevLink("");

      await loadProgressData();
    } catch (err) {
      console.error("Publish Dev error:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to publish Dev video.",
      );
    } finally {
      setPublishingDev(false);
    }
  };

  const handleDeleteContent = (contentId) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-[#14222B]">
            Are you sure you want to delete this learning task?
          </span>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg bg-[#F4F8FA] px-3 py-1.5 text-xs font-bold text-[#71838E] hover:bg-[#E3F5F9]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                toast.dismiss(t.id);

                try {
                  setDeletingId(contentId);
                  setError("");

                  await api.patch(`/progress/content/${contentId}/unpublish`);

                  toast.success("Task deleted successfully.");

                  await loadProgressData();
                } catch (err) {
                  console.error("Delete task error:", err);

                  toast.error(
                    err?.response?.data?.message ||
                      "Failed to delete learning task.",
                  );
                } finally {
                  setDeletingId(null);
                }
              }}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      },
    );
  };

  const statsCurrentBatch = statsData?.currentBatch || {};

  const totalStudents =
    statsData?.overallStats?.totalStudentsAllTime ||
    studentsProgress.length ||
    0;

  const femaleStudentsCount =
    statsCurrentBatch?.femaleStudents ||
    studentsProgress.filter(
      (s) => String(s?.student?.gender || "").toLowerCase() === "female",
    ).length ||
    0;

  const maleStudentsCount =
    statsCurrentBatch?.maleStudents ||
    studentsProgress.filter(
      (s) => String(s?.student?.gender || "").toLowerCase() === "male",
    ).length ||
    0;

  const currentTotal = femaleStudentsCount + maleStudentsCount;

  const malePercent =
    currentTotal > 0
      ? ((maleStudentsCount / currentTotal) * 100).toFixed(1)
      : "0.0";

  const femalePercent =
    currentTotal > 0
      ? ((femaleStudentsCount / currentTotal) * 100).toFixed(1)
      : "0.0";

  const totalMentors = statsData?.overallStats?.totalMentors || 0;

  const cpContentList = contentList.filter(
    (item) => item.type === "cp" && item.week === Number(cpWeek),
  );

  const devContentList = contentList.filter(
    (item) => item.type === "dev" && item.week === Number(devWeek),
  );

  const totalQuestionsSolved = studentsProgress.reduce(
    (total, student) =>
      total + Number(student?.cp?.completed || student?.completed || 0),
    0,
  );

  const totalExpectedQuestions =
    studentsProgress.reduce(
      (total, student) =>
        total + Number(student?.cp?.total || student?.total || 0),
      0,
    ) || 100;

  const avgCpCompletion =
    totalExpectedQuestions > 0
      ? Math.min(
          Math.round((totalQuestionsSolved / totalExpectedQuestions) * 100),
          100,
        )
      : 0;

  const totalDevCompleted = studentsProgress.reduce(
    (total, student) => total + Number(student?.dev?.completed || 0),
    0,
  );

  const totalDevExpected = studentsProgress.reduce(
    (total, student) => total + Number(student?.dev?.total || 0),
    0,
  );

  const avgDevCompletion =
    totalDevExpected > 0
      ? Math.min(Math.round((totalDevCompleted / totalDevExpected) * 100), 100)
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
              <Loader2 className="h-6 w-6 animate-spin text-[#00A8CC]" />
            </div>

            <div className="text-center">
              <p className="font-bold text-[#14222B]">Loading Progress</p>

              <p className="mt-1 text-xs text-[#71838E]">
                Loading curriculum and student analytics...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="mx-3 mt-4 sm:mx-4 lg:mx-8">
        <div className="overflow-hidden rounded-2xl bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] shadow-[0_4px_12px_rgba(20,34,43,0.12)]">
          <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] shadow-[0_4px_12px_rgba(0,168,204,0.25)] sm:h-14 sm:w-14">
                <GraduationCap className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Progress Management
                </h1>
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

            <div>
              <p className="text-sm font-bold text-red-800">
                Something went wrong
              </p>

              <p className="mt-0.5 text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-xl border border-[#DCE7EC] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(20,34,43,0.025)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#8FA3B0]">
              Current Batch
            </p>

            {currentBatch ? (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00A8CC] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#00A8CC]" />
                </span>

                <span className="text-sm font-bold text-[#14222B]">
                  {currentBatch.name}
                </span>
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />

                <span className="text-sm font-bold text-amber-700">
                  No current batch
                </span>
              </div>
            )}
          </div>

          <ChevronDown className="hidden h-4 w-4 text-[#9AAAB4] sm:block" />
        </div>

        {!currentBatch && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-amber-900">
                  No current batch is available
                </h3>

                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Progress content must belong to the current batch. Activate a
                  batch from Batch Management before publishing content.
                </p>
              </div>
            </div>
          </div>
        )}

        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14222B]">
              Batch Overview
            </h2>

            <p className="mt-0.5 text-xs text-[#71838E]">
              Current student and mentor statistics
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA3B0]">
                    Total Students
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-[#14222B]">
                    {totalStudents}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#0088A6]">
                    <Flame className="h-3.5 w-3.5" />
                    Active participants
                  </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <Users className="h-5 w-5 text-[#00A8CC]" />
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA3B0]">
                    Male Students
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-[#14222B]">
                    {maleStudentsCount}
                  </h3>

                  <p className="mt-2 text-[11px] font-semibold text-[#0088A6]">
                    {malePercent}% of total
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <span className="text-lg font-bold text-[#00A8CC]">♂</span>
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA3B0]">
                    Female Students
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-[#14222B]">
                    {femaleStudentsCount}
                  </h3>

                  <p className="mt-2 text-[11px] font-semibold text-[#0088A6]">
                    {femalePercent}% of total
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <span className="text-lg font-bold text-[#00A8CC]">♀</span>
                </div>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8FA3B0]">
                    Total Mentors
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-[#14222B]">
                    {totalMentors}
                  </h3>

                  <p className="mt-2 text-[11px] font-semibold text-[#0088A6]">
                    Active mentors
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <Shield className="h-5 w-5 text-[#00A8CC]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className={cardClass}>
            <div className="flex flex-col gap-3 border-b border-[#DCE7EC] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <BarChart3 className="h-4 w-4 text-[#00A8CC]" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#14222B]">
                    Curriculum Overview
                  </h2>

                  <p className="mt-0.5 text-xs text-[#71838E]">
                    Aggregated CP and development completion statistics.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#DCE7EC] bg-[#F7FAFC] px-3 py-1.5 text-[10px] font-bold text-[#0088A6]">
                <Sparkles className="h-3 w-3 text-[#00A8CC]" />
                LIVE ANALYTICS
              </span>
            </div>

            <div className="grid gap-4 p-5 md:grid-cols-2">
              <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <Code2 className="h-5 w-5 text-[#00A8CC]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#14222B]">
                      CP Track
                    </h3>

                    <p className="text-[11px] text-[#71838E]">
                      Competitive Programming
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-5">
                  <div className="relative h-28 w-28 shrink-0">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        stroke="#DDEBF0"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      <path
                        stroke="#00A8CC"
                        strokeDasharray={`${avgCpCompletion}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-[#14222B]">
                        {avgCpCompletion}%
                      </span>

                      <span className="text-[9px] font-bold uppercase text-[#8FA3B0]">
                        Done
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                      Questions Solved
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-[#14222B]">
                      {totalQuestionsSolved}
                    </p>

                    <p className="text-xs text-[#71838E]">
                      of {totalExpectedQuestions} expected
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <Monitor className="h-5 w-5 text-[#00A8CC]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#14222B]">
                      Dev Track
                    </h3>

                    <p className="text-[11px] text-[#71838E]">
                      Full-Stack Development
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-5">
                  <div className="relative h-28 w-28 shrink-0">
                    <svg
                      className="h-full w-full -rotate-90"
                      viewBox="0 0 36 36"
                    >
                      <path
                        stroke="#DDEBF0"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />

                      <path
                        stroke="#0088A6"
                        strokeDasharray={`${avgDevCompletion}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-[#14222B]">
                        {avgDevCompletion}%
                      </span>

                      <span className="text-[9px] font-bold uppercase text-[#8FA3B0]">
                        Done
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                      Videos Completed
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-[#14222B]">
                      {totalDevCompleted}
                    </p>

                    <p className="text-xs text-[#71838E]">
                      of {totalDevExpected} expected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="border-b border-[#DCE7EC] p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <Trophy className="h-4 w-4 text-[#00A8CC]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-[#14222B]">
                      Top Performers
                    </h2>

                    <p className="text-[10px] text-[#71838E]">
                      Highest completion rates
                    </p>
                  </div>
                </div>

                <div className="flex rounded-lg border border-[#DCE7EC] bg-[#F7FAFC] p-0.5">
                  <button
                    type="button"
                    onClick={() => setPerformerTab("cp")}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition ${
                      performerTab === "cp"
                        ? "bg-[#00A8CC] text-white shadow-sm"
                        : "text-[#71838E] hover:text-[#14222B]"
                    }`}
                  >
                    CP
                  </button>

                  <button
                    type="button"
                    onClick={() => setPerformerTab("dev")}
                    className={`rounded-md px-3 py-1.5 text-[10px] font-bold transition ${
                      performerTab === "dev"
                        ? "bg-[#00A8CC] text-white shadow-sm"
                        : "text-[#71838E] hover:text-[#14222B]"
                    }`}
                  >
                    DEV
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4">
              {studentsProgress.length === 0 ? (
                <div className="py-10 text-center">
                  <Users className="mx-auto h-8 w-8 text-[#B4D7E2]" />

                  <p className="mt-2 text-xs font-semibold text-[#71838E]">
                    No progress records available.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...studentsProgress]
                    .sort((a, b) => {
                      const aCompletion =
                        performerTab === "cp"
                          ? Number(a?.cp?.completion ?? a?.completion ?? 0)
                          : Number(a?.dev?.completion ?? 0);

                      const bCompletion =
                        performerTab === "cp"
                          ? Number(b?.cp?.completion ?? b?.completion ?? 0)
                          : Number(b?.dev?.completion ?? 0);

                      return bCompletion - aCompletion;
                    })
                    .slice(0, 5)
                    .map((item, idx) => {
                      const completion =
                        performerTab === "cp"
                          ? Number(
                              item?.cp?.completion ?? item?.completion ?? 0,
                            )
                          : Number(item?.dev?.completion ?? 0);

                      const completed =
                        performerTab === "cp"
                          ? Number(item?.cp?.completed ?? item?.completed ?? 0)
                          : Number(item?.dev?.completed ?? 0);

                      return (
                        <div
                          key={item?.student?.id || item?.student?._id || idx}
                          className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                            idx === 0
                              ? "border-[#B4D7E2] bg-[#E3F5F9]"
                              : "border-[#DCE7EC] bg-[#F7FAFC]"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                                idx === 0
                                  ? "bg-[#00A8CC] text-white"
                                  : "bg-white text-[#71838E]"
                              }`}
                            >
                              {idx + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#14222B]">
                                {item?.student?.name || "Unknown Student"}
                              </p>

                              <p className="text-[10px] text-[#8FA3B0]">
                                {item?.student?.gender || "Student"}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-xs font-semibold text-[#71838E]">
                              {completed}
                            </span>

                            <span className="rounded-md bg-white px-2 py-1 text-[10px] font-extrabold text-[#0088A6]">
                              {completion}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4">
            <h2 className="text-base font-bold text-[#14222B]">
              Curriculum Content
            </h2>

            <p className="mt-0.5 text-xs text-[#71838E]">
              Publish and manage weekly learning materials.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-[#DCE7EC] bg-[#F7FAFC] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                      <Code2 className="h-5 w-5 text-[#00A8CC]" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#14222B]">
                        Competitive Programming
                      </h3>

                      <p className="mt-0.5 text-[10px] text-[#71838E]">
                        Add weekly coding problems
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#DCE7EC] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#71838E]">
                    CP TRACK
                  </span>
                </div>
              </div>

              <div className="p-5">
                <form onSubmit={handlePublishCp} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Week Number</label>

                      <select
                        value={cpWeek}
                        onChange={(e) => setCpWeek(Number(e.target.value))}
                        className={inputClass}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                          <option key={week} value={week}>
                            Week {week}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Topic</label>

                      <select
                        value={cpTopic}
                        onChange={(e) => setCpTopic(e.target.value)}
                        className={inputClass}
                      >
                        {TOPICS.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Question Title</label>

                    <input
                      type="text"
                      required
                      value={cpTitle}
                      onChange={(e) => setCpTitle(e.target.value)}
                      placeholder="e.g. Two Sum"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Difficulty</label>

                    <select
                      value={cpDifficulty}
                      onChange={(e) => setCpDifficulty(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Easy">🟢 Easy</option>
                      <option value="Medium">🟡 Medium</option>
                      <option value="Hard">🔴 Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Platform Link</label>

                    <input
                      type="url"
                      required
                      value={cpLink}
                      onChange={(e) => setCpLink(e.target.value)}
                      placeholder="https://leetcode.com/problems/..."
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishingCp || !currentBatch}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {publishingCp ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}

                    {currentBatch ? "Publish Question" : "No Current Batch"}
                  </button>
                </form>

                <div className="mt-6 border-t border-[#DCE7EC] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#14222B]">
                        Week {cpWeek} Questions
                      </h4>

                      <p className="mt-0.5 text-[10px] text-[#71838E]">
                        Active curriculum content
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E3F5F9] px-2.5 py-1 text-[10px] font-bold text-[#0088A6]">
                      {cpContentList.length} Active
                    </span>
                  </div>

                  <div className="hidden overflow-hidden rounded-xl border border-[#DCE7EC] md:block">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#F7FAFC]">
                          <tr className="border-b border-[#DCE7EC]">
                            <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              #
                            </th>

                            <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              Question
                            </th>

                            <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              Link
                            </th>

                            <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {cpContentList.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-10 text-center"
                              >
                                <BookOpen className="mx-auto h-7 w-7 text-[#B4D7E2]" />

                                <p className="mt-2 text-xs font-semibold text-[#71838E]">
                                  No questions published
                                </p>
                              </td>
                            </tr>
                          ) : (
                            cpContentList.map((item, index) => (
                              <tr
                                key={item._id}
                                className="border-b border-[#DCE7EC] last:border-0 hover:bg-[#F7FAFC]"
                              >
                                <td className="px-3 py-3 text-[11px] font-bold text-[#8FA3B0]">
                                  {index + 1}
                                </td>

                                <td className="max-w-55 px-3 py-3">
                                  <p className="truncate text-xs font-bold text-[#14222B]">
                                    {item.title}
                                  </p>

                                  <p className="mt-0.5 text-[9px] text-[#71838E]">
                                    {item.topic || "Coding Problem"}
                                  </p>
                                </td>

                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={
                                        item.link?.startsWith("http")
                                          ? item.link
                                          : `https://${item.link}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A8CC] hover:text-[#0088A6] hover:underline"
                                    >
                                      Open
                                      <ExternalLink className="h-3 w-3" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyLink(item.link, item._id)
                                      }
                                      className="text-[#8FA3B0] transition hover:text-[#00A8CC]"
                                    >
                                      {copiedId === item._id ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                <td className="px-3 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteContent(item._id)
                                    }
                                    disabled={deletingId === item._id}
                                    className="rounded-lg p-1.5 text-[#8FA3B0] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                  >
                                    {deletingId === item._id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-2 md:hidden">
                    {cpContentList.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#DCE7EC] p-8 text-center">
                        <BookOpen className="mx-auto h-7 w-7 text-[#B4D7E2]" />

                        <p className="mt-2 text-xs font-semibold text-[#71838E]">
                          No questions published
                        </p>
                      </div>
                    ) : (
                      cpContentList.map((item, index) => (
                        <div
                          key={item._id}
                          className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E3F5F9] text-[10px] font-bold text-[#0088A6]">
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#14222B]">
                                  {item.title}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#71838E]">
                                  {item.topic || "Coding Problem"}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteContent(item._id)}
                              disabled={deletingId === item._id}
                              className="shrink-0 rounded-lg p-1.5 text-[#8FA3B0] hover:bg-red-50 hover:text-red-500"
                            >
                              {deletingId === item._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center gap-2 border-t border-[#DCE7EC] pt-2.5">
                            <a
                              href={
                                item.link?.startsWith("http")
                                  ? item.link
                                  : `https://${item.link}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 rounded-lg bg-[#E3F5F9] px-2.5 py-1.5 text-[10px] font-bold text-[#0088A6]"
                            >
                              Open Problem
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLink(item.link, item._id)
                              }
                              className="rounded-lg border border-[#DCE7EC] bg-white p-1.5 text-[#8FA3B0]"
                            >
                              {copiedId === item._id ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${cardClass} overflow-hidden`}>
              <div className="border-b border-[#DCE7EC] bg-[#F7FAFC] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                      <Monitor className="h-5 w-5 text-[#00A8CC]" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-[#14222B]">
                        Full-Stack Development
                      </h3>

                      <p className="mt-0.5 text-[10px] text-[#71838E]">
                        Add weekly development lectures
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#DCE7EC] bg-white px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#71838E]">
                    DEV TRACK
                  </span>
                </div>
              </div>

              <div className="p-5">
                <form onSubmit={handlePublishDev} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Week Number</label>

                      <select
                        value={devWeek}
                        onChange={(e) => setDevWeek(Number(e.target.value))}
                        className={inputClass}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                          <option key={week} value={week}>
                            Week {week}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Topic</label>

                      <select
                        value={devTopic}
                        onChange={(e) => setDevTopic(e.target.value)}
                        className={inputClass}
                      >
                        {TOPICS.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Video Title</label>

                    <input
                      type="text"
                      required
                      value={devTitle}
                      onChange={(e) => setDevTitle(e.target.value)}
                      placeholder="e.g. React Custom Hooks"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Duration</label>

                    <select
                      value={devDuration}
                      onChange={(e) => setDevDuration(e.target.value)}
                      className={inputClass}
                    >
                      <option value="30 mins">⏱️ 30 mins</option>
                      <option value="45 mins">⏱️ 45 mins</option>
                      <option value="1 hour">⏱️ 1 hour</option>
                      <option value="1.5 hours">⏱️ 1.5 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Lecture Link</label>

                    <input
                      type="url"
                      required
                      value={devLink}
                      onChange={(e) => setDevLink(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={publishingDev || !currentBatch}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {publishingDev ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}

                    {currentBatch ? "Publish Video" : "No Current Batch"}
                  </button>
                </form>

                <div className="mt-6 border-t border-[#DCE7EC] pt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#14222B]">
                        Week {devWeek} Videos
                      </h4>

                      <p className="mt-0.5 text-[10px] text-[#71838E]">
                        Active curriculum content
                      </p>
                    </div>

                    <span className="rounded-full bg-[#E3F5F9] px-2.5 py-1 text-[10px] font-bold text-[#0088A6]">
                      {devContentList.length} Active
                    </span>
                  </div>

                  <div className="hidden overflow-hidden rounded-xl border border-[#DCE7EC] md:block">
                    <div className="max-h-64 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-[#F7FAFC]">
                          <tr className="border-b border-[#DCE7EC]">
                            <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              #
                            </th>

                            <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              Video
                            </th>

                            <th className="px-3 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              Link
                            </th>

                            <th className="px-3 py-2.5 text-right text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {devContentList.length === 0 ? (
                            <tr>
                              <td
                                colSpan={4}
                                className="px-4 py-10 text-center"
                              >
                                <Monitor className="mx-auto h-7 w-7 text-[#B4D7E2]" />

                                <p className="mt-2 text-xs font-semibold text-[#71838E]">
                                  No videos published
                                </p>
                              </td>
                            </tr>
                          ) : (
                            devContentList.map((item, index) => (
                              <tr
                                key={item._id}
                                className="border-b border-[#DCE7EC] last:border-0 hover:bg-[#F7FAFC]"
                              >
                                <td className="px-3 py-3 text-[11px] font-bold text-[#8FA3B0]">
                                  {index + 1}
                                </td>

                                <td className="max-w-55 px-3 py-3">
                                  <p className="truncate text-xs font-bold text-[#14222B]">
                                    {item.title}
                                  </p>

                                  <p className="mt-0.5 text-[9px] text-[#71838E]">
                                    {item.topic || "Development"}
                                  </p>
                                </td>

                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <a
                                      href={
                                        item.link?.startsWith("http")
                                          ? item.link
                                          : `https://${item.link}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00A8CC] hover:text-[#0088A6] hover:underline"
                                    >
                                      Watch
                                      <ExternalLink className="h-3 w-3" />
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleCopyLink(item.link, item._id)
                                      }
                                      className="text-[#8FA3B0] transition hover:text-[#00A8CC]"
                                    >
                                      {copiedId === item._id ? (
                                        <Check className="h-3.5 w-3.5 text-green-500" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </td>

                                <td className="px-3 py-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteContent(item._id)
                                    }
                                    disabled={deletingId === item._id}
                                    className="rounded-lg p-1.5 text-[#8FA3B0] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                  >
                                    {deletingId === item._id ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-2 md:hidden">
                    {devContentList.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#DCE7EC] p-8 text-center">
                        <Monitor className="mx-auto h-7 w-7 text-[#B4D7E2]" />

                        <p className="mt-2 text-xs font-semibold text-[#71838E]">
                          No videos published
                        </p>
                      </div>
                    ) : (
                      devContentList.map((item, index) => (
                        <div
                          key={item._id}
                          className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 gap-2.5">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#E3F5F9] text-[10px] font-bold text-[#0088A6]">
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#14222B]">
                                  {item.title}
                                </p>

                                <p className="mt-0.5 text-[10px] text-[#71838E]">
                                  {item.topic || "Development"}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDeleteContent(item._id)}
                              disabled={deletingId === item._id}
                              className="shrink-0 rounded-lg p-1.5 text-[#8FA3B0] hover:bg-red-50 hover:text-red-500"
                            >
                              {deletingId === item._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center gap-2 border-t border-[#DCE7EC] pt-2.5">
                            <a
                              href={
                                item.link?.startsWith("http")
                                  ? item.link
                                  : `https://${item.link}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 rounded-lg bg-[#E3F5F9] px-2.5 py-1.5 text-[10px] font-bold text-[#0088A6]"
                            >
                              Watch Video
                              <ExternalLink className="h-3 w-3" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLink(item.link, item._id)
                              }
                              className="rounded-lg border border-[#DCE7EC] bg-white p-1.5 text-[#8FA3B0]"
                            >
                              {copiedId === item._id ? (
                                <Check className="h-3.5 w-3.5 text-green-500" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminProgress;
