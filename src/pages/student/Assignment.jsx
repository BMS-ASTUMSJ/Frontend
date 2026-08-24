import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);

  // Admin assignment submissions
  const [mySubmissions, setMySubmissions] = useState([]);

  // Mentor assignment submissions
  const [myMentorSubmissions, setMyMentorSubmissions] = useState([]);

  const [githubUrl, setGithubUrl] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [notes, setNotes] = useState("");

  // Submission modal
  const [selectedId, setSelectedId] = useState(null);

  // Feedback modal
  const [feedbackSubmission, setFeedbackSubmission] = useState(null);
  const [feedbackAssignment, setFeedbackAssignment] = useState(null);

  // Assignment details modal
  const [detailsAssignment, setDetailsAssignment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Only for normal/admin assignment updates
  const [isUpdating, setIsUpdating] = useState(false);

  // ============================================================
  // LOAD DATA
  // ============================================================

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        assignmentsRes,
        mentorAssignmentsRes,
        submissionsRes,
        mentorSubmissionsRes,
      ] = await Promise.all([
        // Admin-created assignments
        api.get("/assignments"),

        // Mentor-created assignments for this student
        api.get("/assignments/student"),

        // Student's normal assignment submissions
        api.get("/submissions/my"),

        // Student's mentor assignment submissions
        api.get("/mentor-assignment-submissions/my"),
      ]);

      console.log("ADMIN ASSIGNMENTS RESPONSE:", assignmentsRes.data);
      console.log("MENTOR ASSIGNMENTS RESPONSE:", mentorAssignmentsRes.data);
      console.log("NORMAL SUBMISSIONS RESPONSE:", submissionsRes.data);
      console.log("MENTOR SUBMISSIONS RESPONSE:", mentorSubmissionsRes.data);

      // ============================================================
      // ADMIN ASSIGNMENTS
      // ============================================================

      const normalAssignments =
        assignmentsRes.data?.assignments ||
        assignmentsRes.data?.data ||
        (Array.isArray(assignmentsRes.data) ? assignmentsRes.data : []);

      // ============================================================
      // MENTOR ASSIGNMENTS
      // ============================================================

      const mentorAssignments =
        mentorAssignmentsRes.data?.assignments ||
        mentorAssignmentsRes.data?.data ||
        mentorAssignmentsRes.data?.projects ||
        (Array.isArray(mentorAssignmentsRes.data)
          ? mentorAssignmentsRes.data
          : []);

      // ============================================================
      // FORMAT ADMIN ASSIGNMENTS
      // ============================================================

      const formattedNormalAssignments = normalAssignments.map(
        (assignment) => ({
          ...assignment,
          isMentorAssignment: false,
        }),
      );

      // ============================================================
      // FORMAT MENTOR ASSIGNMENTS
      // ============================================================

      const formattedMentorAssignments = mentorAssignments.map(
        (assignment) => ({
          ...assignment,
          isMentorAssignment: true,

          instructorName:
            assignment.instructorName ||
            assignment.mentorName ||
            assignment.createdByName ||
            (assignment.mentor
              ? `${assignment.mentor.firstName || ""} ${
                  assignment.mentor.lastName || ""
                }`.trim()
              : "Your Mentor"),

          maxScore: assignment.maxScore ?? null,
        }),
      );

      // ============================================================
      // COMBINE ADMIN + MENTOR ASSIGNMENTS
      // ============================================================

      setAssignments([
        ...formattedNormalAssignments,
        ...formattedMentorAssignments,
      ]);

      // ============================================================
      // NORMAL SUBMISSIONS
      // ============================================================

      const normalSubmissions =
        submissionsRes.data?.submissions ||
        submissionsRes.data?.data ||
        (Array.isArray(submissionsRes.data) ? submissionsRes.data : []);

      setMySubmissions(normalSubmissions);

      // ============================================================
      // MENTOR SUBMISSIONS
      // ============================================================

      const mentorSubmissions =
        mentorSubmissionsRes.data?.submissions ||
        mentorSubmissionsRes.data?.data ||
        (Array.isArray(mentorSubmissionsRes.data)
          ? mentorSubmissionsRes.data
          : []);

      setMyMentorSubmissions(mentorSubmissions);
    } catch (err) {
      console.error("FAILED TO LOAD ASSIGNMENT DATA:", err);

      toast.error(err.response?.data?.message || "Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ============================================================
  // GET NORMAL SUBMISSION
  // ============================================================

  const getNormalSubmission = (assignmentId) => {
    return mySubmissions.find((submission) => {
      const submissionAssignment = submission.assignment;

      if (submissionAssignment && typeof submissionAssignment === "object") {
        return submissionAssignment._id === assignmentId;
      }

      return submissionAssignment === assignmentId;
    });
  };

  // ============================================================
  // GET MENTOR SUBMISSION
  // ============================================================

  const getMentorSubmission = (assignmentId) => {
    return myMentorSubmissions.find((submission) => {
      const submissionAssignment = submission.assignment;

      if (submissionAssignment && typeof submissionAssignment === "object") {
        return submissionAssignment._id === assignmentId;
      }

      return submissionAssignment === assignmentId;
    });
  };

  // ============================================================
  // GET CORRECT SUBMISSION
  // ============================================================

  const getSubmission = (assignment) => {
    if (!assignment) return null;

    if (assignment.isMentorAssignment) {
      return getMentorSubmission(assignment._id);
    }

    return getNormalSubmission(assignment._id);
  };

  // ============================================================
  // GET ASSIGNMENT STATUS
  // ============================================================

  const getAssignmentStatus = (assignment) => {
    const submission = getSubmission(assignment);

    if (!submission) {
      return null;
    }

    // Mentor assignment
    if (assignment.isMentorAssignment) {
      if (submission.feedback?.trim()) {
        return "Reviewed";
      }

      return "Pending";
    }

    // Normal/admin assignment
    return submission.status || "Pending";
  };

  // ============================================================
  // DEADLINE CHECK
  // ============================================================

  const isExpired = (deadline) => {
    if (!deadline) return false;

    return new Date(deadline) < new Date();
  };

  // ============================================================
  // OPEN ASSIGNMENT DETAILS
  // ============================================================

  const openDetailsModal = (assignment) => {
    setDetailsAssignment(assignment);
  };

  // ============================================================
  // CLOSE ASSIGNMENT DETAILS
  // ============================================================

  const closeDetailsModal = () => {
    setDetailsAssignment(null);
  };

  // ============================================================
  // GET FILE URL
  // ============================================================

  const getFileUrl = (file) => {
    if (!file) return null;

    const rawUrl =
      typeof file === "string"
        ? file
        : file.url || file.fileUrl || file.path || file.location;

    if (!rawUrl) return null;

    if (rawUrl.startsWith("http")) {
      return rawUrl;
    }

    return `http://localhost:5000/${rawUrl.replace(/^\/+/, "")}`;
  };

  // ============================================================
  // GET FILE NAME
  // ============================================================

  const getFileName = (file, index) => {
    if (typeof file === "string") {
      return `Attachment ${index + 1}`;
    }

    return (
      file?.fileName ||
      file?.originalName ||
      file?.filename ||
      `Attachment ${index + 1}`
    );
  };

  // ============================================================
  // OPEN SUBMISSION MODAL
  // ============================================================

  const openSubmissionModal = (assignment) => {
    const submission = getSubmission(assignment);

    setSelectedId(assignment._id);

    // Mentor assignment
    if (assignment.isMentorAssignment) {
      if (submission) {
        setGithubUrl(submission.githubUrl || "");
        setLiveDemoUrl(submission.liveDemoUrl || "");
        setNotes(submission.notes || "");
      } else {
        setGithubUrl("");
        setLiveDemoUrl("");
        setNotes("");
      }

      setIsUpdating(false);
      return;
    }

    // Normal/admin assignment

    if (submission?.status === "Pending") {
      setGithubUrl(submission.githubUrl || "");
      setLiveDemoUrl(submission.liveDemoUrl || "");
      setNotes(submission.notes || "");
      setIsUpdating(true);
      return;
    }

    if (submission?.status === "Resubmission Required") {
      setGithubUrl(submission.githubUrl || "");
      setLiveDemoUrl(submission.liveDemoUrl || "");
      setNotes(submission.notes || "");
      setIsUpdating(false);
      return;
    }

    setGithubUrl("");
    setLiveDemoUrl("");
    setNotes("");
    setIsUpdating(false);
  };

  // ============================================================
  // CLOSE SUBMISSION MODAL
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
  // OPEN FEEDBACK MODAL
  // ============================================================

  const openFeedbackModal = (assignment, submission) => {
    setFeedbackAssignment(assignment);
    setFeedbackSubmission(submission);
  };

  // ============================================================
  // CLOSE FEEDBACK MODAL
  // ============================================================

  const closeFeedbackModal = () => {
    setFeedbackAssignment(null);
    setFeedbackSubmission(null);
  };

  // ============================================================
  // SUBMIT ASSIGNMENT
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

    const submission = getSubmission(assignment);

    // ==========================================================
    // MENTOR ASSIGNMENT
    // ==========================================================

    if (assignment.isMentorAssignment) {
      if (submission) {
        toast.error("You have already submitted this mentor assignment.");
        return;
      }

      if (isExpired(assignment.deadline)) {
        toast.error("The deadline for this assignment has passed.");
        return;
      }

      try {
        setSubmitting(true);

        const payload = {
          assignmentId: assignment._id,
          githubUrl: githubUrl.trim(),
          liveDemoUrl: liveDemoUrl.trim(),
          notes: notes.trim(),
        };

        const res = await api.post("/mentor-assignment-submissions", payload);

        toast.success(
          res.data.message || "Mentor assignment submitted successfully!",
        );

        closeModal();
        await loadData();
      } catch (err) {
        console.error("MENTOR ASSIGNMENT SUBMISSION ERROR:", err);

        toast.error(
          err.response?.data?.message || "Mentor assignment submission failed.",
        );
      } finally {
        setSubmitting(false);
      }

      return;
    }

    // ==========================================================
    // NORMAL / ADMIN ASSIGNMENT
    // ==========================================================

    const isResubmission = submission?.status === "Resubmission Required";

    const isPendingUpdate = submission?.status === "Pending";

    if (isExpired(assignment.deadline) && !isResubmission) {
      toast.error("The deadline for this assignment has passed.");
      return;
    }

    try {
      setSubmitting(true);

      // Update pending submission
      if (isPendingUpdate) {
        const res = await api.put(`/submissions/${submission._id}`, {
          githubUrl: githubUrl.trim(),
          liveDemoUrl: liveDemoUrl.trim(),
          notes: notes.trim(),
        });

        toast.success(res.data.message || "Submission updated successfully!");

        closeModal();
        await loadData();
        return;
      }

      // New submission or resubmission
      const payload = {
        assignmentId: assignment._id,
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
      console.error("NORMAL ASSIGNMENT SUBMISSION ERROR:", err);

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

    if (status === "Reviewed") {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
          Reviewed
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
        {/* HEADER */}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0A1931]">
            Course Assignments
          </h2>

          <p className="mt-2 text-sm text-[#7A7F85]">
            View your assignments, submit your work, and check your grades and
            feedback.
          </p>
        </div>

        {/* NO ASSIGNMENTS */}

        {assignments.length === 0 ? (
          <div className="border border-[#B3CFE5] bg-white p-10 text-center">
            <h3 className="text-lg font-bold text-[#0A1931]">
              No assignments available
            </h3>

            <p className="mt-2 text-sm text-[#7A7F85]">
              There are currently no assignments available for you.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-[#B3CFE5] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-275 border-collapse">
                <thead>
                  <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD] text-left">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Assignment
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#0A1931]">
                      Type
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

                <tbody className="divide-y divide-[#E5EEF5]">
                  {assignments.map((asm) => {
                    const submission = getSubmission(asm);

                    const status = getAssignmentStatus(asm);

                    const isMentorAssignment = asm.isMentorAssignment;

                    const canResubmit =
                      !isMentorAssignment && status === "Resubmission Required";

                    const isGraded = !isMentorAssignment && status === "Graded";

                    const isPending = status === "Pending";

                    const isReviewed =
                      isMentorAssignment && status === "Reviewed";

                    const expired = isExpired(asm.deadline);

                    const hasFeedback = Boolean(submission?.feedback?.trim());

                    return (
                      <tr
                        key={`${
                          isMentorAssignment ? "mentor" : "admin"
                        }-${asm._id}`}
                        className="transition hover:bg-[#F8FBFD]"
                      >
                        {/* ASSIGNMENT */}

                        <td className="px-5 py-5">
                          <div className="max-w-xs">
                            <p className="font-semibold text-[#0A1931]">
                              {asm.title}
                            </p>

                            {/* Student clicks this instead of showing
                                the full long description in the table */}
                            <button
                              type="button"
                              onClick={() => openDetailsModal(asm)}
                              className="mt-2 text-xs font-semibold text-[#1A3D63] hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                        </td>

                        {/* TYPE */}

                        <td className="px-5 py-5">
                          {isMentorAssignment ? (
                            <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                              Mentor
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Admin
                            </span>
                          )}
                        </td>

                        {/* INSTRUCTOR */}

                        <td className="px-5 py-5 text-sm text-[#4A7FA7]">
                          {asm.instructorName || asm.instructor || "—"}
                        </td>

                        {/* DEADLINE */}

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

                        {/* MAX SCORE */}

                        <td className="px-5 py-5">
                          {isMentorAssignment ? (
                            <span className="text-sm text-[#7A7F85]">—</span>
                          ) : (
                            <span className="text-sm font-semibold text-[#0A1931]">
                              {asm.maxScore ?? "—"}
                            </span>
                          )}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">{getStatusBadge(status)}</td>

                        {/* GRADE */}

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

                        {/* ACTION */}

                        <td className="px-5 py-5 text-right">
                          {/* MENTOR ASSIGNMENT */}

                          {isMentorAssignment && !submission && (
                            <button
                              type="button"
                              onClick={() => openSubmissionModal(asm)}
                              disabled={expired}
                              className="rounded-lg bg-[#1A3D63] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              {expired ? "Deadline Passed" : "Submit"}
                            </button>
                          )}

                          {isMentorAssignment && submission && !isReviewed && (
                            <button
                              type="button"
                              disabled
                              className="cursor-not-allowed rounded-lg bg-orange-100 px-4 py-2 text-xs font-semibold text-orange-700"
                            >
                              Submitted
                            </button>
                          )}

                          {isMentorAssignment && isReviewed && (
                            <button
                              type="button"
                              onClick={() => openFeedbackModal(asm, submission)}
                              className="rounded-lg bg-green-100 px-4 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-200"
                            >
                              View Review
                            </button>
                          )}

                          {/* NORMAL / ADMIN ASSIGNMENT */}

                          {!isMentorAssignment && !submission && (
                            <button
                              type="button"
                              onClick={() => openSubmissionModal(asm)}
                              disabled={expired}
                              className="rounded-lg bg-[#1A3D63] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-300"
                            >
                              {expired ? "Deadline Passed" : "Submit"}
                            </button>
                          )}

                          {!isMentorAssignment && isPending && (
                            <button
                              type="button"
                              onClick={() => openSubmissionModal(asm)}
                              className="rounded-lg bg-[#1A3D63] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0A1931]"
                            >
                              Update
                            </button>
                          )}

                          {!isMentorAssignment && isGraded && (
                            <button
                              type="button"
                              onClick={() => {
                                if (hasFeedback) {
                                  openFeedbackModal(asm, submission);
                                }
                              }}
                              className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                                hasFeedback
                                  ? "bg-green-100 text-green-700 transition hover:bg-green-200"
                                  : "cursor-not-allowed bg-green-100 text-green-700"
                              }`}
                              disabled={!hasFeedback}
                            >
                              {hasFeedback ? "View Feedback" : "Graded"}
                            </button>
                          )}

                          {!isMentorAssignment && canResubmit && (
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
          ASSIGNMENT DETAILS MODAL
      ========================================================== */}

      {detailsAssignment && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#0A1931]">
                  {detailsAssignment.title}
                </h3>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  {detailsAssignment.isMentorAssignment
                    ? "Mentor Assignment Details"
                    : "Assignment Details"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeDetailsModal}
                className="text-lg font-bold text-[#7A7F85] hover:text-[#0A1931]"
              >
                ×
              </button>
            </div>

            {/* DESCRIPTION */}

            <div className="mb-6 border border-[#B3CFE5] bg-[#F6FAFD] p-4">
              <p className="mb-2 text-sm font-semibold text-[#0A1931]">
                Description
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6 text-[#4B5563]">
                {detailsAssignment.description ||
                  "No description was provided."}
              </p>
            </div>

            {/* ASSIGNMENT LINK */}

            {detailsAssignment.link && (
              <div className="mb-6 border border-[#B3CFE5] bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-[#0A1931]">
                  Assignment Link
                </p>

                <a
                  href={detailsAssignment.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block break-all text-sm font-semibold text-[#1A3D63] hover:underline"
                >
                  Open Link
                </a>
              </div>
            )}

            {/* ATTACHED FILES */}

            {Array.isArray(detailsAssignment.files) &&
              detailsAssignment.files.length > 0 && (
                <div className="mb-6 border border-[#B3CFE5] bg-white p-4">
                  <p className="mb-3 text-sm font-semibold text-[#0A1931]">
                    Attached Files
                  </p>

                  <div className="flex flex-col gap-2">
                    {detailsAssignment.files.map((file, index) => {
                      const fileUrl = getFileUrl(file);
                      const fileName = getFileName(file, index);

                      if (!fileUrl) return null;

                      return (
                        <a
                          key={file?._id || `${fileName}-${index}`}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm font-semibold text-[#1A3D63] hover:underline"
                        >
                          📎 {fileName}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* NO EXTRA MATERIAL */}

            {!detailsAssignment.link &&
              (!Array.isArray(detailsAssignment.files) ||
                detailsAssignment.files.length === 0) && (
                <div className="mb-6 border border-[#B3CFE5] bg-[#F6FAFD] p-4">
                  <p className="text-sm text-[#7A7F85]">
                    No links or files were attached to this assignment.
                  </p>
                </div>
              )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeDetailsModal}
                className="rounded-lg bg-[#1A3D63] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0A1931]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================
          SUBMISSION MODAL
      ========================================================== */}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white p-6 shadow-2xl"
          >
            {(() => {
              const selectedAssignment = assignments.find(
                (asm) => asm._id === selectedId,
              );

              const selectedSubmission = selectedAssignment
                ? getSubmission(selectedAssignment)
                : null;

              const isMentorAssignment = selectedAssignment?.isMentorAssignment;

              return (
                <>
                  <h3 className="mb-2 text-xl font-bold text-[#0A1931]">
                    {isMentorAssignment
                      ? "Submit Mentor Assignment"
                      : isUpdating
                        ? "Update Submission"
                        : selectedSubmission?.status === "Resubmission Required"
                          ? "Resubmit Assignment"
                          : "Submit Assignment"}
                  </h3>

                  <p className="mb-5 text-sm text-[#7A7F85]">
                    {isMentorAssignment
                      ? "Provide your project links for your mentor to review."
                      : isUpdating
                        ? "Update your project links or notes. Your submission will remain pending."
                        : selectedSubmission?.status === "Resubmission Required"
                          ? "Update your project and submit it again for review."
                          : "Provide the links to your project."}
                  </p>

                  {/* GITHUB */}

                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    GitHub Repository *
                  </label>

                  <input
                    type="url"
                    placeholder="https://github.com/user/repository"
                    className="mb-4 w-full border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    required
                    disabled={submitting}
                  />

                  {/* LIVE DEMO */}

                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Live Demo URL
                  </label>

                  <input
                    type="url"
                    placeholder="https://your-project.vercel.app"
                    className="mb-4 w-full border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
                    value={liveDemoUrl}
                    onChange={(e) => setLiveDemoUrl(e.target.value)}
                    disabled={submitting}
                  />

                  {/* NOTES */}

                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Notes
                  </label>

                  <textarea
                    placeholder="Add any notes for your mentor..."
                    className="mb-5 h-24 w-full resize-none border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={submitting}
                  />

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 rounded-lg bg-[#1A3D63] py-2 text-sm font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Saving..."
                        : isMentorAssignment
                          ? "Submit"
                          : isUpdating
                            ? "Update"
                            : selectedSubmission?.status ===
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
                </>
              );
            })()}
          </form>
        </div>
      )}

      {/* ==========================================================
          FEEDBACK MODAL
      ========================================================== */}

      {feedbackSubmission && feedbackAssignment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#0A1931]">Feedback</h3>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  {feedbackAssignment.title}
                </p>
              </div>

              {feedbackAssignment.isMentorAssignment ? (
                <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  Mentor Review
                </span>
              ) : (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  Assignment Feedback
                </span>
              )}
            </div>

            {/* SCORE FOR NORMAL ASSIGNMENTS */}

            {!feedbackAssignment.isMentorAssignment &&
              feedbackSubmission.score !== null &&
              feedbackSubmission.score !== undefined && (
                <div className="mb-5 border border-[#B3CFE5] bg-[#F6FAFD] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F85]">
                    Your Grade
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#1A3D63]">
                    {feedbackSubmission.score}
                    <span className="text-base font-medium text-[#7A7F85]">
                      {" "}
                      / {feedbackAssignment.maxScore}
                    </span>
                  </p>
                </div>
              )}

            {/* FEEDBACK TEXT */}

            <div className="border border-[#B3CFE5] bg-[#F6FAFD] p-4">
              <p className="mb-2 text-sm font-semibold text-[#0A1931]">
                Instructor Feedback
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6 text-[#4B5563]">
                {feedbackSubmission.feedback ||
                  "No feedback has been provided yet."}
              </p>
            </div>

            {/* RESUBMISSION MESSAGE */}

            {feedbackSubmission.status === "Resubmission Required" && (
              <div className="mt-4 border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Resubmission Required
                </p>

                <p className="mt-1 text-xs text-red-600">
                  Please review the feedback, make the required changes, and
                  submit your assignment again.
                </p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={closeFeedbackModal}
                className="rounded-lg bg-[#1A3D63] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#0A1931]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignment;
