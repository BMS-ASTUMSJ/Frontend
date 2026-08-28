import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Users,
  UserPlus,
  Loader2,
  UserRound,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  UsersRound,
  UserCheck,
  GraduationCap,
} from "lucide-react";
import { toast } from "react-hot-toast";

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

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [batch, setBatch] = useState("");

  const [mentor1, setMentor1] = useState("");
  const [mentor2, setMentor2] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  const inputClass =
    "w-full rounded-xl border border-[#D9E4EA] bg-[#F7FAFC] px-3.5 py-2.5 text-sm text-[#14222B] outline-none transition placeholder:text-[#9AAAB4] focus:border-[#00A8CC] focus:bg-white focus:ring-4 focus:ring-[#00A8CC]/10 disabled:cursor-not-allowed disabled:opacity-60";

  const labelClass =
    "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#14222B]";

  const cardClass =
    "rounded-2xl border border-[#DCE7EC] bg-white shadow-[0_2px_8px_rgba(20,34,43,0.035)]";

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

  const getBatchId = (studentBatch) => {
    if (!studentBatch) return "";

    if (typeof studentBatch === "string") {
      return studentBatch;
    }

    if (typeof studentBatch === "object") {
      return studentBatch._id || "";
    }

    return "";
  };

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.gender?.toLowerCase() === gender?.toLowerCase() &&
      mentor.status?.toLowerCase() === "approved",
  );

  const filteredStudents = students.filter((student) => {
    const studentBatchId = getBatchId(student.batch);

    const sameGender = student.gender?.toLowerCase() === gender?.toLowerCase();

    const approved = student.status?.toLowerCase() === "approved";

    const sameBatch = studentBatchId.toString() === batch.toString();

    const alreadySelected = selectedStudents.includes(student._id);

    const belongsToCurrentTeam = teams.some(
      (team) =>
        team._id === editingTeamId &&
        team.students?.some((teamStudent) => teamStudent._id === student._id),
    );

    return (
      sameGender &&
      approved &&
      sameBatch &&
      (!student.teamId || alreadySelected || belongsToCurrentTeam)
    );
  });

  const resetForm = () => {
    setName("");
    setGender("");
    setBatch("");
    setMentor1("");
    setMentor2("");
    setSelectedStudents([]);

    setIsEditing(false);
    setEditingTeamId(null);
  };

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

  const handleStudentChange = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter((id) => id !== studentId);
      }

      return [...previous, studentId];
    });
  };

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
            : "Team created successfully."),
      );

      resetForm();
      await fetchData();
    } catch (error) {
      console.error(
        isEditing ? "Update team error:" : "Create team error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          (isEditing ? "Failed to update team." : "Failed to create team."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditTeam = (team) => {
    setIsEditing(true);
    setEditingTeamId(team._id);

    setName(team.name || "");
    setGender(team.gender || "");

    setBatch(
      typeof team.batch === "object" ? team.batch?._id || "" : team.batch || "",
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
        previous.filter((team) => team._id !== deleteTeam._id),
      );

      setDeleteTeam(null);
    } catch (error) {
      console.error("Delete team error:", error);

      toast.error(error.response?.data?.message || "Failed to delete team.");
    } finally {
      setDeleting("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAFC]">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
              <Loader2 className="h-6 w-6 animate-spin text-[#00A8CC]" />
            </div>

            <div className="text-center">
              <p className="font-bold text-[#14222B]">
                Loading Team Management
              </p>

              <p className="mt-1 text-xs text-[#71838E]">
                Loading teams, mentors and students...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <header className="mx-3 mt-4 lg:mx-8">
        <div className="overflow-hidden rounded-2xl bg-[#0E2933] shadow-[0_4px_12px_rgba(20,34,43,0.12)]">
          <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] shadow-[0_4px_12px_rgba(0,168,204,0.25)] sm:h-14 sm:w-14">
                <Users className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Team Management
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex flex-col gap-3 border-b border-[#DCE7EC] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                {isEditing ? (
                  <Pencil className="h-4 w-4 text-[#00A8CC]" />
                ) : (
                  <UserPlus className="h-4 w-4 text-[#00A8CC]" />
                )}
              </div>

              <div>
                <h2 className="text-base font-bold text-[#14222B]">
                  {isEditing ? "Update Team" : "Create New Team"}
                </h2>

                <p className="mt-0.5 text-xs text-[#71838E]">
                  {isEditing
                    ? "Update team information, mentors and students."
                    : "Configure team members and mentorship."}
                </p>
              </div>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="flex w-fit items-center gap-1.5 rounded-lg border border-[#DCE7EC] bg-[#F7FAFC] px-3 py-2 text-[10px] font-bold text-[#71838E] transition hover:bg-[#E3F5F9] hover:text-[#14222B]"
              >
                <X className="h-3.5 w-3.5" />
                Cancel Editing
              </button>
            )}
          </div>

          <form onSubmit={handleSaveTeam} className="space-y-6 p-5">
            <div>
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#14222B]">
                  Team Information
                </h3>

                <p className="mt-0.5 text-[10px] text-[#71838E]">
                  Basic information about the team.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className={labelClass}>Team Name</label>

                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Team Alpha"
                    disabled={saving}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Team Gender</label>

                  <select
                    value={gender}
                    onChange={(event) => handleGenderChange(event.target.value)}
                    disabled={saving}
                    className={inputClass}
                  >
                    <option value="">Select team gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Batch</label>

                  <select
                    value={batch}
                    onChange={(event) => handleBatchChange(event.target.value)}
                    disabled={saving}
                    className={inputClass}
                  >
                    <option value="">Select batch</option>

                    {batches.map((currentBatch) => (
                      <option key={currentBatch._id} value={currentBatch._id}>
                        {currentBatch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DCE7EC] pt-6">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <UserCheck className="h-4 w-4 text-[#00A8CC]" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#14222B]">
                    Team Mentors
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#71838E]">
                    Select exactly two approved mentors.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>First Mentor</label>

                  <select
                    value={mentor1}
                    onChange={(event) => setMentor1(event.target.value)}
                    disabled={!gender || saving}
                    className={inputClass}
                  >
                    <option value="">
                      {gender ? "Select first mentor" : "Select gender first"}
                    </option>

                    {filteredMentors.map((mentor) => (
                      <option
                        key={mentor._id}
                        value={mentor._id}
                        disabled={mentor._id === mentor2}
                      >
                        {mentor.firstName} {mentor.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Second Mentor</label>

                  <select
                    value={mentor2}
                    onChange={(event) => setMentor2(event.target.value)}
                    disabled={!gender || saving}
                    className={inputClass}
                  >
                    <option value="">
                      {gender ? "Select second mentor" : "Select gender first"}
                    </option>

                    {filteredMentors.map((mentor) => (
                      <option
                        key={mentor._id}
                        value={mentor._id}
                        disabled={mentor._id === mentor1}
                      >
                        {mentor.firstName} {mentor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-[#DCE7EC] pt-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E3F5F9]">
                    <GraduationCap className="h-4 w-4 text-[#00A8CC]" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#14222B]">
                      Students
                    </h3>

                    <p className="mt-0.5 text-[10px] text-[#71838E]">
                      Approved students from the selected batch and gender.
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-[#E3F5F9] px-3 py-1.5 text-[10px] font-bold text-[#0088A6]">
                  {selectedStudents.length} Selected
                </span>
              </div>

              {!gender ? (
                <div className="rounded-xl border border-dashed border-[#B4D7E2] bg-[#F7FAFC] px-5 py-12 text-center">
                  <UsersRound className="mx-auto h-8 w-8 text-[#B4D7E2]" />

                  <p className="mt-2 text-xs font-semibold text-[#71838E]">
                    Select a team gender first.
                  </p>
                </div>
              ) : !batch ? (
                <div className="rounded-xl border border-dashed border-[#B4D7E2] bg-[#F7FAFC] px-5 py-12 text-center">
                  <UsersRound className="mx-auto h-8 w-8 text-[#B4D7E2]" />

                  <p className="mt-2 text-xs font-semibold text-[#71838E]">
                    Select a batch first.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#B4D7E2] bg-[#F7FAFC] px-5 py-12 text-center">
                  <UsersRound className="mx-auto h-8 w-8 text-[#B4D7E2]" />

                  <p className="mt-2 text-xs font-semibold text-[#71838E]">
                    No approved {gender.toLowerCase()} students are available in
                    this batch.
                  </p>
                </div>
              ) : (
                <div className="grid max-h-72 gap-2.5 overflow-y-auto rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student) => {
                    const selected = selectedStudents.includes(student._id);

                    return (
                      <label
                        key={student._id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                          selected
                            ? "border-[#B4D7E2] bg-[#E3F5F9]"
                            : "border-[#DCE7EC] bg-white hover:border-[#B4D7E2] hover:bg-[#F7FAFC]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => handleStudentChange(student._id)}
                          disabled={saving}
                          className="h-4 w-4 accent-[#00A8CC]"
                        />

                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            selected ? "bg-[#00A8CC]" : "bg-[#E3F5F9]"
                          }`}
                        >
                          <UserRound
                            className={`h-4 w-4 ${
                              selected ? "text-white" : "text-[#00A8CC]"
                            }`}
                          />
                        </div>

                        <span className="truncate text-xs font-bold text-[#14222B]">
                          {student.firstName} {student.lastName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#DCE7EC] pt-5 sm:flex-row sm:justify-end">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-[#DCE7EC] bg-white px-6 py-2.5 text-xs font-bold text-[#71838E] transition hover:bg-[#F7FAFC] hover:text-[#14222B]"
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
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-7 py-2.5 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}

                {saving
                  ? isEditing
                    ? "Updating..."
                    : "Creating..."
                  : isEditing
                    ? "Update Team"
                    : "Create Team"}
              </button>
            </div>
          </form>
        </section>

        <section className={`${cardClass} overflow-hidden`}>
          <div className="flex flex-col gap-4 border-b border-[#DCE7EC] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                <Users className="h-5 w-5 text-[#00A8CC]" />
              </div>

              <div>
                <h2 className="text-base font-extrabold text-[#14222B]">
                  Existing Teams
                </h2>

                <p className="mt-0.5 text-xs text-[#71838E]">
                  View and manage all created teams.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE7EC] bg-white px-4 py-2.5 text-xs font-bold text-[#0088A6] shadow-sm transition hover:border-[#B4D7E2] hover:bg-[#E3F5F9] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          <div className="border-b border-[#DCE7EC] bg-[#F7FAFC] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8FA3B0]">
                Total Teams
              </span>

              <span className="rounded-full bg-[#E3F5F9] px-2.5 py-1 text-[10px] font-extrabold text-[#0088A6]">
                {teams.length}
              </span>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
                <Users className="h-6 w-6 text-[#B4D7E2]" />
              </div>

              <p className="mt-4 text-sm font-bold text-[#14222B]">
                No teams created yet
              </p>

              <p className="mt-1 text-xs text-[#8FA3B0]">
                Create your first team using the form above.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#DCE7EC] bg-[#F7FAFC]">
                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#71838E]">
                        Team
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#71838E]">
                        Gender
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#71838E]">
                        Batch
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#71838E]">
                        Mentors
                      </th>

                      <th className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#71838E]">
                        Students
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#71838E]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#DCE7EC]">
                    {teams.map((team) => (
                      <tr
                        key={team._id}
                        className="group transition-colors hover:bg-[#F7FAFC]"
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9]">
                              <Users className="h-4 w-4 text-[#00A8CC]" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-extrabold text-[#14222B]">
                                {team.name}
                              </p>

                              <div className="mt-1 flex items-center gap-1.5">
                                <span className="text-[10px] text-[#8FA3B0]">
                                  {team.students?.length || 0}
                                </span>

                                <span className="text-[10px] text-[#8FA3B0]">
                                  students
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span className="inline-flex rounded-full border border-[#B4D7E2] bg-[#E3F5F9] px-2.5 py-1 text-[9px] font-extrabold text-[#0088A6]">
                            {team.gender || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F7FAFC]">
                              <GraduationCap className="h-3.5 w-3.5 text-[#71838E]" />
                            </div>

                            <span className="text-[10px] font-bold text-[#293E4C]">
                              {team.batch?.name || "Unknown"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 align-top">
                          {team.mentors?.length ? (
                            <div className="space-y-2">
                              {team.mentors.map((mentor) => (
                                <div
                                  key={mentor._id}
                                  className="flex items-center gap-2"
                                >
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-white border-[#00A8CC]">
                                    <UserRound className="h-3 w-3 text-[#00A8CC]" />
                                  </div>

                                  <span className="whitespace-nowrap text-[10px] font-bold text-[#14222B]">
                                    {mentor.firstName} {mentor.lastName || ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-[#8FA3B0]">
                              No mentors
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          {team.students?.length ? (
                            <div className="flex max-w-82.5 flex-wrap gap-1.5">
                              {team.students.map((student) => (
                                <span
                                  key={student._id}
                                  className="rounded-lg border border-[#DCE7EC] bg-white px-2.5 py-1.5 text-[9px] font-bold text-[#293E4C]"
                                >
                                  {student.firstName} {student.lastName}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] italic text-[#8FA3B0]">
                              No students
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleEditTeam(team)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE7EC] bg-white text-[#71838E] transition hover:border-[#B4D7E2] hover:bg-[#E3F5F9] hover:text-[#00A8CC]"
                              title="Edit team"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteTeam(team)}
                              disabled={deleting === team._id}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE7EC] bg-white text-[#71838E] transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete team"
                            >
                              {deleting === team._id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-4 md:hidden">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="overflow-hidden rounded-xl border border-[#DCE7EC] bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-[#DCE7EC] bg-[#F7FAFC] p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9]">
                          <Users className="h-4 w-4 text-[#00A8CC]" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-extrabold text-[#14222B]">
                            {team.name}
                          </p>

                          <p className="mt-1 text-[10px] text-[#8FA3B0]">
                            {team.students?.length || 0} students
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full border border-[#B4D7E2] bg-[#E3F5F9] px-2.5 py-1 text-[9px] font-extrabold text-[#0088A6]">
                        {team.gender || "—"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-4">
                      <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8FA3B0]">
                          Batch
                        </p>

                        <p className="mt-1 truncate text-[10px] font-bold text-[#14222B]">
                          {team.batch?.name || "Unknown"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8FA3B0]">
                          Students
                        </p>

                        <p className="mt-1 text-[10px] font-bold text-[#14222B]">
                          {team.students?.length || 0}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-3">
                      <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8FA3B0]">
                          Mentors
                        </p>

                        {team.mentors?.length ? (
                          <div className="mt-2 space-y-2">
                            {team.mentors.map((mentor) => (
                              <div
                                key={mentor._id}
                                className="flex items-center gap-2"
                              >
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#293E4C]">
                                  <UserRound className="h-3 w-3 text-white" />
                                </div>

                                <span className="text-[10px] font-bold text-[#14222B]">
                                  {mentor.firstName} {mentor.lastName || ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-[10px] italic text-[#8FA3B0]">
                            No mentors assigned
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 pb-3">
                      <div className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-3">
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#8FA3B0]">
                          Students
                        </p>

                        {team.students?.length ? (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {team.students.map((student) => (
                              <span
                                key={student._id}
                                className="rounded-lg border border-[#DCE7EC] bg-white px-2.5 py-1.5 text-[9px] font-bold text-[#293E4C]"
                              >
                                {student.firstName} {student.lastName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-[10px] italic text-[#8FA3B0]">
                            No students
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-[#DCE7EC] bg-[#F7FAFC] p-3">
                      <button
                        type="button"
                        onClick={() => handleEditTeam(team)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE7EC] bg-white py-2.5 text-[10px] font-bold text-[#00A8CC] transition hover:border-[#B4D7E2] hover:bg-[#E3F5F9]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team)}
                        disabled={deleting === team._id}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2.5 text-[10px] font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleting === team._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {deleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071b23]/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-[#DCE7EC] bg-white shadow-[0_20px_60px_rgba(20,34,43,0.2)]">
            <div className="flex items-center justify-between border-b border-[#DCE7EC] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#14222B]">
                    Delete Team
                  </h3>

                  <p className="mt-0.5 text-[10px] text-[#71838E]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                disabled={deleting === deleteTeam._id}
                className="rounded-lg p-2 text-[#8FA3B0] transition hover:bg-[#F7FAFC] hover:text-[#14222B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm leading-relaxed text-[#293E4C]">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#14222B]">
                  {deleteTeam.name}
                </span>
                ?
              </p>
            </div>

            <div className="flex gap-2 border-t border-[#DCE7EC] bg-[#F7FAFC] p-4">
              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                disabled={deleting === deleteTeam._id}
                className="flex-1 rounded-xl border border-[#DCE7EC] bg-white py-2.5 text-xs font-bold text-[#71838E] transition hover:bg-[#F7FAFC] hover:text-[#14222B]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteTeam}
                disabled={deleting === deleteTeam._id}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {deleting === deleteTeam._id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;
