import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  ClipboardList,
  Calendar,
  CheckCircle,
  AlertTriangle,
  FileX,
  UserCircle,
  Code2,
  ExternalLink,
  Eye,
  X,
  FileText,
  Loader2,
  Clock,
  Users,
  Save,
  RotateCcw,
  Plus,
  MessageSquare,
} from "lucide-react";

const Assignment = () => {
  // ============================================================
  // ASSIGNMENTS
  // ============================================================

  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // "admin" = normal admin assignment
  // "mentor" = assignment created by the current mentor
  const [selectedAssignmentType, setSelectedAssignmentType] = useState("admin");

  // ============================================================
  // SUBMISSIONS
  // ============================================================

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  // ============================================================
  // MODALS
  // ============================================================

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ============================================================
  // CREATE MENTOR ASSIGNMENT
  // ============================================================

  const [creatingAssignment, setCreatingAssignment] = useState(false);

  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    instructorName: "",
    deadline: "",
    maxScore: "100",
    link: "",
  });

  const [createFile, setCreateFile] = useState(null);

  // ============================================================
  // ADMIN ASSIGNMENT GRADING
  // ============================================================

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  // ============================================================
  // FETCH ASSIGNMENTS
  // ============================================================

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const adminResponse = await api.get("/assignments");

      const adminAssignments = (adminResponse.data.assignments || []).map(
        (assignment) => ({
          ...assignment,
          assignmentType: "admin",
        }),
      );

      let mentorAssignments = [];

      try {
        const mentorResponse = await api.get("/assignments/mentor");

        mentorAssignments = (mentorResponse.data.assignments || []).map(
          (assignment) => ({
            ...assignment,
            assignmentType: "mentor",
          }),
        );
      } catch (mentorError) {
        console.error("GET OWN MENTOR ASSIGNMENTS ERROR:", mentorError);
      }

      setAssignments([...adminAssignments, ...mentorAssignments]);
    } catch (error) {
      console.error("GET ASSIGNMENTS ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to load assignments.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CREATE FORM
  // ============================================================

  const handleCreateFormChange = (event) => {
    const { name, value } = event.target;

    setCreateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      description: "",
      instructorName: "",
      deadline: "",
      maxScore: "100",
      link: "",
    });

    setCreateFile(null);
  };

  const closeCreateModal = () => {
    if (creatingAssignment) return;

    setShowCreateModal(false);
    resetCreateForm();
  };

  // ============================================================
  // CREATE MENTOR ASSIGNMENT
  // ============================================================

  const handleCreateAssignment = async (event) => {
    event.preventDefault();

    if (!createForm.title.trim()) {
      toast.error("Please enter an assignment title.");
      return;
    }

    if (!createForm.description.trim()) {
      toast.error("Please enter an assignment description.");
      return;
    }

    if (!createForm.instructorName.trim()) {
      toast.error("Please enter the mentor name.");
      return;
    }

    if (!createForm.deadline) {
      toast.error("Please select a deadline.");
      return;
    }

    if (
      !Number.isFinite(Number(createForm.maxScore)) ||
      Number(createForm.maxScore) <= 0
    ) {
      toast.error("Maximum score must be greater than 0.");
      return;
    }

    if (createFile && createFile.size > 20 * 1024 * 1024) {
      toast.error("File size cannot exceed 20 MB.");
      return;
    }

    try {
      setCreatingAssignment(true);

      const formData = new FormData();

      formData.append("title", createForm.title.trim());
      formData.append("description", createForm.description.trim());
      formData.append("instructorName", createForm.instructorName.trim());
      formData.append("deadline", createForm.deadline);
      formData.append("maxScore", Number(createForm.maxScore));

      if (createForm.link.trim()) {
        formData.append("link", createForm.link.trim());
      }

      if (createFile) {
        formData.append("files", createFile);
      }

      const response = await api.post("/assignments/mentor-create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to create assignment.",
        );
      }

      toast.success("Assignment created successfully.");

      setShowCreateModal(false);
      resetCreateForm();

      await fetchAssignments();
    } catch (error) {
      console.error("CREATE MENTOR ASSIGNMENT ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create assignment.",
      );
    } finally {
      setCreatingAssignment(false);
    }
  };

  // ============================================================
  // FETCH ADMIN ASSIGNMENT SUBMISSIONS
  // ============================================================

  const fetchAdminSubmissions = async (assignmentId) => {
    try {
      setLoadingSubmissions(true);

      const response = await api.get(`/submissions/assignment/${assignmentId}`);

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("GET ADMIN SUBMISSIONS ERROR:", error);

      setSubmissions([]);

      toast.error(
        error.response?.data?.message || "Failed to load submissions.",
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ============================================================
  // FETCH OWN MENTOR ASSIGNMENT SUBMISSIONS
  // ============================================================

  const fetchMentorSubmissions = async (assignmentId) => {
    try {
      setLoadingSubmissions(true);

      const response = await api.get(
        `/mentor-assignment-submissions/assignment/${assignmentId}`,
      );

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("GET MENTOR ASSIGNMENT SUBMISSIONS ERROR:", error);

      setSubmissions([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to load mentor assignment submissions.",
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ============================================================
  // SELECT ASSIGNMENT
  // ============================================================

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(null);
    setShowSubmissionModal(false);
    setScore("");
    setFeedback("");

    if (assignment.assignmentType === "mentor") {
      setSelectedAssignmentType("mentor");
      await fetchMentorSubmissions(assignment._id);
    } else {
      setSelectedAssignmentType("admin");
      await fetchAdminSubmissions(assignment._id);
    }
  };

  // ============================================================
  // VIEW SUBMISSION
  // ============================================================

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);

    if (selectedAssignmentType === "admin") {
      setScore(
        submission.score !== null && submission.score !== undefined
          ? submission.score
          : "",
      );
    } else {
      setScore("");
    }

    setFeedback(submission.feedback || "");
    setShowSubmissionModal(true);
  };

  // ============================================================
  // CLOSE SUBMISSION MODAL
  // ============================================================

  const closeSubmissionModal = () => {
    if (grading || feedbackSaving) return;

    setShowSubmissionModal(false);
    setSelectedSubmission(null);
    setScore("");
    setFeedback("");
  };

  // ============================================================
  // GRADE ADMIN ASSIGNMENT
  // ============================================================

  const handleGradeSubmission = async (status = "Graded") => {
    if (selectedAssignmentType !== "admin") {
      toast.error("Mentor assignments do not use score grading.");
      return;
    }

    if (!selectedSubmission) {
      toast.error("No submission selected.");
      return;
    }

    if (score === "" || score === null || score === undefined) {
      toast.error("Please enter a score.");
      return;
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      toast.error("Score must be a valid number.");
      return;
    }

    if (numericScore < 0) {
      toast.error("Score cannot be negative.");
      return;
    }

    const maxScore = Number(selectedAssignment?.maxScore || 100);

    if (numericScore > maxScore) {
      toast.error(`Score cannot exceed ${maxScore}.`);
      return;
    }

    try {
      setGrading(true);

      const response = await api.put(
        `/submissions/grade/${selectedSubmission._id}`,
        {
          score: numericScore,
          feedback: feedback.trim(),
          status,
        },
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to update submission.",
        );
      }

      const updatedSubmission = response.data.submission;

      setSubmissions((prev) =>
        prev.map((submission) =>
          submission._id === updatedSubmission._id
            ? updatedSubmission
            : submission,
        ),
      );

      setSelectedSubmission(updatedSubmission);

      setScore(
        updatedSubmission.score !== null &&
          updatedSubmission.score !== undefined
          ? updatedSubmission.score
          : "",
      );

      setFeedback(updatedSubmission.feedback || "");

      toast.success(
        status === "Graded"
          ? "Submission graded successfully."
          : "Resubmission requested successfully.",
      );
    } catch (error) {
      console.error("GRADE SUBMISSION ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update grade.",
      );
    } finally {
      setGrading(false);
    }
  };

  // ============================================================
  // GIVE FEEDBACK ON OWN MENTOR ASSIGNMENT
  // ============================================================

  const handleMentorFeedback = async () => {
    if (selectedAssignmentType !== "mentor") {
      toast.error("This action is only for your mentor assignments.");
      return;
    }

    if (!selectedSubmission) {
      toast.error("No submission selected.");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please enter feedback.");
      return;
    }

    try {
      setFeedbackSaving(true);

      const response = await api.put(
        `/mentor-assignment-submissions/feedback/${selectedSubmission._id}`,
        {
          feedback: feedback.trim(),
        },
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to save feedback.");
      }

      const updatedSubmission = response.data.submission;

      setSubmissions((prev) =>
        prev.map((submission) =>
          submission._id === updatedSubmission._id
            ? updatedSubmission
            : submission,
        ),
      );

      setSelectedSubmission(updatedSubmission);
      setFeedback(updatedSubmission.feedback || "");

      toast.success("Feedback sent successfully.");
    } catch (error) {
      console.error("MENTOR FEEDBACK ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save feedback.",
      );
    } finally {
      setFeedbackSaving(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (status) => {
    if (status === "Graded") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle className="w-3.5 h-3.5" />
          Graded
        </span>
      );
    }

    if (status === "Resubmission Required") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <AlertTriangle className="w-3.5 h-3.5" />
          Resubmission Required
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6FAFD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1A3D63] animate-spin" />
          <p className="text-sm text-gray-500">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1A3D63] flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[#0A1931]">Assignments</h1>

              <p className="text-sm text-gray-500">
                View assignments, submissions, grading and feedback
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A3D63] text-white text-sm font-semibold hover:bg-[#0A1931] transition"
          >
            <Plus className="w-4 h-4" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* ASSIGNMENT TABLE */}

      <div className="max-w-7xl mx-auto">
        {assignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <FileX className="w-8 h-8 text-gray-400 mx-auto mb-4" />

            <h2 className="text-lg font-semibold text-gray-700">
              No assignments found
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              There are no assignments available.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-250">
                <thead className="bg-[#F6FAFD] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Assignment
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Type
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Instructor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Deadline
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {assignments.map((assignment) => (
                    <tr
                      key={`${assignment.assignmentType}-${assignment._id}`}
                      className={`hover:bg-gray-50 transition ${
                        selectedAssignment?._id === assignment._id &&
                        selectedAssignmentType === assignment.assignmentType
                          ? "bg-[#F6FAFD]"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#B3CFE5]/40 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#1A3D63]" />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-[#0A1931]">
                              {assignment.title}
                            </p>

                            <p className="text-xs text-gray-500 max-w-xs truncate">
                              {assignment.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {assignment.assignmentType === "admin" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                            Admin Assignment
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                            My Assignment
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {assignment.instructorName ||
                            assignment.mentor?.firstName ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-[#4A7FA7]" />
                          {formatDate(assignment.deadline)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSelectAssignment(assignment)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A3D63] text-white text-sm font-medium hover:bg-[#0A1931] transition"
                        >
                          <Users className="w-4 h-4" />
                          View Submissions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SUBMISSIONS */}

      {selectedAssignment && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-[#0A1931]">
                  Student Submissions
                </h2>

                {selectedAssignmentType === "admin" ? (
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                    Admin Assignment
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                    Your Assignment
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {selectedAssignment.title}
              </p>
            </div>

            {loadingSubmissions ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#1A3D63] animate-spin mb-3" />
                <p className="text-sm text-gray-500">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center">
                <FileX className="w-8 h-8 text-gray-400 mx-auto mb-3" />

                <h3 className="text-lg font-semibold text-gray-700">
                  No submissions yet
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  No students have submitted this assignment.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead className="bg-[#F6FAFD] border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Student
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        GitHub
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Live Demo
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Submitted
                      </th>

                      {selectedAssignmentType === "admin" && (
                        <>
                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Status
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Score
                          </th>
                        </>
                      )}

                      {selectedAssignmentType === "mentor" && (
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Feedback
                        </th>
                      )}

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {submissions.map((submission) => {
                      const student = submission.student;

                      const studentName = student
                        ? `${student.firstName || ""} ${
                            student.lastName || ""
                          }`.trim()
                        : "Unknown Student";

                      return (
                        <tr
                          key={submission._id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#B3CFE5] flex items-center justify-center">
                                <UserCircle className="w-6 h-6 text-[#1A3D63]" />
                              </div>

                              <div>
                                <p className="font-semibold text-[#0A1931]">
                                  {studentName}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {student?.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {submission.githubUrl ? (
                              <a
                                href={submission.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#1A3D63] hover:underline"
                              >
                                <Code2 className="w-4 h-4" />
                                GitHub
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-6 py-4">
                            {submission.liveDemoUrl ? (
                              <a
                                href={submission.liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-medium text-[#1A3D63] hover:underline"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Demo
                              </a>
                            ) : (
                              "—"
                            )}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(submission.createdAt)}
                          </td>

                          {selectedAssignmentType === "admin" && (
                            <>
                              <td className="px-6 py-4">
                                {getStatusBadge(submission.status)}
                              </td>

                              <td className="px-6 py-4">
                                {submission.score !== null &&
                                submission.score !== undefined ? (
                                  <span className="font-bold text-[#0A1931]">
                                    {submission.score} /{" "}
                                    {selectedAssignment.maxScore || 100}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">
                                    Not graded
                                  </span>
                                )}
                              </td>
                            </>
                          )}

                          {selectedAssignmentType === "mentor" && (
                            <td className="px-6 py-4">
                              {submission.feedback ? (
                                <span className="text-sm text-green-600 font-medium">
                                  Feedback given
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">
                                  No feedback
                                </span>
                              )}
                            </td>
                          )}

                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleViewSubmission(submission)}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A3D63] text-white text-sm font-medium hover:bg-[#0A1931] transition"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creatingAssignment) {
              closeCreateModal();
            }
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-[#0A1931]">
                  Create Assignment
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create an assignment for your assigned students.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={creatingAssignment}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Assignment Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={createForm.title}
                  onChange={handleCreateFormChange}
                  disabled={creatingAssignment}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1A3D63]/20"
                  placeholder="Enter assignment title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Description
                </label>

                <textarea
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateFormChange}
                  disabled={creatingAssignment}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none outline-none focus:ring-2 focus:ring-[#1A3D63]/20"
                  placeholder="Describe the assignment..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Mentor Name
                </label>

                <input
                  type="text"
                  name="instructorName"
                  value={createForm.instructorName}
                  onChange={handleCreateFormChange}
                  disabled={creatingAssignment}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1A3D63]/20"
                  placeholder="Enter mentor name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Deadline
                  </label>

                  <input
                    type="date"
                    name="deadline"
                    value={createForm.deadline}
                    onChange={handleCreateFormChange}
                    disabled={creatingAssignment}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    name="maxScore"
                    min="1"
                    step="0.01"
                    value={createForm.maxScore}
                    onChange={handleCreateFormChange}
                    disabled={creatingAssignment}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Assignment Link
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>

                <input
                  type="url"
                  name="link"
                  value={createForm.link}
                  onChange={handleCreateFormChange}
                  disabled={creatingAssignment}
                  placeholder="https://example.com/assignment"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                  Assignment File
                  <span className="text-gray-400 font-normal ml-1">
                    (optional)
                  </span>
                </label>

                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  disabled={creatingAssignment}
                  onChange={(event) =>
                    setCreateFile(event.target.files?.[0] || null)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm"
                />

                <p className="text-xs text-gray-500 mt-2">Maximum 20 MB.</p>

                {createFile && (
                  <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-[#F6FAFD] border border-gray-200">
                    <span className="text-sm text-gray-700 truncate">
                      {createFile.name}
                    </span>

                    <button type="button" onClick={() => setCreateFile(null)}>
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-5 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={creatingAssignment}
                  className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A3D63] text-white font-semibold disabled:opacity-50"
                >
                  {creatingAssignment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}

                  {creatingAssignment ? "Creating..." : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSION MODAL */}

      {showSubmissionModal && selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !grading &&
              !feedbackSaving
            ) {
              closeSubmissionModal();
            }
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-bold text-[#0A1931]">
                  Submission Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedSubmission.student?.firstName}{" "}
                  {selectedSubmission.student?.lastName}
                </p>
              </div>

              <button
                onClick={closeSubmissionModal}
                disabled={grading || feedbackSaving}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#B3CFE5] flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-[#1A3D63]" />
                </div>

                <div>
                  <h3 className="font-bold text-[#0A1931]">
                    {selectedSubmission.student?.firstName}{" "}
                    {selectedSubmission.student?.lastName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedSubmission.student?.email}
                  </p>
                </div>
              </div>

              {selectedAssignmentType === "admin" && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Status
                  </p>

                  {getStatusBadge(selectedSubmission.status)}
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  GitHub Repository
                </p>

                {selectedSubmission.githubUrl ? (
                  <a
                    href={selectedSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#F6FAFD] text-[#1A3D63] break-all"
                  >
                    <Code2 className="w-5 h-5 shrink-0" />

                    <span className="text-sm">
                      {selectedSubmission.githubUrl}
                    </span>

                    <ExternalLink className="w-4 h-4 ml-auto shrink-0" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No GitHub URL</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Live Demo
                </p>

                {selectedSubmission.liveDemoUrl ? (
                  <a
                    href={selectedSubmission.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#F6FAFD] text-[#1A3D63] break-all"
                  >
                    <ExternalLink className="w-5 h-5 shrink-0" />

                    <span className="text-sm">
                      {selectedSubmission.liveDemoUrl}
                    </span>
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No live demo URL</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Student Notes
                </p>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedSubmission.notes || "No notes provided."}
                  </p>
                </div>
              </div>

              {/* ADMIN ASSIGNMENT GRADING */}

              {selectedAssignmentType === "admin" && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#0A1931]">
                        Grade Submission
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        Enter score and feedback.
                      </p>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg bg-[#F6FAFD] text-[#1A3D63] text-sm font-bold">
                      Max: {selectedAssignment.maxScore || 100}
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Score
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max={selectedAssignment.maxScore || 100}
                        step="0.01"
                        value={score}
                        onChange={(event) => setScore(event.target.value)}
                        disabled={grading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                        placeholder="Enter score"
                      />

                      <span className="text-gray-500 font-semibold">
                        / {selectedAssignment.maxScore || 100}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                      Mentor Feedback
                    </label>

                    <textarea
                      value={feedback}
                      onChange={(event) => setFeedback(event.target.value)}
                      disabled={grading}
                      rows={5}
                      placeholder="Write feedback for the student..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
                    />
                  </div>
                </div>
              )}

              {/* MENTOR ASSIGNMENT FEEDBACK ONLY */}

              {selectedAssignmentType === "mentor" && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-[#1A3D63]" />

                    <div>
                      <h3 className="text-lg font-bold text-[#0A1931]">
                        Mentor Feedback
                      </h3>

                      <p className="text-sm text-gray-500">
                        Give feedback to the student. No score is required.
                      </p>
                    </div>
                  </div>

                  <textarea
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    disabled={feedbackSaving}
                    rows={5}
                    placeholder="Write feedback for the student..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                onClick={closeSubmissionModal}
                disabled={grading || feedbackSaving}
                className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold"
              >
                Close
              </button>

              {selectedAssignmentType === "admin" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() =>
                      handleGradeSubmission("Resubmission Required")
                    }
                    disabled={grading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {grading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Request Resubmission
                  </button>

                  <button
                    onClick={() => handleGradeSubmission("Graded")}
                    disabled={grading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A3D63] text-white text-sm font-semibold hover:bg-[#0A1931] disabled:opacity-50"
                  >
                    {grading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Grade
                  </button>
                </div>
              )}

              {selectedAssignmentType === "mentor" && (
                <button
                  onClick={handleMentorFeedback}
                  disabled={feedbackSaving}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#1A3D63] text-white text-sm font-semibold hover:bg-[#0A1931] disabled:opacity-50"
                >
                  {feedbackSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}

                  {feedbackSaving ? "Saving..." : "Send Feedback"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;
