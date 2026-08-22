import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

import {
  Users,
  Search,
  Mail,
  X,
  AlertTriangle,
  CheckCircle,
  Loader2,
  CalendarX,
  FileX,
  ArrowUpRight,
  Sparkles,
  GraduationCap,
  ShieldCheck,
  Activity,
  ChevronRight,
} from "lucide-react";

const MyStudents = () => {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH ASSIGNED STUDENTS
  // ============================================================

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/at-risk/my-students");

        if (response.data?.success) {
          setStudents(response.data.students || []);
        } else {
          setStudents([]);
        }
      } catch (err) {
        console.error("Fetch mentor students error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load your assigned students."
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

  const filteredStudents = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return students;

    return students.filter((student) => {
      const name = `${student.firstName || ""} ${
        student.lastName || ""
      }`.toLowerCase();

      const email = student.email?.toLowerCase() || "";
      const schoolId = student.schoolId?.toLowerCase() || "";
      const batch = student.batch?.name?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        email.includes(searchValue) ||
        schoolId.includes(searchValue) ||
        batch.includes(searchValue)
      );
    });
  }, [students, search]);

  // ============================================================
  // COUNTS
  // ============================================================

  const atRiskStudents = students.filter(
    (student) => student.atRisk === true
  );

  const onTrackStudents = students.filter(
    (student) => student.atRisk !== true
  );

  // ============================================================
  // NAME
  // ============================================================

  const getStudentName = (student) => {
    const name = `${student.firstName || ""} ${
      student.lastName || ""
    }`.trim();

    return name || "Unknown Student";
  };

  // ============================================================
  // INITIALS
  // ============================================================

  const getInitials = (student) => {
    const first = student.firstName?.charAt(0) || "";
    const last = student.lastName?.charAt(0) || "";

    const initials = `${first}${last}`.toUpperCase();

    return initials || "ST";
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAF3F7] p-6 text-[#173B59]">
        <div className="mx-auto flex min-h-[75vh] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#E98245]/30 bg-[#FFF9EF] shadow-lg">
              <div className="absolute inset-0 animate-ping rounded-full border border-[#E98245]/20" />

              <Loader2
                size={28}
                className="animate-spin text-[#E98245]"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-[#173B59]">
                Loading your students
              </p>

              <p className="mt-1 text-xs text-[#718096]">
                Preparing your mentor workspace...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EAF3F7] px-4 py-6 text-[#173B59] sm:px-6 lg:px-8">
      {/* ========================================================
          BACKGROUND DECORATION
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#BFDDEB]/60 blur-[120px]" />

        <div className="absolute -bottom-48 -right-48 h-[550px] w-[550px] rounded-full bg-[#F6C8A7]/50 blur-[130px]" />

        <div className="absolute right-[25%] top-[10%] h-64 w-64 rounded-full bg-[#D8EAF4]/70 blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#173B59 1px, transparent 1px), linear-gradient(90deg, #173B59 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              {/* SMALL LABEL */}

              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E98245]/20 bg-[#FFF1E6]">
                  <GraduationCap
                    size={17}
                    className="text-[#E98245]"
                  />
                </div>

                <span className="text-xs font-black uppercase tracking-[0.25em] text-[#E98245]">
                  Mentor Workspace
                </span>
              </div>

              {/* TITLE */}

              <h1 className="text-3xl font-black tracking-tight text-[#173B59] sm:text-4xl">
                My Students
                <span className="ml-2 text-[#E98245]">.</span>
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718096]">
                View your assigned students, monitor their progress,
                and identify learners who may need extra support.
              </p>
            </div>

            {/* HEADER BADGE */}

            <div className="hidden items-center gap-3 rounded-2xl border border-[#D7E3E9] bg-[#FFF9EF]/90 px-4 py-3 shadow-[0_10px_30px_rgba(23,59,89,0.08)] lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF0E4]">
                <Sparkles
                  size={18}
                  className="text-[#E98245]"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-[#173B59]">
                  Mentor Overview
                </p>

                <p className="text-[11px] text-[#81909C]">
                  Your students at a glance
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <AlertTriangle size={19} />
            <span>{error}</span>
          </div>
        )}

        {/* ======================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="mb-7 grid grid-cols-1 gap-5 md:grid-cols-3">

          <SummaryCard
            title="Assigned Students"
            value={students.length}
            description="Students currently assigned to you"
            icon={<Users size={23} />}
            iconClass="bg-[#E3F2FA] text-[#3184B6]"
            accent="blue"
          />

          <SummaryCard
            title="On Track"
            value={onTrackStudents.length}
            description="Students progressing normally"
            icon={<CheckCircle size={23} />}
            iconClass="bg-[#DDF5EA] text-[#35A987]"
            accent="green"
          />

          <SummaryCard
            title="Students At Risk"
            value={atRiskStudents.length}
            description="Students requiring attention"
            icon={<AlertTriangle size={23} />}
            iconClass="bg-[#FFF0E4] text-[#E98245]"
            accent="orange"
            danger
          />

        </div>

        {/* ======================================================
            MAIN STUDENTS CONTAINER
        ====================================================== */}

        <div className="overflow-hidden rounded-[2rem] border border-[#E1D8C8] bg-[#FFF9EF]/95 shadow-[0_25px_80px_rgba(23,59,89,0.10)]">

          {/* ====================================================
              CONTAINER HEADER
          ==================================================== */}

          <div className="border-b border-[#E7DED1] p-5 sm:p-7">

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0E4]">
                    <Users
                      size={19}
                      className="text-[#E98245]"
                    />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-[#173B59]">
                      Assigned Students
                    </h2>

                    <p className="text-xs text-[#84929C]">
                      Your private student list
                    </p>
                  </div>

                </div>

                <p className="mt-4 max-w-2xl text-xs leading-6 text-[#718096]">
                  Students with 2 or more absences or 2 or more
                  missed assignments are automatically marked as
                  <span className="font-bold text-[#E98245]">
                    {" "}At Risk
                  </span>.
                </p>

              </div>

              {/* SEARCH */}

              <div className="relative w-full xl:w-80">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8295A3]"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student..."
                  className="w-full rounded-2xl border border-[#D9E0E4] bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-[#173B59] outline-none transition placeholder:text-[#9AA6AE] hover:border-[#C7D2D8] focus:border-[#E98245]/60 focus:ring-4 focus:ring-[#E98245]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#8295A3] transition hover:bg-[#F3EDE4] hover:text-[#173B59]"
                  >
                    <X size={15} />
                  </button>
                )}

              </div>

            </div>
          </div>

          {/* ====================================================
              STUDENTS
          ==================================================== */}

          <div className="p-5 sm:p-7">

            {filteredStudents.length === 0 ? (
              <EmptyStudents search={search} />
            ) : (
              <div className="grid gap-4">

                {filteredStudents.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    onView={() => setSelectedStudent(student)}
                    getInitials={getInitials}
                    getStudentName={getStudentName}
                  />
                ))}

              </div>
            )}

          </div>
        </div>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B9BA5]">
          <ShieldCheck size={13} />
          ASTU MSJ • Mentor Portal • Student Support
        </div>

      </div>

      {/* ========================================================
          STUDENT MODAL
      ======================================================== */}

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          getInitials={getInitials}
          getStudentName={getStudentName}
        />
      )}
    </div>
  );
};

