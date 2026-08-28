import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  UserCircle,
  ExternalLink,
  FileText,
  Loader2,
  Users,
  Save,
  X,
  Plus,
  MessageSquare,
  RefreshCw,
  Upload,
  Calendar,
  CheckCircle2,
} from "lucide-react";

const Assignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState("admin");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [detailsAssignment, setDetailsAssignment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedbackSaving, setFeedbackSaving] = useState(false);

  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const adminRes = await api.get("/assignments");

      const adminData = (adminRes.data.assignments || []).map((a) => ({
        ...a,
        assignmentType: "admin",
      }));

      let mentorData = [];

      try {
        const mentorRes = await api.get("/assignments/mentor");

        mentorData = (mentorRes.data.assignments || []).map((a) => ({
          ...a,
          assignmentType: "mentor",
        }));
      } catch (e) {
        console.error("Mentor fetch error", e);
      }

      setAssignments([...adminData, ...mentorData]);
    } catch (error) {
      console.error("Failed to load assignments:", error);
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();

    try {
      setCreatingAssignment(true);

      const formData = new FormData();

      Object.keys(createForm).forEach((key) => {
        formData.append(key, createForm[key]);
      });

      if (createFile) {
        formData.append("files", createFile);
      }

      await api.post("/assignments/mentor-create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Assignment created successfully.");

      setShowCreateModal(false);

      setCreateForm({
        title: "",
        description: "",
        instructorName: "",
        deadline: "",
        maxScore: "100",
        link: "",
      });

      setCreateFile(null);

      fetchAssignments();
    } catch (error) {
      console.error("Failed to create assignment:", error);
      toast.error("Failed to create assignment.");
    } finally {
      setCreatingAssignment(false);
    }
  };

  const handleSelectAssignment = async (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedSubmission(null);
    setLoadingSubmissions(true);

    const type = assignment.assignmentType;

    setSelectedAssignmentType(type);

    try {
      const endpoint =
        type === "mentor"
          ? `/mentor-assignment-submissions/assignment/${assignment._id}`
          : `/submissions/assignment/${assignment._id}`;

      const res = await api.get(endpoint);

      setSubmissions(res.data.submissions || []);
    } catch (error) {
      console.error("Failed to load submissions:", error);
      setSubmissions([]);
      toast.error("Failed to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (status = "Graded") => {
    const enteredScore = Number(score);
    const maxScore = Number(selectedAssignment?.maxScore);

    if (score === "") {
      toast.error("Please enter a score.");
      return;
    }

    if (Number.isNaN(enteredScore)) {
      toast.error("Please enter a valid score.");
      return;
    }

    if (enteredScore < 0) {
      toast.error("Score cannot be less than 0.");
      return;
    }

    if (enteredScore > maxScore) {
      toast.error(`Score cannot be greater than ${maxScore}.`);
      return;
    }

    try {
      setGrading(true);

      const res = await api.put(
        `/submissions/grade/${selectedSubmission._id}`,
        {
          score: enteredScore,
          feedback,
          status,
        },
      );

      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === res.data.submission._id ? res.data.submission : s,
        ),
      );

      toast.success(`Submission ${status}`);

      setShowSubmissionModal(false);
    } catch (error) {
      console.error("Grading failed:", error);
      toast.error("Grading failed.");
    } finally {
      setGrading(false);
    }
  };

  const handleMentorFeedback = async () => {
    try {
      setFeedbackSaving(true);

      const res = await api.put(
        `/mentor-assignment-submissions/feedback/${selectedSubmission._id}`,
        {
          feedback,
        },
      );

      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === res.data.submission._id ? res.data.submission : s,
        ),
      );

      toast.success("Feedback sent.");

      setShowSubmissionModal(false);
    } catch (error) {
      console.error("Feedback failed:", error);
      toast.error("Feedback failed.");
    } finally {
      setFeedbackSaving(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const isExpired = (date) => date && new Date(date).getTime() < Date.now();

  const getFileUrl = (file) => {
    if (!file) return null;

    const raw =
      typeof file === "string" ? file : file.url || file.fileUrl || file.path;

    if (!raw) return null;

    const backendBase =
      import.meta.env.VITE_BACKEND_URL || "https://bms-backend-6ali.onrender.com";

    return raw.startsWith("http")
      ? raw
      : `${backendBase}/${raw.replace(/^\/+/, "")}`;
  };

  // Check whether current score is invalid
  const isScoreInvalid =
    score !== "" && Number(score) > Number(selectedAssignment?.maxScore);

  return (
    <div className="min-h-screen bg-[#F4F8FA] p-4 sm:p-8 text-[#14222B]">
      <div className="max-w-7xl mx-auto mb-8 bg-linear-to-r from-[#1b3c47] via-[#0f2b34] to-[#071b23] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A8CC]/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h6 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3">
              <FileText size={30} />
              Assignments
            </h6>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchAssignments}
              disabled={loading}
              className="p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[#00A8CC] transition flex items-center justify-center border border-white/10"
              title="Refresh Assignments"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-[#00A8CC] hover:bg-[#0092b3] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00A8CC]/30 transition transform active:scale-95"
            >
              <Plus size={18} />
              New Assignment
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-[#B4D7E2]/40 mb-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[#8FA3B0] text-[10px] font-bold uppercase tracking-[0.2em]">
                <th className="px-6 pb-2">Title</th>

                <th className="px-6 pb-2">Instructor</th>

                <th className="px-6 pb-2">Lock Date</th>

                <th className="px-6 pb-2 text-center">Out-Of</th>

                <th className="px-6 pb-2 text-center">Resources</th>

                <th className="px-6 pb-2">Status</th>

                <th className="px-6 pb-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-20 text-center">
                    <Loader2
                      className="animate-spin inline-block text-[#00A8CC]"
                      size={28}
                    />

                    <p className="text-xs font-bold text-[#8FA3B0] mt-2">
                      Loading assignments...
                    </p>
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="py-16 text-center text-[#8FA3B0] font-bold text-xs uppercase tracking-wider"
                  >
                    No assignments deployed yet.
                  </td>
                </tr>
              ) : (
                assignments.map((item) => (
                  <tr
                    key={item._id}
                    className="group hover:translate-x-1 transition-all duration-200"
                  >
                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] rounded-l-2xl border-l-[6px] border-[#00A8CC] transition-colors">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black text-white ${
                            item.assignmentType === "mentor"
                              ? "bg-purple-400"
                              : "bg-[#00A8CC]"
                          }`}
                          title={
                            item.assignmentType === "mentor"
                              ? "Created by Mentor"
                              : "Created by Admin"
                          }
                        >
                          {item.assignmentType === "mentor" ? "M" : "A"}
                        </span>

                        <p className="text-sm font-black text-[#14222B] leading-tight">
                          {item.title}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-xs font-bold text-gray-600 transition-colors">
                      {item.instructorName || "Admin"}
                    </td>

                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-xs font-bold text-[#14222B] transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#8FA3B0]" />

                        {new Date(item.deadline).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-center text-xs font-black text-[#14222B] transition-colors">
                      {item.maxScore}
                    </td>

                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-center transition-colors">
                      <button
                        onClick={() => setDetailsAssignment(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#00A8CC] text-[#00A8CC] hover:text-white border border-[#00A8CC]/40 rounded-lg text-[10px] font-black uppercase tracking-wider transition"
                      >
                        <FileText size={12} />
                        Details
                      </button>
                    </td>

                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] transition-colors">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase ${
                            isExpired(item.deadline)
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {isExpired(item.deadline) ? "Expired" : "Active"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] rounded-r-2xl text-right transition-colors">
                      <button
                        onClick={() => handleSelectAssignment(item)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 ml-auto ${
                          selectedAssignment?._id === item._id
                            ? "bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/20"
                            : "bg-[#597c93] text-white hover:bg-[#1b3c47]"
                        }`}
                      >
                        <Users size={14} />
                        Submissions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAssignment && (
        <div className="max-w-7xl mx-auto mt-8 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1.5 bg-[#00A8CC] rounded-full" />

              <h2 className="text-xl font-black text-[#14222B]">
                Submissions: {selectedAssignment.title}
              </h2>
            </div>

            <span className="text-xs font-bold text-[#8FA3B0] bg-white px-3 py-1 rounded-full border border-[#B4D7E2]/50">
              {submissions.length} Total Submission
              {submissions.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loadingSubmissions ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#B4D7E2]/40">
              <Loader2
                className="animate-spin inline-block text-[#00A8CC]"
                size={32}
              />

              <p className="text-xs font-bold text-[#8FA3B0] mt-3">
                Fetching submissions...
              </p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-[#B4D7E2]/40">
              <p className="text-xs font-bold text-[#8FA3B0] uppercase tracking-wider">
                No submissions recorded for this assignment yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub._id}
                  className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#B4D7E2]/60 hover:border-[#00A8CC] transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#14222B] to-[#1b3c47] flex items-center justify-center text-[#00A8CC] shadow-inner">
                      <UserCircle size={28} />
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#14222B]">
                        {sub.student?.firstName} {sub.student?.lastName}
                      </p>

                      <p className="text-[11px] text-[#8FA3B0] font-bold mt-0.5">
                        {sub.student?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                    <div className="flex gap-2">
                      {sub.githubUrl && (
                        <a
                          href={sub.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#F4F8FA] hover:bg-[#e6f9fd] rounded-xl text-[#00A8CC] transition border border-[#B4D7E2]/40"
                          title="GitHub Repository"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}

                      {sub.liveDemoUrl && (
                        <a
                          href={sub.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 bg-[#F4F8FA] hover:bg-[#e6f9fd] rounded-xl text-[#00A8CC] transition border border-[#B4D7E2]/40"
                          title="Live Demo"
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full ${
                        sub.status === "Graded"
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}
                    >
                      {sub.status || "Pending"}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedSubmission(sub);
                        setScore(
                          sub.score !== undefined && sub.score !== null
                            ? sub.score
                            : "",
                        );
                        setFeedback(sub.feedback || "");
                        setShowSubmissionModal(true);
                      }}
                      className="px-5 py-2.5 bg-[#14222B] hover:bg-[#00A8CC] text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition shadow-sm"
                    >
                      Review Submission
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] border border-[#B4D7E2]/60">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F4F8FA]">
              <div>
                <h3 className="text-2xl font-black text-[#14222B]">
                  Create Projects
                </h3>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-gray-400 hover:text-[#14222B] rounded-xl hover:bg-[#F4F8FA]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Assignment Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Mobile Responsive Navigation Layout"
                  required
                  className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium outline-none transition"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Instructions & Specifications
                </label>

                <textarea
                  placeholder="Provide explicit requirement details..."
                  required
                  className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium h-32 outline-none transition resize-none"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Link (Optional)
                </label>

                <input
                  type="url"
                  placeholder="https://example.com/resources or documentation URL"
                  className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium outline-none transition"
                  value={createForm.link}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      link: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                    Instructor Name
                  </label>

                  <input
                    type="text"
                    placeholder="Instructor Name"
                    required
                    className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium outline-none transition"
                    value={createForm.instructorName}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        instructorName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                    Deadline Date
                  </label>

                  <input
                    type="date"
                    required
                    className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium outline-none transition"
                    value={createForm.deadline}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        deadline: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <label className="flex items-center gap-4 p-4 border-2 border-dashed border-[#B4D7E2] hover:border-[#00A8CC] rounded-2xl cursor-pointer hover:bg-[#F4F8FA] transition group">
                <Upload
                  size={22}
                  className="text-[#00A8CC] group-hover:scale-110 transition-transform"
                />

                <span className="text-xs font-bold text-[#14222B]">
                  {createFile
                    ? createFile.name
                    : "Attach Supporting Documentation (Optional)"}
                </span>

                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setCreateFile(e.target.files[0])}
                />
              </label>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 font-bold text-gray-400 hover:text-[#14222B] uppercase text-xs transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingAssignment}
                  className="px-8 py-3.5 bg-[#00A8CC] hover:bg-[#0092b3] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00A8CC]/20 transition flex items-center justify-center min-w-30"
                >
                  {creatingAssignment ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#B4D7E2]/60">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#F4F8FA]">
              <div>
                <h3 className="text-xl font-black text-[#14222B]">
                  Review: {selectedSubmission.student?.firstName}{" "}
                  {selectedSubmission.student?.lastName}
                </h3>

                <p className="text-[10px] font-bold text-[#8FA3B0] uppercase tracking-widest mt-0.5">
                  Submission Data Assessment
                </p>
              </div>

              <button
                onClick={() => setShowSubmissionModal(false)}
                className="p-2 text-gray-400 hover:text-[#14222B] rounded-xl hover:bg-[#F4F8FA]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Student Submission Notes
                </label>

                <div className="p-4 bg-[#F4F8FA] rounded-2xl border border-[#B4D7E2]/50 text-xs italic font-medium text-[#14222B]">
                  "{selectedSubmission.notes || "No student notes attached."}"
                </div>
              </div>

              {selectedAssignmentType === "admin" && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                    Score Evaluation
                  </label>

                  <div className="flex items-start gap-3">
                    <div>
                      <input
                        type="number"
                        min="0"
                        max={selectedAssignment.maxScore}
                        step="any"
                        placeholder="0"
                        className={`w-32 p-3 bg-[#F4F8FA] border rounded-2xl font-black text-center text-sm outline-none transition ${
                          isScoreInvalid
                            ? "border-red-400 bg-red-50 text-red-600 focus:border-red-500"
                            : "border-[#B4D7E2] focus:border-[#00A8CC]"
                        }`}
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                      />

                      {isScoreInvalid && (
                        <p className="text-xs font-bold text-red-500 mt-2 max-w-40 leading-relaxed">
                          Score cannot be greater than{" "}
                          {selectedAssignment.maxScore}.
                        </p>
                      )}
                    </div>

                    <span className="text-xs font-bold text-[#8FA3B0] mt-3">
                      / {selectedAssignment.maxScore} Max Points
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Feedback & Guidance
                </label>

                <textarea
                  placeholder="Provide structured, constructive feedback..."
                  className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium h-32 outline-none transition resize-none"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#F4F8FA]">
                <button
                  onClick={() => setShowSubmissionModal(false)}
                  className="px-5 py-3 text-xs font-bold text-gray-400 hover:text-[#14222B] uppercase transition"
                >
                  Close
                </button>

                {selectedAssignmentType === "admin" ? (
                  <>
                    <button
                      disabled={grading || isScoreInvalid}
                      onClick={() =>
                        handleGradeSubmission("Resubmission Required")
                      }
                      className="px-5 py-3 text-amber-600 bg-amber-50 hover:bg-amber-100 font-black text-xs uppercase rounded-2xl transition border border-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Resubmission
                    </button>

                    <button
                      disabled={grading || score === "" || isScoreInvalid}
                      onClick={() => handleGradeSubmission("Graded")}
                      className="px-7 py-3 bg-[#14222B] hover:bg-[#1b3c47] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-gray-200 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {grading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    disabled={feedbackSaving}
                    onClick={handleMentorFeedback}
                    className="px-7 py-3 bg-[#00A8CC] hover:bg-[#0092b3] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00A8CC]/20 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {feedbackSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                    Submit Feedback
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {detailsAssignment && (
        <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#e6f9fd] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#00A8CC]/30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#00A8CC] text-[10px] font-black uppercase tracking-widest mb-1">
                  <CheckCircle2 size={14} />
                  Assignment Details
                </div>

                <h3 className="text-xl font-black text-[#14222B] leading-tight">
                  {detailsAssignment.title}
                </h3>
              </div>

              <button
                onClick={() => setDetailsAssignment(null)}
                className="p-1.5 text-gray-400 hover:text-[#14222B] rounded-xl hover:bg-white/50 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 bg-white rounded-2xl border-l-[6px] border-[#00A8CC] mb-6 shadow-sm">
              <p className="text-sm text-[#14222B] font-medium leading-relaxed">
                {detailsAssignment.description}
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {detailsAssignment.link && (
                <a
                  href={detailsAssignment.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-[#00A8CC] hover:underline bg-white/70 p-3 rounded-xl border border-[#00A8CC]/20"
                >
                  <ExternalLink size={15} />
                  View Reference Link
                </a>
              )}

              {detailsAssignment.files?.map((file, i) => (
                <a
                  key={i}
                  href={getFileUrl(file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-[#14222B] hover:text-[#00A8CC] bg-white/70 p-3 rounded-xl border border-[#00A8CC]/20 transition"
                >
                  <FileText size={15} className="text-[#00A8CC]" />
                  Attached Document {i + 1}
                </a>
              ))}
            </div>

            <button
              onClick={() => setDetailsAssignment(null)}
              className="w-full py-4 bg-[#99b3c4] hover:bg-[#7da1ac] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition shadow-lg shadow-[#14222B]/20"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assignment;
