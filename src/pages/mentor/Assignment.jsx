
import React, { useState, useEffect } from "react";
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

  
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);

        const res = await api.get("/assignments");

        setAssignments(res.data.assignments || []);
      } catch (err) {
        console.error("Failed to load assignments:", err);

        toast.error(
          err.response?.data?.message ||
            "Failed to load assignments"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

 
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
      const res = await api.get(
        `/submissions/assignment/${assignmentId}`
      );

      const fetchedSubmissions =
        res.data.submissions || [];

      setSubmissions(fetchedSubmissions);

      const initialGrades = {};

      fetchedSubmissions.forEach((sub) => {
        

        const gradingStatus =
          sub.status === "Resubmission Required"
            ? "Resubmission Required"
            : "Graded";

        initialGrades[sub._id] = {
          score: sub.score ?? "",
          feedback: sub.feedback ?? "",
          status: gradingStatus,
        };
      });

      setGradeData(initialGrades);
    } catch (err) {
      console.error(
        "Error loading submissions:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Error loading submissions"
      );

      setSubmissions([]);
      setGradeData({});
    } finally {
      setFetchingSubs(false);
    }
  };


  const handleInputChange = (
    subId,
    field,
    value
  ) => {
    setGradeData((prev) => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        [field]: value,
      },
    }));
  };


  const submitGrade = async (subId) => {
    const currentGrade = gradeData[subId];

    if (!currentGrade) {
      toast.error("Evaluation data not found.");
      return;
    }

   
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

  
    const assignment = assignments.find(
      (asm) => asm._id === selectedAsm
    );

    if (!assignment) {
      toast.error("Assignment information not found.");
      return;
    }

    const maxScore = Number(
      assignment.maxScore ?? 100
    );

    if (score > maxScore) {
      toast.error(
        `Score cannot exceed ${maxScore}.`
      );
      return;
    }

   

    let status = currentGrade.status;

    if (
      status !== "Graded" &&
      status !== "Resubmission Required"
    ) {
      status = "Graded";
    }

    try {
      console.log("========== SENDING GRADE ==========");
      console.log("Submission ID:", subId);
      console.log("Score:", score);
      console.log(
        "Feedback:",
        currentGrade.feedback || ""
      );
      console.log("Status:", status);
      console.log("===================================");

      await api.put(
        `/submissions/grade/${subId}`,
        {
          score,
          feedback:
            currentGrade.feedback?.trim() || "",
          status,
        }
      );

      if (
        status === "Resubmission Required"
      ) {
        toast.success(
          "Resubmission requested successfully."
        );
      } else {
        toast.success(
          "Evaluation saved successfully."
        );
      }

      await loadSubmissions(selectedAsm);
    } catch (err) {
      console.error(
        "Grading failed:",
        err
      );

      console.error(
        "Backend response:",
        err.response?.data
      );

      toast.error(
        err.response?.data?.message ||
          "Grading failed"
      );
    }
  };

  
 
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

        
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#0A1931] p-8 text-white shadow-lg md:flex-row md:items-center">

          <div className="flex items-center gap-5">

            <div className="rounded-2xl bg-[#1A3D63] p-4">
              <GraduationCap
                size={32}
                className="text-[#B3CFE5]"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Grading Dashboard
              </h1>

              <p className="mt-1 text-sm text-[#B3CFE5]">
                Review projects from your assigned
                team members.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3">

            <Users
              size={20}
              className="text-[#4A7FA7]"
            />

            <span className="text-lg font-semibold">
              {submissions.length} Submission
              {submissions.length !== 1
                ? "s"
                : ""}
            </span>

          </div>
        </div>

        
        <div className="rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm">

          <label className="mb-3 block text-sm font-bold text-[#0A1931]">
            Select Assignment to Grade
          </label>

          <div className="relative">

            <select
              value={selectedAsm}
              onChange={(e) =>
                loadSubmissions(e.target.value)
              }
              className="w-full appearance-none rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 font-semibold text-[#0A1931] outline-none transition focus:ring-2 focus:ring-[#1A3D63]"
            >
              <option value="">
                -- Choose a project --
              </option>

              {assignments.map((assignment) => (
                <option
                  key={assignment._id}
                  value={assignment._id}
                >
                  {assignment.title}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#4A7FA7]">
              <Search size={20} />
            </div>

          </div>
        </div>

       
        <div className="space-y-6">

          {fetchingSubs ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[#1A3D63]" />
            </div>
          ) : !selectedAsm ? (

            <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-16 text-center">

              <Inbox
                size={48}
                className="mx-auto mb-4 text-[#B3CFE5]"
              />

              <p className="text-lg font-semibold text-[#0A1931]">
                No Selection
              </p>

              <p className="text-sm text-[#7A7F85]">
                Please select an assignment from
                the dropdown above to view submissions.
              </p>

            </div>

          ) : submissions.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-16 text-center">

              <CheckCircle
                size={48}
                className="mx-auto mb-4 text-green-300"
              />

              <p className="text-lg font-semibold text-[#0A1931]">
                No Submissions
              </p>

              <p className="text-sm text-[#7A7F85]">
                No students in your assigned teams
                have submitted this assignment yet.
              </p>

            </div>

          ) : (

            <div className="grid gap-6">

              {submissions.map((sub) => {

                const currentGrade =
                  gradeData[sub._id] || {
                    score: sub.score ?? "",
                    feedback:
                      sub.feedback ?? "",
                    status:
                      sub.status ===
                      "Resubmission Required"
                        ? "Resubmission Required"
                        : "Graded",
                  };

               
                const status =
                  currentGrade.status ===
                    "Resubmission Required"
                    ? "Resubmission Required"
                    : "Graded";

                const isGraded =
                  status === "Graded";

                const needsResubmission =
                  status ===
                  "Resubmission Required";

                return (
                  <div
                    key={sub._id}
                    className="overflow-hidden rounded-3xl border border-[#B3CFE5] bg-white shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex flex-col lg:flex-row">

                    
                      <div className="border-b border-[#B3CFE5] bg-[#F6FAFD] p-6 lg:w-1/3 lg:border-b-0 lg:border-r">

                        <div className="mb-4 flex items-center gap-4">

                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1A3D63] text-xl font-bold text-white">
                            {sub.student?.firstName?.[0] ||
                              "S"}
                          </div>

                          <div>
                            <h4 className="text-lg font-black text-[#0A1931]">
                              {sub.student?.firstName ||
                                ""}{" "}
                              {sub.student?.lastName ||
                                ""}
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

                              <ExternalLink
                                size={14}
                                className="ml-auto"
                              />
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
                              {sub.notes ||
                                "No notes provided by student."}
                            </p>

                          </div>

                        </div>
                      </div>

                      <div className="flex-1 p-6 lg:p-8">

                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

                          <div className="flex items-center gap-2 text-[#1A3D63]">

                            <Award size={20} />

                            <h5 className="font-bold">
                              Mentor Evaluation
                            </h5>

                          </div>

                       
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${
                              isGraded
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
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
                                  assignments.find(
                                    (a) =>
                                      a._id ===
                                      selectedAsm
                                  )?.maxScore || 100
                                }
                                placeholder="0"
                                className="w-full rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 text-center text-xl font-black text-[#1A3D63] outline-none focus:ring-2 focus:ring-[#1A3D63]"
                                value={
                                  currentGrade.score
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    sub._id,
                                    "score",
                                    e.target.value
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
                                  className="h-[100px] w-full resize-none rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#1A3D63]"
                                  value={
                                    currentGrade.feedback
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      sub._id,
                                      "feedback",
                                      e.target.value
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

                          {/* STATUS */}
                          <div>

                            <label className="mb-2 block text-xs font-bold text-[#7A7F85]">
                              Evaluation Result
                            </label>

                            <select
                              value={status}
                              onChange={(e) =>
                                handleInputChange(
                                  sub._id,
                                  "status",
                                  e.target.value
                                )
                              }
                              className="w-full rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 font-semibold text-[#0A1931] outline-none focus:ring-2 focus:ring-[#1A3D63]"
                            >
                              <option value="Graded">
                                ✓ Graded
                              </option>

                              <option value="Resubmission Required">
                                ↻ Resubmission Required
                              </option>
                            </select>

                          </div>

                          {/* BUTTON */}
                          <button
                            type="button"
                            onClick={() =>
                              submitGrade(sub._id)
                            }
                            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-lg transition ${
                              needsResubmission
                                ? "bg-orange-600 hover:bg-orange-700"
                                : "bg-[#1A3D63] hover:bg-[#0A1931]"
                            }`}
                          >

                            {needsResubmission ? (
                              <>
                                <RotateCcw
                                  size={18}
                                />

                                Request Resubmission
                              </>
                            ) : (
                              <>
                                <CheckCircle
                                  size={18}
                                />

                                {isGraded
                                  ? "Update Evaluation"
                                  : "Submit Grade"}
                              </>
                            )}

                          </button>

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