// ================================================================
// SUMMARY CARD
// ================================================================

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClass,
  accent,
  danger,
}) {
  const accentClasses = {
    blue: "border-[#BFD9E8]",
    green: "border-[#BFE5D6]",
    orange: "border-[#F1C8AA]",
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] border bg-[#FFF9EF] p-6 shadow-[0_10px_35px_rgba(23,59,89,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(23,59,89,0.12)] ${
        accentClasses[accent]
      }`}
    >

      {/* DECORATIVE CIRCLES */}

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full border border-[#173B59]/[0.04]" />

      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border border-[#173B59]/[0.04]" />

      <div className="relative z-10 flex items-start justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#82909A]">
            {title}
          </p>

          <p
            className={`mt-3 text-4xl font-black ${
              danger ? "text-[#E98245]" : "text-[#173B59]"
            }`}
          >
            {value}
          </p>

          <p className="mt-2 max-w-[210px] text-xs leading-5 text-[#84929C]">
            {description}
          </p>

        </div>

        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white shadow-inner ${iconClass}`}
        >
          {icon}
        </div>

      </div>

      {/* BOTTOM LINE */}

      <div className="relative mt-5 h-1 overflow-hidden rounded-full bg-[#EEE7DD]">

        <div
          className={`h-full w-1/3 rounded-full ${
            accent === "orange"
              ? "bg-[#E98245]"
              : accent === "green"
              ? "bg-[#35A987]"
              : "bg-[#4F9CCB]"
          }`}
        />

      </div>

    </div>
  );
}

// ================================================================
// STUDENT CARD
// ================================================================

