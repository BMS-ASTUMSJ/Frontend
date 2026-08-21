import { useState, useEffect } from "react";
import api from "../../utils/api";

import {
  Users,
  Search,
  Mail,
  UserCircle,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  CalendarX,
  FileX,
} from "lucide-react";

const MyStudents = () => {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH ONLY ASSIGNED STUDENTS
  // ============================================================

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/at-risk/my-students");

        if (response.data.success) {
          setStudents(response.data.students || []);
        }
      } catch (err) {
        console.error("Fetch mentor students error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your assigned students.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredStudents = students.filter((student) => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return true;

    const name =
      `${student.firstName || ""} ${student.lastName || ""}`.toLowerCase();

    const email = student.email?.toLowerCase() || "";
    const schoolId = student.schoolId?.toLowerCase() || "";

    return (
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      schoolId.includes(searchValue)
    );
  });

  // ============================================================
  // AT-RISK COUNT
  // ============================================================

  const atRiskStudents = students.filter((student) => student.atRisk === true);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-3 text-[#1A3D63]">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span className="text-sm font-medium">Loading your students...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            My Students
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View only your assigned students and monitor their attendance and
            assignment status.
          </p>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* TOTAL ASSIGNED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  My Assigned Students
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {students.length}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-950">
                <Users size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          {/* AT RISK */}

          <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Students At Risk
                </p>

                <h2 className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
                  {atRiskStudents.length}
                </h2>
              </div>

              <div className="rounded-xl bg-red-100 p-3 dark:bg-red-950">
                <AlertTriangle
                  size={24}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            STUDENTS LIST
        ===================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
          {/* TOP */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assigned Students
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Students with 2 or more absences or 2 or more missed assignments
                are marked at risk.
              </p>
            </div>

            {/* SEARCH */}

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* ===================================================
              LIST
          =================================================== */}

          <div className="mt-6 space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center text-center">
                <Users size={42} className="text-gray-400" />

                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You currently have no assigned students.
                </p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const absenceCount =
                  student.risk?.absenceCount ??
                  student.risk?.attendanceIssues ??
                  0;

                const missedAssignmentCount =
                  student.risk?.missedAssignmentCount ??
                  student.risk?.assignmentIssues ??
                  0;

                return (
                  <div
                    key={student._id}
                    className={`rounded-2xl border p-5 transition hover:shadow-sm ${
                      student.atRisk
                        ? "border-red-300 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20"
                        : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* STUDENT INFO */}

                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                            student.atRisk
                              ? "bg-red-100 text-red-600 dark:bg-red-950"
                              : "bg-[#1A3D63] text-white"
                          }`}
                        >
                          {student.atRisk ? (
                            <AlertTriangle size={25} />
                          ) : (
                            <UserCircle size={26} />
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {student.firstName} {student.lastName}
                            </h3>

                            {student.atRisk ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-900 dark:text-red-300">
                                <AlertTriangle size={12} />
                                At Risk
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300">
                                <CheckCircle size={12} />
                                On Track
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {student.email}
                            </span>

                            {student.schoolId && (
                              <span>ID: {student.schoolId}</span>
                            )}

                            {student.batch?.name && (
                              <span>{student.batch.name}</span>
                            )}
                          </div>

                          {/* RISK DETAILS */}

                          {student.atRisk && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {absenceCount >= 2 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                  <CalendarX size={13} />
                                  {absenceCount} Absences
                                </span>
                              )}

                              {missedAssignmentCount >= 2 && (
                                <span className="inline-flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                                  <FileX size={13} />
                                  {missedAssignmentCount} Missed Assignments
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* VIEW STUDENT */}

                      <button
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                        className="rounded-xl bg-[#1A3D63] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A7FA7]"
                      >
                        View Student
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =======================================================
          STUDENT MODAL
      ======================================================= */}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Student Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* RISK STATUS */}

            <div className="mt-6">
              {selectedStudent.atRisk ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 shrink-0 text-red-600" />

                    <div>
                      <p className="font-bold text-red-700 dark:text-red-400">
                        Student is At Risk
                      </p>

                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                        This student has reached the risk threshold.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {/* ABSENCES */}

                    <div className="flex items-center justify-between rounded-lg bg-white/70 p-3 text-sm dark:bg-black/20">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <CalendarX size={16} />
                        Absences
                      </span>

                      <strong className="text-red-600">
                        {selectedStudent.risk?.absenceCount ??
                          selectedStudent.risk?.attendanceIssues ??
                          0}
                      </strong>
                    </div>

                    {/* MISSED ASSIGNMENTS */}

                    <div className="flex items-center justify-between rounded-lg bg-white/70 p-3 text-sm dark:bg-black/20">
                      <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                        <FileX size={16} />
                        Missed Assignments
                      </span>

                      <strong className="text-red-600">
                        {selectedStudent.risk?.missedAssignmentCount ??
                          selectedStudent.risk?.assignmentIssues ??
                          0}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />

                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">
                      Student is On Track
                    </p>

                    <p className="mt-1 text-xs text-green-600 dark:text-green-300">
                      The student has not reached the at-risk threshold.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* STUDENT DETAILS */}

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.email}
                </p>
              </div>

              {selectedStudent.schoolId && (
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>

                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedStudent.schoolId}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500">Risk Status</p>

                <p
                  className={`font-semibold ${
                    selectedStudent.atRisk ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {selectedStudent.atRisk ? "At Risk" : "On Track"}
                </p>
              </div>
            </div>

            {/* CLOSE */}

            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="mt-6 w-full rounded-xl bg-[#1A3D63] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#4A7FA7]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyStudents;
