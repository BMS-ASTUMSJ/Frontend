import { useMemo, useState } from "react";
import {
  UserPlus,
  Check,
  X,
  Users,
  UserCheck,
  Clock3,
  UserX,
  MoreVertical,
  UserRoundPlus,
  ArrowRight,
  ShieldCheck,
  ShieldBan,
  RotateCcw,
} from "lucide-react";

function UserManagement() {
  const [activeTab, setActiveTab] = useState("applicants");


  const [applicantStatus, setApplicantStatus] = useState("all");

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState(null);

  const [mentorForm, setMentorForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  
  const [applicants, setApplicants] = useState([
    {
      id: 1,
      name: "Abebe Kebede",
      email: "abebe@gmail.com",
      appliedAt: "Aug 15, 2026",
      status: "pending",
    },
    {
      id: 2,
      name: "Hana Ali",
      email: "hana@gmail.com",
      appliedAt: "Aug 14, 2026",
      status: "pending",
    },
    {
      id: 3,
      name: "Dawit Mekonnen",
      email: "dawit@gmail.com",
      appliedAt: "Aug 13, 2026",
      status: "accepted",
    },
    {
      id: 4,
      name: "Mimi Tesfaye",
      email: "mimi@gmail.com",
      appliedAt: "Aug 12, 2026",
      status: "rejected",
    },
  ]);

  const [mentors, setMentors] = useState([
    {
      id: 1,
      name: "Mentor A",
      email: "mentora@gmail.com",
      students: [1, 2],
    },
    {
      id: 2,
      name: "Mentor B",
      email: "mentorb@gmail.com",
      students: [3],
    },
  ]);

  const [students] = useState([
    {
      id: 1,
      name: "Student One",
      email: "student1@gmail.com",
    },
    {
      id: 2,
      name: "Student Two",
      email: "student2@gmail.com",
    },
    {
      id: 3,
      name: "Student Three",
      email: "student3@gmail.com",
    },
    {
      id: 4,
      name: "Student Four",
      email: "student4@gmail.com",
    },
    {
      id: 5,
      name: "Student Five",
      email: "student5@gmail.com",
    },
    {
      id: 6,
      name: "Student Six",
      email: "student6@gmail.com",
    },
  ]);

  

  const [blacklist, setBlacklist] = useState([
    {
      id: 101,
      name: "Blacklisted Student",
      email: "blacklisted@gmail.com",
      role: "Student",
      addedAt: "Aug 10, 2026",
    },
    {
      id: 102,
      name: "Former Mentor",
      email: "formermentor@gmail.com",
      role: "Mentor",
      addedAt: "Aug 08, 2026",
    },
  ]);

  

  const filteredApplicants = useMemo(() => {
    if (applicantStatus === "all") {
      return applicants;
    }

    return applicants.filter(
      (applicant) => applicant.status === applicantStatus
    );
  }, [applicants, applicantStatus]);

 

  const updateApplicantStatus = (id, status) => {
    setApplicants((previous) =>
      previous.map((applicant) =>
        applicant.id === id
          ? {
              ...applicant,
              status,
            }
          : applicant
      )
    );

    /*
      Later connect this to your backend.

      Accept:
      PATCH /api/users/:id/approve

      Reject:
      PATCH /api/users/:id/reject
    */
  };

  

  const addToBlacklist = (user, role = "Student") => {
    const alreadyBlacklisted = blacklist.some(
      (item) => item.email === user.email
    );

    if (alreadyBlacklisted) {
      return;
    }

    const newBlacklistedUser = {
      id: Date.now(),
      name: user.name,
      email: user.email,
      role,
      addedAt: "Aug 15, 2026",
    };

    setBlacklist((previous) => [
      ...previous,
      newBlacklistedUser,
    ]);
  };

  

  const removeFromBlacklist = (id) => {
    setBlacklist((previous) =>
      previous.filter((user) => user.id !== id)
    );
  };

  

  const handleMentorChange = (e) => {
    const { name, value } = e.target;

    setMentorForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  

  const handleAddMentor = (e) => {
    e.preventDefault();

    if (
      !mentorForm.name ||
      !mentorForm.email ||
      !mentorForm.password
    ) {
      return;
    }

    const newMentor = {
      id: Date.now(),
      name: mentorForm.name,
      email: mentorForm.email,
      students: [],
    };

    setMentors((previous) => [
      ...previous,
      newMentor,
    ]);

    setMentorForm({
      name: "",
      email: "",
      password: "",
    });

    setShowMentorModal(false);

    
  };

 

  const getAssignedStudentIds = () => {
    const ids = [];

    mentors.forEach((mentor) => {
      mentor.students.forEach((studentId) => {
        ids.push(studentId);
      });
    });

    return ids;
  };

  const assignedStudentIds = getAssignedStudentIds();

  const availableStudents = students.filter(
    (student) => !assignedStudentIds.includes(student.id)
  );

  const openAssignModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowAssignModal(true);
  };

  const assignStudent = (studentId) => {
    if (!selectedMentor) return;

    if (assignedStudentIds.includes(studentId)) {
      return;
    }

    setMentors((previous) =>
      previous.map((mentor) =>
        mentor.id === selectedMentor.id
          ? {
              ...mentor,
              students: [...mentor.students, studentId],
            }
          : mentor
      )
    );

    setSelectedMentor((previous) => ({
      ...previous,
      students: [
        ...previous.students,
        studentId,
      ],
    }));
  };

  const removeStudent = (mentorId, studentId) => {
    setMentors((previous) =>
      previous.map((mentor) =>
        mentor.id === mentorId
          ? {
              ...mentor,
              students: mentor.students.filter(
                (id) => id !== studentId
              ),
            }
          : mentor
      )
    );
  };

  const getStudentsForMentor = (mentor) => {
    return students.filter((student) =>
      mentor.students.includes(student.id)
    );
  };

 

  const pendingCount = applicants.filter(
    (item) => item.status === "pending"
  ).length;

  const acceptedCount = applicants.filter(
    (item) => item.status === "accepted"
  ).length;

  const rejectedCount = applicants.filter(
    (item) => item.status === "rejected"
  ).length;

  
  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-6 lg:p-8">

     

      <div className="mb-8">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A7FA7] text-white">
                <Users className="h-5 w-5" />
              </div>

              <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[#4A7FA7]">
                Administration
              </span>

            </div>

            <h1 className="text-3xl font-bold text-[#0A1931]">
              User Management
            </h1>

            <p className="mt-2 text-sm text-[#7A7F85]">
              Manage applicants, mentors, student groups and blacklist.
            </p>

          </div>

        </div>

      </div>

      

      <div className="mb-6 overflow-x-auto">

        <div className="flex min-w-max gap-2 rounded-2xl border border-[#B3CFE5] bg-white p-2">

        

          <button
            onClick={() => {
              setActiveTab("applicants");
              setApplicantStatus("all");
            }}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "applicants"
                ? "bg-[#1A3D63] text-white"
                : "text-[#7A7F85] hover:bg-[#F6FAFD] hover:text-[#1A3D63]"
            }`}
          >
            Applicants
          </button>

          

          <button
            onClick={() => setActiveTab("mentors")}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "mentors"
                ? "bg-[#1A3D63] text-white"
                : "text-[#7A7F85] hover:bg-[#F6FAFD] hover:text-[#1A3D63]"
            }`}
          >
            Mentors
          </button>

          

          <button
            onClick={() => setActiveTab("groups")}
            className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "groups"
                ? "bg-[#1A3D63] text-white"
                : "text-[#7A7F85] hover:bg-[#F6FAFD] hover:text-[#1A3D63]"
            }`}
          >
            Student Groups
          </button>

          

          <button
            onClick={() => setActiveTab("blacklist")}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === "blacklist"
                ? "bg-[#1A3D63] text-white"
                : "text-[#7A7F85] hover:bg-[#F6FAFD] hover:text-[#1A3D63]"
            }`}
          >
            <ShieldBan className="h-4 w-4" />
            Blacklist
          </button>

        </div>

      </div>

     

      {activeTab === "applicants" && (
        <div>

          

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

           

            <button
              onClick={() => setApplicantStatus("pending")}
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                applicantStatus === "pending"
                  ? "border-[#4A7FA7] ring-2 ring-[#B3CFE5]"
                  : "border-[#B3CFE5]"
              }`}
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-[#7A7F85]">
                    Pending
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0A1931]">
                    {pendingCount}
                  </p>

                  <p className="mt-1 text-xs text-[#7A7F85]">
                    Click to view
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF7E6] text-[#B7791F]">
                  <Clock3 className="h-5 w-5" />
                </div>

              </div>

            </button>


            <button
              onClick={() => setApplicantStatus("accepted")}
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                applicantStatus === "accepted"
                  ? "border-green-500 ring-2 ring-green-100"
                  : "border-[#B3CFE5]"
              }`}
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-[#7A7F85]">
                    Accepted
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0A1931]">
                    {acceptedCount}
                  </p>

                  <p className="mt-1 text-xs text-[#7A7F85]">
                    Click to view
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <UserCheck className="h-5 w-5" />
                </div>

              </div>

            </button>

           

            <button
              onClick={() => setApplicantStatus("rejected")}
              className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                applicantStatus === "rejected"
                  ? "border-red-500 ring-2 ring-red-100"
                  : "border-[#B3CFE5]"
              }`}
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-medium text-[#7A7F85]">
                    Rejected
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0A1931]">
                    {rejectedCount}
                  </p>

                  <p className="mt-1 text-xs text-[#7A7F85]">
                    Click to view
                  </p>

                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <UserX className="h-5 w-5" />
                </div>

              </div>

            </button>

          </div>

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-[#0A1931]">
                {applicantStatus === "all"
                  ? "All Applications"
                  : `${capitalize(applicantStatus)} Applicants`}
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                {filteredApplicants.length} applicant
                {filteredApplicants.length !== 1 ? "s" : ""} shown
              </p>

            </div>

            <button
              onClick={() => setApplicantStatus("all")}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                applicantStatus === "all"
                  ? "border-[#1A3D63] bg-[#1A3D63] text-white"
                  : "border-[#B3CFE5] bg-white text-[#1A3D63] hover:bg-[#F6FAFD]"
              }`}
            >
              All Applicants
            </button>

          </div>

         

          <div className="overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-sm">

            <div className="border-b border-[#B3CFE5] px-6 py-5">

              <h2 className="text-lg font-bold text-[#0A1931]">
                Applications
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Review registration applications and manage their status.
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px]">

                <thead className="bg-[#F6FAFD]">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Applicant
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Applied
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredApplicants.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center"
                      >

                        <Users className="mx-auto h-10 w-10 text-[#B3CFE5]" />

                        <p className="mt-3 font-semibold text-[#0A1931]">
                          No applicants found
                        </p>

                        <p className="mt-1 text-sm text-[#7A7F85]">
                          There are no applicants with this status.
                        </p>

                      </td>

                    </tr>

                  ) : (

                    filteredApplicants.map((applicant) => (

                      <tr
                        key={applicant.id}
                        className="border-t border-[#E5EEF5] transition hover:bg-[#F6FAFD]"
                      >

                       

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B3CFE5] font-bold text-[#0A1931]">
                              {applicant.name.charAt(0)}
                            </div>

                            <p className="font-semibold text-[#0A1931]">
                              {applicant.name}
                            </p>

                          </div>

                        </td>

                        

                        <td className="px-6 py-5 text-sm text-[#7A7F85]">
                          {applicant.email}
                        </td>

                        

                        <td className="px-6 py-5 text-sm text-[#7A7F85]">
                          {applicant.appliedAt}
                        </td>

                       

                        <td className="px-6 py-5">
                          <StatusBadge status={applicant.status} />
                        </td>

                        

                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            {applicant.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateApplicantStatus(
                                      applicant.id,
                                      "accepted"
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                  Accept
                                </button>

                                <button
                                  onClick={() =>
                                    updateApplicantStatus(
                                      applicant.id,
                                      "rejected"
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                  <X className="h-4 w-4" />
                                  Reject
                                </button>
                              </>
                            )}

                            <button
                              onClick={() =>
                                addToBlacklist(
                                  applicant,
                                  "Student"
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg border border-[#B3CFE5] bg-[#F6FAFD] px-3 py-2 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#EAF2F8]"
                            >
                              <ShieldBan className="h-4 w-4" />
                              Blacklist
                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      
      {activeTab === "mentors" && (
        <div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-2xl font-bold text-[#0A1931]">
                Mentors
              </h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Create mentors and manage their assigned students.
              </p>

            </div>

            <button
              onClick={() => setShowMentorModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#4A7FA7]"
            >
              <UserPlus className="h-5 w-5" />
              Add Mentor
            </button>

          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {mentors.map((mentor) => {

              const mentorStudents =
                getStudentsForMentor(mentor);

              return (
                <div
                  key={mentor.id}
                  className="rounded-2xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B3CFE5] text-lg font-bold text-[#0A1931]">
                        {mentor.name.charAt(0)}
                      </div>

                      <div>

                        <h3 className="font-bold text-[#0A1931]">
                          {mentor.name}
                        </h3>

                        <p className="text-sm text-[#7A7F85]">
                          {mentor.email}
                        </p>

                      </div>

                    </div>

                    <button className="text-[#7A7F85] hover:text-[#1A3D63]">
                      <MoreVertical className="h-5 w-5" />
                    </button>

                  </div>

                  <div className="my-5 border-t border-[#E5EEF5]" />

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Users className="h-5 w-5 text-[#4A7FA7]" />

                      <span className="text-sm font-semibold text-[#0A1931]">
                        {mentorStudents.length} students
                      </span>

                    </div>

                    <button
                      onClick={() =>
                        openAssignModal(mentor)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-[#B3CFE5] px-3 py-2 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
                    >
                      Assign Students
                      <ArrowRight className="h-4 w-4" />
                    </button>

                  </div>

                  
                  <button
                    onClick={() =>
                      addToBlacklist(mentor, "Mentor")
                    }
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    <ShieldBan className="h-4 w-4" />
                    Add to Blacklist
                  </button>

                </div>
              );
            })}

          </div>

        </div>
      )}

      

      {activeTab === "groups" && (
        <div>

          <div className="mb-6">

            <h2 className="text-2xl font-bold text-[#0A1931]">
              Student Groups
            </h2>

            <p className="mt-1 text-sm text-[#7A7F85]">
              Each student can belong to only one mentor group.
            </p>

          </div>

          <div className="grid gap-5 lg:grid-cols-2">

            {mentors.map((mentor) => {

              const mentorStudents =
                getStudentsForMentor(mentor);

              return (
                <div
                  key={mentor.id}
                  className="rounded-2xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-[#0A1931]">
                        {mentor.name}
                      </h3>

                      <p className="mt-1 text-sm text-[#7A7F85]">
                        {mentorStudents.length} assigned students
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F6FAFD] text-[#4A7FA7]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                  </div>

                  <div className="mt-5 space-y-3">

                    {mentorStudents.length === 0 ? (

                      <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-5 text-center text-sm text-[#7A7F85]">
                        No students assigned yet.
                      </div>

                    ) : (

                      mentorStudents.map((student) => (

                        <div
                          key={student.id}
                          className="flex items-center justify-between rounded-xl border border-[#E5EEF5] bg-[#F6FAFD] p-3"
                        >

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B3CFE5] text-sm font-bold text-[#0A1931]">
                              {student.name.charAt(0)}
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-[#0A1931]">
                                {student.name}
                              </p>

                              <p className="text-xs text-[#7A7F85]">
                                {student.email}
                              </p>

                            </div>

                          </div>

                          <button
                            onClick={() =>
                              removeStudent(
                                mentor.id,
                                student.id
                              )
                            }
                            className="text-xs font-semibold text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>

                        </div>

                      ))

                    )}

                  </div>

                  <button
                    onClick={() =>
                      openAssignModal(mentor)
                    }
                    className="mt-5 w-full rounded-xl border border-[#B3CFE5] py-3 text-sm font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
                  >
                    + Assign Student
                  </button>

                </div>
              );
            })}

          </div>

        </div>
      )}


      {activeTab === "blacklist" && (
        <div>

          <div className="mb-6">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ShieldBan className="h-6 w-6" />
              </div>

              <div>

                <h2 className="text-2xl font-bold text-[#0A1931]">
                  Blacklist
                </h2>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  Manage users who are restricted from the system.
                </p>

              </div>

            </div>

          </div>

          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">

            <div className="flex items-start gap-3">

              <ShieldBan className="mt-0.5 h-5 w-5 text-red-600" />

              <div>

                <p className="font-semibold text-red-700">
                  Blacklisted Users: {blacklist.length}
                </p>

                <p className="mt-1 text-sm text-red-600">
                  These users have been added to the system blacklist.
                </p>

              </div>

            </div>

          </div>

          <div className="overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="bg-[#F6FAFD]">

                  <tr>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      User
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Added
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {blacklist.length === 0 ? (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-6 py-12 text-center"
                      >

                        <ShieldCheck className="mx-auto h-10 w-10 text-green-500" />

                        <p className="mt-3 font-semibold text-[#0A1931]">
                          No blacklisted users
                        </p>

                        <p className="mt-1 text-sm text-[#7A7F85]">
                          The blacklist is currently empty.
                        </p>

                      </td>

                    </tr>

                  ) : (

                    blacklist.map((user) => (

                      <tr
                        key={user.id}
                        className="border-t border-[#E5EEF5] transition hover:bg-[#F6FAFD]"
                      >

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                              {user.name.charAt(0)}
                            </div>

                            <p className="font-semibold text-[#0A1931]">
                              {user.name}
                            </p>

                          </div>

                        </td>

                        <td className="px-6 py-5 text-sm text-[#7A7F85]">
                          {user.email}
                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold text-[#1A3D63]">
                            {user.role}
                          </span>

                        </td>

                        <td className="px-6 py-5 text-sm text-[#7A7F85]">
                          {user.addedAt}
                        </td>

                        <td className="px-6 py-5 text-right">

                          <button
                            onClick={() =>
                              removeFromBlacklist(user.id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Remove
                          </button>

                        </td>

                      </tr>

                    ))

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      )}

      
      {showMentorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1931]/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-[#B3CFE5] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-[#0A1931]">
                    Add Mentor
                  </h2>

                  <p className="mt-1 text-sm text-[#7A7F85]">
                    Create a mentor account.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowMentorModal(false)
                  }
                  className="rounded-lg p-2 text-[#7A7F85] hover:bg-[#F6FAFD]"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

            </div>

            <form
              onSubmit={handleAddMentor}
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Full Name
                </label>

                <input
                  name="name"
                  value={mentorForm.name}
                  onChange={handleMentorChange}
                  placeholder="Enter mentor name"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={mentorForm.email}
                  onChange={handleMentorChange}
                  placeholder="mentor@example.com"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Temporary Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={mentorForm.password}
                  onChange={handleMentorChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />

              </div>

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowMentorModal(false)
                  }
                  className="flex-1 rounded-xl border border-[#B3CFE5] py-3 text-sm font-semibold text-[#1A3D63] hover:bg-[#F6FAFD]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#1A3D63] py-3 text-sm font-semibold text-white hover:bg-[#4A7FA7]"
                >
                  Create Mentor
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

     

      {showAssignModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1931]/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="border-b border-[#B3CFE5] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h2 className="text-xl font-bold text-[#0A1931]">
                    Assign Students
                  </h2>

                  <p className="mt-1 text-sm text-[#7A7F85]">
                    Assign students to {selectedMentor.name}.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowAssignModal(false)
                  }
                  className="rounded-lg p-2 text-[#7A7F85] hover:bg-[#F6FAFD]"
                >
                  <X className="h-5 w-5" />
                </button>

              </div>

            </div>

            <div className="max-h-[450px] overflow-y-auto p-6">

              <div className="mb-4 rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">

                <div className="flex items-start gap-3">

                  <ShieldCheck className="mt-0.5 h-5 w-5 text-[#4A7FA7]" />

                  <p className="text-sm leading-6 text-[#7A7F85]">
                    A student can only belong to one mentor group.
                    Students already assigned to another mentor are
                    not available here.
                  </p>

                </div>

              </div>

              {availableStudents.length === 0 ? (

                <div className="rounded-xl border border-dashed border-[#B3CFE5] bg-[#F6FAFD] p-6 text-center">

                  <Users className="mx-auto h-8 w-8 text-[#4A7FA7]" />

                  <p className="mt-3 font-semibold text-[#0A1931]">
                    No available students
                  </p>

                  <p className="mt-1 text-sm text-[#7A7F85]">
                    All students have already been assigned.
                  </p>

                </div>

              ) : (

                <div className="space-y-3">

                  {availableStudents.map((student) => (

                    <button
                      key={student.id}
                      onClick={() =>
                        assignStudent(student.id)
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-[#B3CFE5] p-4 text-left transition hover:border-[#4A7FA7] hover:bg-[#F6FAFD]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B3CFE5] font-bold text-[#0A1931]">
                          {student.name.charAt(0)}
                        </div>

                        <div>

                          <p className="font-semibold text-[#0A1931]">
                            {student.name}
                          </p>

                          <p className="text-xs text-[#7A7F85]">
                            {student.email}
                          </p>

                        </div>

                      </div>

                      <UserRoundPlus className="h-5 w-5 text-[#4A7FA7]" />

                    </button>

                  ))}

                </div>

              )}

            </div>

            <div className="border-t border-[#B3CFE5] p-6">

              <button
                onClick={() =>
                  setShowAssignModal(false)
                }
                className="w-full rounded-xl bg-[#1A3D63] py-3 text-sm font-semibold text-white hover:bg-[#4A7FA7]"
              >
                Done
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}



function StatusBadge({ status }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF7E6] px-3 py-1.5 text-xs font-semibold text-[#B7791F]">
        <Clock3 className="h-3.5 w-3.5" />
        Pending
      </span>
    );
  }

  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        <Check className="h-3.5 w-3.5" />
        Accepted
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
      <X className="h-3.5 w-3.5" />
      Rejected
    </span>
  );
}



function capitalize(value) {
  if (!value) return "";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default UserManagement;