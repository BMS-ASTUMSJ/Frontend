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
  Sparkles,
  Users,
  RotateCcw,
  UserCheck,
  CalendarDays,
  KeyRound,
  Check,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

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
        response.data?.message || `User status updated to ${newStatus}.`
      );
      toast.success(`User status updated to ${newStatus}.`);

      await refreshUsers();
    } catch (err) {
      console.error("Status update error:", err);
      setError(err.response?.data?.message || "Failed to update user status.");
      toast.error(err.response?.data?.message || "Failed to update status.");
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
      toast.success("User removed successfully.");

      await refreshUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.response?.data?.message || "Failed to delete user.");
      toast.error(err.response?.data?.message || "Failed to delete user.");
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
      console.error("Create mentor error:", err);
      setError(err.response?.data?.message || "Failed to create mentor.");
      toast.error(err.response?.data?.message || "Failed to create mentor.");
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

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            background: "#FAF4EB",
            color: "#16344E",
            border: "1px solid #E8DCB8",
            fontWeight: "600",
          },
        }}
      />

      {/* ============================================================
          ANIMATION STYLES
      ============================================================ */}
      <style>{`
        @keyframes pageEnter {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .page-enter { animation: pageEnter 0.6s cubic-bezier(.2,.8,.2,1) both; }
        .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
        .float-slow { animation: floatSlow 5s ease-in-out infinite; }
        .modal-enter { animation: modalEnter 0.22s cubic-bezier(.2,.8,.2,1) both; }
        .smooth-transition { transition: all 220ms ease; }
        
        .hide-scrollbar::-webkit-scrollbar { height: 6px; }
        .hide-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .hide-scrollbar::-webkit-scrollbar-thumb { background: rgba(226, 109, 44, 0.3); border-radius: 999px; }
      `}</style>

      {/* ============================================================
          MAIN CONTAINER (Ice-Blue -> Cream -> Sunset Peach Gradient)
      ============================================================ */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#BDDCF2] via-[#F4E9D8] via-[#F8DECA] to-[#F7C9A4] p-4 text-[#16344E] selection:bg-[#E26D2C] selection:text-white md:p-6 lg:p-8">

        {/* Ambient Moving Glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="pulse-glow absolute -top-36 left-1/4 h-[480px] w-[600px] rounded-full bg-[#5FB8F2]/30 blur-[130px]" />
          <div className="absolute top-1/3 -right-20 h-[480px] w-[480px] rounded-full bg-[#F38744]/30 blur-[140px]" />
          <div className="float-slow absolute -bottom-20 left-1/3 h-[500px] w-[500px] rounded-full bg-[#F5A36C]/35 blur-[150px]" />
        </div>

        <div className="page-enter relative z-10 mx-auto max-w-[1500px] space-y-7">

          {/* ======================================================
              1. TOP HEADER BANNER
          ====================================================== */}
          <header className="relative overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-r from-[#173854] via-[#1A3E5E] to-[#224A6D] px-6 py-7 shadow-[0_20px_50px_rgba(23,56,84,0.22)] backdrop-blur-2xl md:px-8">
            <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-[#F38744]/35 blur-[70px]" />
            <div className="pointer-events-none absolute bottom-[-50px] left-1/3 h-52 w-52 rounded-full bg-[#7EC8F5]/25 blur-[60px]" />

            <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <div className="float-slow relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md">
                  <UserCheck size={28} strokeWidth={1.9} />
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#F38744] shadow-[0_0_12px_#F38744]" />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-5 rounded-full bg-[#F38744]" />
                    <Sparkles size={14} className="text-[#F38744]" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FCD8BF]">
                      Account Directory
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    User Management
                  </h1>

                  <p className="mt-1 text-sm text-[#D7E8F7]">
                    Oversee student registrations, assign mentors, and enforce security policies.
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
                  className="smooth-transition inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Plus size={16} />
                  <span>Add New Mentor</span>
                </button>
              )}
            </div>
          </header>

          {/* ======================================================
              ALERTS
          ====================================================== */}
          {success && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-100/90 p-4 text-sm text-emerald-800 shadow-sm backdrop-blur-md">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <div className="flex-1 font-bold">{success}</div>
              <button
                type="button"
                onClick={() => setSuccess("")}
                className="rounded-lg p-1 text-emerald-800 hover:bg-emerald-200"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-100/90 p-4 text-sm text-rose-800 shadow-sm backdrop-blur-md">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-600" />
              <div className="flex-1 font-bold">{error}</div>
              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg p-1 text-rose-800 hover:bg-rose-200"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* ======================================================
              2. ROLE TABS & FILTER BAR (Creamy Glass Card)
          ====================================================== */}
          <div className="space-y-4">
            
            {/* ROLE TABS (Students vs Mentors) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleTabChange("students")}
                className={`smooth-transition inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-wider ${
                  activeTab === "students"
                    ? "bg-[#173854] text-white shadow-md"
                    : "border border-[#DFCBB5] bg-[#FAF4EB]/80 text-[#16344E] hover:bg-[#FFFDF9]"
                }`}
              >
                <GraduationCap size={16} />
                <span>Students</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "students" ? "bg-white/20 text-white" : "bg-[#EBDCC8] text-[#16344E]"}`}>
                  {activeTab === "students" ? filteredUsers.length : ""}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("mentors")}
                className={`smooth-transition inline-flex items-center gap-2.5 rounded-2xl px-6 py-3 text-xs font-black uppercase tracking-wider ${
                  activeTab === "mentors"
                    ? "bg-[#173854] text-white shadow-md"
                    : "border border-[#DFCBB5] bg-[#FAF4EB]/80 text-[#16344E] hover:bg-[#FFFDF9]"
                }`}
              >
                <Shield size={16} />
                <span>Mentors</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === "mentors" ? "bg-white/20 text-white" : "bg-[#EBDCC8] text-[#16344E]"}`}>
                  {activeTab === "mentors" ? filteredUsers.length : ""}
                </span>
              </button>
            </div>

            {/* FILTERS & SEARCH ROW */}
            <div className="flex flex-col gap-4 rounded-[26px] border border-[#E8DCB8] bg-[#FAF4EB]/90 p-4 shadow-[0_12px_35px_rgba(23,56,84,0.08)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
              {/* GENDER FILTER PILLS */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#DFCBB5] bg-[#F5ECE0]/80 p-1.5">
                {["All", "Female", "Male"].map((gender) => (
                  <button
                    type="button"
                    key={gender}
                    onClick={() => setGenderFilter(gender)}
                    className={`smooth-transition rounded-xl px-4 py-2 text-xs font-bold ${
                      genderFilter === gender
                        ? "bg-[#173854] text-white shadow-sm"
                        : "text-[#16344E] hover:bg-[#FFFDF9]"
                    }`}
                  >
                    {gender === "Female" && "👩 "}
                    {gender === "Male" && "👨 "}
                    {gender === "All" ? `All ${activeTab}` : `${gender} ${activeTab}`}
                  </button>
                ))}
              </div>

              {/* SEARCH INPUT */}
              <div className="relative w-full lg:max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab} by name, email, phone...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-[#DFCBB5] bg-[#FFFDF9] pl-10 pr-4 text-xs font-semibold text-[#16344E] placeholder-slate-400 outline-none transition focus:border-[#E26D2C]"
                />
              </div>
            </div>
          </div>

          {/* ======================================================
              3. USERS DIRECTORY TABLE (Creamy Alabaster)
          ====================================================== */}
          <section className="overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB]/90 shadow-[0_20px_50px_rgba(23,56,84,0.1)] backdrop-blur-xl">
            
            {/* Top Table Summary Bar */}
            <div className="flex items-center justify-between border-b border-[#EBDCC8] px-6 py-4.5">
              <p className="text-xs font-semibold text-slate-600">
                Showing <span className="font-black text-[#16344E]">{filteredUsers.length}</span> active {activeTab}
              </p>

              <button
                type="button"
                onClick={refreshUsers}
                disabled={loading}
                className="smooth-transition inline-flex items-center gap-1.5 rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-3.5 py-1.5 text-xs font-bold text-[#16344E] hover:bg-[#FFFDF9]"
              >
                <RotateCcw size={13} className={loading ? "animate-spin" : ""} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Content Display */}
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#E26D2C]" />
                <p className="mt-3 text-xs font-bold text-slate-500">Loading {activeTab}...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                {activeTab === "students" ? (
                  <GraduationCap className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                ) : (
                  <Shield className="mx-auto h-12 w-12 text-[#DE7E4A]" />
                )}
                <h3 className="mt-4 text-base font-black text-[#16344E]">No {activeTab} found</h3>
                <p className="mt-1 text-xs text-slate-500">
                  No {activeTab} match your current filter criteria or search.
                </p>
              </div>
            ) : (
              <div className="hide-scrollbar overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-[#EBDCC8] bg-[#EFE2CE]/95 text-left">
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        User Info
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Gender
                      </th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Contact Details
                      </th>
                      {activeTab === "students" && (
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          Assigned Mentors
                        </th>
                      )}
                      {activeTab === "mentors" && (
                        <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                          System Role
                        </th>
                      )}
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Account Status
                      </th>
                      <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.16em] text-[#4E6173]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="smooth-transition border-b border-[#EBDCC8] bg-[#FDF8F0]/75 last:border-b-0 hover:bg-[#EAE0D0]"
                      >
                        {/* USER AVATAR & NAME */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E0F0FA] to-[#D0E6F7] text-xs font-black text-[#173854]">
                              {user.firstName?.charAt(0)?.toUpperCase()}
                              {user.lastName?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-[#16344E]">
                                {user.firstName} {user.lastName}
                              </p>
                              {user.batch?.name && (
                                <p className="text-[10px] font-bold text-[#E26D2C]">
                                  {user.batch.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* GENDER */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-lg border px-2.5 py-0.5 text-xs font-bold ${
                              user.gender?.toLowerCase() === "female"
                                ? "border-rose-200 bg-rose-50 text-rose-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {user.gender?.toLowerCase() === "female" ? "Female" : "Male"}
                          </span>
                        </td>

                        {/* CONTACT */}
                        <td className="px-5 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                              <Mail size={12} className="text-slate-400" />
                              <span className="truncate max-w-[200px]">{user.email || "-"}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                                <Phone size={12} className="text-slate-400" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* STUDENT'S MENTORS */}
                        {activeTab === "students" && (
                          <td className="px-5 py-4">
                            {user.assignedMentors?.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5 max-w-xs">
                                {user.assignedMentors.map((m) => (
                                  <span
                                    key={m._id}
                                    className="rounded-lg border border-[#DFCBB5] bg-[#FFFDF9] px-2 py-0.5 text-[10px] font-bold text-[#16344E]"
                                  >
                                    {m.firstName} {m.lastName || ""}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs italic text-slate-400">
                                No mentors assigned
                              </span>
                            )}
                          </td>
                        )}

                        {/* MENTOR ROLE */}
                        {activeTab === "mentors" && (
                          <td className="px-5 py-4">
                            <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#DFCBB5] bg-[#FFFDF9] px-2.5 py-1 text-xs font-bold text-[#173854]">
                              <Shield size={13} className="text-[#DE7E4A]" />
                              <span>Bootcamp Mentor</span>
                            </div>
                          </td>
                        )}

                        {/* STATUS */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                              user.status === "approved"
                                ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                : "border-rose-300 bg-rose-100 text-rose-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                user.status === "approved"
                                  ? "bg-emerald-600 animate-pulse"
                                  : "bg-rose-600"
                              }`}
                            />
                            {(user.status || "approved").toUpperCase()}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user._id, user.status)}
                              disabled={actionId === user._id}
                              className={`smooth-transition inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${
                                user.status === "approved"
                                  ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                  : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                              }`}
                            >
                              {actionId === user._id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : user.status === "approved" ? (
                                <Ban size={13} />
                              ) : (
                                <CheckCircle size={13} />
                              )}
                              <span>{user.status === "approved" ? "Suspend" : "Approve"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={actionId === user._id}
                              className="smooth-transition inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                              title="Delete user"
                            >
                              {actionId === user._id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ========================================================
          ADD MENTOR MODAL (Creamy Glass)
      ======================================================== */}
      {isAddMentorOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#173854]/50 p-4 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeMentorModal();
          }}
        >
          <div className="modal-enter w-full max-w-lg overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBDCC8] bg-[#F5ECE0] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FDE2D2] text-[#E26D2C]">
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#16344E]">
                    Add New Mentor
                  </h2>
                  <p className="text-xs text-slate-500">
                    A secure temporary password will be issued upon creation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMentorModal}
                disabled={creatingMentor}
                className="rounded-xl border border-[#DFCBB5] bg-[#FAF4EB] p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={17} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMentor} className="p-6 sm:p-7 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#16344E]">
                    First Name <span className="text-[#E26D2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sara"
                    value={newMentor.firstName}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, firstName: e.target.value })
                    }
                    className="h-10.5 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#16344E]">
                    Last Name <span className="text-[#E26D2C]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bekele"
                    value={newMentor.lastName}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, lastName: e.target.value })
                    }
                    className="h-10.5 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#16344E]">
                  Email Address <span className="text-[#E26D2C]">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="mentor@example.com"
                  value={newMentor.email}
                  onChange={(e) =>
                    setNewMentor({ ...newMentor, email: e.target.value })
                  }
                  className="h-10.5 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#16344E]">
                    Gender <span className="text-[#E26D2C]">*</span>
                  </label>
                  <select
                    value={newMentor.gender}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, gender: e.target.value })
                    }
                    className="h-10.5 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#16344E]">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="09xxxxxxxx"
                    value={newMentor.phone}
                    onChange={(e) =>
                      setNewMentor({ ...newMentor, phone: e.target.value })
                    }
                    className="h-10.5 w-full rounded-xl border border-[#DFCBB5] bg-[#FFFDF9] px-3.5 text-xs font-semibold outline-none focus:border-[#E26D2C]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#EBDCC8] pt-5 mt-5">
                <button
                  type="button"
                  onClick={closeMentorModal}
                  disabled={creatingMentor}
                  className="rounded-xl border border-[#DFCBB5] bg-[#F5ECE0] px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-[#E5D7C4]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingMentor}
                  className="smooth-transition inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#DE7E4A] via-[#E26D2C] to-[#BA6137] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                >
                  {creatingMentor && <Loader2 size={14} className="animate-spin" />}
                  <span>{creatingMentor ? "Registering..." : "Create Mentor"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          CREATED MENTOR CREDENTIALS MODAL
      ======================================================== */}
      {createdMentorCredentials && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#173854]/60 p-4 backdrop-blur-md">
          <div className="modal-enter w-full max-w-md overflow-hidden rounded-[30px] border border-[#E8DCB8] bg-[#FAF4EB] p-7 shadow-[0_30px_90px_rgba(23,56,84,0.3)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <KeyRound size={32} />
            </div>

            <h2 className="text-center text-xl font-black text-[#16344E]">
              Mentor Created Successfully
            </h2>

            <p className="mt-1 text-center text-xs text-slate-500">
              Account provisioned with an initial temporary password.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl border border-[#EBDCC8] bg-[#FFFDF9] p-4.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mentor Name
                </p>
                <p className="text-sm font-black text-[#16344E]">
                  {createdMentorCredentials.firstName} {createdMentorCredentials.lastName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email
                </p>
                <p className="text-xs font-bold text-[#1E6FA3] break-all">
                  {createdMentorCredentials.email}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-medium text-amber-900">
              <strong>Notice:</strong> The login credentials and instructions have been automatically dispatched to the mentor's inbox.
            </div>

            <button
              type="button"
              onClick={() => setCreatedMentorCredentials(null)}
              className="mt-6 w-full rounded-2xl bg-[#173854] py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-[#1f4a70]"
            >
              Done / Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UserManagement;