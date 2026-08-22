import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";
import {
  Users,
  UserPlus,
  Loader2,
  UserRound,
  Pencil,
  Trash2,
  X,
  Sparkles,
  CheckCircle2,
  Layers,
  Search,
  ShieldCheck,
  GraduationCap,
  RotateCcw,
  Check,
  AlertCircle,
  UserCheck,
  PlusCircle,
  ChevronDown,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);

  const [deleteTeam, setDeleteTeam] = useState(null);

  // Form State
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [batch, setBatch] = useState("");
  const [mentor1, setMentor1] = useState("");
  const [mentor2, setMentor2] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Modals & Search
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        teamsResponse,
        studentsResponse,
        mentorsResponse,
        batchesResponse,
      ] = await Promise.all([
        api.get("/teams"),
        api.get("/users/students"),
        api.get("/users/mentors"),
        api.get("/batches"),
      ]);

      setTeams(teamsResponse.data?.teams || []);
      setStudents(studentsResponse.data?.students || []);
      setMentors(mentorsResponse.data?.mentors || []);
      setBatches(batchesResponse.data?.batches || []);
    } catch (error) {
      console.error("Fetch team data error:", error);
      toast.error(error.response?.data?.message || "Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // HELPERS & FILTERING
  // ============================================================

  const getBatchId = (studentBatch) => {
    if (!studentBatch) return "";
    if (typeof studentBatch === "string") return studentBatch;
    if (typeof studentBatch === "object") return studentBatch._id || "";
    return "";
  };

  const filteredMentors = useMemo(() => {
    return mentors.filter(
      (mentor) =>
        mentor.gender?.toLowerCase() === gender?.toLowerCase() &&
        mentor.status?.toLowerCase() === "approved"
    );
  }, [mentors, gender]);

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const studentBatchId = getBatchId(student.batch);
      const sameGender = student.gender?.toLowerCase() === gender?.toLowerCase();
      const approved = student.status?.toLowerCase() === "approved";
      const sameBatch = studentBatchId.toString() === batch.toString();
      const alreadySelected = selectedStudents.includes(student._id);

      const belongsToCurrentTeam = teams.some(
        (team) =>
          team._id === editingTeamId &&
          team.students?.some((teamStudent) => teamStudent._id === student._id)
      );

      const matchesSearch =
        !studentSearch ||
        `${student.firstName} ${student.lastName} ${student.schoolId || ""} ${student.department || ""}`
          .toLowerCase()
          .includes(studentSearch.toLowerCase());

      return (
        sameGender &&
        approved &&
        sameBatch &&
        (!student.teamId || alreadySelected || belongsToCurrentTeam) &&
        matchesSearch
      );
    });
  }, [students, gender, batch, selectedStudents, teams, editingTeamId, studentSearch]);

  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) return teams;
    const term = teamSearch.toLowerCase();
    return teams.filter(
      (team) =>
        team.name?.toLowerCase().includes(term) ||
        team.batch?.name?.toLowerCase().includes(term) ||
        team.gender?.toLowerCase().includes(term) ||
        team.mentors?.some((m) =>
          `${m.firstName} ${m.lastName}`.toLowerCase().includes(term)
        )
    );
  }, [teams, teamSearch]);

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    setName("");
    setGender("");
    setBatch("");
    setMentor1("");
    setMentor2("");
    setSelectedStudents([]);
    setStudentSearch("");
    setIsEditing(false);
    setEditingTeamId(null);
    setIsStudentModalOpen(false);
  };

  // ============================================================
  // FORM HANDLERS
  // ============================================================

  const handleGenderChange = (value) => {
    setGender(value);
    setMentor1("");
    setMentor2("");
    setSelectedStudents([]);
  };

  const handleBatchChange = (value) => {
    setBatch(value);
    setSelectedStudents([]);
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    const allFilteredIds = filteredStudents.map((s) => s._id);
    const areAllSelected = allFilteredIds.every((id) =>
      selectedStudents.includes(id)
    );

    if (areAllSelected) {
      setSelectedStudents((prev) =>
        prev.filter((id) => !allFilteredIds.includes(id))
      );
    } else {
      setSelectedStudents((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  // ============================================================
  // SAVE TEAM
  // ============================================================

  const handleSaveTeam = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Team name is required.");
      return;
    }

    if (!gender) {
      toast.error("Please select a team gender.");
      return;
    }

    if (!batch) {
      toast.error("Please select a batch.");
      return;
    }

    if (!mentor1 || !mentor2) {
      toast.error("Please select exactly 2 mentors.");
      return;
    }

    if (mentor1 === mentor2) {
      toast.error("The two mentors must be different.");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),
        gender,
        batch,
        mentorIds: [mentor1, mentor2],
        studentIds: selectedStudents,
      };

      let response;

      if (isEditing) {
        response = await api.put(`/teams/${editingTeamId}`, payload);
      } else {
        response = await api.post("/teams", payload);
      }

      toast.success(
        response.data?.message ||
          (isEditing
            ? "Team updated successfully."
            : "Team created successfully.")
      );

      resetForm();
      await fetchData();
    } catch (error) {
      console.error(
        isEditing ? "Update team error:" : "Create team error:",
        error
      );
      toast.error(
        error.response?.data?.message ||
          (isEditing ? "Failed to update team." : "Failed to create team.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT & DELETE
  // ============================================================

  const handleEditTeam = (team) => {
    setIsEditing(true);
    setEditingTeamId(team._id);

    setName(team.name || "");
    setGender(team.gender || "");
    setBatch(
      typeof team.batch === "object" ? team.batch?._id || "" : team.batch || ""
    );
    setMentor1(team.mentors?.[0]?._id || "");
    setMentor2(team.mentors?.[1]?._id || "");
    setSelectedStudents(team.students?.map((student) => student._id) || []);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDeleteTeam = (team) => {
    setDeleteTeam(team);
  };

  const confirmDeleteTeam = async () => {
    if (!deleteTeam) return;

    try {
      setDeleting(deleteTeam._id);
      const response = await api.delete(`/teams/${deleteTeam._id}`);
      toast.success(response.data?.message || "Team deleted successfully.");

      if (editingTeamId === deleteTeam._id) {
        resetForm();
      }

      setTeams((previous) =>
        previous.filter((team) => team._id !== deleteTeam._id)
      );
      setDeleteTeam(null);
    } catch (error) {
      console.error("Delete team error:", error);
      toast.error(error.response?.data?.message || "Failed to delete team.");
    } finally {
      setDeleting("");
    }
  };

  // Selected Objects
  const selectedBatchObj = batches.find((b) => b._id === batch);
  const selectedStudentObjects = students.filter((s) =>
    selectedStudents.includes(s._id)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] to-[#F7C9A4]">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <Loader2 className="h-9 w-9 animate-spin text-[#DE7E4A]" />
          <p className="text-sm font-bold text-[#173854]">Loading Team Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            background: "#FAF4EB",
            color: "#16344E",
            border: "1px solid #E8DCB8",
            fontWeight: "600",
          },
        }}
      />

      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .modal-enter { animation: modalEnter 0.22s cubic-bezier(.2,.8,.2,1) both; }
        .smooth-transition { transition: all 220ms ease; }
        
        .hide-scrollbar::-webkit-scrollbar { height: 6px; }
        .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: rgba(226, 109, 44, 0.3); border-radius: 999px; }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Glow Lights */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        <div className="page-enter relative z-10 mx-auto max-w-[1500px] space-y-8">

          {/* ======================================================
              1. TOP HEADER BANNER
          ====================================================== */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <Users size={28} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-[#F38744]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Administration
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Team Management
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Architect balanced teams, assign specialized mentors, and manage student rosters.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-white shadow-lg backdrop-blur-md">
                  <Layers size={18} className="text-[#F38744]" />
                  <span className="text-sm font-bold">
                    {teams.length} Active Team{teams.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ======================================================
              2. CREATE / UPDATE TEAM BUILDER PANEL
          ====================================================== */}
          <div className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">

            {/* Panel Top Header */}
            <div className="border-b border-[#EBDCC8] bg-[#F5ECE0]/80 px-6 py-5 md:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDE2D2] text-[#E26D2C] shadow-sm">
                    {isEditing ? <Pencil size={20} /> : <UserPlus size={20} />}
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#16344E]">
                      {isEditing ? `Update Team: ${name || "Untitled"}` : "Create New Team"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Configure batch, allocate 2 distinct mentors, and select student members.
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center gap-1.5 rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] px-3.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-[#E5D7C4]"
                  >
                    <X size={14} />
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveTeam} className="p-6 md:p-8 space-y-7">

              {/* ROW 1: BASIC TEAM INFO */}
              <div className="grid gap-5 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Team Name <span className="text-[#E26D2C]">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter team name"
                    disabled={saving}
                    className="h-13 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] placeholder-slate-400 outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Team Gender <span className="text-[#E26D2C]">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => handleGenderChange(e.target.value)}
                    disabled={saving}
                    className="h-13 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                  >
                    <option value="">Select team gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#16344E]">
                    Batch Cohort <span className="text-[#E26D2C]">*</span>
                  </label>
                  <select
                    value={batch}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    disabled={saving}
                    className="h-13 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15"
                  >
                    <option value="">Select batch</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ROW 2: 2 MENTORS ALLOCATION */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#16344E]">
                      First Mentor <span className="text-[#E26D2C]">*</span>
                    </label>
                    {gender && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {filteredMentors.length} approved {gender.toLowerCase()} mentors
                      </span>
                    )}
                  </div>
                  <select
                    value={mentor1}
                    onChange={(e) => setMentor1(e.target.value)}
                    disabled={!gender || saving}
                    className="h-13 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15 disabled:opacity-50"
                  >
                    <option value="">
                      {gender ? "Select first mentor" : "Select gender first"}
                    </option>
                    {filteredMentors.map((m) => (
                      <option key={m._id} value={m._id} disabled={m._id === mentor2}>
                        {m.firstName} {m.lastName} {m._id === mentor2 ? "(Selected as Mentor 2)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#16344E]">
                      Second Mentor <span className="text-[#E26D2C]">*</span>
                    </label>
                    {gender && (
                      <span className="text-[10px] font-semibold text-slate-500">
                        Must be different mentor
                      </span>
                    )}
                  </div>
                  <select
                    value={mentor2}
                    onChange={(e) => setMentor2(e.target.value)}
                    disabled={!gender || saving}
                    className="h-13 w-full rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/90 px-4 py-3 text-sm font-semibold text-[#16344E] outline-none transition focus:border-[#E26D2C] focus:bg-[#FFFDF9] focus:ring-4 focus:ring-[#E26D2C]/15 disabled:opacity-50"
                  >
                    <option value="">
                      {gender ? "Select second mentor" : "Select gender first"}
                    </option>
                    {filteredMentors.map((m) => (
                      <option key={m._id} value={m._id} disabled={m._id === mentor1}>
                        {m.firstName} {m.lastName} {m._id === mentor1 ? "(Selected as Mentor 1)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ======================================================
                  ROW 3: THE DEDICATED "CHOOSE STUDENTS" BUTTON & ROSTER
              ====================================================== */}
              <div className="rounded-2xl border border-[#EBDCC8] bg-[#F5ECE0]/60 p-5 space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[#16344E]">
                      Students Assignment <span className="text-[#E26D2C]">*</span>
                    </label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Click the button below to browse and assign approved students to this team.
                    </p>
                  </div>

                  {/* THE CHOOSE STUDENTS BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!gender) {
                        toast.error("Please select a team gender first.");
                        return;
                      }
                      if (!batch) {
                        toast.error("Please select a batch first.");
                        return;
                      }
                      setIsStudentModalOpen(true);
                    }}
                    className="smooth-transition inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#173854] to-[#224A6D] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <UserPlus size={15} className="text-[#F38744]" />
                    <span>Choose Students</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black">
                      {selectedStudents.length} Selected
                    </span>
                  </button>
                </div>

                {/* SELECTED STUDENTS TAGS PREVIEW */}
                {selectedStudents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#DFCBB5] bg-[#FAF4EB]/80 p-5 text-center text-xs font-semibold text-slate-500">
                    {!gender
                      ? "Select a team gender first."
                      : !batch
                      ? "Select a batch first."
                      : "No students chosen yet. Click 'Choose Students' to assign members."}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                      <span>Currently Assigned Roster ({selectedStudents.length} students):</span>
                      <button
                        type="button"
                        onClick={() => setSelectedStudents([])}
                        className="text-rose-600 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                      {selectedStudentObjects.map((s) => (
                        <span
                          key={s._id}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] py-1.5 pl-3 pr-2 text-xs font-bold text-[#16344E] shadow-sm"
                        >
                          <span>{s.firstName} {s.lastName}</span>
                          <button
                            type="button"
                            onClick={() => handleStudentToggle(s._id)}
                            className="rounded-lg p-0.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Remove student"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* FORM ACTION BUTTONS */}
              <div className="flex flex-col gap-3 border-t border-[#EBDCC8] pt-6 sm:flex-row sm:justify-end">
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={saving}
                    className="rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] px-6 py-3.5 text-sm font-bold text-[#16344E] transition hover:bg-[#E5D7C4]"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !name.trim() ||
                    !gender ||
                    !batch ||
                    !mentor1 ||
                    !mentor2 ||
                    mentor1 === mentor2 ||
                    selectedStudents.length === 0
                  }
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-9 py-3.5 text-sm font-black text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isEditing ? "Updating Team..." : "Creating Team..."}
                    </>
                  ) : (
                    <>
                      {isEditing ? <Pencil size={16} /> : <Users size={16} />}
                      {isEditing ? "Update Team" : "Save Team"}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ======================================================
              3. EXISTING TEAMS DIRECTORY TABLE (REPLACING CARDS)
          ====================================================== */}
          <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">

            {/* Table Header Top Bar */}
            <div className="flex flex-col justify-between gap-4 border-b border-[#EBDCC8] px-6 py-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-black text-[#16344E]">
                  Existing Teams Directory
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {teams.length} team{teams.length !== 1 ? "s" : ""} configured across cohorts
                </p>
              </div>

              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  placeholder="Search teams, mentors, batch..."
                  className="h-10.5 w-full rounded-xl border border-[#DFCBB5] bg-[#F5ECE0]/90 pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                />
              </div>
            </div>

            {/* Table */}
            {filteredTeams.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                <h3 className="mt-4 text-base font-black text-[#16344E]">No teams found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {teamSearch ? "No teams matched your filter search." : "Create your first team using the form above."}
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95 text-left">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Team Info
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Gender
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Batch
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Assigned Mentors
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Assigned Students
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTeams.map((team, index) => (
                      <tr
                        key={team._id}
                        className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                      >
                        {/* TEAM INFO */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-sm font-black text-[#173854]">
                              {team.name?.charAt(0)?.toUpperCase() || "T"}
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#16344E]">
                                {team.name}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500">
                                {team.students?.length || 0} student members
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* GENDER */}
                        <td className="px-5 py-4.5">
                          <span className="inline-flex rounded-lg border border-[#FDE2D2] bg-[#FDE2D2] px-2.5 py-1 text-xs font-bold text-[#E26D2C]">
                            {team.gender || "—"}
                          </span>
                        </td>

                        {/* BATCH */}
                        <td className="px-5 py-4.5">
                          <span className="inline-flex rounded-lg border border-[#EBDCC8] bg-[#FAF4EB] px-2.5 py-1 text-xs font-bold text-[#173854]">
                            {team.batch?.name || "Unknown"}
                          </span>
                        </td>

                        {/* MENTORS */}
                        <td className="px-5 py-4.5">
                          <div className="space-y-1.5 max-w-xs">
                            {team.mentors?.length ? (
                              team.mentors.map((m) => (
                                <div key={m._id} className="flex items-center gap-2">
                                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#173854] text-[9px] text-white">
                                    {m.firstName?.charAt(0)}
                                  </div>
                                  <span className="truncate text-xs font-bold text-[#16344E]">
                                    {m.firstName} {m.lastName}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No mentors</span>
                            )}
                          </div>
                        </td>

                        {/* STUDENTS */}
                        <td className="px-5 py-4.5">
                          <div className="flex flex-wrap gap-1.5 max-w-md max-h-20 overflow-y-auto">
                            {team.students?.length ? (
                              team.students.map((s) => (
                                <span
                                  key={s._id}
                                  className="inline-flex rounded-lg border border-[#DFCBB5] bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-semibold text-[#16344E]"
                                >
                                  {s.firstName} {s.lastName}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">No students assigned</span>
                            )}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditTeam(team)}
                              className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] p-2 text-[#173854] transition hover:bg-[#FFFDF9]"
                              title="Edit Team"
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team)}
                              className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
                              title="Delete Team"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ========================================================
          STUDENT SELECTOR MODAL (Creamy Glass)
      ======================================================== */}
      {isStudentModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsStudentModalOpen(false);
          }}
        >
          <div className="modal-enter flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
            
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-[#EBDCC8] bg-[#F5ECE0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#16344E]">
                    Select Team Students
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cohort: {selectedBatchObj?.name} • Gender: {gender}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Search Bar & Actions */}
            <div className="flex flex-col gap-3 border-b border-[#EBDCC8] bg-[#FAF4EB] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students by name, ID, department..."
                  className="h-10 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllStudents}
                  className="rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-4 py-2 text-xs font-bold text-[#16344E] transition hover:bg-[#E5D7C4]"
                >
                  Toggle All Visible
                </button>
                <span className="rounded-xl bg-[#E0F0FA] px-3 py-2 text-xs font-black text-[#173854]">
                  {selectedStudents.length} Selected
                </span>
              </div>
            </div>

            {/* Students Checkable Grid */}
            <div className="overflow-y-auto p-5">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-500">
                  No candidate students match this search.
                </div>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.includes(student._id);
                    return (
                      <label
                        key={student._id}
                        className={`smooth-transition flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 ${
                          isSelected
                            ? "border-[#E26D2C] bg-[#FFFDF9] shadow-sm"
                            : "border-[#EBDCC8] bg-[#F5ECE0]/50 hover:bg-[#FFFDF9]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                              isSelected
                                ? "bg-[#E26D2C] text-white"
                                : "bg-[#E0F0FA] text-[#173854]"
                            }`}
                          >
                            {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-[#16344E]">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {student.schoolId || student.department || "Approved Candidate"}
                            </p>
                          </div>
                        </div>

                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleStudentToggle(student._id)}
                          className="h-4.5 w-4.5 rounded text-[#E26D2C] focus:ring-[#E26D2C]"
                        />
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Bottom Footer */}
            <div className="flex items-center justify-between border-t border-[#EBDCC8] bg-[#F5ECE0] p-4.5">
              <span className="text-xs font-bold text-slate-600">
                {selectedStudents.length} total students assigned
              </span>

              <button
                type="button"
                onClick={() => setIsStudentModalOpen(false)}
                className="rounded-xl bg-gradient-to-r from-[#173854] to-[#224A6D] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg"
              >
                Done / Confirm
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          DELETE CONFIRMATION MODAL (Creamy Glass)
      ======================================================== */}
      {deleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/45 px-4 backdrop-blur-md">
          <div className="modal-enter w-full max-w-sm overflow-hidden rounded-[28px] border border-[#E8DCB8] bg-[#FAF4EB] p-6 shadow-[0_25px_70px_rgba(0,0,0,0.25)]">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <Trash2 size={20} />
                </div>
                <div>
                  <h3 className="font-black text-[#16344E]">Delete Team</h3>
                  <p className="text-xs text-slate-500">Irreversible operation</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-[#E5D7C4]"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mb-6 text-sm leading-relaxed text-slate-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-black text-[#16344E]">{deleteTeam.name}</span>? All student assignments will be reset.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                disabled={deleting === deleteTeam._id}
                className="flex-1 rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0] py-3 text-sm font-bold text-slate-700 transition hover:bg-[#E5D7C4]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteTeam}
                disabled={deleting === deleteTeam._id}
                className="flex-1 rounded-2xl bg-rose-600 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting === deleteTeam._id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete Team"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TeamManagement;