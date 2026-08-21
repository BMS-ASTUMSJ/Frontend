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
} from "lucide-react";

function UserManagement() {
  const [activeTab, setActiveTab] = useState("students");
  const [genderFilter, setGenderFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [actionId, setActionId] = useState(null);

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

  // ============================================================
  // HELPERS
  // ============================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  // ============================================================
  // FETCH USERS
  // ============================================================

  const refreshUsers = async () => {
    try {
      setLoading(true);

      const endpoint =
        activeTab === "students" ? "/users/students" : "/users/mentors";

      const params = [];

      if (genderFilter !== "All") {
        params.push(`gender=${encodeURIComponent(genderFilter)}`);
      }

      const queryString = params.length > 0 ? `?${params.join("&")}` : "";

      const response = await api.get(`${endpoint}${queryString}`);

      if (activeTab === "students") {
        setUsers(response.data?.students || []);
      } else {
        setUsers(response.data?.mentors || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);

      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint =
          activeTab === "students" ? "/users/students" : "/users/mentors";

        const params = [];

        if (genderFilter !== "All") {
          params.push(`gender=${encodeURIComponent(genderFilter)}`);
        }

        const queryString = params.length > 0 ? `?${params.join("&")}` : "";

        const response = await api.get(`${endpoint}${queryString}`);

        if (!isMounted) return;

        if (activeTab === "students") {
          setUsers(response.data?.students || []);
        } else {
          setUsers(response.data?.mentors || []);
        }
      } catch (err) {
        console.error("Fetch users error:", err);

        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [activeTab, genderFilter]);

  // ============================================================
  // TOGGLE USER STATUS
  // ============================================================

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

      await refreshUsers();
    } catch (err) {
      console.error("Status update error:", err);

      setError(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setActionId(null);
    }
  };

  // ============================================================
  // DELETE USER
  // ============================================================

  const handleDeleteUser = async (userId) => {
    try {
      setActionId(userId);
      clearMessages();

      const response = await api.delete(`/users/${userId}`);

      setSuccess(response.data?.message || "User deleted successfully.");

      await refreshUsers();
    } catch (err) {
      console.error("Delete user error:", err);

      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionId(null);
    }
  };

  // ============================================================
  // CREATE MENTOR
  // ============================================================

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
      console.error("Create mentor error:", err);

      setError(err.response?.data?.message || "Failed to create mentor.");
    } finally {
      setCreatingMentor(false);
    }
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    const fullName = `${user.firstName || ""} ${
      user.lastName || ""
    }`.toLowerCase();

    return (
      fullName.includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search)
    );
  });

  // ============================================================
  // CLOSE MENTOR MODAL
  // ============================================================

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

  // ============================================================
  // TAB CHANGE
  // ============================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setGenderFilter("All");
    setSearchTerm("");
    clearMessages();
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-screen bg-[#F6FAFD] p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ========================================================
            HEADER
        ======================================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0A1931]">
              User Management
            </h1>

            <p className="mt-1 text-sm text-[#7A7F85]">
              Manage students and mentors with account controls.
            </p>
          </div>

          {activeTab === "mentors" && (
            <button
              type="button"
              onClick={() => {
                clearMessages();
                setIsAddMentorOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7]"
            >
              <Plus className="h-4 w-4" />
              Add New Mentor
            </button>
          )}
        </div>

        {/* ========================================================
            NOTIFICATIONS
        ======================================================== */}

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto rounded-lg p-1 hover:bg-green-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ========================================================
            ROLE TABS
        ======================================================== */}

        <div className="mb-6 flex border-b border-[#DCE8F0]">
          <button
            type="button"
            onClick={() => handleTabChange("students")}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition ${
              activeTab === "students"
                ? "border-[#1A3D63] text-[#1A3D63]"
                : "border-transparent text-[#7A7F85] hover:text-[#0A1931]"
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            Students
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("mentors")}
            className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-bold transition ${
              activeTab === "mentors"
                ? "border-[#1A3D63] text-[#1A3D63]"
                : "border-transparent text-[#7A7F85] hover:text-[#0A1931]"
            }`}
          >
            <Shield className="h-4 w-4" />
            Mentors
          </button>
        </div>

        {/* ========================================================
            FILTERS
        ======================================================== */}

        <div className="mb-6 flex flex-col gap-4 border-b border-[#DCE8F0] pb-5 lg:flex-row lg:items-center lg:justify-between">
          {/* GENDER FILTER */}

          <div className="flex w-fit overflow-x-auto rounded-xl bg-gray-100 p-1">
            {["All", "Female", "Male"].map((gender) => (
              <button
                type="button"
                key={gender}
                onClick={() => setGenderFilter(gender)}
                className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                  genderFilter === gender
                    ? "bg-white text-[#1A3D63] shadow-sm"
                    : "text-[#7A7F85] hover:text-[#0A1931]"
                }`}
              >
                {gender === "Female" && "👩 "}
                {gender === "Male" && "👨 "}

                {gender === "All"
                  ? `All ${activeTab}`
                  : `${gender} ${activeTab}`}
              </button>
            ))}
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

            <input
              type="text"
              placeholder={`Search ${activeTab} by name, email...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-xs outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
            />
          </div>
        </div>

        {/* ========================================================
            RESULTS COUNT
        ======================================================== */}

        {!loading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[#7A7F85]">
              Showing{" "}
              <span className="font-bold text-[#0A1931]">
                {filteredUsers.length}
              </span>{" "}
              {activeTab}
            </p>

            <button
              type="button"
              onClick={refreshUsers}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1A3D63] transition hover:text-[#4A7FA7]"
            >
              <Loader2
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        )}

        {/* ========================================================
            USERS TABLE
        ======================================================== */}

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-[#1A3D63]">
              <Loader2 className="h-6 w-6 animate-spin" />

              <span className="text-sm font-medium">
                Loading {activeTab}...
              </span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#B3CFE5] p-12 text-center">
            {activeTab === "students" ? (
              <GraduationCap className="mx-auto h-10 w-10 text-[#B3CFE5]" />
            ) : (
              <Shield className="mx-auto h-10 w-10 text-[#B3CFE5]" />
            )}

            <h3 className="mt-4 text-lg font-bold text-[#0A1931]">
              No {activeTab} Found
            </h3>

            <p className="mt-1 text-sm text-[#7A7F85]">
              No {activeTab} match the current search or gender filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#DCE8F0] bg-white">
            <div className="overflow-x-auto">
              <table className="w-full min-w-237.5 border-collapse">
                {/* TABLE HEADER */}

                <thead>
                  <tr className="border-b border-[#DCE8F0] bg-[#F6FAFD]">
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Gender
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Contact
                    </th>

                    {activeTab === "students" && (
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                        Mentors
                      </th>
                    )}

                    {activeTab === "mentors" && (
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                        Role
                      </th>
                    )}

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#7A7F85]">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* TABLE BODY */}

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-[#EDF2F5] transition last:border-b-0 hover:bg-[#FAFCFE]"
                    >
                      {/* USER */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF3F9] text-sm font-bold text-[#1A3D63]">
                            {user.firstName?.charAt(0)?.toUpperCase()}
                            {user.lastName?.charAt(0)?.toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-[#0A1931]">
                              {user.firstName} {user.lastName}
                            </p>

                            {user.batch?.name && (
                              <p className="mt-0.5 text-xs font-medium text-[#4A7FA7]">
                                {user.batch.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* GENDER */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                            user.gender?.toLowerCase() === "female"
                              ? "border-pink-200 bg-pink-50 text-pink-700"
                              : "border-blue-200 bg-blue-50 text-blue-700"
                          }`}
                        >
                          {user.gender?.toLowerCase() === "female"
                            ? "Female"
                            : "Male"}
                        </span>
                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex max-w-57.5 items-center gap-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-[#7A7F85]" />

                            <span className="truncate text-xs text-[#4A5560]">
                              {user.email || "-"}
                            </span>
                          </div>

                          {user.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 shrink-0 text-[#7A7F85]" />

                              <span className="text-xs text-[#4A5560]">
                                {user.phone}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* STUDENT MENTORS */}

                      {activeTab === "students" && (
                        <td className="px-5 py-4">
                          {user.assignedMentors?.length > 0 ? (
                            <div className="flex max-w-57.5 flex-wrap gap-1.5">
                              {user.assignedMentors.map((mentor) => (
                                <span
                                  key={mentor._id}
                                  className="rounded-lg bg-[#EAF3F9] px-2 py-1 text-xs font-semibold text-[#1A3D63]"
                                >
                                  {mentor.firstName
                                    ? `${mentor.firstName} ${
                                        mentor.lastName || ""
                                      }`
                                    : "Mentor"}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs italic text-[#9CA3AF]">
                              No mentors assigned
                            </span>
                          )}
                        </td>
                      )}

                      {/* MENTOR ROLE */}

                      {activeTab === "mentors" && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-[#1A3D63]" />

                            <span className="text-xs font-semibold text-[#1A3D63]">
                              Mentor
                            </span>
                          </div>
                        </td>
                      )}

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                            user.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.status === "approved"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />

                          {(user.status || "approved").toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(user._id, user.status)
                            }
                            disabled={actionId === user._id}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.status === "approved"
                                ? "text-amber-600 hover:text-amber-700"
                                : "text-green-600 hover:text-green-700"
                            }`}
                          >
                            {actionId === user._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : user.status === "approved" ? (
                              <Ban className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}

                            {user.status === "approved" ? "Suspend" : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionId === user._id}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {actionId === user._id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            ADD MENTOR MODAL
        ======================================================== */}

        {isAddMentorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#0A1931]">
                  Add New Mentor
                </h2>

                <button
                  type="button"
                  onClick={closeMentorModal}
                  disabled={creatingMentor}
                  className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <p className="text-xs text-[#7A7F85]">
                Create a mentor account directly. A temporary password will be
                generated automatically.
              </p>

              <form onSubmit={handleCreateMentor} className="mt-6 space-y-4">
                {/* NAMES */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A1931]">
                      First Name *
                    </label>

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
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A1931]">
                      Last Name *
                    </label>

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
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                    />
                  </div>
                </div>

                {/* EMAIL */}

                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#0A1931]">
                    Email *
                  </label>

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
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                {/* GENDER + PHONE */}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A1931]">
                      Gender *
                    </label>

                    <select
                      value={newMentor.gender}
                      onChange={(e) =>
                        setNewMentor({
                          ...newMentor,
                          gender: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-[#0A1931]">
                      Phone
                    </label>

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
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                    />
                  </div>
                </div>

                {/* FOOTER */}

                <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={closeMentorModal}
                    disabled={creatingMentor}
                    className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#7A7F85] hover:bg-gray-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creatingMentor}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#1A3D63] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-50"
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

        {/* ========================================================
            CREATED MENTOR CREDENTIALS
        ======================================================== */}

        {createdMentorCredentials && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>

              <h2 className="text-center text-xl font-bold text-[#0A1931]">
                Mentor Account Created
              </h2>

              <p className="mt-2 text-center text-sm text-[#7A7F85]">
                The mentor account was created successfully.
              </p>

              <div className="mt-6 space-y-4 rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F85]">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-[#0A1931]">
                    {createdMentorCredentials.firstName}{" "}
                    {createdMentorCredentials.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7A7F85]">
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold text-[#0A1931]">
                    {createdMentorCredentials.email}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                <strong>Important:</strong> The temporary password has been sent
                to the mentor's email.
              </div>

              <button
                type="button"
                onClick={() => setCreatedMentorCredentials(null)}
                className="mt-6 w-full rounded-xl bg-[#0A1931] py-3 text-sm font-bold text-white transition hover:bg-[#1A3D63]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManagement;
