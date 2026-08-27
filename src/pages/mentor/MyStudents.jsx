import { useEffect, useMemo, useState } from "react";
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
  RefreshCw,
} from "lucide-react";

const MyStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/at-risk/my-students");

      if (response.data?.success) {
        setStudents(
          Array.isArray(response.data.students) ? response.data.students : [],
        );
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Fetch mentor students error:", err);

      setError(
        err.response?.data?.message || "Failed to load your assigned students.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      const fullName = `${student.firstName || ""} ${
        student.lastName || ""
      }`.toLowerCase();

      const email = String(student.email || "").toLowerCase();

      const schoolId = String(student.schoolId || "").toLowerCase();

      const batchName =
        typeof student.batch === "object"
          ? String(student.batch?.name || "").toLowerCase()
          : String(student.batch || "").toLowerCase();

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        schoolId.includes(query) ||
        batchName.includes(query)
      );
    });
  }, [students, search]);

  const atRiskStudents = useMemo(
    () => students.filter((student) => student.atRisk === true),
    [students],
  );

  const getAbsenceCount = (student) => {
    return student?.risk?.absenceCount ?? student?.risk?.attendanceIssues ?? 0;
  };

  const getMissedAssignmentCount = (student) => {
    return (
      student?.risk?.missedAssignmentCount ??
      student?.risk?.assignmentIssues ??
      0
    );
  };

  const getBatchName = (student) => {
    if (!student?.batch) {
      return "No batch";
    }

    if (typeof student.batch === "object") {
      return student.batch.name || "No batch";
    }

    return student.batch;
  };

  const getInitials = (student) => {
    const first = student?.firstName?.trim()?.[0] || "";
    const last = student?.lastName?.trim()?.[0] || "";

    return `${first}${last}`.toUpperCase() || "ST";
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F8FA]">
        <div className="flex items-center gap-3 rounded-xl border border-[#B4D7E2] bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#00A8CC]" />

          <span className="text-sm font-semibold text-[#14222B]">
            Loading your students...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F8FA] text-[#14222B]">
      <header className="relative mx-auto mt-4 w-[calc(100%-2rem)] max-w-7xl overflow-hidden rounded-[20px] bg-linear-to-b from-[#173A45] via-[#0F2B34] to-[#071B23] shadow-md">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#00A8CC]/10" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[#4A7FA7]/10" />

        <div className="relative px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-r from-[#061E27] via-[#0B303A] to-[#173F49] shadow-sm text-white">
                <Users className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  My Students
                </h1>

                <p className="mt-1 text-xs font-medium text-[#B3CFE5]">
                  Manage and monitor your assigned students
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-sm sm:flex">
                <Users className="h-4 w-4 text-[#B3CFE5]" />

                <span>{students.length} Assigned</span>
              </div>

              <button
                type="button"
                onClick={() => fetchStudents(true)}
                disabled={refreshing}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                title="Refresh students"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/70 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />

              <p className="text-xs font-semibold text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-lg p-1 text-red-400 transition hover:bg-red-100 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-[#B4D7E2] bg-white px-4 py-3.5 shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                Assigned Students
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold leading-none text-[#14222B]">
                  {students.length}
                </span>

                <span className="text-[10px] font-medium text-[#8FA3B0]">
                  currently assigned
                </span>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#B4D7E2] bg-[#E3F5F9]">
              <Users className="h-5 w-5 text-[#00A8CC]" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-red-100 bg-white px-4 py-3.5 shadow-sm">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8FA3B0]">
                Students At Risk
              </p>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold leading-none text-red-500">
                  {atRiskStudents.length}
                </span>

                <span className="text-[10px] font-medium text-[#8FA3B0]">
                  requiring attention
                </span>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-red-50/60">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-sm">
          <div className="border-b border-[#E7EEF1] px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <h2 className="text-base font-bold text-[#14222B] sm:text-lg">
                  Assigned Students
                </h2>

                <p className="mt-0.5 text-[11px] text-[#8FA3B0] sm:text-xs">
                  Students with 2 or more absences or missed assignments are
                  marked at risk.
                </p>
              </div>

              <div className="relative w-full md:w-60">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8FA3B0]" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="h-10 w-full rounded-xl border border-[#B4D7E2] bg-[#F4F8FA] pl-9 pr-9 text-xs font-medium text-[#14222B] outline-none transition placeholder:text-[#8FA3B0] focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8FA3B0] transition hover:bg-[#E3F5F9] hover:text-[#14222B]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {filteredStudents.length === 0 ? (
              <div className="flex min-h-55 flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#B4D7E2] bg-[#E3F5F9] text-[#00A8CC]">
                  <Users className="h-6 w-6" />
                </div>

                <h3 className="mt-3 text-sm font-bold text-[#14222B]">
                  No students found
                </h3>

                <p className="mt-1 max-w-xs text-xs text-[#8FA3B0]">
                  {search
                    ? "No students match your search."
                    : "You currently have no assigned students."}
                </p>

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-3 rounded-lg bg-[#14222B] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1B3C47]"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredStudents.map((student) => {
                  const absenceCount = getAbsenceCount(student);

                  const missedAssignmentCount =
                    getMissedAssignmentCount(student);

                  const initials = getInitials(student);

                  return (
                    <article
                      key={student._id}
                      className={`rounded-xl border transition ${
                        student.atRisk
                          ? "border-red-100 bg-[#FFFAFA] hover:border-red-200"
                          : "border-[#D8E7EC] bg-[#F9FBFC] hover:border-[#B4D7E2] hover:bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-3 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xs font-bold ${
                              student.atRisk
                                ? "border-red-100 bg-red-50/70 text-red-500"
                                : "border-[#B4D7E2] bg-[#E3F5F9] text-[#00A8CC]"
                            }`}
                          >
                            {student.atRisk ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : (
                              initials
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-sm font-bold text-[#14222B]">
                                {student.firstName || "-"}{" "}
                                {student.lastName || ""}
                              </h3>

                              {student.atRisk ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-red-50/60 px-2 py-0.5 text-[9px] font-bold text-red-500">
                                  <AlertTriangle className="h-2.5 w-2.5" />
                                  At Risk
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50/60 px-2 py-0.5 text-[9px] font-bold text-emerald-600">
                                  <CheckCircle className="h-2.5 w-2.5" />
                                  On Track
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#8FA3B0]">
                              {student.email && (
                                <span className="flex min-w-0 items-center gap-1">
                                  <Mail className="h-3 w-3 shrink-0" />

                                  <span className="max-w-52.5 truncate">
                                    {student.email}
                                  </span>
                                </span>
                              )}

                              {student.schoolId && (
                                <span className="font-medium">
                                  ID: {student.schoolId}
                                </span>
                              )}

                              <span className="font-medium">
                                {getBatchName(student)}
                              </span>
                            </div>

                            {student.atRisk && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {absenceCount >= 2 && (
                                  <span className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-white px-2 py-1 text-[9px] font-bold text-red-500">
                                    <CalendarX className="h-3 w-3" />
                                    {absenceCount} Absences
                                  </span>
                                )}

                                {missedAssignmentCount >= 2 && (
                                  <span className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-white px-2 py-1 text-[9px] font-bold text-red-500">
                                    <FileX className="h-3 w-3" />
                                    {missedAssignmentCount} Missed Assignments
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedStudent(student)}
                          className="shrink-0 rounded-lg bg-[#00A8CC] px-4 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#0088A6] hover:shadow-md"
                        >
                          View Student
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {selectedStudent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#071B23]/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#B4D7E2] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7EEF1] bg-[#F4F8FA] px-5 py-4">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                    selectedStudent.atRisk
                      ? "border-red-100 bg-red-50/70 text-red-500"
                      : "border-[#B4D7E2] bg-[#E3F5F9] text-[#00A8CC]"
                  }`}
                >
                  {selectedStudent.atRisk ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <UserCircle className="h-5 w-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#14222B]">
                    Student Details
                  </h2>

                  <p className="max-w-62.5 truncate text-[11px] text-[#8FA3B0]">
                    {selectedStudent.firstName || ""}{" "}
                    {selectedStudent.lastName || ""}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 text-[#8FA3B0] transition hover:bg-gray-200 hover:text-[#14222B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-5">
              <div className="flex items-center gap-3 rounded-xl border border-[#B4D7E2]/70 bg-[#E3F5F9]/50 p-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    selectedStudent.atRisk
                      ? "bg-red-50/70 text-red-500"
                      : "bg-[#00A8CC] text-white"
                  }`}
                >
                  {selectedStudent.atRisk ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-[#14222B]">
                    {selectedStudent.firstName || ""}{" "}
                    {selectedStudent.lastName || ""}
                  </h3>

                  <p className="truncate text-[11px] text-[#8FA3B0]">
                    {selectedStudent.email || "No email available"}
                  </p>
                </div>
              </div>

              {selectedStudent.atRisk ? (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-red-600">
                        Student is At Risk
                      </p>

                      <p className="mt-0.5 text-[10px] text-red-500">
                        This student has reached the risk threshold.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-red-100 bg-white p-3">
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8FA3B0]">
                        <CalendarX className="h-3.5 w-3.5" />
                        Absences
                      </div>

                      <p className="mt-1 text-lg font-bold text-red-500">
                        {getAbsenceCount(selectedStudent)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-red-100 bg-white p-3">
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-[#8FA3B0]">
                        <FileX className="h-3.5 w-3.5" />
                        Missed Assignments
                      </div>

                      <p className="mt-1 text-lg font-bold text-red-500">
                        {getMissedAssignmentCount(selectedStudent)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <DetailBox
                  label="Student ID"
                  value={selectedStudent.schoolId}
                />

                <DetailBox
                  label="Batch"
                  value={getBatchName(selectedStudent)}
                />

                <DetailBox label="Email" value={selectedStudent.email} />

                <DetailBox
                  label="Risk Status"
                  value={selectedStudent.atRisk ? "At Risk" : "On Track"}
                  danger={selectedStudent.atRisk}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-[#E7EEF1] bg-[#F4F8FA] px-5 py-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-[#14222B] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#1B3C47]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailBox = ({ label, value, danger = false }) => {
  return (
    <div className="rounded-xl border border-[#B4D7E2]/70 bg-[#F8FAFB] p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-[#8FA3B0]">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-xs font-bold ${
          danger ? "text-red-500" : "text-[#14222B]"
        }`}
      >
        {value || "Not available"}
      </p>
    </div>
  );
};

export default MyStudents;
