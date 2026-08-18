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

  const refreshUsers = async () => {
    try {
      const endpoint =
        activeTab === "students" ? "/users/students" : "/users/mentors";
      const params = [];
      if (genderFilter !== "All") params.push(`gender=${genderFilter}`);
      const queryString = params.length > 0 ? `?${params.join("&")}` : "";

      const response = await api.get(`${endpoint}${queryString}`);
      if (activeTab === "students") {
        setUsers(response.data?.students || []);
      } else {
        setUsers(response.data?.mentors || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        const endpoint =
          activeTab === "students" ? "/users/students" : "/users/mentors";
        const params = [];
        if (genderFilter !== "All") params.push(`gender=${genderFilter}`);
        const queryString = params.length > 0 ? `?${params.join("&")}` : "";

        const response = await api.get(`${endpoint}${queryString}`);
        if (isMounted) {
          if (activeTab === "students") {
            setUsers(response.data?.students || []);
          } else {
            setUsers(response.data?.mentors || []);
          }
        }
      } catch (err) {
        console.error("Fetch users error:", err);
        if (isMounted) {
          setError("Failed to load users.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [activeTab, genderFilter]);

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      setActionId(userId);
      setError("");
      setSuccess("");

      const newStatus = currentStatus === "approved" ? "suspended" : "approved";
      await api.patch(`/users/${userId}/status`, { status: newStatus });

      setSuccess(`User status updated to ${newStatus}.`);
      await refreshUsers();
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.response?.data?.message || "Failed to update status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setActionId(userId);
      setError("");
      setSuccess("");

      await api.delete(`/users/${userId}`);
      setSuccess("User deleted successfully.");
      await refreshUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionId(null);
    }
  };

  const handleCreateMentor = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newMentor.firstName || !newMentor.lastName || !newMentor.email) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setCreatingMentor(true);
      const response = await api.post("/users", newMentor);

      setSuccess("Mentor created successfully!");
      setIsAddMentorOpen(false);

      if (response.data?.user?.temporaryPassword) {
        setCreatedMentorCredentials(response.data.user);
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

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1931]">User Management</h1>
          <p className="text-sm text-[#7A7F85] mt-1">
            Manage students and mentors with gender filtering and batch
            tracking.
          </p>
        </div>

        {activeTab === "mentors" && (
          <button
            onClick={() => setIsAddMentorOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1A3D63] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7]"
          >
            <Plus className="h-4 w-4" />
            Add New Mentor
          </button>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("students");
            setGenderFilter("All");
          }}
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
          onClick={() => {
            setActiveTab("mentors");
            setGenderFilter("All");
          }}
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

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-xl bg-gray-100 p-1">
          {["All", "Female", "Male"].map((gender) => (
            <button
              key={gender}
              onClick={() => setGenderFilter(gender)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                genderFilter === gender
                  ? "bg-white text-[#1A3D63] shadow-sm"
                  : "text-[#7A7F85] hover:text-[#0A1931]"
              }`}
            >
              {gender === "Female" && "👩 "}
              {gender === "Male" && "👨 "}
              {gender === "All" ? `All ${activeTab}` : `${gender} ${activeTab}`}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab} by name, email...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-xs outline-none focus:border-[#4A7FA7]"
          />
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <div className="flex items-center gap-3 text-[#1A3D63]">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm font-medium">Loading {activeTab}...</span>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#B3CFE5] p-12 text-center">
          <h3 className="text-lg font-bold text-[#0A1931]">
            No {activeTab} Found
          </h3>
          <p className="mt-1 text-sm text-[#7A7F85]">
            No {activeTab} match the current search or gender filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-gray-100 transition hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      u.gender === "Female"
                        ? "bg-pink-50 text-pink-700 border border-pink-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {u.gender === "Female" ? "👩 Female" : "👨 Male"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      u.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {(u.status || "approved").toUpperCase()}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-[#0A1931]">
                  {u.firstName} {u.lastName}
                </h3>

                {u.batch?.name && (
                  <span className="mt-1 inline-block rounded-md bg-[#F6FAFD] px-2 py-0.5 text-xs font-bold text-[#4A7FA7]">
                    {u.batch.name}
                  </span>
                )}

                <div className="mt-4 space-y-1.5 text-xs text-[#7A7F85]">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                </div>

                {activeTab === "students" && (
                  <div className="mt-4 rounded-xl border border-gray-100 bg-[#F6FAFD] p-3 text-xs">
                    <span className="block font-bold text-[#0A1931] mb-1">
                      Assigned Mentors:
                    </span>
                    {u.assignedMentors && u.assignedMentors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.assignedMentors.map((m) => (
                          <span
                            key={m._id}
                            className="inline-block rounded bg-white px-2 py-0.5 font-semibold text-[#1A3D63] border border-gray-200"
                          >
                            {m.firstName
                              ? `${m.firstName} ${m.lastName}`
                              : "Mentor"}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">
                        No mentors assigned
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4 text-xs">
                <button
                  onClick={() => handleToggleStatus(u._id, u.status)}
                  disabled={actionId === u._id}
                  className={`inline-flex items-center gap-1 font-bold transition ${
                    u.status === "approved"
                      ? "text-amber-600 hover:text-amber-700"
                      : "text-green-600 hover:text-green-700"
                  }`}
                >
                  {u.status === "approved" ? (
                    <Ban className="h-3.5 w-3.5" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5" />
                  )}
                  {u.status === "approved" ? "Suspend" : "Approve"}
                </button>

                <button
                  onClick={() => handleDeleteUser(u._id)}
                  disabled={actionId === u._id}
                  className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Mentor */}
      {isAddMentorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-[#0A1931]">
                Add New Mentor
              </h2>
              <button onClick={() => setIsAddMentorOpen(false)}>
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-[#7A7F85]">
              Create a mentor account directly. Credentials will be generated.
            </p>

            <form onSubmit={handleCreateMentor} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={newMentor.firstName}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, firstName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#4A7FA7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last name"
                    value={newMentor.lastName}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, lastName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#4A7FA7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="mentor@example.com"
                  value={newMentor.email}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#4A7FA7]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                    Gender *
                  </label>
                  <select
                    value={newMentor.gender}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, gender: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#4A7FA7]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A1931] mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={newMentor.phone}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#4A7FA7]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddMentorOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7A7F85]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingMentor}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1A3D63] px-5 py-2 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {creatingMentor && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Create Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {createdMentorCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-[#0A1931]">
              Account Created!
            </h2>
            <div className="mt-5 rounded-2xl border border-gray-200 bg-[#F6FAFD] p-4 text-left space-y-2 text-xs">
              <div>
                <span className="font-semibold text-[#7A7F85]">Email:</span>{" "}
                <span className="font-bold text-[#0A1931]">
                  {createdMentorCredentials.email}
                </span>
              </div>
              <div>
                <span className="font-semibold text-[#7A7F85]">Password:</span>{" "}
                <span className="font-mono font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                  {createdMentorCredentials.temporaryPassword}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCreatedMentorCredentials(null)}
              className="mt-6 w-full rounded-xl bg-[#1A3D63] py-2.5 text-xs font-bold text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
