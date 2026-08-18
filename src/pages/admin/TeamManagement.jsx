import { useState, useEffect } from "react";
import api from "../../utils/api";
import { Users, UserPlus, Loader2, UserRound } from "lucide-react";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, sRes, mRes] = await Promise.all([
          api.get("/teams"),
          api.get("/users/students"),
          api.get("/users/mentors"),
        ]);

        setTeams(tRes.data.teams || []);
        setStudents(sRes.data.students || []);
        setMentors(mRes.data.mentors || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | FILTER MENTORS BY GENDER
  |--------------------------------------------------------------------------
  */

  const filteredMentors = mentors.filter((mentor) => mentor.gender === gender);

  /*
  |--------------------------------------------------------------------------
  | CREATE TEAM
  |--------------------------------------------------------------------------
  */

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    setFormError("");
    setFormSuccess("");

    if (!mentor1 || !mentor2) {
      setFormError("Please select exactly 2 mentors.");
      return;
    }

    if (mentor1 === mentor2) {
      setFormError("Please select two different mentors.");
      return;
    }

    if (selectedStudents.length === 0) {
      setFormError("Please select at least one student.");
      return;
    }

    try {
      setCreating(true);

      const mentorIds = [mentor1, mentor2];

      const response = await api.post("/teams", {
        name,
        gender,
        mentorIds,
        studentIds: selectedStudents,
      });

      console.log("Team created:", response.data);

      setFormSuccess("Team created successfully!");

      setName("");
      setGender("");
      setMentor1("");
      setMentor2("");
      setSelectedStudents([]);

      const teamsResponse = await api.get("/teams");

      setTeams(teamsResponse.data.teams || []);
    } catch (err) {
      console.error("Create team error:", err);

      setFormError(err.response?.data?.message || "Error creating team");
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
      <div className="p-10 text-center">
        <Loader2 className="animate-spin mx-auto text-[#1A3D63]" />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex items-center justify-between bg-[#0A1931] p-8 rounded-3xl text-white">
          <div>
            <h1 className="text-2xl font-bold">Team Management</h1>

            <p className="text-[#B3CFE5]">
              Group students with two mentors for projects.
            </p>
          </div>

          <Users size={42} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ===================================================
              CREATE TEAM FORM
          ==================================================== */}

          <form
            onSubmit={handleCreateTeam}
            className="bg-white p-6 rounded-3xl border border-[#B3CFE5] space-y-5"
          >
            <div className="flex items-center gap-2">
              <UserPlus size={20} className="text-[#1A3D63]" />

              <h2 className="font-bold text-lg text-[#0A1931]">New Team</h2>
            </div>

            {/* Inline feedback */}
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-semibold text-green-700">
                {formSuccess}
              </div>
            )}

            {/* Team Name */}
            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                Team Name
              </label>

              <input
                type="text"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#4A7FA7]"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-[#0A1931] mb-2">
                Team Gender
              </label>

              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);

                  setMentor1("");
                  setMentor2("");
                }}
                className="w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#4A7FA7]"
                required
              >
                <option value="">Select Team Gender</option>

                <option value="Male">Male Only</option>

                <option value="Female">Female Only</option>
              </select>
            </div>

            {/* =================================================
                MENTOR SECTION
            ================================================== */}

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-[#0A1931]">
                    Team Mentors
                  </p>

                  <p className="text-xs text-[#7A7F85] mt-1">
                    Select exactly 2 mentors
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-[#EAF3F9] px-3 py-1.5 rounded-full">
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
                    className="mx-auto text-[#B3CFE5] mb-2"
                  />

                  <p className="text-sm text-[#7A7F85]">
                    Select a team gender first
                  </p>

                  <p className="text-xs text-[#7A7F85] mt-1">
                    Available mentors will appear here
                  </p>
                </div>
              ) : filteredMentors.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-4 text-center">
                  <p className="text-sm text-red-500 font-medium">
                    No approved {gender.toLowerCase()} mentors available.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* ================================
                      MENTOR 1
                  ================================= */}

                  <div className="rounded-2xl border border-[#B3CFE5] p-4 bg-[#FAFCFE]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-[#1A3D63] text-white flex items-center justify-center text-xs font-bold">
                        1
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0A1931]">
                          First Mentor
                        </p>

                        <p className="text-xs text-[#7A7F85]">Primary mentor</p>
                      </div>
                    </div>

                    <select
                      value={mentor1}
                      onChange={(e) => setMentor1(e.target.value)}
                      className="w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#4A7FA7] bg-white"
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
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        ✓ Mentor selected
                      </div>
                    )}
                  </div>

                  {/* ================================
                      MENTOR 2
                  ================================= */}

                  <div className="rounded-2xl border border-[#B3CFE5] p-4 bg-[#FAFCFE]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-[#4A7FA7] text-white flex items-center justify-center text-xs font-bold">
                        2
                      </div>

                      <div>
                        <p className="text-sm font-bold text-[#0A1931]">
                          Second Mentor
                        </p>

                        <p className="text-xs text-[#7A7F85]">Co-mentor</p>
                      </div>
                    </div>

                    <select
                      value={mentor2}
                      onChange={(e) => setMentor2(e.target.value)}
                      className="w-full rounded-xl border border-[#B3CFE5] p-3 outline-none focus:ring-2 focus:ring-[#4A7FA7] bg-white"
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
                      <div className="mt-2 text-xs text-green-600 font-medium">
                        ✓ Mentor selected
                      </div>
                    )}
                  </div>

                  {/* ================================
                      SELECTED MENTOR SUMMARY
                  ================================= */}

                  {mentor1 && mentor2 && (
                    <div className="rounded-2xl bg-[#EAF3F9] border border-[#B3CFE5] p-4">
                      <p className="text-xs font-bold text-[#1A3D63] mb-3">
                        TEAM MENTORS
                      </p>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Mentor 1 */}
                        <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                          <div className="h-9 w-9 rounded-full bg-[#1A3D63] text-white flex items-center justify-center">
                            <UserRound size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#7A7F85]">Mentor 1</p>

                            <p className="text-sm font-bold text-[#0A1931] truncate">
                              {
                                mentors.find((m) => m._id === mentor1)
                                  ?.firstName
                              }{" "}
                              {mentors.find((m) => m._id === mentor1)?.lastName}
                            </p>
                          </div>
                        </div>

                        {/* Mentor 2 */}
                        <div className="flex items-center gap-2 bg-white rounded-xl p-3">
                          <div className="h-9 w-9 rounded-full bg-[#4A7FA7] text-white flex items-center justify-center">
                            <UserRound size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs text-[#7A7F85]">Mentor 2</p>

                            <p className="text-sm font-bold text-[#0A1931] truncate">
                              {
                                mentors.find((m) => m._id === mentor2)
                                  ?.firstName
                              }{" "}
                              {mentors.find((m) => m._id === mentor2)?.lastName}
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-[#0A1931]">Students</p>

                <span className="text-xs font-bold text-[#4A7FA7]">
                  {selectedStudents.length} selected
                </span>
              </div>

              <div className="border border-[#B3CFE5] rounded-xl p-3 h-32 overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No students available.
                  </p>
                ) : (
                  students.map((student) => (
                    <label
                      key={student._id}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#F6FAFD] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents((prev) => [
                              ...prev,
                              student._id,
                            ]);
                          } else {
                            setSelectedStudents((prev) =>
                              prev.filter((id) => id !== student._id),
                            );
                          }
                        }}
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
              disabled={creating || !mentor1 || !mentor2 || mentor1 === mentor2}
              className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                creating || !mentor1 || !mentor2 || mentor1 === mentor2
                  ? "bg-gray-400 cursor-not-allowed text-white"
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

          <div className="lg:col-span-2 grid gap-4">
            {teams.length === 0 ? (
              <div className="rounded-3xl border border-[#B3CFE5] bg-white p-10 text-center">
                <Users size={40} className="mx-auto text-[#B3CFE5] mb-3" />

                <p className="text-[#7A7F85]">No teams created yet.</p>
              </div>
            ) : (
              teams.map((team) => (
                <div
                  key={team._id}
                  className="rounded-3xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                >
                  {/* Team Header */}
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-bold text-[#0A1931]">
                      {team.name}
                    </h3>

                    <span className="bg-[#EAF3F9] px-3 py-1 rounded-full text-xs font-bold text-[#1A3D63]">
                      {team.gender}
                    </span>
                  </div>

                  {/* Mentors — every team has exactly two */}
                  <div className="mb-5">
                    <p className="text-xs font-bold text-[#4A7FA7] mb-2">
                      MENTORS
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {team.mentors?.map((mentor, index) => (
                        <div
                          key={mentor._id}
                          className="flex items-center gap-3 bg-[#F6FAFD] rounded-xl p-3"
                        >
                          <div className="h-9 w-9 rounded-full bg-[#1A3D63] text-white flex items-center justify-center">
                            <UserRound size={16} />
                          </div>

                          <div>
                            <p className="text-xs text-[#7A7F85]">
                              Mentor {index + 1}
                            </p>

                            <p className="text-sm font-bold text-[#0A1931]">
                              {mentor.firstName} {mentor.lastName}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Students — displayed the same style as mentors */}
                  <div className="mb-5">
                    <p className="text-xs font-bold text-[#4A7FA7] mb-2">
                      STUDENTS
                    </p>

                    {team.students?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {team.students.map((student) => (
                          <div
                            key={student._id}
                            className="flex items-center gap-3 bg-[#F6FAFD] rounded-xl p-3"
                          >
                            <div className="h-9 w-9 rounded-full bg-[#4A7FA7] text-white flex items-center justify-center">
                              <UserRound size={16} />
                            </div>

                            <div>
                              <p className="text-xs text-[#7A7F85]">Student</p>

                              <p className="text-sm font-bold text-[#0A1931]">
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
                  <div className="flex items-center justify-between text-xs font-semibold text-[#4A7FA7] border-t border-[#EAF3F9] pt-4">
                    <span>Mentors: {team.mentors?.length || 0}</span>

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
