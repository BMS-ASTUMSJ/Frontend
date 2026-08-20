import { useState, useEffect } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Search,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  Award,
  Loader2,
  Users,
  Inbox,
  GitBranch,
  RotateCcw,
} from "lucide-react";

const MentorAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAsm, setSelectedAsm] = useState("");

  const [loading, setLoading] = useState(true);
  const [fetchingSubs, setFetchingSubs] = useState(false);

  const [gradeData, setGradeData] = useState({});

  // ============================================================
  // FETCH ASSIGNMENTS
  // ============================================================

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        const res = await api.get("/assignments");

        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error("FAILED TO LOAD ASSIGNMENTS:", err);

        toast.error(
          err.response?.data?.message || "Failed to load assignments",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // ============================================================
  // AUTOMATIC SUBMISSION STATUS
  // ============================================================

  const getSubmissionStatus = (submission) => {
    if (submission?.status === "Graded") {
      return "Graded";
    }

    if (submission?.status === "Resubmission Required") {
      return "Resubmission Required";
    }

    // If submitted but not graded yet
    return "Pending";
  };

  // ============================================================
  // LOAD SUBMISSIONS
  // ============================================================

  const loadSubmissions = async (assignmentId) => {
    if (!assignmentId) {
      setSelectedAsm("");
      setSubmissions([]);
      setGradeData({});
      return;
    }

    setSelectedAsm(assignmentId);
    setFetchingSubs(true);

    try {
      const res = await api.get(`/submissions/assignment/${assignmentId}`);

      const fetchedSubmissions = res.data.submissions || [];

      setSubmissions(fetchedSubmissions);

      const initialGrades = {};

      fetchedSubmissions.forEach((sub) => {
        const automaticStatus = getSubmissionStatus(sub);

        initialGrades[sub._id] = {
          score: sub.score ?? "",
          feedback: sub.feedback ?? "",
          status: automaticStatus,
        };
      });

      setGradeData(initialGrades);
    } catch (err) {
      console.error("ERROR LOADING SUBMISSIONS:", err);

      toast.error(err.response?.data?.message || "Error loading submissions");

      setSubmissions([]);
      setGradeData({});
    } finally {
      setFetchingSubs(false);
    }
  };

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleInputChange = (subId, field, value) => {
    setGradeData((prev) => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        [field]: value,
      },
    }));
  };

  // ============================================================
  // REQUEST RESUBMISSION
  // ============================================================

  const requestResubmission = async (subId) => {
    const confirmed = window.confirm(
      "Do you want to request a resubmission from this student?",
    );

    if (!confirmed) {
      return;
    }

    const currentGrade = gradeData[subId];

    try {
      await api.put(`/submissions/grade/${subId}`, {
        score:
          currentGrade?.score === "" ||
          currentGrade?.score === null ||
          currentGrade?.score === undefined
            ? null
            : Number(currentGrade.score),

        feedback: currentGrade?.feedback?.trim() || "",

        status: "Resubmission Required",
      });

      toast.success("Resubmission request sent successfully.");

      await loadSubmissions(selectedAsm);
    } catch (err) {
      console.error("RESUBMISSION REQUEST FAILED:", err);

      toast.error(
        err.response?.data?.message || "Failed to request resubmission",
      );
    }
  };

  // ============================================================
  // SUBMIT GRADE
  // ============================================================

  const submitGrade = async (subId) => {
    const currentGrade = gradeData[subId];

    if (!currentGrade) {
      toast.error("Evaluation data not found.");
      return;
    }

    // ----------------------------------------------------------
    // SCORE REQUIRED
    // ----------------------------------------------------------

    if (
      currentGrade.score === "" ||
      currentGrade.score === null ||
      currentGrade.score === undefined
    ) {
      toast.error("Please enter a score.");
      return;
    }

    const score = Number(currentGrade.score);

    if (!Number.isFinite(score)) {
      toast.error("Please enter a valid score.");
      return;
    }

    if (score < 0) {
      toast.error("Score cannot be negative.");
      return;
    }

    // ----------------------------------------------------------
    // GET ASSIGNMENT
    // ----------------------------------------------------------

    const assignment = assignments.find((asm) => asm._id === selectedAsm);

    if (!assignment) {
      toast.error("Assignment information not found.");
      return;
    }

    const maxScore = Number(assignment.maxScore ?? 100);

    if (score > maxScore) {
      toast.error(`Score cannot exceed ${maxScore}.`);
      return;
    }

    // ----------------------------------------------------------
    // GRADING ALWAYS MEANS GRADED
    // ----------------------------------------------------------

    try {
      console.log("========== SENDING GRADE ==========");
      console.log("Submission ID:", subId);
      console.log("Score:", score);
      console.log("Feedback:", currentGrade.feedback || "");
      console.log("Status:", "Graded");
      console.log("===================================");

      await api.put(`/submissions/grade/${subId}`, {
        score,
        feedback: currentGrade.feedback?.trim() || "",
        status: "Graded",
      });

      toast.success("Evaluation saved successfully.");

      // Reload so status becomes Graded automatically
      await loadSubmissions(selectedAsm);
    } catch (err) {
      console.error("GRADING FAILED:", err);

      console.error("BACKEND RESPONSE:", err.response?.data);

      toast.error(err.response?.data?.message || "Grading failed");
    }
  };

  // ============================================================
  // LOADING PAGE
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3D63]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#0A1931] p-8 text-white shadow-lg md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div className="rounded-2xl bg-[#1A3D63] p-4">
              <GraduationCap size={32} className="text-[#B3CFE5]" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">Grading Dashboard</h1>

              <p className="mt-1 text-sm text-[#B3CFE5]">
                Review projects from your assigned team members.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3">
            <Users size={20} className="text-[#4A7FA7]" />

            <span className="text-lg font-semibold">
              {submissions.length} Submission
              {submissions.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ======================================================
            ASSIGNMENT SELECTOR
        ====================================================== */}

        <div className="rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm">
          <label className="mb-3 block text-sm font-bold text-[#0A1931]">
            Select Assignment to Grade
          </label>

          <div className="relative">
            <select
              value={selectedAsm}
              onChange={(e) => loadSubmissions(e.target.value)}
              className="w-full appearance-none rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 font-semibold text-[#0A1931] outline-none transition focus:ring-2 focus:ring-[#1A3D63]"
            >
              <option value="">Choose a project</option>

              {assignments.map((assignment) => (
                <option key={assignment._id} value={assignment._id}>
                  {assignment.title}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7FA7]">
              <Search size={20} />
            </div>
          </div>
        </div>

        {/* ======================================================
            SUBMISSIONS
        ====================================================== */}

        <div className="space-y-6">
          {fetchingSubs ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#1A3D63]" />
            </div>
          ) : !selectedAsm ? (
            <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-16 text-center">
              <Inbox size={48} className="mx-auto mb-4 text-[#B3CFE5]" />

              <p className="text-lg font-semibold text-[#0A1931]">
                No Selection
              </p>

              <p className="text-sm text-[#7A7F85]">
                Please select an assignment from the dropdown above to view
                submissions.
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-16 text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-300" />

              <p className="text-lg font-semibold text-[#0A1931]">
                No Submissions
              </p>

              <p className="text-sm text-[#7A7F85]">
                No students in your assigned teams have submitted this
                assignment yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {submissions.map((sub) => {
                const currentGrade = gradeData[sub._id] || {
                  score: sub.score ?? "",
                  feedback: sub.feedback ?? "",
                  status: getSubmissionStatus(sub),
                };

                // AUTOMATIC STATUS
                const status = currentGrade.status || getSubmissionStatus(sub);

                const isPending = status === "Pending";

                const isGraded = status === "Graded";

                return (
                  <div
                    key={sub._id}
                    className="overflow-hidden rounded-3xl border border-[#B3CFE5] bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* ==================================================
                          STUDENT INFORMATION
                      ================================================== */}

                      <div className="border-b border-[#B3CFE5] bg-[#F6FAFD] p-6 lg:w-1/3 lg:border-b-0 lg:border-r">
                        <div className="mb-4 flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A3D63] text-xl font-bold text-white">
                            {sub.student?.firstName?.[0] || "S"}
                          </div>

                          <div>
                            <h4 className="text-lg font-black text-[#0A1931]">
                              {sub.student?.firstName || ""}{" "}
                              {sub.student?.lastName || ""}
                            </h4>

                            <span className="text-[10px] font-bold uppercase text-[#4A7FA7]">
                              Assigned Student
                            </span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {/* GITHUB */}

                          {sub.githubUrl ? (
                            <a
                              href={sub.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
                            >
                              <GitBranch size={18} />
                              Open Repository
                              <ExternalLink size={14} className="ml-auto" />
                            </a>
                          ) : (
                            <div className="flex items-center gap-2 rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm font-bold text-[#7A7F85]">
                              <GitBranch size={18} />
                              No Repository Provided
                            </div>
                          )}

                          {/* LIVE DEMO */}

                          {sub.liveDemoUrl && (
                            <a
                              href={sub.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                            >
                              <ExternalLink size={18} />
                              Open Live Demo
                            </a>
                          )}

                          {/* NOTES */}

                          <div className="rounded-xl border border-[#B3CFE5] bg-white p-3">
                            <p className="mb-1 text-xs font-bold text-[#7A7F85]">
                              Student Notes:
                            </p>

                            <p className="text-xs italic leading-relaxed text-[#0A1931]">
                              {sub.notes || "No notes provided by student."}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ==================================================
                          EVALUATION
                      ================================================== */}

                      <div className="flex-1 p-6 lg:p-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[#1A3D63]">
                            <Award size={20} />

                            <h5 className="font-bold">Mentor Evaluation</h5>
                          </div>

                          {/* AUTOMATIC STATUS */}

                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                              isPending
                                ? "bg-yellow-100 text-yellow-700"
                                : isGraded
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="grid gap-6">
                          {/* SCORE + FEEDBACK */}

                          <div className="flex flex-col gap-4 md:flex-row">
                            {/* SCORE */}

                            <div className="md:w-32">
                              <label className="mb-2 block text-xs font-bold text-[#7A7F85]">
                                Score
                              </label>

                              <input
                                type="number"
                                min="0"
                                max={
                                  assignments.find((a) => a._id === selectedAsm)
                                    ?.maxScore || 100
                                }
                                placeholder="0"
                                className="w-full rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 text-center text-xl font-black text-[#1A3D63] outline-none focus:ring-2 focus:ring-[#1A3D63]"
                                value={currentGrade.score}
                                onChange={(e) =>
                                  handleInputChange(
                                    sub._id,
                                    "score",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* FEEDBACK */}

                            <div className="flex-1">
                              <label className="mb-2 block text-xs font-bold text-[#7A7F85]">
                                Feedback & Comments
                              </label>

                              <div className="relative">
                                <textarea
                                  placeholder="Give constructive feedback..."
                                  className="h-25 w-full resize-none rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#1A3D63]"
                                  value={currentGrade.feedback}
                                  onChange={(e) =>
                                    handleInputChange(
                                      sub._id,
                                      "feedback",
                                      e.target.value,
                                    )
                                  }
                                />

                                <MessageSquare
                                  size={18}
                                  className="absolute right-4 top-4 text-[#B3CFE5]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* ==================================================
                              SMALL ACTION BUTTONS
                          ================================================== */}

                          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                            {/* REQUEST RESUBMISSION */}

                            <button
                              type="button"
                              onClick={() => requestResubmission(sub._id)}
                              className="flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
                            >
                              <RotateCcw size={15} />
                              Request Resubmission
                            </button>

                            {/* SUBMIT / UPDATE GRADE */}

                            <button
                              type="button"
                              onClick={() => submitGrade(sub._id)}
                              className="flex items-center gap-2 rounded-xl bg-[#1A3D63] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#0A1931]"
                            >
                              <CheckCircle size={15} />

                              {isGraded ? "Update Grade" : "Submit Grade"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorAssignment;
