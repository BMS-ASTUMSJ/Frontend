import { useEffect, useState } from "react";
import api from "../../utils/api";
import {
  Users,
  UserPlus,
  Loader2,
  UserRound,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

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

      console.log("TEAMS:", teamsResponse.data);
      console.log("STUDENTS:", studentsResponse.data);
      console.log("MENTORS:", mentorsResponse.data);
      console.log("BATCHES:", batchesResponse.data);

      setTeams(teamsResponse.data?.teams || []);
      setStudents(studentsResponse.data?.students || []);
      setMentors(mentorsResponse.data?.mentors || []);
      setBatches(batchesResponse.data?.batches || []);
    } catch (error) {
      console.error("Fetch team data error:", error);

      const message =
        error.response?.data?.message ||
        "Failed to load teams, students, mentors, and batches.";

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ============================================================
  // GET BATCH ID
  // ============================================================

  const getBatchId = (studentBatch) => {
    if (!studentBatch) {
      return "";
    }

    if (typeof studentBatch === "string") {
      return studentBatch;
    }

    if (typeof studentBatch === "object") {
      return studentBatch._id || "";
    }

    return "";
  };

  // ============================================================
  // FILTER MENTORS
  // ============================================================

  const filteredMentors = mentors.filter(
    (mentor) =>
      mentor.gender?.toLowerCase() === gender?.toLowerCase() &&
      mentor.status?.toLowerCase() === "approved",
  );

  // ============================================================
  // FILTER STUDENTS
  // ============================================================

  const filteredStudents = students.filter((student) => {
    const studentBatchId = getBatchId(student.batch);

    const sameGender = student.gender?.toLowerCase() === gender?.toLowerCase();

    const approved = student.status?.toLowerCase() === "approved";

    const sameBatch = studentBatchId.toString() === batch.toString();

    return sameGender && approved && sameBatch;
  });

  // ============================================================
  // GENDER CHANGE
  // ============================================================

  const handleGenderChange = (value) => {
    setGender(value);

    setMentor1("");
    setMentor2("");
    setSelectedStudents([]);

    setFormError("");
    setFormSuccess("");
  };

  // ============================================================
  // BATCH CHANGE
  // ============================================================

  const handleBatchChange = (value) => {
    setBatch(value);

    // Clear previously selected students because
    // they may belong to another batch.
    setSelectedStudents([]);

    setFormError("");
    setFormSuccess("");
  };

  // ============================================================
  // STUDENT CHANGE
  // ============================================================

  const handleStudentChange = (studentId) => {
    setSelectedStudents((previous) => {
      if (previous.includes(studentId)) {
        return previous.filter((id) => id !== studentId);
      }

      return [...previous, studentId];
    });

    setFormError("");
    setFormSuccess("");
  };

  // ============================================================
  // CREATE TEAM
  // ============================================================

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    setFormError("");
    setFormSuccess("");

    const trimmedName = name.trim();

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!trimmedName) {
      const message = "Team name is required.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!gender) {
      const message = "Please select a team gender.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!batch) {
      const message = "Please select a batch.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (!mentor1 || !mentor2) {
      const message = "Please select exactly 2 mentors.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (mentor1 === mentor2) {
      const message = "The two mentors must be different.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (selectedStudents.length === 0) {
      const message = "Please select at least one student.";
      setFormError(message);
      toast.error(message);
      return;
    }

    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------

    try {
      setCreating(true);

      const response = await api.post("/teams", {
        name: trimmedName,
        gender,
        batch,
        mentorIds: [mentor1, mentor2],
        studentIds: selectedStudents,
      });

      const message = response.data?.message || "Team created successfully.";

      setFormSuccess(message);
      toast.success(message);

      // --------------------------------------------------------
      // RESET FORM
      // --------------------------------------------------------

      setName("");
      setGender("");
      setBatch("");
      setMentor1("");
      setMentor2("");
      setSelectedStudents([]);

      await fetchData();
    } catch (error) {
      console.error("Create team error:", error);

      const message = error.response?.data?.message || "Failed to create team.";

      setFormError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  // ============================================================
  // DELETE TEAM
  // ============================================================

  const handleDeleteTeam = async (teamId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this team?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(teamId);

      const response = await api.delete(`/teams/${teamId}`);

      toast.success(response.data?.message || "Team deleted successfully.");

      setTeams((previous) => previous.filter((team) => team._id !== teamId));
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
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#0A1931] p-6 text-white shadow-sm md:flex-row md:items-center md:p-8">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#1A3D63] p-3">
              <Users size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold md:text-3xl">
                Team Management
              </h1>

              <p className="mt-1 text-sm text-[#B3CFE5]">
                Create teams with two mentors and multiple students.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
            <Users size={18} />

            <span className="text-sm font-semibold">
              {teams.length} Team
              {teams.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ====================================================
              CREATE TEAM
          ==================================================== */}

          <form
            onSubmit={handleCreateTeam}
            className="h-fit space-y-5 rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
          >
            {/* TITLE */}

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#EAF3F9] p-2">
                <UserPlus size={20} className="text-[#1A3D63]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  Create New Team
                </h2>

                <p className="text-xs text-[#7A7F85]">
                  Select a batch, 2 mentors and students
                </p>
              </div>
            </div>

            {/* ERROR */}

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />

                <span>{formError}</span>
              </div>
            )}

            {/* SUCCESS */}

            {formSuccess && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                <span>{formSuccess}</span>
              </div>
            )}

            {/* TEAM NAME */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Team Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setFormError("");
                  setFormSuccess("");
                }}
                placeholder="Enter team name"
                className="w-full rounded-xl border border-[#B3CFE5] p-3 text-sm outline-none focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
              />
            </div>

            {/* GENDER */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Team Gender
              </label>

              <select
                value={gender}
                onChange={(event) => handleGenderChange(event.target.value)}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
              >
                <option value="">Select team gender</option>

                <option value="Male">Male</option>

                <option value="Female">Female</option>
              </select>
            </div>

            {/* BATCH */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Batch
              </label>

              <select
                value={batch}
                onChange={(event) => handleBatchChange(event.target.value)}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
              >
                <option value="">Select batch</option>

                {batches.map((currentBatch) => (
                  <option key={currentBatch._id} value={currentBatch._id}>
                    {currentBatch.name}
                  </option>
                ))}
              </select>

              {batches.length === 0 && (
                <p className="mt-2 text-xs font-medium text-red-500">
                  No batches available. Please create a batch first.
                </p>
              )}
            </div>

            {/* FIRST MENTOR */}

            <div className="rounded-2xl border border-[#B3CFE5] bg-[#FAFCFE] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0A1931]">
                    First Mentor
                  </p>

                  <p className="text-xs text-[#7A7F85]">
                    Select the first mentor
                  </p>
                </div>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A3D63] text-xs font-bold text-white">
                  1
                </span>
              </div>

              <select
                value={mentor1}
                onChange={(event) => {
                  setMentor1(event.target.value);
                  setFormError("");
                }}
                disabled={!gender}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none disabled:bg-gray-100 focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
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

              {gender && filteredMentors.length === 0 && (
                <p className="mt-2 text-xs text-red-500">
                  No approved {gender.toLowerCase()} mentors available.
                </p>
              )}
            </div>

            {/* SECOND MENTOR */}

            <div className="rounded-2xl border border-[#B3CFE5] bg-[#FAFCFE] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0A1931]">
                    Second Mentor
                  </p>

                  <p className="text-xs text-[#7A7F85]">
                    Select the second mentor
                  </p>
                </div>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4A7FA7] text-xs font-bold text-white">
                  2
                </span>
              </div>

              <select
                value={mentor2}
                onChange={(event) => {
                  setMentor2(event.target.value);
                  setFormError("");
                }}
                disabled={!gender}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none disabled:bg-gray-100 focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
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

            {/* STUDENTS */}

            <div className="rounded-2xl border border-[#B3CFE5] bg-[#EAF3F9] p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-bold text-[#0A1931]">Students</p>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1A3D63]">
                  {selectedStudents.length} selected
                </span>
              </div>

              {!gender ? (
                <div className="rounded-xl bg-white p-4 text-center">
                  <p className="text-sm text-[#7A7F85]">
                    Select a team gender first.
                  </p>
                </div>
              ) : !batch ? (
                <div className="rounded-xl bg-white p-4 text-center">
                  <p className="text-sm text-[#7A7F85]">
                    Select a batch first.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="rounded-xl bg-white p-4 text-center">
                  <p className="text-sm text-red-600">
                    No approved {gender.toLowerCase()} students are available in
                    this batch.
                  </p>
                </div>
              ) : (
                <div className="max-h-56 space-y-1 overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <label
                      key={student._id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl bg-white p-3 hover:bg-[#F6FAFD]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={() => handleStudentChange(student._id)}
                        className="h-4 w-4"
                      />

                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4A7FA7] text-white">
                        <UserRound size={15} />
                      </div>

                      <span className="text-sm font-medium text-[#0A1931]">
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* CREATE BUTTON */}

            <button
              type="submit"
              disabled={
                creating ||
                !name.trim() ||
                !gender ||
                !batch ||
                !mentor1 ||
                !mentor2 ||
                mentor1 === mentor2 ||
                selectedStudents.length === 0
              }
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold transition ${
                creating ||
                !name.trim() ||
                !gender ||
                !batch ||
                !mentor1 ||
                !mentor2 ||
                mentor1 === mentor2 ||
                selectedStudents.length === 0
                  ? "cursor-not-allowed bg-gray-400 text-white"
                  : "bg-[#1A3D63] text-white hover:bg-[#4A7FA7]"
              }`}
            >
              {creating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Team...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Create Team
                </>
              )}
            </button>
          </form>

          {/* ====================================================
              TEAM LIST
          ==================================================== */}

          <div className="grid gap-4 lg:col-span-2">
            {teams.length === 0 ? (
              <div className="rounded-3xl border border-[#B3CFE5] bg-white p-10 text-center shadow-sm">
                <Users size={40} className="mx-auto mb-3 text-[#B3CFE5]" />

                <p className="font-semibold text-[#0A1931]">
                  No teams created yet.
                </p>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  Create your first team using the form.
                </p>
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team._id}
                  className="rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                >
                  {/* TEAM HEADER */}

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#0A1931]">
                        {team.name}
                      </h3>

                      {team.batch && (
                        <p className="mt-1 text-sm font-semibold text-[#4A7FA7]">
                          Batch: {team.batch.name || "Unknown batch"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#EAF3F9] px-3 py-1 text-xs font-bold text-[#1A3D63]">
                        {team.gender}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleDeleteTeam(team._id)}
                        disabled={deleting === team._id}
                        className="rounded-xl p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleting === team._id ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* MENTORS */}

                  <div className="mb-5">
                    <p className="mb-3 text-xs font-bold text-[#4A7FA7]">
                      MENTORS
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {team.mentors?.map((mentor, index) => (
                        <div
                          key={mentor._id}
                          className="flex items-center gap-3 rounded-xl bg-[#F6FAFD] p-3"
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white ${
                              index === 0 ? "bg-[#1A3D63]" : "bg-[#4A7FA7]"
                            }`}
                          >
                            <UserRound size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#7A7F85]">
                              Mentor {index + 1}
                            </p>

                            <p className="truncate text-sm font-bold text-[#0A1931]">
                              {mentor.firstName} {mentor.lastName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STUDENTS */}

                  <div className="mb-5">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-xs font-bold text-[#4A7FA7]">
                        STUDENTS
                      </p>

                      <span className="text-xs font-bold text-[#1A3D63]">
                        {team.students?.length || 0} students
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {team.students?.map((student) => (
                        <div
                          key={student._id}
                          className="flex items-center gap-3 rounded-xl bg-[#F6FAFD] p-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white">
                            <UserRound size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#0A1931]">
                              {student.firstName} {student.lastName}
                            </p>

                            <p className="text-xs text-[#7A7F85]">Student</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div className="flex items-center justify-between border-t border-[#EAF3F9] pt-4 text-xs font-semibold text-[#4A7FA7]">
                    <span>Mentors: {team.mentors?.length || 0}/2</span>

                    <span>Students: {team.students?.length || 0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;