function StudentCard({
  student,
  onView,
  getInitials,
  getStudentName,
}) {
  const absenceCount =
    student.risk?.absenceCount ??
    student.risk?.attendanceIssues ??
    0;

  const missedAssignmentCount =
    student.risk?.missedAssignmentCount ??
    student.risk?.assignmentIssues ??
    0;

  const atRisk = student.atRisk === true;

  return (
    <div
      className={`group relative overflow-hidden rounded-[1.5rem] border p-5 shadow-[0_6px_25px_rgba(23,59,89,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(23,59,89,0.10)] sm:p-6 ${
        atRisk
          ? "border-[#F1C8AA] bg-[#FFF5EC] hover:border-[#E98245]/50"
          : "border-[#DDE5E9] bg-white hover:border-[#BFD9E8]"
      }`}
    >

      {/* SIDE ACCENT */}

      <div
        className={`absolute bottom-0 left-0 top-0 w-1 ${
          atRisk ? "bg-[#E98245]" : "bg-[#35A987]"
        }`}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        {/* STUDENT INFO */}

        <div className="flex min-w-0 items-start gap-4">

          {/* AVATAR */}

          <div
            className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${
              atRisk
                ? "border-[#F1C8AA] bg-[#FFF0E4] text-[#E98245]"
                : "border-[#BFD9E8] bg-[#E5F2F8] text-[#3184B6]"
            }`}
          >

            <span className="text-sm font-black">
              {getInitials(student)}
            </span>

            {/* STATUS DOT */}

            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                atRisk ? "bg-[#E98245]" : "bg-[#35A987]"
              }`}
            />

          </div>

          {/* DETAILS */}

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <h3 className="truncate text-base font-black text-[#173B59]">
                {getStudentName(student)}
              </h3>

              {atRisk ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F1C8AA] bg-[#FFF0E4] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#E98245]">
                  <AlertTriangle size={11} />
                  At Risk
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#BFE5D6] bg-[#E4F7EF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#299978]">
                  <CheckCircle size={11} />
                  On Track
                </span>
              )}

            </div>

            {/* EMAIL */}

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#778893]">

              <span className="flex items-center gap-1.5">
                <Mail size={13} />
                {student.email || "No email"}
              </span>

              {student.schoolId && (
                <span className="rounded-md bg-[#F2F5F6] px-2 py-1">
                  ID: {student.schoolId}
                </span>
              )}

              {student.batch?.name && (
                <span className="rounded-md bg-[#F2F5F6] px-2 py-1">
                  {student.batch.name}
                </span>
              )}

            </div>

            {/* RISK DETAILS */}

            {atRisk && (
              <div className="mt-4 flex flex-wrap gap-2">

                {absenceCount >= 2 && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-[#F1C8AA] bg-[#FFF0E4] px-3 py-2 text-[11px] font-bold text-[#E98245]">
                    <CalendarX size={13} />
                    {absenceCount} Absences
                  </div>
                )}

                {missedAssignmentCount >= 2 && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-[#F1C8AA] bg-[#FFF0E4] px-3 py-2 text-[11px] font-bold text-[#E98245]">
                    <FileX size={13} />
                    {missedAssignmentCount} Missed Assignments
                  </div>
                )}

              </div>
            )}

          </div>
        </div>

        {/* VIEW BUTTON */}

        <button
          type="button"
          onClick={onView}
          className="group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#173B59] px-5 py-3 text-xs font-black text-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-[#E98245]"
        >
          View Student

          <ChevronRight
            size={15}
            className="transition-transform group-hover/button:translate-x-0.5"
          />
        </button>

      </div>
    </div>
  );
}

// ================================================================
// EMPTY STATE
// ================================================================

function EmptyStudents({ search }) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-[#C9D8DF] bg-[#F8FBFC] px-6 text-center">

      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#D5E2E8] bg-white shadow-sm">

        <div className="absolute inset-[-8px] rounded-full border border-[#DCE8ED]" />

        {search ? (
          <Search
            size={28}
            className="text-[#8295A3]"
          />
        ) : (
          <Users
            size={28}
            className="text-[#8295A3]"
          />
        )}

      </div>

      <h3 className="text-base font-black text-[#173B59]">
        {search ? "No matching students" : "No students found"}
      </h3>

      <p className="mt-2 max-w-sm text-xs leading-6 text-[#7D8D97]">
        {search
          ? "Try searching with a different name, email, student ID, or batch."
          : "You currently have no students assigned to you. Assigned students will appear here."}
      </p>

    </div>
  );
}

// ================================================================
// STUDENT MODAL
// ================================================================

