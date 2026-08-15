import { useEffect, useMemo, useState } from "react";
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
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../../utils/api";

function UserManagement() {
  const [activeTab, setActiveTab] = useState("applicants");
  const [applicantStatus, setApplicantStatus] = useState("all");

  const [applicants, setApplicants] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [blacklist, setBlacklist] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedMentor, setSelectedMentor] = useState(null);

  const [mentorForm, setMentorForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError("");

    try {
      const [
        applicantsResponse,
        mentorsResponse,
        studentsResponse,
        blacklistResponse,
      ] = await Promise.all([
        api.get("/applicants"),
        api.get("/users/mentors"),
        api.get("/users/students"),
        api.get("/users/blacklist"),
      ]);

      setApplicants(applicantsResponse.data?.applicants || []);
      setMentors(mentorsResponse.data?.mentors || []);
      setStudents(studentsResponse.data?.students || []);
      setBlacklist(blacklistResponse.data?.users || []);
    } catch (err) {
      console.error("Load user management data error:", err);

      showError(
        err.response?.data?.message || "Failed to load user management data.",
      );
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);

    setTimeout(() => {
      setSuccess("");
    }, 4000);
  };

  const showError = (message) => {
    setError(message);

    setTimeout(() => {
      setError("");
    }, 5000);
  };

  const getFullName = (user) => {
    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const blacklistUser = async (user) => {
    const fullName = getFullName(user) || user.email || "this user";

    const confirmed = window.confirm(
      `Are you sure you want to blacklist ${fullName}?`,
    );

    if (!confirmed) return;

    setActionLoading(`blacklist-${user._id}`);
    setError("");

    try {
      const response = await api.patch(`/users/${user._id}/status`, {
        status: "suspended",
      });

      console.log("Blacklist response:", response.data);

      setMentors((previous) =>
        previous.filter((item) => item._id !== user._id),
      );

      setStudents((previous) =>
        previous.filter((item) => item._id !== user._id),
      );

      setBlacklist((previous) => {
        const alreadyExists = previous.some((item) => item._id === user._id);

        if (alreadyExists) {
          return previous.map((item) =>
            item._id === user._id
              ? {
                  ...item,
                  ...user,
                  status: "suspended",
                }
              : item,
          );
        }

        return [
          ...previous,
          {
            ...user,
            status: "suspended",
          },
        ];
      });

      showSuccess(`${fullName} has been added to the blacklist.`);
    } catch (err) {
      console.error("Blacklist user error:", err);

      showError(err.response?.data?.message || "Failed to blacklist user.");
    } finally {
      setActionLoading(null);
    }
  };

  const removeFromBlacklist = async (user) => {
    const fullName = getFullName(user) || user.email || "this user";

    const confirmed = window.confirm(`Remove ${fullName} from the blacklist?`);

    if (!confirmed) return;

    setActionLoading(`unblacklist-${user._id}`);
    setError("");

    try {
      const response = await api.patch(`/users/${user._id}/status`, {
        status: "approved",
      });

      console.log("Remove blacklist response:", response.data);

      setBlacklist((previous) =>
        previous.filter((item) => item._id !== user._id),
      );

      const [mentorsResponse, studentsResponse] = await Promise.all([
        api.get("/users/mentors"),
        api.get("/users/students"),
      ]);

      setMentors(mentorsResponse.data?.mentors || []);
      setStudents(studentsResponse.data?.students || []);

      showSuccess(`${fullName} removed from blacklist.`);
    } catch (err) {
      console.error("Remove from blacklist error:", err);

      showError(
        err.response?.data?.message || "Failed to remove user from blacklist.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const filteredApplicants = useMemo(() => {
    if (applicantStatus === "all") {
      return applicants;
    }

    return applicants.filter(
      (applicant) => applicant.status === applicantStatus,
    );
  }, [applicants, applicantStatus]);

  const pendingCount = useMemo(
    () => applicants.filter((item) => item.status === "pending").length,
    [applicants],
  );

  const acceptedCount = useMemo(
    () => applicants.filter((item) => item.status === "passed").length,
    [applicants],
  );

  const rejectedCount = useMemo(
    () => applicants.filter((item) => item.status === "rejected").length,
    [applicants],
  );

  const updateApplicantStatus = async (applicantId, status) => {
    const loadingKey = `applicant-${applicantId}-${status}`;

    setActionLoading(loadingKey);
    setError("");

    try {
      const response = await api.patch(`/applicants/${applicantId}/status`, {
        status,
      });

      const updatedApplicant = response.data?.applicant;

      if (!updatedApplicant) {
        throw new Error("Updated applicant was not returned by the server.");
      }

      setApplicants((previous) =>
        previous.map((applicant) =>
          applicant._id === applicantId ? updatedApplicant : applicant,
        ),
      );

      if (status === "passed") {
        showSuccess(
          "Applicant accepted. Student account created and credentials sent by email.",
        );

        const studentsResponse = await api.get("/users/students");

        setStudents(studentsResponse.data?.students || []);
      } else {
        showSuccess("Applicant rejected successfully.");
      }
    } catch (err) {
      console.error("Update applicant status error:", err);

      showError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update applicant status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleMentorChange = (event) => {
    const { name, value } = event.target;

    setMentorForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddMentor = async (event) => {
    event.preventDefault();

    const firstName = mentorForm.firstName.trim();
    const lastName = mentorForm.lastName.trim();
    const email = mentorForm.email.trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      showError("Please fill in all mentor fields.");
      return;
    }

    setActionLoading("create-mentor");
    setError("");

    try {
      const response = await api.post("/users", {
        firstName,
        lastName,
        email,
        role: "mentor",
      });

      const newMentor = response.data?.user;

      if (!newMentor) {
        throw new Error("Mentor was not returned by the server.");
      }

      setMentors((previous) => [
        ...previous,
        {
          ...newMentor,
          students: [],
        },
      ]);

      setMentorForm({
        firstName: "",
        lastName: "",
        email: "",
      });

      setShowMentorModal(false);

      showSuccess("Mentor created successfully.");
    } catch (err) {
      console.error("Create mentor error:", err);

      showError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create mentor.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const availableStudents = useMemo(() => {
    return students.filter(
      (student) => !student.assignedMentor && student.status === "approved",
    );
  }, [students]);

  const openAssignModal = (mentor) => {
    setSelectedMentor(mentor);
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedMentor(null);
    setActionLoading(null);
  };

  const assignStudent = async (studentId) => {
    if (!selectedMentor) return;

    setActionLoading(`assign-${studentId}`);
    setError("");

    try {
      await api.patch("/users/assign-mentor", {
        studentId,
        mentorId: selectedMentor._id,
      });

      const studentsResponse = await api.get("/users/students");

      setStudents(studentsResponse.data?.students || []);

      showSuccess("Student assigned successfully.");
    } catch (err) {
      console.error("Assign student error:", err);

      showError(err.response?.data?.message || "Failed to assign student.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStudentsForMentor = (mentor) => {
    return students.filter(
      (student) =>
        student.assignedMentor?._id === mentor._id ||
        student.assignedMentor === mentor._id,
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6FAFD]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#1A3D63]" />

          <p className="text-sm font-semibold text-[#7A7F85]">
            Loading user management...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-4 sm:p-6 lg:p-8">
      {success && (
        <div className="fixed right-5 top-5 z-[100] flex max-w-md items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-lg">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="fixed right-5 top-5 z-[100] flex max-w-md items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-lg">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A7FA7] text-white">
            <Users className="h-5 w-5" />
          </div>

          <span className="text-sm font-semibold uppercase tracking-[0.15em] text-[#4A7FA7]">
            Administration
          </span>
        </div>

        <h1 className="text-3xl font-bold text-[#0A1931]">User Management</h1>

        <p className="mt-2 text-sm text-[#7A7F85]">
          Manage applicants, mentors, student groups and blacklist.
        </p>
      </div>

      <div className="mb-6 overflow-x-auto">
        <div className="flex min-w-max gap-2 rounded-2xl border border-[#B3CFE5] bg-white p-2">
          <TabButton
            active={activeTab === "applicants"}
            onClick={() => {
              setActiveTab("applicants");
              setApplicantStatus("all");
            }}
          >
            Applicants
          </TabButton>

          <TabButton
            active={activeTab === "mentors"}
            onClick={() => setActiveTab("mentors")}
          >
            Mentors
          </TabButton>

          <TabButton
            active={activeTab === "groups"}
            onClick={() => setActiveTab("groups")}
          >
            Student Groups
          </TabButton>

          <TabButton
            active={activeTab === "blacklist"}
            onClick={() => setActiveTab("blacklist")}
          >
            <ShieldBan className="h-4 w-4" />
            Blacklist
          </TabButton>
        </div>
      </div>

      {activeTab === "applicants" && (
        <div>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              title="Pending"
              count={pendingCount}
              icon={<Clock3 className="h-5 w-5" />}
              active={applicantStatus === "pending"}
              onClick={() => setApplicantStatus("pending")}
            />

            <StatCard
              title="Accepted"
              count={acceptedCount}
              icon={<UserCheck className="h-5 w-5" />}
              active={applicantStatus === "passed"}
              onClick={() => setApplicantStatus("passed")}
            />

            <StatCard
              title="Rejected"
              count={rejectedCount}
              icon={<UserX className="h-5 w-5" />}
              active={applicantStatus === "rejected"}
              onClick={() => setApplicantStatus("rejected")}
            />
          </div>

          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0A1931]">
                {applicantStatus === "all"
                  ? "All Applications"
                  : `${capitalizeApplicantStatus(applicantStatus)} Applicants`}
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
              <h2 className="text-lg font-bold text-[#0A1931]">Applications</h2>

              <p className="mt-1 text-sm text-[#7A7F85]">
                Review registration applications and manage their status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead className="bg-[#F6FAFD]">
                  <tr>
                    <TableHeader>Applicant</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Applied</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader right>Action</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {filteredApplicants.length === 0 ? (
                    <EmptyRow message="No applicants found" colSpan={5} />
                  ) : (
                    filteredApplicants.map((applicant) => {
                      const isAccepting =
                        actionLoading === `applicant-${applicant._id}-passed`;

                      const isRejecting =
                        actionLoading === `applicant-${applicant._id}-rejected`;

                      return (
                        <tr
                          key={applicant._id}
                          className="border-t border-[#E5EEF5] transition hover:bg-[#F6FAFD]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B3CFE5] font-bold text-[#0A1931]">
                                {applicant.fullName?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </div>

                              <p className="font-semibold text-[#0A1931]">
                                {applicant.fullName || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#7A7F85]">
                            {applicant.email || "-"}
                          </td>

                          <td className="px-6 py-5 text-sm text-[#7A7F85]">
                            {formatDate(applicant.createdAt)}
                          </td>

                          <td className="px-6 py-5">
                            <StatusBadge status={applicant.status} />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              {applicant.status === "pending" && (
                                <>
                                  <button
                                    disabled={isAccepting || isRejecting}
                                    onClick={() =>
                                      updateApplicantStatus(
                                        applicant._id,
                                        "passed",
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {isAccepting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                    Accept
                                  </button>

                                  <button
                                    disabled={isAccepting || isRejecting}
                                    onClick={() =>
                                      updateApplicantStatus(
                                        applicant._id,
                                        "rejected",
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                                  >
                                    {isRejecting ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
              <h2 className="text-2xl font-bold text-[#0A1931]">Mentors</h2>

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
            {mentors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#B3CFE5] bg-white p-10 text-center lg:col-span-2">
                <Users className="mx-auto h-10 w-10 text-[#B3CFE5]" />

                <p className="mt-3 font-semibold text-[#0A1931]">
                  No mentors found
                </p>
              </div>
            ) : (
              mentors.map((mentor) => {
                const mentorStudents = getStudentsForMentor(mentor);

                const blacklisting =
                  actionLoading === `blacklist-${mentor._id}`;

                return (
                  <div
                    key={mentor._id}
                    className="rounded-2xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B3CFE5] text-lg font-bold text-[#0A1931]">
                          {mentor.firstName?.charAt(0)?.toUpperCase() || "M"}
                        </div>

                        <div>
                          <h3 className="font-bold text-[#0A1931]">
                            {getFullName(mentor)}
                          </h3>

                          <p className="text-sm text-[#7A7F85]">
                            {mentor.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={blacklisting}
                          onClick={() => blacklistUser(mentor)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {blacklisting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <ShieldBan className="h-4 w-4" />
                          )}
                          Blacklist
                        </button>

                        <MoreVertical className="h-5 w-5 text-[#7A7F85]" />
                      </div>
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
                        onClick={() => openAssignModal(mentor)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#B3CFE5] px-3 py-2 text-xs font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
                      >
                        Assign Students
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
            {mentors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#B3CFE5] bg-white p-10 text-center lg:col-span-2">
                <Users className="mx-auto h-10 w-10 text-[#B3CFE5]" />

                <p className="mt-3 font-semibold text-[#0A1931]">
                  No mentors found
                </p>
              </div>
            ) : (
              mentors.map((mentor) => {
                const mentorStudents = getStudentsForMentor(mentor);

                return (
                  <div
                    key={mentor._id}
                    className="rounded-2xl border border-[#B3CFE5] bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-[#0A1931]">
                          {getFullName(mentor)}
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
                        mentorStudents.map((student) => {
                          const blacklisting =
                            actionLoading === `blacklist-${student._id}`;

                          return (
                            <div
                              key={student._id}
                              className="flex items-center justify-between rounded-xl border border-[#E5EEF5] bg-[#F6FAFD] p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B3CFE5] text-sm font-bold text-[#0A1931]">
                                  {student.firstName
                                    ?.charAt(0)
                                    ?.toUpperCase() || "S"}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-[#0A1931]">
                                    {getFullName(student)}
                                  </p>

                                  <p className="text-xs text-[#7A7F85]">
                                    {student.email}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                disabled={blacklisting}
                                onClick={() => blacklistUser(student)}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {blacklisting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <ShieldBan className="h-4 w-4" />
                                )}
                                Blacklist
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button
                      onClick={() => openAssignModal(mentor)}
                      className="mt-5 w-full rounded-xl border border-[#B3CFE5] py-3 text-sm font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
                    >
                      + Assign Student
                    </button>
                  </div>
                );
              })
            )}
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
                <h2 className="text-2xl font-bold text-[#0A1931]">Blacklist</h2>

                <p className="mt-1 text-sm text-[#7A7F85]">
                  Manage users who are restricted from the system.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-5">
            <p className="font-semibold text-red-700">
              Blacklisted Users: {blacklist.length}
            </p>

            <p className="mt-1 text-sm text-red-600">
              These users have been suspended from the system.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#B3CFE5] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-[#F6FAFD]">
                  <tr>
                    <TableHeader>User</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Added</TableHeader>
                    <TableHeader right>Action</TableHeader>
                  </tr>
                </thead>

                <tbody>
                  {blacklist.length === 0 ? (
                    <EmptyRow message="No blacklisted users" colSpan={5} />
                  ) : (
                    blacklist.map((user) => {
                      const removing =
                        actionLoading === `unblacklist-${user._id}`;

                      return (
                        <tr
                          key={user._id}
                          className="border-t border-[#E5EEF5] transition hover:bg-[#F6FAFD]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                                {user.firstName?.charAt(0)?.toUpperCase() ||
                                  "?"}
                              </div>

                              <p className="font-semibold text-[#0A1931]">
                                {getFullName(user) || user.email || "-"}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#7A7F85]">
                            {user.email || "-"}
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-[#F6FAFD] px-3 py-1.5 text-xs font-semibold capitalize text-[#1A3D63]">
                              {user.role || "-"}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-[#7A7F85]">
                            {formatDate(user.updatedAt)}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button
                              type="button"
                              disabled={removing}
                              onClick={() => removeFromBlacklist(user)}
                              className="inline-flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {removing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })
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
                  onClick={() => setShowMentorModal(false)}
                  className="rounded-lg p-2 text-[#7A7F85] hover:bg-[#F6FAFD]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddMentor} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  First Name
                </label>

                <input
                  name="firstName"
                  value={mentorForm.firstName}
                  onChange={handleMentorChange}
                  placeholder="Enter first name"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Last Name
                </label>

                <input
                  name="lastName"
                  value={mentorForm.lastName}
                  onChange={handleMentorChange}
                  placeholder="Enter last name"
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

              <div className="rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4 text-sm text-[#7A7F85]">
                A temporary password will be generated automatically and the
                mentor can change it after logging in.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMentorModal(false)}
                  className="flex-1 rounded-xl border border-[#B3CFE5] py-3 text-sm font-semibold text-[#1A3D63] hover:bg-[#F6FAFD]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={actionLoading === "create-mentor"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1A3D63] py-3 text-sm font-semibold text-white hover:bg-[#4A7FA7] disabled:opacity-60"
                >
                  {actionLoading === "create-mentor" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
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
                    Assign students to {getFullName(selectedMentor)}
                  </p>
                </div>

                <button
                  onClick={closeAssignModal}
                  className="rounded-lg p-2 text-[#7A7F85] hover:bg-[#F6FAFD]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto p-6">
              <div className="mb-4 rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#4A7FA7]" />

                  <p className="text-sm leading-6 text-[#7A7F85]">
                    A student can only belong to one mentor group. Students
                    already assigned to another mentor are not available.
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
                    All approved students have already been assigned.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableStudents.map((student) => {
                    const assigning = actionLoading === `assign-${student._id}`;

                    return (
                      <button
                        key={student._id}
                        type="button"
                        disabled={assigning}
                        onClick={() => assignStudent(student._id)}
                        className="flex w-full items-center justify-between rounded-xl border border-[#B3CFE5] p-4 text-left transition hover:border-[#4A7FA7] hover:bg-[#F6FAFD] disabled:opacity-60"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B3CFE5] font-bold text-[#0A1931]">
                            {student.firstName?.charAt(0)?.toUpperCase() || "S"}
                          </div>

                          <div>
                            <p className="font-semibold text-[#0A1931]">
                              {getFullName(student)}
                            </p>

                            <p className="text-xs text-[#7A7F85]">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        {assigning ? (
                          <Loader2 className="h-5 w-5 animate-spin text-[#4A7FA7]" />
                        ) : (
                          <UserRoundPlus className="h-5 w-5 text-[#4A7FA7]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[#B3CFE5] p-6">
              <button
                onClick={closeAssignModal}
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

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[#1A3D63] text-white"
          : "text-[#7A7F85] hover:bg-[#F6FAFD] hover:text-[#1A3D63]"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, count, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active ? "border-[#4A7FA7] ring-2 ring-[#B3CFE5]" : "border-[#B3CFE5]"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[#7A7F85]">{title}</p>

          <p className="mt-2 text-3xl font-bold text-[#0A1931]">{count}</p>

          <p className="mt-1 text-xs text-[#7A7F85]">Click to view</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6FAFD] text-[#4A7FA7]">
          {icon}
        </div>
      </div>
    </button>
  );
}

function TableHeader({ children, right = false }) {
  return (
    <th
      className={`px-6 py-4 text-xs font-bold uppercase tracking-wide text-[#7A7F85] ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function EmptyRow({ message, colSpan = 5 }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <Users className="mx-auto h-10 w-10 text-[#B3CFE5]" />

        <p className="mt-3 font-semibold text-[#0A1931]">{message}</p>
      </td>
    </tr>
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

  if (status === "passed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        <Check className="h-3.5 w-3.5" />
        Accepted
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
        <X className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold capitalize text-gray-600">
      {status || "Unknown"}
    </span>
  );
}

function capitalizeApplicantStatus(value) {
  if (value === "passed") return "Accepted";
  if (value === "rejected") return "Rejected";

  return "Pending";
}

export default UserManagement;
