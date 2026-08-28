import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  Plus,
  Search,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Ban,
  Mail,
  Phone,
  Shield,
  GraduationCap,
  X,
  RefreshCw,
  Users,
  UserCog,
  UserX,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function UserManagement() {
  const [activeTab, setActiveTab] = useState("students");
  const [genderFilter, setGenderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [actionId, setActionId] = useState(null);
  const [deleteUserModal, setDeleteUserModal] = useState(null);

  const [isAddMentorOpen, setIsAddMentorOpen] = useState(false);
  const [creatingMentor, setCreatingMentor] = useState(false);

  const [newMentor, setNewMentor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "Female",
    phone: "",
    role: "mentor",
  });

  const [createdMentorCredentials, setCreatedMentorCredentials] =
    useState(null);

  const inputClass =
    "w-full rounded-xl border border-[#D9E4EA] bg-[#F7FAFC] px-3.5 py-2.5 text-sm text-[#14222B] outline-none transition placeholder:text-[#9AAAB4] focus:border-[#00A8CC] focus:bg-white focus:ring-4 focus:ring-[#00A8CC]/10";

  const labelClass =
    "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[#14222B]";

  const cardClass =
    "rounded-2xl border border-[#DCE7EC] bg-white shadow-[0_2px_8px_rgba(20,34,43,0.035)]";

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const refreshUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        activeTab === "students" ? "/users/students" : "/users/mentors";

      const params = [];

      if (genderFilter !== "All") {
        params.push(`gender=${encodeURIComponent(genderFilter)}`);
      }

      const queryString = params.length ? `?${params.join("&")}` : "";

      const response = await api.get(`${endpoint}${queryString}`);

      if (activeTab === "students") {
        setUsers(response.data?.students || []);
      } else {
        setUsers(response.data?.mentors || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load users. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUsers();
  }, [activeTab, genderFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionId(userId);
      clearMessages();

      const newStatus = currentStatus === "approved" ? "suspended" : "approved";

      const response = await api.patch(`/users/${userId}/status`, {
        status: newStatus,
      });

      setSuccess(
        response.data?.message || `User status updated to ${newStatus}.`,
      );
      toast.success(`User status updated to ${newStatus}.`);

      await refreshUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user status.");
      toast.error(
        err.response?.data?.message || "Failed to update user status.",
      );
    } finally {
      setActionId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserModal) return;

    try {
      setActionId(deleteUserModal._id);
      clearMessages();

      const response = await api.delete(`/users/${deleteUserModal._id}`);

      setSuccess(response.data?.message || "User deleted successfully.");
      toast.success("User deleted successfully.");

      setDeleteUserModal(null);
      await refreshUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionId(null);
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();

    clearMessages();

    const firstName = newMentor.firstName.trim();
    const lastName = newMentor.lastName.trim();
    const email = newMentor.email.trim().toLowerCase();
    const phone = newMentor.phone.trim();

    if (!firstName || !lastName || !email) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setCreatingMentor(true);

      const response = await api.post("/users", {
        firstName,
        lastName,
        email,
        gender: newMentor.gender,
        phone,
        role: "mentor",
      });

      const createdUser = response.data?.user;

      setSuccess(response.data?.message || "Mentor created successfully!");
      toast.success("Mentor created successfully!");

      setIsAddMentorOpen(false);

      if (createdUser?.temporaryPassword) {
        setCreatedMentorCredentials({
          firstName: createdUser.firstName || firstName,
          lastName: createdUser.lastName || lastName,
          email: createdUser.email || email,
          temporaryPassword: createdUser.temporaryPassword,
        });
      }

      setNewMentor({
        firstName: "",
        lastName: "",
        email: "",
        gender: "Female",
        phone: "",
        role: "mentor",
      });

      await refreshUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create mentor.");
      toast.error(err.response?.data?.message || "Failed to create mentor.");
    } finally {
      setCreatingMentor(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.trim().toLowerCase();

    const fullName =
      `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();

    const matchesSearch =
      !search ||
      fullName.includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search);

    const userStatus = (user.status || "approved").toLowerCase();
    const matchesStatus =
      statusFilter === "All" || userStatus === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const suspendedCount = users.filter(
    (u) => (u.status || "").toLowerCase() === "suspended",
  ).length;

  const closeMentorModal = () => {
    if (creatingMentor) return;

    setIsAddMentorOpen(false);

    setNewMentor({
      firstName: "",
      lastName: "",
      email: "",
      gender: "Female",
      phone: "",
      role: "mentor",
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setGenderFilter("All");
    setStatusFilter("All");
    setSearchTerm("");
    clearMessages();
  };

  const getInitials = (user) => {
    return `${user.firstName?.charAt(0) || ""}${
      user.lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const getUserAvatar = (user) => {
    if (typeof user.profileImage === "string" && user.profileImage.trim() !== "") {
      return user.profileImage;
    }
    if (user.profileImage && typeof user.profileImage === "object" && user.profileImage.url) {
      return user.profileImage.url;
    }
    return null;
  };

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "13px",
          },
        }}
      />

      <div className="min-h-screen bg-[#F7FAFC]">
        <header className="mx-3 mt-4 lg:mx-8">
          <div className="overflow-hidden rounded-2xl bg-linear-to-b from-[#1b3c47] via-[#0f2b34] to-[#071b23] shadow-[0_4px_12px_rgba(20,34,43,0.12)]">
            <div className="px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC] shadow-[0_4px_12px_rgba(0,168,204,0.25)] sm:h-14 sm:w-14">
                  <UserCog className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    User Management
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-green-800">Success</p>
                <p className="mt-0.5 text-xs text-green-700">{success}</p>
              </div>

              <button
                type="button"
                onClick={() => setSuccess("")}
                className="ml-auto rounded-lg p-1.5 text-green-600 transition hover:bg-green-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-red-800">
                  Something went wrong
                </p>
                <p className="mt-0.5 text-xs text-red-700">{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto rounded-lg p-1.5 text-red-600 transition hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <section className={cardClass}>
            <div className="flex flex-col gap-4 border-b border-[#DCE7EC] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F5F9]">
                  <Users className="h-5 w-5 text-[#00A8CC]" />
                </div>

                <div>
                  <h2 className="text-base font-bold text-[#14222B]">
                    User Directory
                  </h2>

                  <p className="mt-0.5 text-xs text-[#71838E]">
                    View, search and manage registered users.
                  </p>
                </div>
              </div>

              {activeTab === "mentors" && (
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setIsAddMentorOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0088A6]"
                >
                  <Plus className="h-4 w-4" />
                  Add New Mentor
                </button>
              )}
            </div>

            <div className="border-b border-[#DCE7EC] px-5">
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    handleTabChange("students");
                    setStatusFilter("All");
                  }}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition sm:px-5 ${
                    activeTab === "students" && statusFilter !== "suspended"
                      ? "text-[#00A8CC]"
                      : "text-[#71838E] hover:text-[#14222B]"
                  }`}
                >
                  <GraduationCap className="h-4 w-4" />
                  Students
                  {activeTab === "students" && statusFilter !== "suspended" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#00A8CC]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleTabChange("mentors");
                    setStatusFilter("All");
                  }}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition sm:px-5 ${
                    activeTab === "mentors" && statusFilter !== "suspended"
                      ? "text-[#00A8CC]"
                      : "text-[#71838E] hover:text-[#14222B]"
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Mentors
                  {activeTab === "mentors" && statusFilter !== "suspended" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#00A8CC]" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      statusFilter === "suspended" ? "All" : "suspended",
                    )
                  }
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-xs font-bold transition sm:px-5 ${
                    statusFilter === "suspended"
                      ? "text-rose-600"
                      : "text-[#71838E] hover:text-rose-600"
                  }`}
                >
                  <Ban className="h-3.5 w-3.5" />
                  Suspended {activeTab === "students" ? "Students" : "Mentors"}
                  {suspendedCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700">
                      {suspendedCount}
                    </span>
                  )}
                  {statusFilter === "suspended" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-rose-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9AAAB4]" />

                  <input
                    type="text"
                    placeholder={`Search ${activeTab} by name, email or phone...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${inputClass} pl-10`}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex overflow-x-auto rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-1">
                    {["All", "Female", "Male"].map((gender) => (
                      <button
                        type="button"
                        key={gender}
                        onClick={() => setGenderFilter(gender)}
                        className={`whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-bold transition sm:px-4 ${
                          genderFilter === gender
                            ? "bg-white text-[#00A8CC] shadow-sm"
                            : "text-[#71838E] hover:text-[#14222B]"
                        }`}
                      >
                        {gender === "Female" && "👩 "}
                        {gender === "Male" && "👨 "}
                        {gender === "All" ? `All ${activeTab}` : gender}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {!loading && (
              <div className="flex flex-col gap-2 border-y border-[#DCE7EC] bg-[#F7FAFC] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-xs text-[#71838E]">
                  <Users className="h-3.5 w-3.5" />
                  Showing{" "}
                  <span className="font-extrabold text-[#14222B]">
                    {filteredUsers.length}
                  </span>{" "}
                  {statusFilter === "suspended"
                    ? `suspended ${activeTab}`
                    : activeTab}
                </div>

                <button
                  type="button"
                  onClick={refreshUsers}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-[#00A8CC] transition hover:text-[#0088A6]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-90 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
                    <Loader2 className="h-6 w-6 animate-spin text-[#00A8CC]" />
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-[#14222B]">
                      Loading {activeTab}
                    </p>

                    <p className="mt-1 text-xs text-[#71838E]">
                      Loading registered users...
                    </p>
                  </div>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-5 py-16 text-center sm:py-20">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3F5F9]">
                  {statusFilter === "suspended" ? (
                    <UserX className="h-7 w-7 text-rose-500" />
                  ) : activeTab === "students" ? (
                    <GraduationCap className="h-7 w-7 text-[#00A8CC]" />
                  ) : (
                    <Shield className="h-7 w-7 text-[#00A8CC]" />
                  )}
                </div>

                <h3 className="mt-4 text-sm font-bold text-[#14222B]">
                  {statusFilter === "suspended"
                    ? `No suspended ${activeTab} found`
                    : `No ${activeTab} found`}
                </h3>

                <p className="mt-1 text-xs text-[#71838E]">
                  No users match the current search or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-225 border-separate border-spacing-y-4 text-left">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8FA3B0]">
                        <th className="px-6 pb-2">User</th>
                        <th className="px-6 pb-2">Gender</th>
                        <th className="px-6 pb-2">Contact</th>

                        {activeTab === "students" && (
                          <th className="px-6 pb-2">Mentors</th>
                        )}

                        {activeTab === "mentors" && (
                          <th className="px-6 pb-2">Role</th>
                        )}

                        <th className="px-6 pb-2">Status</th>
                        <th className="px-6 pb-2 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.map((user) => {
                        const avatarUrl = getUserAvatar(user);

                        return (
                          <tr
                            key={user._id}
                            className="group transition-transform hover:translate-x-1"
                          >
                            <td className="rounded-l-2xl border-l-4 border-[#00A8CC] bg-white px-6 py-5 shadow-sm">
                              <div className="flex items-center gap-4">
                                {avatarUrl ? (
                                  <img
                                    src={avatarUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-inner"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#E3F5F9] text-[11px] font-bold text-[#00A8CC] shadow-inner">
                                    {getInitials(user)}
                                  </div>
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold leading-tight text-[#14222B]">
                                    {user.firstName} {user.lastName}
                                  </p>

                                  {user.batch?.name && (
                                    <p className="mt-1 text-[10px] font-bold uppercase tracking-tighter text-[#00A8CC]">
                                      {user.batch.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="bg-white px-6 py-5 shadow-sm">
                              <span
                                className={`inline-flex rounded-lg px-3 py-1.5 text-[10px] font-black uppercase ${
                                  user.gender?.toLowerCase() === "female"
                                    ? "bg-pink-50 text-pink-600"
                                    : "bg-[#E3F5F9] text-[#0088A6]"
                                }`}
                              >
                                {user.gender?.toLowerCase() === "female"
                                  ? "Female"
                                  : "Male"}
                              </span>
                            </td>

                            <td className="bg-white px-6 py-5 shadow-sm">
                              <div className="space-y-1.5">
                                <div className="flex max-w-55 items-center gap-2">
                                  <Mail
                                    size={14}
                                    className="shrink-0 text-[#9AAAB4]"
                                  />

                                  <span className="truncate text-[11px] font-medium text-[#596A73]">
                                    {user.email || "-"}
                                  </span>
                                </div>

                                {user.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone
                                      size={14}
                                      className="shrink-0 text-[#9AAAB4]"
                                    />

                                    <span className="text-[10px] font-medium text-[#596A73]">
                                      {user.phone}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {activeTab === "students" && (
                              <td className="bg-white px-6 py-5 shadow-sm">
                                {user.assignedMentors?.length > 0 ? (
                                  <div className="flex max-w-52.5 flex-wrap gap-1.5">
                                    {user.assignedMentors.map((mentor) => (
                                      <span
                                        key={mentor._id}
                                        className="rounded-lg bg-[#E3F5F9] px-2.5 py-1.5 text-[10px] font-bold text-[#0088A6]"
                                      >
                                        {mentor.firstName} {mentor.lastName || ""}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] font-medium italic text-[#9AAAB4]">
                                    No mentors assigned
                                  </span>
                                )}
                              </td>
                            )}

                            {activeTab === "mentors" && (
                              <td className="bg-white px-6 py-5 shadow-sm">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E3F5F9]">
                                    <Shield
                                      size={15}
                                      className="text-[#00A8CC]"
                                    />
                                  </div>
                                  <span className="text-[11px] font-black uppercase text-[#0088A6]">
                                    Mentor
                                  </span>
                                </div>
                              </td>
                            )}

                            <td className="bg-white px-6 py-5 shadow-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`h-2.5 w-2.5 rounded-full ring-4 ${
                                    user.status === "approved"
                                    ? "bg-emerald-500 ring-emerald-100"
                                    : "bg-red-500 ring-red-100"
                                  }`}
                                />
                                <span
                                  className={`text-[10px] font-black uppercase tracking-widest ${
                                    user.status === "approved"
                                      ? "text-emerald-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {(user.status || "approved").toUpperCase()}
                                </span>
                              </div>
                            </td>

                            <td className="rounded-r-2xl bg-white px-6 py-5 text-right shadow-sm">
                              <div className="flex justify-end gap-5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleStatus(user._id, user.status)
                                  }
                                  disabled={actionId === user._id}
                                  className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase transition hover:opacity-70 disabled:opacity-50 ${
                                    user.status === "approved"
                                      ? "text-amber-500"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {actionId === user._id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : user.status === "approved" ? (
                                    <Ban size={14} />
                                  ) : (
                                    <CheckCircle size={14} />
                                  )}
                                  {user.status === "approved"
                                    ? "Suspend"
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeleteUserModal(user)}
                                  disabled={actionId === user._id}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-500 transition hover:opacity-70 disabled:opacity-50"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="space-y-3 p-4 md:hidden">
                  {filteredUsers.map((user) => {
                    const avatarUrl = getUserAvatar(user);

                    return (
                      <div
                        key={user._id}
                        className="rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            {avatarUrl ? (
                              <img
                                src={avatarUrl}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="h-10 w-10 shrink-0 rounded-xl object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3F5F9] text-xs font-extrabold text-[#00A8CC]">
                                {getInitials(user)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold text-[#14222B]">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="mt-0.5 truncate text-[10px] text-[#71838E]">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-lg px-2 py-1 text-[8px] font-extrabold ${
                              user.status === "approved"
                                ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {(user.status || "approved").toUpperCase()}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="rounded-xl border border-[#DCE7EC] bg-white p-3">
                            <p className="text-[8px] font-bold uppercase tracking-wide text-[#8FA3B0]">
                              Gender
                            </p>
                            <p className="mt-1 text-[10px] font-bold text-[#14222B]">
                              {user.gender || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#DCE7EC] bg-white p-3">
                            <p className="text-[8px] font-bold uppercase tracking-wide text-[#8FA3B0]">
                              Phone
                            </p>
                            <p className="mt-1 truncate text-[10px] font-bold text-[#14222B]">
                              {user.phone || "-"}
                            </p>
                          </div>
                        </div>

                        {activeTab === "students" && (
                          <div className="mt-2 rounded-xl border border-[#DCE7EC] bg-white p-3">
                            <p className="text-[8px] font-bold uppercase tracking-wide text-[#8FA3B0]">
                              Assigned Mentors
                            </p>

                            {user.assignedMentors?.length > 0 ? (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {user.assignedMentors.map((mentor) => (
                                  <span
                                    key={mentor._id}
                                    className="rounded-lg bg-[#E3F5F9] px-2 py-1 text-[9px] font-bold text-[#0088A6]"
                                  >
                                    {mentor.firstName} {mentor.lastName || ""}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-1 text-[9px] italic text-[#9AAAB4]">
                                No mentors assigned
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex gap-2 border-t border-[#DCE7EC] pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(user._id, user.status)
                            }
                            disabled={actionId === user._id}
                            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-[9px] font-bold ${
                              user.status === "approved"
                                ? "border-amber-200 bg-amber-50 text-amber-600"
                                : "border-green-200 bg-green-50 text-green-600"
                            } disabled:opacity-50`}
                          >
                            {actionId === user._id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : user.status === "approved" ? (
                              <Ban className="h-3 w-3" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            {user.status === "approved" ? "Suspend" : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteUserModal(user)}
                            disabled={actionId === user._id}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-[9px] font-bold text-red-600 disabled:opacity-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </main>

        {isAddMentorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07151D]/70 p-3 backdrop-blur-sm sm:p-5">
            <div className="my-auto max-h-[94vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#DCE7EC] bg-white shadow-2xl">
              <div className="border-b border-[#DCE7EC] bg-[#F7FAFC] px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A8CC] shadow-[0_4px_12px_rgba(0,168,204,0.2)]">
                      <Shield className="h-5 w-5 text-white" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#14222B]">
                        Add New Mentor
                      </h2>
                      <p className="mt-0.5 text-xs text-[#71838E]">
                        Create a mentor account
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeMentorModal}
                    disabled={creatingMentor}
                    className="rounded-xl p-2 text-[#8FA3B0] transition hover:bg-[#E3F5F9] hover:text-[#14222B] disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={handleCreateMentor}
                className="space-y-4 p-5 sm:p-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      value={newMentor.firstName}
                      onChange={(e) =>
                        setNewMentor({
                          ...newMentor,
                          firstName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      value={newMentor.lastName}
                      onChange={(e) =>
                        setNewMentor({
                          ...newMentor,
                          lastName: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="mentor@example.com"
                    value={newMentor.email}
                    onChange={(e) =>
                      setNewMentor({
                        ...newMentor,
                        email: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Gender *</label>
                    <select
                      value={newMentor.gender}
                      onChange={(e) =>
                        setNewMentor({
                          ...newMentor,
                          gender: e.target.value,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      placeholder="09xxxxxxxx"
                      value={newMentor.phone}
                      onChange={(e) =>
                        setNewMentor({
                          ...newMentor,
                          phone: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#BFE5EE] bg-[#E3F5F9] p-4 text-xs leading-5 text-[#287487]">
                  A temporary password will be generated automatically and sent
                  to the mentor's email address.
                </div>

                <div className="flex flex-col-reverse gap-2 border-t border-[#DCE7EC] pt-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeMentorModal}
                    disabled={creatingMentor}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-[#71838E] transition hover:bg-[#F7FAFC] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creatingMentor}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A8CC] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingMentor && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    {creatingMentor ? "Creating..." : "Create Mentor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {createdMentorCredentials && (
          <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto bg-[#07151D]/75 p-4 backdrop-blur-sm">
            <div className="my-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#DCE7EC] bg-white shadow-2xl">
              <div className="bg-[#0E2933] px-6 py-6 text-center sm:px-8">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00A8CC] shadow-[0_4px_12px_rgba(0,168,204,0.25)]">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>

                <h2 className="mt-4 text-lg font-extrabold text-white">
                  Mentor Account Created
                </h2>

                <p className="mt-1 text-xs text-[#B4D7E2]">
                  The mentor account was created successfully.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-3 rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] p-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA3B0]">
                      Name
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#14222B]">
                      {createdMentorCredentials.firstName}{" "}
                      {createdMentorCredentials.lastName}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#8FA3B0]">
                      Email
                    </p>
                    <p className="mt-1 break-all text-xs font-bold text-[#14222B]">
                      {createdMentorCredentials.email}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-700">
                  <strong>Important:</strong> The temporary password has been
                  sent to the mentor's email.
                </div>

                <button
                  type="button"
                  onClick={() => setCreatedMentorCredentials(null)}
                  className="mt-5 w-full rounded-xl bg-[#0E2933] py-3 text-xs font-bold text-white transition hover:bg-[#173C48]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteUserModal && (
          <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#DCE7EC] bg-white p-6 shadow-2xl text-center">
              <h3 className="mt-4 text-base font-bold text-[#14222B]">
                Delete User
              </h3>

              <p className="mt-1.5 text-xs text-[#71838E] leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-[#14222B]">
                  {deleteUserModal.firstName} {deleteUserModal.lastName}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteUserModal(null)}
                  disabled={actionId === deleteUserModal._id}
                  className="flex-1 rounded-xl border border-[#DCE7EC] bg-[#F7FAFC] py-2.5 text-xs font-bold text-[#71838E] transition hover:bg-[#EDF2F5] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteUser}
                  disabled={actionId === deleteUserModal._id}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {actionId === deleteUserModal._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UserManagement;