function StudentModal({
  student,
  onClose,
  getInitials,
  getStudentName,
}) {
  const atRisk = student.atRisk === true;

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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#173B59]/40 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >

      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-[#DCD4C8] bg-[#FFF9EF] shadow-[0_30px_100px_rgba(23,59,89,0.25)]">

        {/* TOP DECORATION */}

        <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 rounded-full bg-[#F6C8A7]/50 blur-[90px]" />

        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[#CFE6F0]/60 blur-[90px]" />

        {/* HEADER */}

        <div className="relative border-b border-[#E7DED1] p-6 sm:p-7">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#E98245]">
                Student Profile
              </p>

              <h2 className="mt-2 text-2xl font-black text-[#173B59]">
                Student Details
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#DDE3E6] bg-white p-2 text-[#7B8B95] transition hover:bg-[#F3EDE4] hover:text-[#173B59]"
            >
              <X size={19} />
            </button>

          </div>

          {/* PROFILE */}

          <div className="mt-6 flex items-center gap-4">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full border ${
                atRisk
                  ? "border-[#F1C8AA] bg-[#FFF0E4] text-[#E98245]"
                  : "border-[#BFE5D6] bg-[#E4F7EF] text-[#299978]"
              }`}
            >
              <span className="text-lg font-black">
                {getInitials(student)}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-[#173B59]">
                {getStudentName(student)}
              </h3>

              <p className="mt-1 text-xs text-[#71828D]">
                {student.email || "No email available"}
              </p>
            </div>

          </div>
        </div>

        {/* BODY */}

        <div className="relative space-y-5 p-6 sm:p-7">

          {/* STATUS */}

          <div
            className={`rounded-2xl border p-4 ${
              atRisk
                ? "border-[#F1C8AA] bg-[#FFF0E4]"
                : "border-[#BFE5D6] bg-[#E4F7EF]"
            }`}
          >

            <div className="flex items-center gap-3">

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  atRisk
                    ? "bg-white text-[#E98245]"
                    : "bg-white text-[#299978]"
                }`}
              >
                {atRisk ? (
                  <AlertTriangle size={19} />
                ) : (
                  <CheckCircle size={19} />
                )}
              </div>

              <div>

                <p
                  className={`text-sm font-black ${
                    atRisk
                      ? "text-[#E98245]"
                      : "text-[#299978]"
                  }`}
                >
                  {atRisk
                    ? "Student is At Risk"
                    : "Student is On Track"}
                </p>

                <p className="mt-1 text-[11px] text-[#71828D]">
                  {atRisk
                    ? "This student has reached the risk threshold."
                    : "This student is currently progressing normally."}
                </p>

              </div>

            </div>

          </div>

          {/* RISK STATS */}

          <div className="grid grid-cols-2 gap-3">

            <DetailStat
              icon={<CalendarX size={17} />}
              label="Absences"
              value={absenceCount}
              danger={absenceCount >= 2}
            />

            <DetailStat
              icon={<FileX size={17} />}
              label="Missed Assignments"
              value={missedAssignmentCount}
              danger={missedAssignmentCount >= 2}
            />

          </div>

          {/* INFORMATION */}

          <div className="rounded-2xl border border-[#E1D9CE] bg-white p-5">

            <div className="mb-4 flex items-center gap-2">

              <Activity
                size={16}
                className="text-[#E98245]"
              />

              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#71828D]">
                Student Information
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <InfoItem
                label="Full Name"
                value={getStudentName(student)}
              />

              <InfoItem
                label="Email"
                value={student.email || "N/A"}
              />

              <InfoItem
                label="Student ID"
                value={student.schoolId || "N/A"}
              />

              <InfoItem
                label="Batch"
                value={student.batch?.name || "N/A"}
              />

              <InfoItem
                label="Role"
                value="Student"
              />

              <InfoItem
                label="Risk Status"
                value={atRisk ? "At Risk" : "On Track"}
                valueClass={
                  atRisk
                    ? "text-[#E98245]"
                    : "text-[#299978]"
                }
              />

            </div>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#E98245] py-3.5 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#D97038]"
          >
            Close Profile

            <ArrowUpRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </button>

        </div>
      </div>
    </div>
  );
}

// ================================================================
// DETAIL STAT
// ================================================================

function DetailStat({
  icon,
  label,
  value,
  danger,
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        danger
          ? "border-[#F1C8AA] bg-[#FFF0E4]"
          : "border-[#DDE5E9] bg-white"
      }`}
    >

      <div className="flex items-center gap-2">

        <span
          className={
            danger
              ? "text-[#E98245]"
              : "text-[#8295A3]"
          }
        >
          {icon}
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wide text-[#71828D]">
          {label}
        </span>

      </div>

      <p
        className={`mt-3 text-2xl font-black ${
          danger ? "text-[#E98245]" : "text-[#173B59]"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

// ================================================================
// INFO ITEM
// ================================================================

function InfoItem({
  label,
  value,
  valueClass = "text-[#173B59]",
}) {
  return (
    <div>

      <p className="text-[10px] font-bold uppercase tracking-wide text-[#82909A]">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold ${valueClass}`}
      >
        {value}
      </p>

    </div>
  );
}

export default MyStudents;