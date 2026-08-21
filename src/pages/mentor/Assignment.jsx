import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  ClipboardList,
  Calendar,
  Trophy,
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
} from "lucide-react";

const Assignment = () => {
  // ============================================================
  // STATE
  // ============================================================

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // ============================================================
  // GET ASSIGNMENTS
  // ============================================================

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const response = await api.get("/assignments");

      console.log("ASSIGNMENTS API RESPONSE:", response.data);

      setAssignments(response.data.assignments || []);
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
  // GET SUBMISSIONS FOR ASSIGNMENT
  // ============================================================

  const fetchSubmissions = async (assignmentId) => {
    try {
      setLoadingSubmissions(true);

      console.log("==========================================");
      console.log("SELECTED ASSIGNMENT:", assignmentId);

      const response = await api.get(`/submissions/assignment/${assignmentId}`);

      console.log("SUBMISSIONS API RESPONSE:", response.data);

      console.log(
        "NUMBER OF SUBMISSIONS:",
        response.data.submissions?.length || 0,
      );

      console.log("SUBMISSIONS:", response.data.submissions);

      console.log("TOTAL TEAM STUDENTS:", response.data.totalTeamStudents);

      console.log("SUBMITTED STUDENTS:", response.data.submittedStudents);

      console.log(
        "STUDENTS WITHOUT SUBMISSION:",
        response.data.studentsWithoutSubmission,
      );

      console.log("==========================================");

      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error("GET SUBMISSIONS ERROR:", error);

      setSubmissions([]);

      toast.error(
        error.response?.data?.message || "Failed to load submissions.",
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

    await fetchSubmissions(assignment._id);
  };

  // ============================================================
  // VIEW SUBMISSION
  // ============================================================

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setShowSubmissionModal(true);
  };

  // ============================================================
  // CLOSE SUBMISSION MODAL
  // ============================================================

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false);
    setSelectedSubmission(null);
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ============================================================
  // STATUS UI
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
      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1A3D63] flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#0A1931]">Assignments</h1>

            <p className="text-sm text-gray-500">
              View assignments and student submissions
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          ASSIGNMENT TABLE
      ======================================================== */}

      <div className="max-w-7xl mx-auto">
        {assignments.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileX className="w-8 h-8 text-gray-400" />
            </div>

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
              <table className="w-full min-w-[900px]">
                <thead className="bg-[#F6FAFD] border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Assignment
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Batch
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Instructor
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Deadline
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Max Score
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {assignments.map((assignment) => (
                    <tr
                      key={assignment._id}
                      className={`hover:bg-gray-50 transition ${
                        selectedAssignment?._id === assignment._id
                          ? "bg-[#F6FAFD]"
                          : ""
                      }`}
                    >
                      {/* ASSIGNMENT */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#B3CFE5]/40 flex items-center justify-center flex-shrink-0">
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

                      {/* BATCH */}

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {assignment.batch?.name || "Current Batch"}
                        </span>
                      </td>

                      {/* INSTRUCTOR */}

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {assignment.instructorName || "—"}
                        </span>
                      </td>

                      {/* DEADLINE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-[#4A7FA7]" />

                          {formatDate(assignment.deadline)}
                        </div>
                      </td>

                      {/* MAX SCORE */}

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Trophy className="w-4 h-4 text-[#4A7FA7]" />

                          {assignment.maxScore || 100}
                        </div>
                      </td>

                      {/* ACTION */}

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

      {/* ========================================================
          SELECTED ASSIGNMENT / SUBMISSIONS
      ======================================================== */}

      {selectedAssignment && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* ==================================================
                TABLE HEADER
            ================================================== */}

            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0A1931]">
                    Student Submissions
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {selectedAssignment.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-[#F6FAFD] text-[#1A3D63] text-sm font-semibold">
                    {submissions.length} submission
                    {submissions.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* ==================================================
                LOADING
            ================================================== */}

            {loadingSubmissions ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#1A3D63] animate-spin mb-3" />

                <p className="text-sm text-gray-500">Loading submissions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileX className="w-8 h-8 text-gray-400" />
                </div>

                <h3 className="text-lg font-semibold text-gray-700">
                  No submissions yet
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  No students have submitted this assignment.
                </p>
              </div>
            ) : (
              /* ==================================================
                 SUBMISSIONS TABLE
              ================================================== */

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
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

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Score
                      </th>

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
                          {/* STUDENT */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#B3CFE5] flex items-center justify-center flex-shrink-0">
                                <UserCircle className="w-6 h-6 text-[#1A3D63]" />
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-[#0A1931] truncate">
                                  {studentName}
                                </p>

                                <p className="text-xs text-gray-500 truncate">
                                  {student?.email || "No email"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* GITHUB */}

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
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>

                          {/* LIVE DEMO */}

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
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {formatDate(submission.createdAt)}
                            </span>
                          </td>

                          {/* STATUS */}

                          <td className="px-6 py-4">
                            {getStatusBadge(submission.status)}
                          </td>

                          {/* SCORE */}

                          <td className="px-6 py-4">
                            {submission.score !== null &&
                            submission.score !== undefined ? (
                              <span className="font-bold text-[#0A1931]">
                                {submission.score}

                                {selectedAssignment.maxScore
                                  ? ` / ${selectedAssignment.maxScore}`
                                  : ""}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Not graded
                              </span>
                            )}
                          </td>

                          {/* ACTION */}

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

      {/* ========================================================
          SUBMISSION DETAILS MODAL
      ======================================================== */}

      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-[#0A1931]">
                  Submission Details
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {selectedSubmission.student?.firstName || "Unknown"}{" "}
                  {selectedSubmission.student?.lastName || ""}
                </p>
              </div>

              <button
                onClick={closeSubmissionModal}
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* MODAL CONTENT */}

            <div className="p-6 space-y-6">
              {/* STUDENT */}

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#B3CFE5] flex items-center justify-center">
                  <UserCircle className="w-7 h-7 text-[#1A3D63]" />
                </div>

                <div>
                  <h3 className="font-bold text-[#0A1931]">
                    {selectedSubmission.student?.firstName || ""}{" "}
                    {selectedSubmission.student?.lastName || ""}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {selectedSubmission.student?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* STATUS */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Status
                </p>

                {getStatusBadge(selectedSubmission.status)}
              </div>

              {/* SCORE */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Score
                </p>

                <div className="text-lg font-bold text-[#0A1931]">
                  {selectedSubmission.score !== null &&
                  selectedSubmission.score !== undefined
                    ? `${selectedSubmission.score} / ${
                        selectedAssignment?.maxScore || 100
                      }`
                    : "Not graded"}
                </div>
              </div>

              {/* GITHUB */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  GitHub Repository
                </p>

                {selectedSubmission.githubUrl ? (
                  <a
                    href={selectedSubmission.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#F6FAFD] text-[#1A3D63] hover:bg-[#B3CFE5]/30 transition break-all"
                  >
                    <Code2 className="w-5 h-5 flex-shrink-0" />

                    <span className="text-sm">
                      {selectedSubmission.githubUrl}
                    </span>
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No GitHub URL</p>
                )}
              </div>

              {/* LIVE DEMO */}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Live Demo
                </p>

                {selectedSubmission.liveDemoUrl ? (
                  <a
                    href={selectedSubmission.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#F6FAFD] text-[#1A3D63] hover:bg-[#B3CFE5]/30 transition break-all"
                  >
                    <ExternalLink className="w-5 h-5 flex-shrink-0" />

                    <span className="text-sm">
                      {selectedSubmission.liveDemoUrl}
                    </span>
                  </a>
                ) : (
                  <p className="text-sm text-gray-400">No live demo URL</p>
                )}
              </div>

              {/* NOTES */}

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

              {/* FEEDBACK */}

              {selectedSubmission.feedback && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    Mentor Feedback
                  </p>

                  <div className="p-4 rounded-lg bg-[#F6FAFD] border border-[#B3CFE5]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedSubmission.feedback}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeSubmissionModal}
                className="px-5 py-2.5 rounded-lg bg-[#1A3D63] text-white text-sm font-semibold hover:bg-[#0A1931] transition"
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

export default Assignment;
