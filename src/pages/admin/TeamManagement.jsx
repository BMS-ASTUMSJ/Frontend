import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  Users,
  UserPlus,
  Loader2,
  UserRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  const [mentor1, setMentor1] = useState("");
  const [mentor2, setMentor2] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  /*
  |--------------------------------------------------------------------------
  | FETCH DATA
  |--------------------------------------------------------------------------
  */

  const fetchData = async () => {
    try {
      setLoading(true);

      const [teamsResponse, studentsResponse, mentorsResponse] =
        await Promise.all([
          api.get("/teams"),
          api.get("/users/students"),
          api.get("/users/mentors"),
        ]);

      setTeams(teamsResponse.data?.teams || []);
      setStudents(studentsResponse.data?.students || []);
      setMentors(mentorsResponse.data?.mentors || []);
    } catch (err) {
      console.error("Fetch team management data error:", err);

      const message =
        err.response?.data?.message ||
        "Failed to load teams, students, and mentors.";

      setFormError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER MENTORS BY GENDER
  |--------------------------------------------------------------------------
  */

  const filteredMentors = mentors.filter(
    (mentor) =>
      !gender ||
      mentor.gender?.toLowerCase() === gender.toLowerCase(),
  );

  /*
  |--------------------------------------------------------------------------
  | CREATE TEAM
  |--------------------------------------------------------------------------
  */

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess("");

    const trimmedName = name.trim();

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

    if (!mentor1 || !mentor2) {
      const message = "Please select exactly 2 mentors.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (mentor1 === mentor2) {
      const message = "Please select two different mentors.";
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

    try {
      setCreating(true);

      const mentorIds = [mentor1, mentor2];

      const response = await api.post("/teams", {
        name: trimmedName,
        gender,
        mentorIds,
        studentIds: selectedStudents,
      });

      console.log("Team created:", response.data);

      const message =
        response.data?.message || "Team created successfully.";

      setFormSuccess(message);
      toast.success(message);

      setName("");
      setGender("");
      setMentor1("");
      setMentor2("");
      setSelectedStudents([]);

      const teamsResponse = await api.get("/teams");

      setTeams(teamsResponse.data?.teams || []);
    } catch (err) {
      console.error("Create team error:", err);

      const message =
        err.response?.data?.message || "Failed to create team.";

      setFormError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A3D63]" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col justify-between gap-5 rounded-3xl bg-[#0A1931] p-6 text-white shadow-sm md:flex-row md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-[#1A3D63] p-3">
                <Users size={28} />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">
                  Team Management
                </h1>

                <p className="mt-1 text-sm text-[#B3CFE5]">
                  Group students with two mentors for projects.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
            <Users size={18} />

            <span className="text-sm font-semibold">
              {teams.length} Team{teams.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ===================================================
              CREATE TEAM FORM
          ==================================================== */}

          <form
            onSubmit={handleCreateTeam}
            className="h-fit space-y-5 rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#EAF3F9] p-2">
                <UserPlus size={20} className="text-[#1A3D63]" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A1931]">
                  New Team
                </h2>

                <p className="text-xs text-[#7A7F85]">
                  Assign 2 mentors and students
                </p>
              </div>
            </div>

            {/* =================================================
                INLINE ERROR
            ================================================== */}

            {formError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />

                <span>{formError}</span>
              </div>
            )}

            {/* =================================================
                INLINE SUCCESS
            ================================================== */}

            {formSuccess && (
              <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 flex-shrink-0"
                />

                <span>{formSuccess}</span>
              </div>
            )}

            {/* =================================================
                TEAM NAME
            ================================================== */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Team Name
              </label>

              <input
                type="text"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFormError("");
                  setFormSuccess("");
                }}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                required
              />
            </div>

            {/* =================================================
                GENDER
            ================================================== */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Team Gender
              </label>

              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setMentor1("");
                  setMentor2("");
                  setFormError("");
                  setFormSuccess("");
                }}
                className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                required
              >
                <option value="">Select Team Gender</option>

                <option value="Male">Male Only</option>

                <option value="Female">Female Only</option>
              </select>
            </div>

            {/* =================================================
                MENTORS
            ================================================== */}

            <div className="pt-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#0A1931]">
                    Team Mentors
                  </p>

                  <p className="mt-1 text-xs text-[#7A7F85]">
                    Select exactly 2 mentors
                  </p>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-[#EAF3F9] px-3 py-1.5">
                  <UserRound size={14} className="text-[#1A3D63]" />

                  <span className="text-xs font-bold text-[#1A3D63]">
                    {[mentor1, mentor2].filter(Boolean).length}/2
                  </span>
                </div>
              </div>

              {!gender ? (
                <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-4 text-center">
                  <UserRound
                    size={28}
                    className="mx-auto mb-2 text-[#B3CFE5]"
                  />

                  <p className="text-sm text-[#7A7F85]">
                    Select a team gender first
                  </p>

                  <p className="mt-1 text-xs text-[#7A7F85]">
                    Available mentors will appear here
                  </p>
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-sm font-medium text-red-600">
                    No approved {gender.toLowerCase()} mentors available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Mentor 1 */}

                  <div className="rounded-2xl border border-[#B3CFE5] bg-[#FAFCFE] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1A3D63] text-xs font-bold text-white">
                        1
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0A1931]">
                          First Mentor
                        </p>

                        <p className="text-xs text-[#7A7F85]">
                          Primary mentor
                        </p>
                      </div>
                    </div>

                    <select
                      value={mentor1}
                      onChange={(e) => {
                        setMentor1(e.target.value);
                        setFormError("");
                      }}
                      className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                      required
                    >
                      <option value="">Select first mentor</option>

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

                    {mentor1 && (
                      <div className="mt-2 text-xs font-medium text-green-600">
                        ✓ Mentor selected
                      </div>
                    )}
                  </div>

                  {/* Mentor 2 */}

                  <div className="rounded-2xl border border-[#B3CFE5] bg-[#FAFCFE] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4A7FA7] text-xs font-bold text-white">
                        2
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0A1931]">
                          Second Mentor
                        </p>

                        <p className="text-xs text-[#7A7F85]">
                          Co-mentor
                        </p>
                      </div>
                    </div>

                    <select
                      value={mentor2}
                      onChange={(e) => {
                        setMentor2(e.target.value);
                        setFormError("");
                      }}
                      className="w-full rounded-xl border border-[#B3CFE5] bg-white p-3 text-sm outline-none transition focus:border-[#1A3D63] focus:ring-2 focus:ring-[#B3CFE5]"
                      required
                    >
                      <option value="">Select second mentor</option>

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

                    {mentor2 && (
                      <div className="mt-2 text-xs font-medium text-green-600">
                        ✓ Mentor selected
                      </div>
                    )}
                  </div>

                  {/* Selected mentors */}

                  {mentor1 && mentor2 && (
                    <div className="rounded-2xl border border-[#B3CFE5] bg-[#EAF3F9] p-4">
                      <p className="mb-3 text-xs font-bold text-[#1A3D63]">
                        TEAM MENTORS
                      </p>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Mentor 1 */}

                        <div className="flex items-center gap-2 rounded-xl bg-white p-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1A3D63] text-white">
                            <UserRound size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#7A7F85]">
                              Mentor 1
                            </p>

                            <p className="truncate text-sm font-bold text-[#0A1931]">
                              {
                                mentors.find(
                                  (mentor) => mentor._id === mentor1,
                                )?.firstName
                              }{" "}
                              {
                                mentors.find(
                                  (mentor) => mentor._id === mentor1,
                                )?.lastName
                              }
                            </p>
                          </div>
                        </div>

                        {/* Mentor 2 */}

                        <div className="flex items-center gap-2 rounded-xl bg-white p-3">
                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white">
                            <UserRound size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#7A7F85]">
                              Mentor 2
                            </p>

                            <p className="truncate text-sm font-bold text-[#0A1931]">
                              {
                                mentors.find(
                                  (mentor) => mentor._id === mentor2,
                                )?.firstName
                              }{" "}
                              {
                                mentors.find(
                                  (mentor) => mentor._id === mentor2,
                                )?.lastName
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                STUDENTS
            ================================================== */}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-bold text-[#0A1931]">
                  Students
                </p>

                <span className="text-xs font-bold text-[#4A7FA7]">
                  {selectedStudents.length} selected
                </span>
              </div>

              <div className="h-40 overflow-y-auto rounded-xl border border-[#B3CFE5] p-3">
                {students.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-500">
                      No students available.
                    </p>
                  </div>
                ) : (
                  students.map((student) => (
                    <label
                      key={student._id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-[#F6FAFD]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents((previous) => [
                              ...previous,
                              student._id,
                            ]);
                          } else {
                            setSelectedStudents((previous) =>
                              previous.filter(
                                (id) => id !== student._id,
                              ),
                            );
                          }
                        }}
                        className="h-4 w-4"
                      />

                      <span className="text-sm text-[#0A1931]">
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* =================================================
                CREATE BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={
                creating ||
                !mentor1 ||
                !mentor2 ||
                mentor1 === mentor2 ||
                selectedStudents.length === 0
              }
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold transition ${
                creating ||
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

          {/* ===================================================
              TEAMS LIST
          ==================================================== */}

          <div className="grid gap-4 lg:col-span-2">
            {teams.length === 0 ? (
              <div className="rounded-3xl border border-[#B3CFE5] bg-white p-10 text-center shadow-sm">
                <Users
                  size={40}
                  className="mx-auto mb-3 text-[#B3CFE5]"
                />

                <p className="font-semibold text-[#0A1931]">
                  No teams created yet.
                </p>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  Create a team using the form.
                </p>
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team._id}
                  className="rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  {/* Team Header */}

                  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#0A1931]">
                        {team.name}
                      </h3>

                      {team.description && (
                        <p className="mt-1 text-sm text-[#7A7F85]">
                          {team.description}
                        </p>
                      )}
                    </div>

                    <span className="w-fit rounded-full bg-[#EAF3F9] px-3 py-1 text-xs font-bold text-[#1A3D63]">
                      {team.gender || "Mixed"}
                    </span>
                  </div>

                  {/* Mentors */}

                  <div className="mb-5">
                    <p className="mb-2 text-xs font-bold text-[#4A7FA7]">
                      MENTORS
                    </p>

                    {team.mentors?.length ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {team.mentors.map((mentor, index) => (
                          <div
                            key={mentor._id}
                            className="flex items-center gap-3 rounded-xl bg-[#F6FAFD] p-3"
                          >
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#1A3D63] text-white">
                              <UserRound size={16} />
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
                    ) : (
                      <p className="text-sm text-[#7A7F85]">
                        No mentors assigned.
                      </p>
                    )}
                  </div>

                  {/* Students */}

                  <div className="mb-5">
                    <p className="mb-2 text-xs font-bold text-[#4A7FA7]">
                      STUDENTS
                    </p>

                    {team.students?.length ? (
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {team.students.map((student) => (
                          <div
                            key={student._id}
                            className="flex items-center gap-3 rounded-xl bg-[#F6FAFD] p-3"
                          >
                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white">
                              <UserRound size={16} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs text-[#7A7F85]">
                                Student
                              </p>

                              <p className="truncate text-sm font-bold text-[#0A1931]">
                                {student.firstName} {student.lastName}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#7A7F85]">
                        No students assigned.
                      </p>
                    )}
                  </div>

                  {/* Bottom Stats */}

                  <div className="flex items-center justify-between border-t border-[#EAF3F9] pt-4 text-xs font-semibold text-[#4A7FA7]">
                    <span>
                      Mentors: {team.mentors?.length || 0}
                    </span>

                    <span>
                      Students: {team.students?.length || 0}
                    </span>
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