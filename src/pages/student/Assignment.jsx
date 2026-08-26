import { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  Code2,
  ExternalLink,
  FileText,
  Loader2,
  X,
  RefreshCw,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Award,
} from "lucide-react";

const StudentAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [mySubmissions, setMySubmissions] = useState({});
  const [loading, setLoading] = useState(true);

  const [detailsAssignment, setDetailsAssignment] = useState(null);
  const [submitAssignment, setSubmitAssignment] = useState(null);
  const [viewFeedbackSubmission, setViewFeedbackSubmission] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    githubUrl: "",
    liveDemoUrl: "",
    notes: "",
  });

  const fetchStudentData = async () => {
    try {
      setLoading(true);

      const [adminRes, mentorRes, adminSubs, mentorSubs] =
        await Promise.allSettled([
          api.get("/assignments"),
          api.get("/assignments/student"),
          api.get("/submissions/my"),
          api.get("/mentor-assignment-submissions/my"),
        ]);

      let adminData = [];
      if (adminRes.status === "fulfilled") {
        adminData = (adminRes.value.data.assignments || []).map((a) => ({
          ...a,
          assignmentType: "admin",
        }));
      }

      let mentorData = [];
      if (mentorRes.status === "fulfilled") {
        mentorData = (mentorRes.value.data.assignments || []).map((a) => ({
          ...a,
          assignmentType: "mentor",
        }));
      }

      const subMap = {};

      if (adminSubs.status === "fulfilled") {
        (adminSubs.value.data.submissions || []).forEach((sub) => {
          const id =
            typeof sub.assignment === "object"
              ? sub.assignment._id
              : sub.assignment;

          subMap[id] = sub;
        });
      }

      if (mentorSubs.status === "fulfilled") {
        (mentorSubs.value.data.submissions || []).forEach((sub) => {
          const id =
            typeof sub.assignment === "object"
              ? sub.assignment._id
              : sub.assignment;

          subMap[id] = sub;
        });
      }

      setAssignments([...adminData, ...mentorData]);
      setMySubmissions(subMap);
    } catch {
      toast.error("Failed to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitAssignment) return;

    try {
      setSubmitting(true);

      const endpoint =
        submitAssignment.assignmentType === "mentor"
          ? "/mentor-assignment-submissions"
          : "/submissions";

      const res = await api.post(endpoint, {
        assignmentId: submitAssignment._id,
        githubUrl: submitForm.githubUrl,
        liveDemoUrl: submitForm.liveDemoUrl,
        notes: submitForm.notes,
      });

      toast.success("Assignment submitted successfully!");

      setSubmitAssignment(null);

      setMySubmissions((prev) => ({
        ...prev,
        [submitAssignment._id]: res.data.submission,
      }));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit assignment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openSubmitModal = (assignment) => {
    const existing = mySubmissions[assignment._id];
    setSubmitAssignment(assignment);
    setSubmitForm({
      githubUrl: existing?.githubUrl || "",
      liveDemoUrl: existing?.liveDemoUrl || "",
      notes: existing?.notes || "",
    });
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const isExpired = (date) => date && new Date(date).getTime() < Date.now();

  const getStatusBadge = (submission, deadline) => {
    if (!submission) {
      if (isExpired(deadline)) {
        return (
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
            Expired
          </span>
        );
      }
      return (
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          Active
        </span>
      );
    }

    if (submission.status === "Graded") {
      return (
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
          Graded
        </span>
      );
    }

    if (submission.status === "Resubmission Required") {
      return (
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
          Resubmit
        </span>
      );
    }

    return (
      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800">
        Submitted
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F8FA] p-4 sm:p-8 text-[#14222B]">
      {/* TOP HERO CONTAINER */}
      <div className="max-w-7xl mx-auto mb-8 bg-gradient-to-r from-[#1b3c47] via-[#0f2b34] to-[#071b23] rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A8CC]/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h6 className="text-3xl sm:text-4xl font-black tracking-tight">
              My Assignments
            </h6>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={fetchStudentData}
              disabled={loading}
              className="p-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl text-[#00A8CC] transition flex items-center justify-center border border-white/10 hover:translate-y-0.5"
              title="Refresh Assignments"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* ASSIGNMENT TABLE CONTAINER */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 shadow-sm border border-[#B4D7E2]/40 mb-10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[#030303] text-[12px] font-bold uppercase tracking-[0.2em]">
                <th className="px-6 pb-2">Title</th>
                <th className="px-6 pb-2">Instructor</th>
                <th className="px-6 pb-2">Lock Date</th>
                <th className="px-6 pb-2 text-center">Score</th>
                {/* 1. SEPARATED DETAILS COLUMN HEADER */}
                <th className="px-6 pb-2 text-center">Details</th>
                {/* 2. SEPARATED RESOURCES COLUMN HEADER */}
                <th className="px-6 pb-2 text-center">Resources</th>
                <th className="px-6 pb-2">Status</th>
                <th className="px-6 pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-20 text-center">
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
                    colSpan="8"
                    className="py-16 text-center text-[#8FA3B0] font-bold text-xs uppercase tracking-wider"
                  >
                    No assigned tasks yet.
                  </td>
                </tr>
              ) : (
                assignments.map((item) => {
                  const submission = mySubmissions[item._id];
                  return (
                    /* HOVER SINK ANIMATION: hover:translate-y-1 hover:shadow-md */
                    <tr
                      key={item._id}
                      className="group hover:translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] rounded-l-2xl border-l-[6px] border-[#00A8CC] transition-colors">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-[#14222B] leading-tight">
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-xs font-bold text-gray-600 transition-colors">
                        {item.instructorName || "Mentor/Admin"}
                      </td>
                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-xs font-bold text-[#14222B] transition-colors">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#8FA3B0]" />
                          {new Date(item.deadline).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-center text-xs font-black text-[#14222B] transition-colors">
                        {submission?.score !== undefined ? (
                          <span className="text-[#00A8CC]">
                            {submission.score} / {item.maxScore}
                          </span>
                        ) : (
                          <span>{item.maxScore}</span>
                        )}
                      </td>

                      {/* SEPARATED DETAILS COLUMN */}
                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-center transition-colors">
                        <button
                          onClick={() => setDetailsAssignment(item)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-[#00A8CC] hover:text-[#2b4f57] border border-[#00A8CC]/40 rounded-lg text-[10px] font-black uppercase tracking-wider transition hover:translate-y-0.5"
                        >
                          <FileText size={12} /> View Details
                        </button>
                      </td>

                      {/* SEPARATED RESOURCES COLUMN */}
                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] text-center transition-colors">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-[#3d5b6d] text-[#7292a5] hover:text-white border border-[#B4D7E2] rounded-lg text-[10px] font-black uppercase tracking-wider transition hover:translate-y-0.5"
                          >
                            <ExternalLink size={12} /> Resource
                          </a>
                        ) : (
                          <span className="text-[10px] font-bold text-[#8FA3B0]">
                            N/A
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] transition-colors">
                        {getStatusBadge(submission, item.deadline)}
                      </td>

                      <td className="px-6 py-4 bg-[#F4F8FA] group-hover:bg-[#e6f9fd] rounded-r-2xl text-right transition-colors">
                        <div className="flex items-center justify-end gap-2">
                          {submission?.feedback && (
                            <button
                              onClick={() =>
                                setViewFeedbackSubmission(submission)
                              }
                              className="p-2 bg-white hover:bg-[#c7e4f4] text-[#14222B] hover:text-white border border-[#B4D7E2] rounded-xl transition hover:translate-y-0.5"
                              title="View Feedback"
                            >
                              <MessageSquare size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => openSubmitModal(item)}
                            disabled={isExpired(item.deadline) && !submission}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 hover:translate-y-0.5 ${
                              submission
                                ? "bg-[#00A8CC] text-white shadow-md shadow-[#00A8CC]/20"
                                : isExpired(item.deadline)
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-[#7595a9] text-white hover:bg-[#315763]"
                            }`}
                          >
                            {submission ? "Update Work" : "Submit Work"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT SUBMISSION FORM MODAL */}
      {submitAssignment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#B4D7E2]/60">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F4F8FA]">
              <div>
                <h3 className="text-2xl font-black text-[#14222B]">
                  Submit Solution
                </h3>
                <p className="text-xs font-bold text-[#8FA3B0] mt-0.5">
                  {submitAssignment.title}
                </p>
              </div>
              <button
                onClick={() => setSubmitAssignment(null)}
                className="p-2 text-gray-400 hover:text-[#14222B] rounded-xl hover:bg-[#F4F8FA]"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <Code2
                    size={18}
                    className="absolute left-4 top-4 text-[#8FA3B0]"
                  />
                  <input
                    type="url"
                    placeholder="https://github.com/your-username/project-repo"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium outline-none transition"
                    value={submitForm.githubUrl}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        githubUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Live Demo URL (Optional)
                </label>
                <div className="relative">
                  <ExternalLink
                    size={18}
                    className="absolute left-4 top-4 text-[#8FA3B0]"
                  />
                  <input
                    type="url"
                    placeholder="https://your-app-demo.vercel.app"
                    className="w-full pl-12 pr-4 py-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium outline-none transition"
                    value={submitForm.liveDemoUrl}
                    onChange={(e) =>
                      setSubmitForm({
                        ...submitForm,
                        liveDemoUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0] mb-1 block">
                  Notes & Remarks
                </label>
                <textarea
                  placeholder="Mention features completed, implementation details, or notes for the reviewer..."
                  className="w-full p-4 bg-[#F4F8FA] border border-[#B4D7E2] focus:border-[#00A8CC] rounded-2xl text-sm font-medium h-28 outline-none transition resize-none"
                  value={submitForm.notes}
                  onChange={(e) =>
                    setSubmitForm({ ...submitForm, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#F4F8FA]">
                <button
                  type="button"
                  onClick={() => setSubmitAssignment(null)}
                  className="px-6 py-3 font-bold text-gray-400 hover:text-[#14222B] uppercase text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#00A8CC] hover:bg-[#0092b3] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00A8CC]/20 transition flex items-center justify-center min-w-[140px]"
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Confirm Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {detailsAssignment && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#e6f9fd] w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#00A8CC]/30">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 text-[#00A8CC] text-[10px] font-black uppercase tracking-widest mb-1">
                  <CheckCircle2 size={14} /> Assignment Details
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

            <div className="space-y-3 mb-4">
              {detailsAssignment.link && (
                <a
                  href={detailsAssignment.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-[#00A8CC] hover:underline bg-white/70 p-3 rounded-xl border border-[#00A8CC]/20"
                >
                  <ExternalLink size={15} /> View Reference Link
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MENTOR FEEDBACK MODAL */}
      {viewFeedbackSubmission && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#14222B]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#B4D7E2]/60">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-[#00A8CC] font-black text-xs uppercase tracking-widest">
                <Award size={18} /> Mentor Feedback & Grade
              </div>
              <button
                onClick={() => setViewFeedbackSubmission(null)}
                className="p-1.5 text-gray-400 hover:text-[#14222B] rounded-xl hover:bg-[#F4F8FA] transition"
              >
                <X size={20} />
              </button>
            </div>

            {viewFeedbackSubmission.score !== undefined && (
              <div className="p-4 mb-4 bg-[#F4F8FA] rounded-2xl flex items-center justify-between border border-[#B4D7E2]/40">
                <span className="text-xs font-bold text-[#8FA3B0] uppercase">
                  Assigned Score
                </span>
                <span className="text-lg font-black text-[#00A8CC]">
                  {viewFeedbackSubmission.score} Points
                </span>
              </div>
            )}

            <div className="p-5 bg-[#F4F8FA] rounded-2xl border-l-[6px] border-[#00A8CC] mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[#8FA3B0] mb-2">
                Feedback
              </p>
              <p className="text-sm text-[#14222B] font-medium italic">
                "{viewFeedbackSubmission.feedback}"
              </p>
            </div>

            <button
              onClick={() => setViewFeedbackSubmission(null)}
              className="w-full py-3 bg-[#9cb4c3] hover:bg-[#00A8CC] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition"
            >
              Close Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignment;
