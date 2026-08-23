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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  Copy,
  Check,
  Flame,
  Zap,
} from "lucide-react";

function AdminProgress() {
  // ============================================================
  // DATA
  // ============================================================

  const [statsData, setStatsData] = useState(null);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // LEADERBOARD
  // ============================================================

  const [performerTab, setPerformerTab] = useState("cp");

  // ============================================================
  // CP FORM
  // ============================================================

  const [cpWeek, setCpWeek] = useState(1);
  const [cpTitle, setCpTitle] = useState("");
  const [cpLink, setCpLink] = useState("");
  const [cpDifficulty, setCpDifficulty] = useState("Medium");
  const [cpTopic, setCpTopic] = useState("JavaScript");
  const [publishingCp, setPublishingCp] = useState(false);

  // ============================================================
  // DEV FORM
  // ============================================================

  const [devWeek, setDevWeek] = useState(1);
  const [devTitle, setDevTitle] = useState("");
  const [devLink, setDevLink] = useState("");
  const [devDuration, setDevDuration] = useState("45 mins");
  const [devTopic, setDevTopic] = useState("React");
  const [publishingDev, setPublishingDev] = useState(false);

  // ============================================================
  // UI
  // ============================================================

  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ============================================================
  // TOPICS
  // ============================================================

  const TOPICS = [
    "HTML / CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Git / GitHub",
  ];

  // ============================================================
  // GET CURRENT BATCH
  // ============================================================

  const fetchCurrentBatch = async () => {
    try {
      const res = await api.get("/batches/dashboard-stats");

      const currentBatch =
        res.data?.currentBatch?.batch || res.data?.currentBatch || null;

      if (!currentBatch?._id) {
        setCurrentBatch(null);

        throw new Error(
          "No current batch available. Please activate a batch first.",
        );
      }

      setCurrentBatch(currentBatch);

      return currentBatch;
    } catch (err) {
      console.error("Current batch error:", err);

      setCurrentBatch(null);

      throw new Error(
        err?.response?.data?.message ||
          err?.message ||
          "No current batch available. Please activate a batch first.",
      );
    }
  };

  // ============================================================
  // LOAD PROGRESS DATA
  // ============================================================

  const loadProgressData = async () => {
    try {
      setError("");

      const batch = await fetchCurrentBatch();
      const batchId = batch._id;

      const [statsRes, progRes, contentRes] = await Promise.allSettled([
        api.get("/batches/dashboard-stats"),

        api.get("/progress/students/progress", {
          params: {
            batchId,
          },
        }),

        api.get("/progress/content", {
          params: {
            batchId,
          },
        }),
      ]);

      // --------------------------------------------------------
      // STATS
      // --------------------------------------------------------

      if (statsRes.status === "fulfilled") {
        setStatsData(statsRes.value.data || {});
      } else {
        console.error("Batch statistics error:", statsRes.reason);
        setStatsData(null);
      }

      // --------------------------------------------------------
      // STUDENT PROGRESS
      // --------------------------------------------------------

      if (progRes.status === "fulfilled") {
        const progData = progRes.value.data?.data || progRes.value.data || [];

        setStudentsProgress(Array.isArray(progData) ? progData : []);
      } else {
        console.error("Student progress error:", progRes.reason);
        setStudentsProgress([]);
      }

      // --------------------------------------------------------
      // CONTENT
      // --------------------------------------------------------

      if (contentRes.status === "fulfilled") {
        const contentData =
          contentRes.value.data?.data || contentRes.value.data || [];

        setContentList(Array.isArray(contentData) ? contentData : []);
      } else {
        console.error("Progress content error:", contentRes.reason);
        setContentList([]);
      }
    } catch (err) {
      console.error("Load progress data error:", err);

      setError(err?.message || "Failed to load current batch progress.");
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

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

  // ============================================================
  // COPY LINK
  // ============================================================

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

  // ============================================================
  // PUBLISH CP
  // ============================================================

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
      setSuccess("");

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

  // ============================================================
  // PUBLISH DEV
  // ============================================================

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
      setSuccess("");

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

  // ============================================================
  // DELETE / UNPUBLISH
  // ============================================================

  const handleDeleteContent = (contentId) => {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">
            Are you sure you want to remove this learning task?
          </span>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-200"
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
                  setSuccess("");

                  await api.patch(`/progress/content/${contentId}/unpublish`);

                  toast.success("Question removed successfully.");

                  await loadProgressData();
                } catch (err) {
                  console.error("Delete task error:", err);

                  toast.error(
                    err?.response?.data?.message || "Failed to remove task.",
                  );
                } finally {
                  setDeletingId(null);
                }
              }}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-600"
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

  // ============================================================
  // STATISTICS
  // ============================================================

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

  // ============================================================
  // CONTENT FILTER
  // ============================================================

  const cpContentList = contentList.filter(
    (item) => item.type === "cp" && item.week === Number(cpWeek),
  );

  const devContentList = contentList.filter(
    (item) => item.type === "dev" && item.week === Number(devWeek),
  );

  // ============================================================
  // CP METRICS
  // ============================================================

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

  // ============================================================
  // DEV METRICS
  // ============================================================

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

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-7 w-7 animate-spin" />

          <span className="text-base font-semibold">
            Loading Live Curriculum & Progress...
          </span>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen space-y-8 bg-[#F6FAFD] p-6 sm:p-8">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[#1A3D63] px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
              ASTU MSJ
            </span>

            <span className="text-xs font-medium text-[#7A7F85]">
              • Live Curriculum Hub
            </span>
          </div>

          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0A1931] sm:text-3xl">
            Progress
          </h1>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Current Batch
          </p>

          {currentBatch ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-sm font-extrabold text-[#1A3D63]">
                {currentBatch.name}
              </span>
            </div>
          ) : (
            <span className="text-sm font-bold text-red-500">
              No current batch
            </span>
          )}
        </div>
      </div>

      {/* NOTIFICATIONS */}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-xs font-bold text-green-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CURRENT BATCH WARNING */}

      {!currentBatch && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />

            <div>
              <h3 className="font-bold text-amber-800">
                No current batch is available
              </h3>

              <p className="mt-1 text-xs text-amber-700">
                Progress content must belong to the current batch. Please
                activate a batch from the Batch Management page before
                publishing content.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STAT CARDS */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Students */}

        <div className="group flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-[#4A7FA7] hover:shadow-md">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Total Students
            </span>

            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">
              {totalStudents}
            </h3>

            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-green-600">
              <Flame className="h-3 w-3 fill-green-500 text-green-500" />
              Active participants
            </span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1A3D63]">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Male */}

        <div className="group flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Male Students
            </span>

            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">
              {maleStudentsCount}
            </h3>

            <span className="mt-1 inline-block text-[11px] font-bold text-blue-600">
              {malePercent}% of total
            </span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl font-extrabold text-blue-600">
            ♂
          </div>
        </div>

        {/* Female */}

        <div className="group flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-pink-300 hover:shadow-md">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Female Students
            </span>

            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">
              {femaleStudentsCount}
            </h3>

            <span className="mt-1 inline-block text-[11px] font-bold text-pink-600">
              {femalePercent}% of total
            </span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-xl font-extrabold text-pink-600">
            ♀
          </div>
        </div>

        {/* Mentors */}

        <div className="group flex items-center justify-between rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-purple-300 hover:shadow-md">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Total Mentors
            </span>

            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">
              {totalMentors}
            </h3>

            <span className="mt-1 inline-block text-[11px] font-bold text-purple-600">
              Active mentors
            </span>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
            <Shield className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ======================================================
          OVERVIEW
          ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* CURRICULUM OVERVIEW */}

        <div className="space-y-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                Overall Curriculum Overview
              </h2>

              <p className="mt-0.5 text-xs text-[#7A7F85]">
                Aggregated CP and Dev completion statistics.
              </p>
            </div>

            <span className="flex items-center gap-1 rounded-full bg-[#1A3D63]/5 px-3 py-1 text-xs font-bold text-[#4A7FA7]">
              <Sparkles className="h-3.5 w-3.5 text-[#1A3D63]" />
              Real-Time Analytics
            </span>
          </div>

          {/* CIRCULAR PROGRESS */}

          <div className="grid gap-10 pt-4 sm:grid-cols-2">
            {/* CP */}

            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-[#1A3D63]">
                  <Code2 className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0A1931]">CP Track</h3>

                  <p className="text-[10px] text-[#7A7F85]">
                    Competitive Programming
                  </p>
                </div>
              </div>

              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  <path
                    className="text-[#1A3D63]"
                    strokeDasharray={`${avgCpCompletion}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-3xl font-black text-[#0A1931]">
                    {avgCpCompletion}%
                  </span>

                  <span className="block text-[10px] font-bold text-[#7A7F85]">
                    Completed
                  </span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7F85]">
                  Questions Solved
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#0A1931]">
                  {totalQuestionsSolved}

                  <span className="text-xs font-normal text-gray-400">
                    {" "}
                    / {totalExpectedQuestions}
                  </span>
                </p>
              </div>
            </div>

            {/* DEV */}

            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <Monitor className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#0A1931]">
                    Dev Track
                  </h3>

                  <p className="text-[10px] text-[#7A7F85]">
                    Full-Stack Development
                  </p>
                </div>
              </div>

              <div className="relative flex h-36 w-36 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />

                  <path
                    className="text-[#4A7FA7]"
                    strokeDasharray={`${avgDevCompletion}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>

                <div className="absolute text-center">
                  <span className="text-3xl font-black text-[#0A1931]">
                    {avgDevCompletion}%
                  </span>

                  <span className="block text-[10px] font-bold text-[#7A7F85]">
                    Completed
                  </span>
                </div>
              </div>

              <div className="mt-5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7A7F85]">
                  Videos Completed
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#0A1931]">
                  {totalDevCompleted}

                  <span className="text-xs font-normal text-gray-400">
                    {" "}
                    / {totalDevExpected || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LEADERBOARD */}

        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />

              <h3 className="text-base font-bold text-[#0A1931]">
                Leaderboard
              </h3>
            </div>

            <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-bold">
              <button
                onClick={() => setPerformerTab("cp")}
                className={`rounded-md px-3 py-1 ${
                  performerTab === "cp"
                    ? "bg-white text-[#1A3D63] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                CP
              </button>

              <button
                onClick={() => setPerformerTab("dev")}
                className={`rounded-md px-3 py-1 ${
                  performerTab === "dev"
                    ? "bg-white text-[#1A3D63] shadow-sm"
                    : "text-gray-500"
                }`}
              >
                Dev
              </button>
            </div>
          </div>

          {studentsProgress.length === 0 ? (
            <p className="py-8 text-center text-xs text-[#7A7F85]">
              No progress records available.
            </p>
          ) : (
            <div className="space-y-2">
              {[...studentsProgress]
                .sort((a, b) => {
                  const aCompletion =
                    performerTab === "cp"
                      ? (a?.cp?.completion ?? a?.completion ?? 0)
                      : (a?.dev?.completion ?? 0);

                  const bCompletion =
                    performerTab === "cp"
                      ? (b?.cp?.completion ?? b?.completion ?? 0)
                      : (b?.dev?.completion ?? 0);

                  return bCompletion - aCompletion;
                })
                .slice(0, 5)
                .map((item, idx) => {
                  const completion =
                    performerTab === "cp"
                      ? (item?.cp?.completion ?? item?.completion ?? 0)
                      : (item?.dev?.completion ?? 0);

                  const completed =
                    performerTab === "cp"
                      ? (item?.cp?.completed ?? item?.completed ?? 0)
                      : (item?.dev?.completed ?? 0);

                  const medal =
                    idx === 0
                      ? "🥇"
                      : idx === 1
                        ? "🥈"
                        : idx === 2
                          ? "🥉"
                          : `#${idx + 1}`;

                  return (
                    <div
                      key={item?.student?.id || item?.student?._id || idx}
                      className={`flex items-center justify-between rounded-xl p-2.5 ${
                        idx === 0
                          ? "border border-amber-200 bg-amber-50/60"
                          : "bg-[#F6FAFD]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="w-5 text-center text-base">
                          {medal}
                        </span>

                        <div className="truncate">
                          <p className="truncate text-xs font-bold text-[#0A1931]">
                            {item?.student?.name || "Unknown Student"}
                          </p>

                          <span className="text-[10px] text-gray-400">
                            {item?.student?.gender || "Student"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-semibold text-[#7A7F85]">
                          {completed}
                        </span>

                        <span className="rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-extrabold text-[#1A3D63]">
                          {completion}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          PUBLISH CP + DEV
          ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CP */}

        <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-[#1A3D63]">
                <Code2 className="h-4 w-4" />
              </div>

              <h3 className="text-base font-bold text-[#0A1931]">
                Publish CP Progress
              </h3>
            </div>

            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-700">
              LeetCode / CF
            </span>
          </div>

          <form onSubmit={handlePublishCp} className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Week Number
              </label>

              <select
                value={cpWeek}
                onChange={(e) => setCpWeek(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#4A7FA7]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Question Title
              </label>

              <input
                type="text"
                required
                value={cpTitle}
                onChange={(e) => setCpTitle(e.target.value)}
                placeholder="e.g. Two Sum"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Difficulty
              </label>

              <select
                value={cpDifficulty}
                onChange={(e) => setCpDifficulty(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#4A7FA7]"
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Platform Link
              </label>

              <input
                type="url"
                required
                value={cpLink}
                onChange={(e) => setCpLink(e.target.value)}
                placeholder="https://leetcode.com/problems/..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
              />
            </div>

            <button
              type="submit"
              disabled={publishingCp || !currentBatch}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1A3D63] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishingCp ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}

              {currentBatch ? "Add Question" : "No Current Batch"}
            </button>
          </form>

          {/* CP TABLE */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0A1931]">
                Week {cpWeek} Questions
              </span>

              <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                {cpContentList.length} Active
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-gray-100 bg-white text-[10px] uppercase text-gray-500">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Question</th>
                    <th className="p-2.5">Link</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {cpContentList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        No CP questions published for Week {cpWeek}.
                      </td>
                    </tr>
                  ) : (
                    cpContentList.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-gray-400">
                          {index + 1}
                        </td>

                        <td className="p-2.5 font-bold text-[#0A1931]">
                          {item.title}
                        </td>

                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={
                                item.link?.startsWith("http")
                                  ? item.link
                                  : `https://${item.link}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-20 items-center gap-1 truncate text-blue-600 hover:underline"
                            >
                              Problem
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLink(item.link, item._id)
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {copiedId === item._id ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteContent(item._id)}
                            disabled={deletingId === item._id}
                            className="text-red-400 hover:text-red-600 disabled:opacity-50"
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
        </div>

        {/* DEV */}

        <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Monitor className="h-4 w-4" />
              </div>

              <h3 className="text-base font-bold text-[#0A1931]">
                Publish Dev Progress
              </h3>
            </div>

            <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-700">
              Full-Stack Video
            </span>
          </div>

          <form onSubmit={handlePublishDev} className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Week Number
              </label>

              <select
                value={devWeek}
                onChange={(e) => setDevWeek(Number(e.target.value))}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#4A7FA7]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                  <option key={week} value={week}>
                    Week {week}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Topic
              </label>

              <select
                value={devTopic}
                onChange={(e) => setDevTopic(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#4A7FA7]"
              >
                {TOPICS.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Video Topic
              </label>

              <input
                type="text"
                required
                value={devTitle}
                onChange={(e) => setDevTitle(e.target.value)}
                placeholder="e.g. React Custom Hooks"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Duration
              </label>

              <select
                value={devDuration}
                onChange={(e) => setDevDuration(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#4A7FA7]"
              >
                <option value="30 mins">⏱️ 30 mins</option>
                <option value="45 mins">⏱️ 45 mins</option>
                <option value="1 hour">⏱️ 1 hour</option>
                <option value="1.5 hours">⏱️ 1.5 hours</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-[#0A1931]">
                Lecture Link
              </label>

              <input
                type="url"
                required
                value={devLink}
                onChange={(e) => setDevLink(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
              />
            </div>

            <button
              type="submit"
              disabled={publishingDev || !currentBatch}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1A3D63] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {publishingDev ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}

              {currentBatch ? "Add Video" : "No Current Batch"}
            </button>
          </form>

          {/* DEV TABLE */}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0A1931]">
                Week {devWeek} Videos
              </span>

              <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
                {devContentList.length} Active
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-gray-100 bg-white text-[10px] uppercase text-gray-500">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Topic</th>
                    <th className="p-2.5">Link</th>
                    <th className="p-2.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {devContentList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400">
                        No Dev videos published for Week {devWeek}.
                      </td>
                    </tr>
                  ) : (
                    devContentList.map((item, index) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="p-2.5 font-bold text-gray-400">
                          {index + 1}
                        </td>

                        <td className="p-2.5 font-bold text-[#0A1931]">
                          {item.title}
                        </td>

                        <td className="p-2.5">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={
                                item.link?.startsWith("http")
                                  ? item.link
                                  : `https://${item.link}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex max-w-20 items-center gap-1 truncate text-purple-600 hover:underline"
                            >
                              Watch
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleCopyLink(item.link, item._id)
                              }
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {copiedId === item._id ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteContent(item._id)}
                            disabled={deletingId === item._id}
                            className="text-red-400 hover:text-red-600 disabled:opacity-50"
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
        </div>
      </div>
    </div>
  );
}

export default AdminProgress;
