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
  // HELPERS
  // ============================================================

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

    setIsEditing(false);
    setEditingTeamId(null);
  };

  // ============================================================
  // FORM CHANGES
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

  const handleStudentChange = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter((id) => id !== studentId);
      }

      return [...previous, studentId];
    });
  };

  // ============================================================
  // CREATE / UPDATE TEAM
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

  // ============================================================
  // EDIT
  // ============================================================

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

  // ============================================================
  // DELETE
  // ============================================================

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

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3D63]" />
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="rounded-3xl bg-[#0A1931] p-6 text-white md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#1A3D63] p-3">
                <Users className="h-7 w-7" />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Team Management
                </h1>

                <p className="mt-1 text-sm text-[#B3CFE5]">
                  Create and manage teams with mentors and students.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
              <Users className="h-5 w-5" />

              <span className="text-sm font-semibold">
                {teams.length} Team
                {teams.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
            CREATE / UPDATE TEAM
        ====================================================== */}

        <div className="rounded-3xl border border-[#B3CFE5] bg-white">
          <div className="border-b border-[#EAF3F9] px-6 py-5 md:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#EAF3F9] p-2.5">
                  {isEditing ? (
                    <Pencil className="h-5 w-5 text-[#1A3D63]" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-[#1A3D63]" />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-[#0A1931]">
                    {isEditing ? "Update Team" : "Create New Team"}
                  </h2>

                  <p className="text-xs text-[#7A7F85]">
                    Select a batch, two mentors and students.
                  </p>
                </div>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSaveTeam} className="space-y-6 p-6 md:p-8">
            {/* FIRST ROW */}

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Team Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter team name"
                  disabled={saving}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Team Gender
                </label>

                <select
                  value={gender}
                  onChange={(event) => handleGenderChange(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                >
                  <option value="">Select team gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Batch
                </label>

                <select
                  value={batch}
                  onChange={(event) => handleBatchChange(event.target.value)}
                  disabled={saving}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
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

            {/* MENTORS */}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  First Mentor
                </label>

                <select
                  value={mentor1}
                  onChange={(event) => setMentor1(event.target.value)}
                  disabled={!gender || saving}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none disabled:bg-gray-100"
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
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Second Mentor
                </label>

                <select
                  value={mentor2}
                  onChange={(event) => setMentor2(event.target.value)}
                  disabled={!gender || saving}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none disabled:bg-gray-100"
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

            {/* STUDENTS */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="text-sm font-semibold text-[#0A1931]">
                  Students
                </label>

                <span className="rounded-full bg-[#EAF3F9] px-3 py-1 text-xs font-bold text-[#1A3D63]">
                  {selectedStudents.length} selected
                </span>
              </div>

              {!gender ? (
                <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-5 text-center text-sm text-[#7A7F85]">
                  Select a team gender first.
                </div>
              ) : !batch ? (
                <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-5 text-center text-sm text-[#7A7F85]">
                  Select a batch first.
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-5 text-center text-sm text-[#7A7F85]">
                  No approved {gender.toLowerCase()} students are available in
                  this batch.
                </div>
              ) : (
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student) => (
                    <label
                      key={student._id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 transition hover:bg-[#EAF3F9]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentChange(student._id)}
                        disabled={saving}
                        className="h-4 w-4"
                      />

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white">
                        <UserRound className="h-4 w-4" />
                      </div>

                      <span className="truncate text-sm font-medium text-[#0A1931]">
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* BUTTONS */}

            <div className="flex flex-col gap-3 border-t border-[#EAF3F9] pt-5 sm:flex-row sm:justify-end">
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
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
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? "Updating Team..." : "Creating Team..."}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <Pencil className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}

                    {isEditing ? "Update Team" : "Create Team"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================
            EXISTING TEAMS
        ====================================================== */}

        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A1931]">
                Existing Teams
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                {teams.length} team
                {teams.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#B3CFE5] bg-white p-10 text-center">
              <Users className="mx-auto h-10 w-10 text-[#B3CFE5]" />

              <p className="mt-3 font-semibold text-[#0A1931]">
                No teams created yet.
              </p>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Create your first team using the form above.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white">
              {/* TABLE HEADER */}

              <div className="hidden grid-cols-[1.3fr_0.8fr_1fr_1.8fr_2fr_100px] gap-4 border-b border-[#EAF3F9] bg-[#F6FAFD] px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#4A7FA7] md:grid">
                <span>Team</span>

                <span>Gender</span>

                <span>Batch</span>

                <span>Mentors</span>

                <span>Students</span>

                <span className="text-right">Actions</span>
              </div>

              {/* TABLE ROWS */}

              <div className="divide-y divide-[#EAF3F9]">
                {teams.map((team) => (
                  <div
                    key={team._id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-[#FAFCFE] md:grid-cols-[1.3fr_0.8fr_1fr_1.8fr_2fr_100px] md:items-center"
                  >
                    {/* TEAM */}

                    <div className="min-w-0">
                      <p className="font-bold text-[#0A1931]">{team.name}</p>

                      <p className="mt-1 text-xs text-[#7A7F85]">
                        {team.students?.length || 0} students
                      </p>
                    </div>

                    {/* GENDER */}

                    <div>
                      <span className="inline-flex rounded-full bg-[#EAF3F9] px-3 py-1 text-xs font-bold text-[#1A3D63]">
                        {team.gender || "—"}
                      </span>
                    </div>

                    {/* BATCH */}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0A1931]">
                        {team.batch?.name || "Unknown"}
                      </p>
                    </div>

                    {/* MENTORS */}

                    <div className="min-w-0 space-y-1">
                      {team.mentors?.length ? (
                        team.mentors.map((mentor) => (
                          <div
                            key={mentor._id}
                            className="flex items-center gap-2"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1A3D63] text-white">
                              <UserRound className="h-3.5 w-3.5" />
                            </div>

                            <span className="truncate text-xs font-semibold text-[#0A1931]">
                              {mentor.firstName} {mentor.lastName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-[#7A7F85]">
                          No mentors
                        </span>
                      )}
                    </div>

                    {/* STUDENTS */}

                    <div className="min-w-0">
                      {team.students?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {team.students.map((student) => (
                            <span
                              key={student._id}
                              className="rounded-lg bg-[#F6FAFD] px-2 py-1 text-[11px] font-medium text-[#1A3D63]"
                            >
                              {student.firstName} {student.lastName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-[#7A7F85]">
                          No students
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}

                    <div className="flex items-center justify-start gap-1 md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleEditTeam(team)}
                        className="rounded-xl p-2 text-[#1A3D63] transition hover:bg-[#EAF3F9]"
                        title="Edit team"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team)}
                        disabled={deleting === team._id}
                        className="rounded-xl p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                        title="Delete team"
                      >
                        {deleting === team._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      {deleteTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1931]/30 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDECEC]">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>

                <div>
                  <h3 className="font-bold text-[#0A1931]">Delete Team</h3>

                  <p className="text-xs text-[#7A7F85]">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                disabled={deleting === deleteTeam._id}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-[#0A1931]">
                {deleteTeam.name}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTeam(null)}
                disabled={deleting === deleteTeam._id}
                className="flex-1 rounded-xl bg-gray-100 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteTeam}
                disabled={deleting === deleteTeam._id}
                className="flex-1 rounded-xl bg-[#D9534F] py-2.5 text-sm font-semibold text-white hover:bg-[#C64541] disabled:opacity-60"
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
