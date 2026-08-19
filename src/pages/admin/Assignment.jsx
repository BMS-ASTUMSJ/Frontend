import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  ClipboardList,
  PlusCircle,
  Calendar,
  Trophy,
  FileText,
  Trash2,
  Loader2,
  Clock,
  Users,
} from "lucide-react";

const AdminAssignment = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    maxScore: 100,
  });

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ======================================================
  // FETCH ASSIGNMENTS
  // ======================================================
  const fetchAssignments = async () => {
    try {
      setLoading(true);

      const res = await api.get("/assignments");

      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error("FETCH ASSIGNMENTS ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to load assignments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Assignment title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Assignment description is required");
      return;
    }

    if (!formData.deadline) {
      toast.error("Deadline is required");
      return;
    }

    if (Number(formData.maxScore) <= 0) {
      toast.error("Maximum score must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);

  
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        deadline: formData.deadline,
        maxScore: Number(formData.maxScore),
      };

      await api.post("/assignments", payload);

      toast.success("Assignment published successfully");

      setFormData({
        title: "",
        description: "",
        deadline: "",
        maxScore: 100,
      });

      await fetchAssignments();
    } catch (err) {
      console.error("CREATE ASSIGNMENT ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to publish assignment"
      );
    } finally {
      setSubmitting(false);
    }
  };

 
  const handleDelete = async (id) => {
    if (!id) return;

    try {
      await api.delete(`/assignments/${id}`);

      toast.success("Assignment deleted successfully");

      await fetchAssignments();
    } catch (err) {
      console.error("DELETE ASSIGNMENT ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Failed to delete assignment"
      );
    }
  };


  const getBatchName = (assignment) => {
    if (!assignment?.batch) {
      return "No batch";
    }

    if (typeof assignment.batch === "object") {
      return assignment.batch.name || "Unknown batch";
    }

    return "Unknown batch";
  };

  
  const isExpired = (deadline) => {
    if (!deadline) return false;

    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">

       
        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#0A1931] p-8 text-white shadow-lg md:flex-row md:items-center">

          <div className="flex items-center gap-5">

            <div className="rounded-2xl bg-[#1A3D63] p-4">
              <ClipboardList
                size={32}
                className="text-[#B3CFE5]"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                Assignment Management
              </h1>

              <p className="mt-1 text-sm text-[#B3CFE5]">
                Create and track student projects and deadlines.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-3">

            <Trophy
              size={20}
              className="text-yellow-400"
            />

            <span className="text-lg font-semibold">
              {assignments.length} Assignment
              {assignments.length !== 1 ? "s" : ""}
            </span>

          </div>
        </div>

     
        <div className="grid gap-8 lg:grid-cols-5">

          
          <div className="lg:col-span-2">

            <form
              onSubmit={handleSubmit}
              className="sticky top-8 space-y-5 rounded-3xl border border-[#B3CFE5] bg-white p-8 shadow-sm"
            >

              <div className="mb-2 flex items-center gap-3">

                <div className="rounded-xl bg-[#EAF3F9] p-2">
                  <PlusCircle
                    size={20}
                    className="text-[#1A3D63]"
                  />
                </div>

                <h2 className="text-xl font-bold text-[#0A1931]">
                  New Assignment
                </h2>

              </div>

              <div className="space-y-4">

                {/* TITLE */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                    Project Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. React & Tailwind Portfolio"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                    Instructions
                  </label>

                  <textarea
                    name="description"
                    placeholder="Provide detailed project requirements..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                    className="h-32 w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                {/* ACTIVE BATCH INFO */}
                <div className="rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">

                  <div className="flex items-center gap-2">

                    <Users
                      size={18}
                      className="text-[#1A3D63]"
                    />

                    <span className="text-sm font-bold text-[#0A1931]">
                      Assignment Batch
                    </span>

                  </div>

                  <p className="mt-2 text-xs text-[#7A7F85]">
                    This assignment will automatically be
                    assigned to the currently active batch.
                  </p>

                </div>

           
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                      Deadline
                    </label>

                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-[#0A1931]">
                      Points
                    </label>

                    <input
                      type="number"
                      name="maxScore"
                      min="1"
                      value={formData.maxScore}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none transition focus:border-[#1A3D63]"
                    />
                  </div>

                </div>

               
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1A3D63] py-4 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#0A1931] disabled:cursor-not-allowed disabled:bg-gray-400"
                >

                  {submitting ? (
                    <>
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />

                      Publishing...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />

                      Publish Assignment
                    </>
                  )}

                </button>

              </div>
            </form>

          </div>

       
          <div className="space-y-4 lg:col-span-3">

            <h2 className="flex items-center gap-2 px-2 text-xl font-bold text-[#0A1931]">

              <Clock
                size={20}
                className="text-[#4A7FA7]"
              />

              Recent Assignments

            </h2>

           
            {loading ? (

              <div className="flex h-64 items-center justify-center rounded-3xl border border-[#B3CFE5] bg-white">

                <Loader2
                  className="h-8 w-8 animate-spin text-[#1A3D63]"
                />

              </div>

            ) : assignments.length === 0 ? (

              <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-12 text-center">

                <FileText
                  size={48}
                  className="mx-auto mb-4 text-[#B3CFE5]"
                />

                <p className="font-semibold text-[#0A1931]">
                  No assignments yet.
                </p>

                <p className="text-sm text-[#7A7F85]">
                  Start by filling out the form on the left.
                </p>

              </div>

            ) : (

            
              assignments.map((assignment) => {

                const expired = isExpired(
                  assignment.deadline
                );

                return (
                  <div
                    key={assignment._id}
                    className="group relative rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0 space-y-3">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                              expired
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {expired ? "Expired" : "Live"}
                          </span>

                          <h3 className="text-lg font-bold text-[#0A1931]">
                            {assignment.title}
                          </h3>

                        </div>

                        <p className="line-clamp-2 max-w-md text-sm text-[#7A7F85]">
                          {assignment.description}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">

                          {/* BATCH */}
                          <div className="flex items-center gap-2 rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#1A3D63]">

                            <Users size={14} />

                            {getBatchName(assignment)}

                          </div>

                          {/* DEADLINE */}
                          <div className="flex items-center gap-2 rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#1A3D63]">

                            <Calendar size={14} />

                            Due:{" "}
                            {new Date(
                              assignment.deadline
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}

                          </div>

                          {/* SCORE */}
                          <div className="flex items-center gap-2 rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#4A7FA7]">

                            <Trophy size={14} />

                            Max: {assignment.maxScore} pts

                          </div>

                        </div>

                      </div>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(assignment._id)
                        }
                        className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete assignment"
                      >
                        <Trash2 size={20} />
                      </button>

                    </div>

                  </div>
                );
              })
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAssignment;