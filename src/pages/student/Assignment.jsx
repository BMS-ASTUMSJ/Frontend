import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);

  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ============================================================
  // LOAD ASSIGNMENTS + SUBMISSIONS
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [assignmentsRes, submissionsRes] = await Promise.all([
        api.get("/assignments"),
        api.get("/submissions/my"),
      ]);

      setAssignments(assignmentsRes.data.assignments || []);
      setMySubmissions(submissionsRes.data.submissions || []);
    } catch (err) {
      console.error("Failed to load assignment data:", err);

      toast.error(err.response?.data?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // GET SUBMISSION FOR ASSIGNMENT
  // ============================================================

  const getSubmission = (assignmentId) => {
    return mySubmissions.find((submission) => {
      const submissionAssignment = submission.assignment;

      if (submissionAssignment && typeof submissionAssignment === "object") {
        return submissionAssignment._id === assignmentId;
      }

      return submissionAssignment === assignmentId;
    });
  };

  // ============================================================
  // CHECK DEADLINE
  // ============================================================

  const isExpired = (deadline) => {
    if (!deadline) return false;

    return new Date(deadline) < new Date();
  };

  // ============================================================
  // OPEN SUBMISSION MODAL
  // ============================================================

  const openSubmissionModal = (assignment) => {
    const submission = getSubmission(assignment._id);

    setSelectedId(assignment._id);

    if (submission?.status === "Resubmission Required") {
      setGithubUrl(submission.githubUrl || "");
      setLiveDemoUrl(submission.liveDemoUrl || "");
      setNotes(submission.notes || "");

      setIsUpdating(false);

      return;
    }

    if (submission?.status === "Pending") {
      setGithubUrl(submission.githubUrl || "");
      setLiveDemoUrl(submission.liveDemoUrl || "");
      setNotes(submission.notes || "");

      setIsUpdating(true);

      return;
    }

    setGithubUrl("");
    setLiveDemoUrl("");
    setNotes("");
    setIsUpdating(false);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (submitting) return;

    setSelectedId(null);

    setGithubUrl("");
    setLiveDemoUrl("");
    setNotes("");

    setIsUpdating(false);
  };

  // ============================================================
  // SUBMIT / UPDATE / RESUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      toast.error("Please select an assignment.");
      return;
    }

    if (!githubUrl.trim()) {
      toast.error("GitHub URL is required.");
      return;
    }

    const assignment = assignments.find((asm) => asm._id === selectedId);

    if (!assignment) {
      toast.error("Assignment could not be found.");
      return;
    }

    const existingSubmission = getSubmission(selectedId);

    const isResubmission =
      existingSubmission?.status === "Resubmission Required";

    const isPendingUpdate = existingSubmission?.status === "Pending";

    // Normal submissions cannot be made after deadline.
    // Resubmission is still allowed.
    if (isExpired(assignment.deadline) && !isResubmission) {
      toast.error("The deadline for this assignment has passed.");
      return;
    }

    try {
      setSubmitting(true);

      // ========================================================
      // UPDATE PENDING SUBMISSION
      // ========================================================

      if (isPendingUpdate) {
        const res = await api.put(`/submissions/${existingSubmission._id}`, {
          githubUrl: githubUrl.trim(),
          liveDemoUrl: liveDemoUrl.trim(),
          notes: notes.trim(),
        });

        toast.success(res.data.message || "Submission updated successfully!");

        closeModal();

        await loadData();

        return;
      }

      // ========================================================
      // NEW SUBMISSION / RESUBMISSION
      // ========================================================

      const payload = {
        assignmentId: selectedId,
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        notes: notes.trim(),
      };

      const res = await api.post("/submissions", payload);

      toast.success(
        res.data.message ||
          (isResubmission
            ? "Assignment resubmitted successfully!"
            : "Assignment submitted successfully!"),
      );

      closeModal();

      await loadData();
    } catch (err) {
      console.error("Submission error:", err);

      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (status) => {
    if (!status) {
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
          Not Submitted
        </span>
      );
    }

    if (status === "Graded") {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Graded
        </span>
      );
    }

    if (status === "Resubmission Required") {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
          Resubmit
        </span>
      );
    }

    if (status === "Pending") {
      return (
        <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          Pending
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {status}
      </span>
    );
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="font-semibold text-[#1A3D63]">
          Loading assignments...
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0A1931]">
            Course Assignments
          </h2>

          <p className="mt-2 text-sm text-[#7A7F85]">
            View your assignments, submit your work, update pending submissions,
            and check mentor feedback.
          </p>
        </div>

        {/* ======================================================
            NO ASSIGNMENTS
        ====================================================== */}

        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-[#B3CFE5] bg-white p-10 text-center shadow-sm">
            <h3 className="text-lg font-bold text-[#0A1931]">
              No assignments available
            </h3>

            <p className="mt-2 text-sm text-[#7A7F85]">
              There are currently no assignments available for you.
            </p>
          </div>
        ) : (
          /* ====================================================
             TABLE
          ==================================================== */

          <div className="overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-sm">
            {/* MOBILE SCROLL */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse">
                {/* =================================================
                    TABLE HEADER
                ================================================= */}

                <thead>
                  <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD] text-left">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Assignment
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Instructor
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Deadline
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Max Score
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Grade
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody className="divide-y divide-[#E5EEF5]">
                  {assignments.map((asm) => {
                    const submission = getSubmission(asm._id);

                    const status = submission?.status || null;

                    const canResubmit = status === "Resubmission Required";

                    const isGraded = status === "Graded";

                    const isPending = status === "Pending";

                    const expired = isExpired(asm.deadline);

                    return (
                      <tr
                        key={asm._id}
                        className="transition hover:bg-[#F8FBFD]"
                      >
                        {/* ==========================================
                            ASSIGNMENT
                        ========================================== */}

                        <td className="px-5 py-5">
                          <div className="max-w-xs">
                            <p className="font-semibold text-[#0A1931]">
                              {asm.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs text-[#7A7F85]">
                              {asm.description || "No description provided."}
                            </p>

                            {submission?.feedback && (
                              <button
                                type="button"
                                onClick={() => alert(submission.feedback)}
                                className="mt-2 text-xs font-semibold text-[#1A3D63] hover:underline"
                              >
                                View Feedback
                              </button>
                            )}
                          </div>
                        </td>

                        {/* ==========================================
                            INSTRUCTOR
                        ========================================== */}

                        <td className="px-5 py-5 text-sm text-[#4A7FA7]">
                          {asm.instructorName || asm.instructor || "—"}
                        </td>

                        {/* ==========================================
                            DEADLINE
                        ========================================== */}

                        <td className="px-5 py-5">
                          {asm.deadline ? (
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  expired ? "text-red-600" : "text-[#1A3D63]"
                                }`}
                              >
                                {new Date(asm.deadline).toLocaleDateString()}
                              </p>

                              <p className="mt-1 text-xs text-[#7A7F85]">
                                {new Date(asm.deadline).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>

                              {expired && (
                                <span className="mt-1 inline-block text-xs font-semibold text-red-600">
                                  Expired
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-[#7A7F85]">
                              No deadline
                            </span>
                          )}
                        </td>

                        {/* ==========================================
                            MAX SCORE
                        ========================================== */}

                        <td className="px-5 py-5">
                          <span className="text-sm font-semibold text-[#0A1931]">
                            {asm.maxScore ?? "—"}
                          </span>
                        </td>

                        {/* ==========================================
                            STATUS
                        ========================================== */}

                        <td className="px-5 py-5">{getStatusBadge(status)}</td>

                        {/* ==========================================
                            GRADE
                        ========================================== */}

                        <td className="px-5 py-5">
                          {isGraded ? (
                            <div>
                              <span className="text-lg font-bold text-green-600">
                                {submission.score}
                              </span>

                              <span className="text-sm text-[#7A7F85]">
                                {" "}
                                / {asm.maxScore}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-[#7A7F85]">—</span>
                          )}
                        </td>

                        {/* ==========================================
                            ACTION
                        ========================================== */}

                        <td className="px-5 py-5 text-right">
                          {/* NEVER SUBMITTED */}

                          {!submission && (
                            <button
                              type="button"
                              onClick={() => openSubmissionModal(asm)}
                              disabled={expired}
                              className="rounded-lg bg-[#1A3D63] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              {expired ? "Deadline Passed" : "Submit"}
                            </button>
                          )}

                          {/* PENDING */}

                          {isPending && (
                            <button
                              type="button"
                              onClick={() => openSubmissionModal(asm)}
                              className="rounded-lg bg-[#1A3D63] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0A1931]"
                            >
                              Update
                            </button>
                          )}

                          {/* GRADED */}

                          {isGraded && (
                            <button
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-lg bg-green-100 px-4 py-2 text-xs font-semibold text-green-700"
                            >
                              Graded
                            </button>
                          )}

                          {/* RESUBMISSION */}

                          {canResubmit && (
                            <button
                              type="button"
                              onClick={() => openSubmissionModal(asm)}
                              className="rounded-lg bg-orange-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-orange-700"
                            >
                              Resubmit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ======================================================
                TABLE FOOTER
            ====================================================== */}

            <div className="border-t border-[#B3CFE5] bg-[#F6FAFD] px-5 py-3">
              <p className="text-xs text-[#7A7F85]">
                Showing {assignments.length} assignment
                {assignments.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================================
          SUBMISSION MODAL
      ========================================================== */}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            {/* ====================================================
                TITLE
            ==================================================== */}

            <h3 className="mb-2 text-xl font-bold text-[#0A1931]">
              {isUpdating
                ? "Update Submission"
                : getSubmission(selectedId)?.status === "Resubmission Required"
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
            </h3>

            <p className="mb-5 text-sm text-[#7A7F85]">
              {isUpdating
                ? "Update your project links or notes. Your submission will remain pending."
                : getSubmission(selectedId)?.status === "Resubmission Required"
                  ? "Update your project and submit it again for mentor review."
                  : "Provide the links to your project."}
            </p>

            {/* ====================================================
                GITHUB
            ==================================================== */}

            <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
              GitHub Repository *
            </label>

            <input
              type="url"
              placeholder="https://github.com/user/repository"
              className="mb-4 w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              required
              disabled={submitting}
            />

            {/* ====================================================
                LIVE DEMO
            ==================================================== */}

            <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
              Live Demo URL
            </label>

            <input
              type="url"
              placeholder="https://your-project.vercel.app"
              className="mb-4 w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
              value={liveDemoUrl}
              onChange={(e) => setLiveDemoUrl(e.target.value)}
              disabled={submitting}
            />

            {/* ====================================================
                NOTES
            ==================================================== */}

            <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
              Notes
            </label>

            <textarea
              placeholder="Add any notes for your mentor..."
              className="mb-5 h-24 w-full resize-none rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />

            {/* ====================================================
                BUTTONS
            ==================================================== */}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#1A3D63] py-2 text-sm font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : isUpdating
                    ? "Update"
                    : getSubmission(selectedId)?.status ===
                        "Resubmission Required"
                      ? "Resubmit"
                      : "Submit"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StudentAssignment;
