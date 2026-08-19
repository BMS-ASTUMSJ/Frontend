import React, { useEffect, useState } from "react";
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

  
  const loadData = async () => {
    try {
      setLoading(true);

      const [assignmentsRes, submissionsRes] =
        await Promise.all([
          api.get("/assignments"),
          api.get("/submissions/my"),
        ]);

      setAssignments(
        assignmentsRes.data.assignments || []
      );

      setMySubmissions(
        submissionsRes.data.submissions || []
      );
    } catch (err) {
      console.error(
        "Failed to load assignment data:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Failed to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const getSubmission = (assignmentId) => {
    return mySubmissions.find((submission) => {
      const submissionAssignment =
        submission.assignment;

      if (
        submissionAssignment &&
        typeof submissionAssignment === "object"
      ) {
        return (
          submissionAssignment._id ===
          assignmentId
        );
      }

      return (
        submissionAssignment === assignmentId
      );
    });
  };


  const isExpired = (deadline) => {
    if (!deadline) return false;

    return new Date(deadline) < new Date();
  };


  const openSubmissionModal = (assignment) => {
    const submission = getSubmission(
      assignment._id
    );

    
    if (
      submission?.status ===
      "Resubmission Required"
    ) {
      setGithubUrl(
        submission.githubUrl || ""
      );

      setLiveDemoUrl(
        submission.liveDemoUrl || ""
      );

      setNotes(
        submission.notes || ""
      );
    } else {
      setGithubUrl("");
      setLiveDemoUrl("");
      setNotes("");
    }

    setSelectedId(assignment._id);
  };

  
  const closeModal = () => {
    if (submitting) return;

    setSelectedId(null);
    setGithubUrl("");
    setLiveDemoUrl("");
    setNotes("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      toast.error(
        "Please select an assignment."
      );
      return;
    }

    if (!githubUrl.trim()) {
      toast.error(
        "GitHub URL is required."
      );
      return;
    }

    const assignment = assignments.find(
      (asm) => asm._id === selectedId
    );

    if (!assignment) {
      toast.error(
        "Assignment could not be found."
      );
      return;
    }

    const existingSubmission =
      getSubmission(selectedId);

    const isResubmission =
      existingSubmission?.status ===
      "Resubmission Required";


    if (
      isExpired(assignment.deadline) &&
      !isResubmission
    ) {
      toast.error(
        "The deadline for this assignment has passed."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        assignmentId: selectedId,
        githubUrl: githubUrl.trim(),
        liveDemoUrl: liveDemoUrl.trim(),
        notes: notes.trim(),
      };

      const res = await api.post(
        "/submissions",
        payload
      );

      toast.success(
        res.data.message ||
          (isResubmission
            ? "Assignment resubmitted successfully!"
            : "Assignment submitted successfully!")
      );

      closeModal();

      await loadData();
    } catch (err) {
      console.error(
        "Submission error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Submission failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="font-semibold text-[#1A3D63]">
          Loading assignments...
        </div>
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-[#F6FAFD] p-6">
      <div className="mx-auto max-w-5xl">

    
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#0A1931]">
            Course Assignments
          </h2>

          <p className="mt-2 text-sm text-[#7A7F85]">
            View your assignments, submit your work,
            and check mentor feedback.
          </p>
        </div>

       
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-[#B3CFE5] bg-white p-10 text-center">

            <h3 className="text-lg font-bold text-[#0A1931]">
              No assignments available
            </h3>

            <p className="mt-2 text-sm text-[#7A7F85]">
              There are currently no assignments
              available for you.
            </p>

          </div>
        ) : (

          <div className="space-y-5">

            {assignments.map((asm) => {
              const submission =
                getSubmission(asm._id);

              const status =
                submission?.status || null;

              const canResubmit =
                status ===
                "Resubmission Required";

              const isGraded =
                status === "Graded";

              const isPending =
                status === "Pending";

              const expired =
                isExpired(asm.deadline);

              return (
                <div
                  key={asm._id}
                  className="rounded-2xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col justify-between gap-5 md:flex-row">

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-xl font-bold text-[#0A1931]">
                          {asm.title}
                        </h3>

                        {/* SUBMISSION STATUS */}
                        {status && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              isGraded
                                ? "bg-green-100 text-green-700"
                                : canResubmit
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {status}
                          </span>
                        )}

                      </div>

                      <p className="my-3 leading-relaxed text-[#7A7F85]">
                        {asm.description ||
                          "No description provided."}
                      </p>

                      {/* DEADLINE */}
                      {asm.deadline && (
                        <p
                          className={`text-sm font-semibold ${
                            expired
                              ? "text-red-600"
                              : "text-[#4A7FA7]"
                          }`}
                        >
                          Deadline:{" "}
                          {new Date(
                            asm.deadline
                          ).toLocaleString()}
                          {expired &&
                            " — Expired"}
                        </p>
                      )}

                      {/* MAX SCORE */}
                      {asm.maxScore !==
                        undefined && (
                        <p className="mt-1 text-sm text-[#7A7F85]">
                          Maximum Score:{" "}
                          {asm.maxScore}
                        </p>
                      )}

                    </div>

                   
                    <div className="flex items-start">

                      {/* NEVER SUBMITTED */}
                      {!submission && (
                        <button
                          type="button"
                          onClick={() =>
                            openSubmissionModal(
                              asm
                            )
                          }
                          disabled={expired}
                          className="rounded-xl bg-[#1A3D63] px-5 py-3 font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-300"
                        >
                          {expired
                            ? "Deadline Passed"
                            : "Submit Work"}
                        </button>
                      )}

                      {/* PENDING */}
                      {isPending && (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-xl bg-gray-300 px-5 py-3 font-semibold text-gray-600"
                        >
                          Submitted
                        </button>
                      )}

                      {/* GRADED */}
                      {isGraded && (
                        <button
                          type="button"
                          disabled
                          className="cursor-not-allowed rounded-xl bg-green-100 px-5 py-3 font-semibold text-green-700"
                        >
                          Graded
                        </button>
                      )}

                      {/* RESUBMISSION */}
                      {canResubmit && (
                        <button
                          type="button"
                          onClick={() =>
                            openSubmissionModal(
                              asm
                            )
                          }
                          className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-700"
                        >
                          Resubmit Work
                        </button>
                      )}

                    </div>
                  </div>

                  {submission && (
                    <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

                      <p className="text-sm font-bold text-[#1A3D63]">
                        Submission Status:{" "}
                        {submission.status}
                      </p>

                      {/* GITHUB */}
                      {submission.githubUrl && (
                        <a
                          href={
                            submission.githubUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                        >
                          View GitHub Repository
                        </a>
                      )}

                      {/* LIVE DEMO */}
                      {submission.liveDemoUrl && (
                        <a
                          href={
                            submission.liveDemoUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-sm text-blue-600 hover:underline"
                        >
                          View Live Demo
                        </a>
                      )}

                      {/* NOTES */}
                      {submission.notes && (
                        <p className="mt-3 text-sm text-[#7A7F85]">
                          <strong>
                            Your notes:
                          </strong>{" "}
                          {submission.notes}
                        </p>
                      )}

                    </div>
                  )}

                  {canResubmit && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

                      <p className="font-bold text-red-700">
                        Resubmission requested
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        Your mentor has requested
                        changes to your submission.
                        Update your project and
                        submit it again.
                      </p>

                      {/* MENTOR FEEDBACK */}
                      {submission.feedback && (
                        <div className="mt-3 rounded-lg bg-white p-3">

                          <p className="text-xs font-bold text-gray-500">
                            Mentor Feedback
                          </p>

                          <p className="mt-1 text-sm text-gray-800">
                            {submission.feedback}
                          </p>

                        </div>
                      )}

                    </div>
                  )}

                
                  {isGraded && (
                    <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

                      <p className="font-bold text-green-700">
                        Grade:{" "}
                        {submission.score} /{" "}
                        {asm.maxScore}
                      </p>

                      {submission.feedback && (
                        <p className="mt-2 text-sm italic text-green-800">
                          "{submission.feedback}"
                        </p>
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}
      </div>

      
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >

            {/* TITLE */}
            <h3 className="mb-2 text-xl font-bold text-[#0A1931]">
              {getSubmission(selectedId)
                ?.status ===
              "Resubmission Required"
                ? "Resubmit Assignment"
                : "Submit Assignment"}
            </h3>

            <p className="mb-5 text-sm text-[#7A7F85]">
              {getSubmission(selectedId)
                ?.status ===
              "Resubmission Required"
                ? "Update your project and submit it again for mentor review."
                : "Provide the links to your project."}
            </p>

            {/* GITHUB */}
            <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
              GitHub Repository *
            </label>

            <input
              type="url"
              placeholder="https://github.com/user/repository"
              className="mb-4 w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
              value={githubUrl}
              onChange={(e) =>
                setGithubUrl(e.target.value)
              }
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
              className="mb-4 w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
              value={liveDemoUrl}
              onChange={(e) =>
                setLiveDemoUrl(e.target.value)
              }
              disabled={submitting}
            />

            {/* NOTES */}
            <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
              Notes
            </label>

            <textarea
              placeholder="Add any notes for your mentor..."
              className="mb-5 h-24 w-full resize-none rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#1A3D63]"
              value={notes}
              onChange={(e) =>
                setNotes(e.target.value)
              }
              disabled={submitting}
            />

            {/* BUTTONS */}
            <div className="flex gap-3">

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#1A3D63] py-3 font-semibold text-white transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Submitting..."
                  : getSubmission(selectedId)
                      ?.status ===
                    "Resubmission Required"
                  ? "Resubmit"
                  : "Submit"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="flex-1 rounded-xl bg-gray-100 py-3 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
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