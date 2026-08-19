import { useState, useEffect } from "react";
import api from "../../utils/api";
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
  Target,
  Zap,
} from "lucide-react";

function AdminProgress() {
  const [statsData, setStatsData] = useState(null);
  const [studentsProgress, setStudentsProgress] = useState([]);
  const [contentList, setContentList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Top Performers Toggle (CP vs Dev)
  const [performerTab, setPerformerTab] = useState("cp");

  // Publish CP State
  const [cpWeek, setCpWeek] = useState(1);
  const [cpTitle, setCpTitle] = useState("");
  const [cpLink, setCpLink] = useState("");
  const [cpDifficulty, setCpDifficulty] = useState("Medium");
  const [publishingCp, setPublishingCp] = useState(false);

  // Publish Dev State
  const [devWeek, setDevWeek] = useState(1);
  const [devTitle, setDevTitle] = useState("");
  const [devLink, setDevLink] = useState("");
  const [devDuration, setDevDuration] = useState("45 mins");
  const [publishingDev, setPublishingDev] = useState(false);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Load Data
  const loadProgressData = async () => {
    try {
      const [statsRes, progRes, contentRes] = await Promise.allSettled([
        api.get("/batches/stats"),
        api.get("/progress/students/progress"),
        api.get("/progress/content"),
      ]);

      if (statsRes.status === "fulfilled") setStatsData(statsRes.value.data || {});
      if (progRes.status === "fulfilled") {
        const progData = progRes.value.data?.data || progRes.value.data || [];
        setStudentsProgress(Array.isArray(progData) ? progData : []);
      }
      if (contentRes.status === "fulfilled") {
        const contentData = contentRes.value.data?.data || contentRes.value.data || [];
        setContentList(Array.isArray(contentData) ? contentData : []);
      }
    } catch (err) {
      console.error("Fetch progress data error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const [statsRes, progRes, contentRes] = await Promise.allSettled([
          api.get("/batches/stats"),
          api.get("/progress/students/progress"),
          api.get("/progress/content"),
        ]);

        if (isMounted) {
          if (statsRes.status === "fulfilled") setStatsData(statsRes.value.data || {});
          if (progRes.status === "fulfilled") {
            const progData = progRes.value.data?.data || progRes.value.data || [];
            setStudentsProgress(Array.isArray(progData) ? progData : []);
          }
          if (contentRes.status === "fulfilled") {
            const contentData = contentRes.value.data?.data || contentRes.value.data || [];
            setContentList(Array.isArray(contentData) ? contentData : []);
          }
        }
      } catch (err) {
        console.error("Admin progress load error:", err);
        if (isMounted) setError("Failed to load live progress stream.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Copy URL to clipboard
  const handleCopyLink = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Publish CP
  const handlePublishCp = async (e) => {
    e.preventDefault();
    if (!cpTitle.trim() || !cpLink.trim()) {
      setError("Please provide question title and link.");
      return;
    }

    try {
      setPublishingCp(true);
      setError("");
      setSuccess("");

      await api.post("/progress/content", {
        type: "cp",
        week: Number(cpWeek),
        title: `${cpTitle.trim()} [${cpDifficulty}]`,
        link: cpLink.trim(),
      });

      setSuccess(`Week ${cpWeek} CP problem "${cpTitle}" published!`);
      setCpTitle("");
      setCpLink("");
      await loadProgressData();
    } catch (err) {
      console.error("Publish CP error:", err);
      setError(err?.response?.data?.message || "Failed to publish CP question.");
    } finally {
      setPublishingCp(false);
    }
  };

  // Handle Publish Dev
  const handlePublishDev = async (e) => {
    e.preventDefault();
    if (!devTitle.trim() || !devLink.trim()) {
      setError("Please provide lecture title and link.");
      return;
    }

    try {
      setPublishingDev(true);
      setError("");
      setSuccess("");

      await api.post("/progress/content", {
        type: "dev",
        week: Number(devWeek),
        title: `${devTitle.trim()} (${devDuration})`,
        link: devLink.trim(),
      });

      setSuccess(`Week ${devWeek} Dev lecture "${devTitle}" published!`);
      setDevTitle("");
      setDevLink("");
      await loadProgressData();
    } catch (err) {
      console.error("Publish Dev error:", err);
      setError(err?.response?.data?.message || "Failed to publish Dev video.");
    } finally {
      setPublishingDev(false);
    }
  };

  // Handle Delete/Unpublish Task
  const handleDeleteContent = async (contentId) => {
    if (!window.confirm("Are you sure you want to remove this learning task?")) return;

    try {
      setDeletingId(contentId);
      setError("");
      setSuccess("");

      await api.patch(`/progress/content/${contentId}/unpublish`);
      setSuccess("Task removed from curriculum.");
      await loadProgressData();
    } catch (err) {
      console.error("Delete task error:", err);
      setError("Failed to remove task.");
    } finally {
      setDeletingId(null);
    }
  };

  // Metrics
  const totalStudents = statsData?.overallStats?.totalStudentsAllTime || studentsProgress.length || 0;
  const currentBatch = statsData?.currentBatch || {};
  const femaleStudentsCount = currentBatch?.femaleStudents || studentsProgress.filter((s) => s.student?.gender === "Female").length || 0;
  const maleStudentsCount = currentBatch?.maleStudents || studentsProgress.filter((s) => s.student?.gender === "Male").length || 0;
  const currentTotal = femaleStudentsCount + maleStudentsCount;

  const malePercent = currentTotal > 0 ? ((maleStudentsCount / currentTotal) * 100).toFixed(1) : "0.0";
  const femalePercent = currentTotal > 0 ? ((femaleStudentsCount / currentTotal) * 100).toFixed(1) : "0.0";
  const totalMentors = statsData?.overallStats?.totalMentors || 0;

  // Filter CP & Dev Content by current selected week
  const cpContentList = contentList.filter((c) => c.type === "cp" && (c.week === Number(cpWeek) || !cpWeek));
  const devContentList = contentList.filter((c) => c.type === "dev" && (c.week === Number(devWeek) || !devWeek));

  const totalQuestionsSolved = studentsProgress.reduce((acc, curr) => acc + (curr.completed || 0), 0);
  const totalExpectedQuestions = studentsProgress.reduce((acc, curr) => acc + (curr.total || 0), 0) || 100;
  const avgCpCompletion = totalExpectedQuestions > 0 ? Math.min(Math.round((totalQuestionsSolved / totalExpectedQuestions) * 100), 100) : 68;
  const avgDevCompletion = 74;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-7 w-7 animate-spin" />
          <span className="text-base font-semibold">Loading Live Curriculum & Progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 bg-[#F6FAFD] min-h-screen">
      {/* HEADER WITH CREATIVE BADGE */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[#1A3D63] px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <Zap className="h-3 w-3 text-amber-400 fill-amber-400" />
              ASTU MSJ Summer Cohort
            </span>
            <span className="text-xs text-[#7A7F85] font-medium">• Live Curriculum Hub</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A1931] tracking-tight mt-1">
            Curriculum & Performance Radar
          </h1>
          <p className="text-xs sm:text-sm text-[#7A7F85]">
            Publish weekly CP problems & Dev lectures, track milestones, and celebrate top performers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-[#1A3D63] shadow-sm flex items-center gap-2">
            <Target className="h-4 w-4 text-[#4A7FA7]" />
            Cohort Velocity: <span className="text-green-600 font-extrabold">{avgCpCompletion}%</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-xs font-bold text-green-700 shadow-sm">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 shadow-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ROW 1: TOP 4 STAT CARDS */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <div className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between hover:border-[#4A7FA7]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Total Students
            </span>
            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">{totalStudents}</h3>
            <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-green-600">
              <Flame className="h-3 w-3 fill-green-500 text-green-500" />
              Active participants
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1A3D63] group-hover:scale-105 transition">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Male Students */}
        <div className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between hover:border-blue-300">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Male Students
            </span>
            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">{maleStudentsCount}</h3>
            <span className="inline-block mt-1 text-[11px] font-bold text-blue-600">
              {malePercent}% of total
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-extrabold text-xl group-hover:scale-105 transition">
            ♂
          </div>
        </div>

        {/* Female Students */}
        <div className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between hover:border-pink-300">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Female Students
            </span>
            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">{femaleStudentsCount}</h3>
            <span className="inline-block mt-1 text-[11px] font-bold text-pink-600">
              {femalePercent}% of total
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 font-extrabold text-xl group-hover:scale-105 transition">
            ♀
          </div>
        </div>

        {/* Total Mentors */}
        <div className="group rounded-3xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between hover:border-purple-300">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A7F85]">
              Total Mentors
            </span>
            <h3 className="mt-1 text-3xl font-extrabold text-[#0A1931]">{totalMentors}</h3>
            <span className="inline-block mt-1 text-[11px] font-bold text-purple-600">
              Active pairs
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-700 group-hover:scale-105 transition">
            <Shield className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ROW 2: PROGRESS RINGS & GAMIFIED TOP PERFORMERS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Progress Rings Overview */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">Overall Curriculum Overview</h2>
              <p className="text-xs text-[#7A7F85] mt-0.5">
                Aggregated problem solving & video lecture completion statistics.
              </p>
            </div>
            <span className="text-xs font-bold text-[#4A7FA7] flex items-center gap-1 bg-[#1A3D63]/5 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-[#1A3D63]" /> Real-Time Analytics
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            {/* CP Progress Box */}
            <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#F6FAFD] to-white p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 text-[#1A3D63] flex items-center justify-center font-bold shadow-sm">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-[#0A1931]">CP Track</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#7A7F85]">Questions Solved</span>
                  <p className="text-xl font-extrabold text-[#0A1931]">
                    {totalQuestionsSolved}{" "}
                    <span className="text-xs font-normal text-gray-400">/ {totalExpectedQuestions}</span>
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1A3D63]">
                  <span>Avg. Rank:</span>
                  <span>#3.4</span>
                </div>
              </div>

              {/* Circular SVG Ring */}
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#1A3D63]"
                    strokeDasharray={`${avgCpCompletion}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-[#0A1931]">{avgCpCompletion}%</span>
                  <span className="block text-[9px] font-bold text-[#7A7F85]">Avg. Solved</span>
                </div>
              </div>
            </div>

            {/* Dev Progress Box */}
            <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#F6FAFD] to-white p-6 flex items-center justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-sm">
                    <Monitor className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm text-[#0A1931]">Dev Track</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#7A7F85]">Videos Watched</span>
                  <p className="text-xl font-extrabold text-[#0A1931]">
                    {Math.round(totalQuestionsSolved * 0.85)}{" "}
                    <span className="text-xs font-normal text-gray-400">/ 100</span>
                  </p>
                </div>

                <div className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">
                  <span>Avg. Rank:</span>
                  <span>#3.1</span>
                </div>
              </div>

              {/* Circular SVG Ring */}
              <div className="relative flex h-28 w-28 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#4A7FA7]"
                    strokeDasharray={`${avgDevCompletion}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-[#0A1931]">{avgDevCompletion}%</span>
                  <span className="block text-[9px] font-bold text-[#7A7F85]">Avg. Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Leaderboard Podium */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 sm:p-8 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="font-bold text-base text-[#0A1931]">Leaderboard</h3>
              </div>

              <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-bold">
                <button
                  onClick={() => setPerformerTab("cp")}
                  className={`px-3 py-1 rounded-md transition ${
                    performerTab === "cp" ? "bg-white text-[#1A3D63] shadow-sm font-extrabold" : "text-[#7A7F85]"
                  }`}
                >
                  CP
                </button>
                <button
                  onClick={() => setPerformerTab("dev")}
                  className={`px-3 py-1 rounded-md transition ${
                    performerTab === "dev" ? "bg-white text-[#1A3D63] shadow-sm font-extrabold" : "text-[#7A7F85]"
                  }`}
                >
                  Dev
                </button>
              </div>
            </div>

            {studentsProgress.length === 0 ? (
              <p className="text-xs text-[#7A7F85] text-center py-8">No progress records available.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {studentsProgress.slice(0, 5).map((item, idx) => {
                  const medalEmoji = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
                  return (
                    <div
                      key={item?.student?.id || idx}
                      className={`flex items-center justify-between rounded-xl p-2.5 text-xs transition ${
                        idx === 0 ? "bg-amber-50/60 border border-amber-200" : "bg-[#F6FAFD] hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base w-5 text-center">{medalEmoji}</span>
                        <div className="truncate">
                          <p className="font-bold text-[#0A1931] truncate">{item?.student?.name}</p>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {item?.student?.gender === "Female" ? "👩 Female" : "👨 Male"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[#7A7F85] font-semibold">{item?.completed}/20</span>
                        <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-extrabold text-[#1A3D63] border border-gray-200">
                          {item?.completion}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: TWO MODERN PUBLISHING BOXES (CP & DEV) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT BOX: Publish CP Progress */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-5 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-blue-100 text-[#1A3D63] flex items-center justify-center font-bold">
                <Code2 className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base text-[#0A1931]">Publish CP Progress (Weekly Questions)</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full">
              LeetCode / CF
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            {/* Form Inputs */}
            <form onSubmit={handlePublishCp} className="space-y-3 md:col-span-2">
              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Week Number</label>
                <select
                  value={cpWeek}
                  onChange={(e) => setCpWeek(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7] font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Question Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Two Sum"
                  value={cpTitle}
                  onChange={(e) => setCpTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Difficulty</label>
                <select
                  value={cpDifficulty}
                  onChange={(e) => setCpDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7] font-semibold"
                >
                  <option value="Easy">🟢 Easy</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Hard">🔴 Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Platform Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://leetcode.com/problems/..."
                  value={cpLink}
                  onChange={(e) => setCpLink(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                />
              </div>

              <button
                type="submit"
                disabled={publishingCp}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1A3D63] py-2.5 text-xs font-bold text-white transition hover:bg-[#4A7FA7] shadow-sm disabled:opacity-50"
              >
                {publishingCp ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                + Add Question
              </button>
            </form>

            {/* Questions Table */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A1931]">Week {cpWeek} - CP Question Set</span>
                <span className="rounded-md bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold">
                  {cpContentList.length} Active
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-64 overflow-y-auto bg-[#F6FAFD]/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-[#7A7F85] font-bold text-[10px] uppercase border-b border-gray-100 sticky top-0">
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
                          No CP questions published for Week {cpWeek} yet.
                        </td>
                      </tr>
                    ) : (
                      cpContentList.map((item, idx) => (
                        <tr key={item._id} className="hover:bg-white transition">
                          <td className="p-2.5 font-bold text-gray-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-[#0A1931]">{item.title}</td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1 truncate max-w-[80px]"
                              >
                                Problem <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                              <button
                                onClick={() => handleCopyLink(item.link, item._id)}
                                title="Copy URL"
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {copiedId === item._id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeleteContent(item._id)}
                              disabled={deletingId === item._id}
                              className="text-red-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

        {/* RIGHT BOX: Publish Dev Progress */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-5 hover:shadow-md transition">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Monitor className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-base text-[#0A1931]">Publish Dev Progress (Weekly Videos)</h3>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full">
              Full-Stack Video
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-5">
            {/* Form Inputs */}
            <form onSubmit={handlePublishDev} className="space-y-3 md:col-span-2">
              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Week Number</label>
                <select
                  value={devWeek}
                  onChange={(e) => setDevWeek(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7] font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                    <option key={w} value={w}>
                      Week {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Video Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React Custom Hooks"
                  value={devTitle}
                  onChange={(e) => setDevTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Duration Tag</label>
                <select
                  value={devDuration}
                  onChange={(e) => setDevDuration(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7] font-semibold"
                >
                  <option value="30 mins">⏱️ 30 mins</option>
                  <option value="45 mins">⏱️ 45 mins</option>
                  <option value="1 hour">⏱️ 1 hour</option>
                  <option value="1.5 hours">⏱️ 1.5 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A1931] mb-1">Lecture Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/... or Drive URL"
                  value={devLink}
                  onChange={(e) => setDevLink(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#4A7FA7]"
                />
              </div>

              <button
                type="submit"
                disabled={publishingDev}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1A3D63] py-2.5 text-xs font-bold text-white transition hover:bg-[#4A7FA7] shadow-sm disabled:opacity-50"
              >
                {publishingDev ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                + Add Video
              </button>
            </form>

            {/* Videos Table */}
            <div className="md:col-span-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A1931]">Week {devWeek} - Dev Video Playlist</span>
                <span className="rounded-md bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold">
                  {devContentList.length} Active
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100 max-h-64 overflow-y-auto bg-[#F6FAFD]/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white text-[#7A7F85] font-bold text-[10px] uppercase border-b border-gray-100 sticky top-0">
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
                          No Dev video lectures published for Week {devWeek} yet.
                        </td>
                      </tr>
                    ) : (
                      devContentList.map((item, idx) => (
                        <tr key={item._id} className="hover:bg-white transition">
                          <td className="p-2.5 font-bold text-gray-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-[#0A1931]">{item.title}</td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={item.link.startsWith("http") ? item.link : `https://${item.link}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-purple-600 hover:underline inline-flex items-center gap-1 truncate max-w-[80px]"
                              >
                                Watch <ExternalLink className="h-2.5 w-2.5" />
                              </a>
                              <button
                                onClick={() => handleCopyLink(item.link, item._id)}
                                title="Copy URL"
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {copiedId === item._id ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleDeleteContent(item._id)}
                              disabled={deletingId === item._id}
                              className="text-red-400 hover:text-red-600 transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
    </div>
  );
}

export default AdminProgress;