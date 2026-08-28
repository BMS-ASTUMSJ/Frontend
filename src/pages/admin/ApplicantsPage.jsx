import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  RefreshCw,
  Check,
  X,
  Users,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Layers,
  Search,
  UserCheck,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import api from "../../utils/api";

function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [approvalMessage, setApprovalMessage] = useState(null);

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);
      const response = await api.get("/batches");
      setBatches(response.data?.batches || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchApplicants = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await api.get("/applicants");

      setApplicants(response.data?.applicants || []);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to load applicants.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBatches();
    fetchApplicants();
  }, []);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applicants.filter((applicant) => {
      const fullName = applicant.fullName?.toString().toLowerCase() || "";

      const email = applicant.email?.toString().toLowerCase() || "";

      const schoolId = applicant.schoolId?.toString().toLowerCase() || "";

      const department = applicant.department?.toString().toLowerCase() || "";

      const applicantGender =
        applicant.gender?.toString().trim().toLowerCase() || "";

      const selectedGender = gender?.toString().trim().toLowerCase() || "";

      const applicantStatus =
        applicant.status?.toString().trim().toLowerCase() || "";

      const selectedStatus = status?.toString().trim().toLowerCase() || "";

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        email.includes(query) ||
        schoolId.includes(query) ||
        department.includes(query);

      const matchesGender =
        !selectedGender || applicantGender === selectedGender;

      const matchesStatus =
        !selectedStatus || applicantStatus === selectedStatus;

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [applicants, search, gender, status]);

  const updateStatus = async (applicantId, newStatus) => {
    try {
      setProcessingId(applicantId);
      setError("");

      const response = await api.patch(`/applicants/${applicantId}/status`, {
        status: newStatus,
      });

      const updatedApplicant = response.data?.applicant;
      const student = response.data?.student;

      setApplicants((previous) =>
        previous.map((applicant) =>
          applicant._id === applicantId
            ? {
                ...applicant,
                ...updatedApplicant,
              }
            : applicant,
        ),
      );

      if (newStatus === "passed") {
        const email = student?.email || updatedApplicant?.email || "";

        setApprovalMessage({ email });

        toast.success("Applicant approved successfully.");
      } else {
        toast.success("Applicant rejected successfully.");
      }

      setSelectedApplicant(null);
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to update applicant status.";

      setError(message);
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (value) => {
    switch (value) {
      case "passed":
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E5F8EF] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#15965D]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#16B978]" />
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF0F0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#E34D59]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F04444]" />
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF6E6] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#E18A00]">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]" />
            Pending
          </span>
        );
    }
  };

  const getBatchName = (applicant, batchList = batches) => {
    if (!applicant?.batch) return "No batch";

    if (typeof applicant.batch === "object") {
      return applicant.batch.name || "Unknown batch";
    }

    const batch = batchList.find((item) => item._id === applicant.batch);

    return batch?.name || "Unknown batch";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  const resetFilters = () => {
    setSearch("");
    setGender("");
    setStatus("");
  };

  const hasFilters = search.trim() !== "" || gender !== "" || status !== "";

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontWeight: "600",
            fontSize: "13px",
          },
        }}
      />

      <div className="min-h-screen bg-[#F4F8FA] px-4 py-3 md:px-7 lg:px-8">
        <div className="mx-auto max-w-350">
          <div className="overflow-hidden rounded-3xl bg-linear-to-b from-[#061E27] via-[#0B303A] to-[#173F49] shadow-sm">
            <div className="flex min-h-22.5 items-center justify-between gap-5 px-4 py-7 md:px-9">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#00A8CC] text-white shadow-lg shadow-[#00A8CC]/20">
                  <GraduationCap size={29} strokeWidth={2.3} />
                </div>

                <div>
                  <h1 className="text-[26px] font-bold tracking-tight text-white md:text-[32px]">
                    Applicants
                  </h1>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchApplicants(false)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />

                <span className="hidden sm:inline">
                  {refreshing ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8CA1AA]"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, school ID or department..."
                className="h-12 w-full rounded-xl border border-[#D5E5E9] bg-[#F8FBFC] pl-11 pr-10 text-sm font-medium text-[#172A33] outline-none transition placeholder:text-[#A7B5BA] focus:border-[#00A8CC] focus:bg-white focus:ring-2 focus:ring-[#00A8CC]/10"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8CA1AA] transition hover:bg-[#EAF5F8] hover:text-[#132832]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex items-center rounded-xl bg-[#F1F5F6] p-1">
                {["", "male", "female"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                      gender === g
                        ? "bg-white text-[#17303A] shadow-sm"
                        : "text-[#8CA1AA] hover:text-[#17303A]"
                    }`}
                  >
                    {g === "" ? "All" : g === "male" ? "Male" : "Female"}
                  </button>
                ))}
              </div>

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-12 min-w-36.25 appearance-none rounded-xl border border-[#D5E5E9] bg-[#F8FBFC] pl-4 pr-10 text-xs font-bold text-[#17303A] outline-none transition focus:border-[#00A8CC] focus:bg-white"
                >
                  <option value="">All statuses</option>

                  <option value="pending">Pending</option>

                  <option value="passed">Approved</option>

                  <option value="rejected">Rejected</option>
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8CA1AA]"
                />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-5 flex items-center justify-between gap-3 rounded-xl border border-[#FFD8D8] bg-[#FFF5F5] px-4 py-3 text-xs font-semibold text-[#C93643] md:mx-8">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-[#E34D59]" />

              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 transition hover:bg-[#FFE5E5]"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-105 flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F7FA]">
              <Loader2 size={27} className="animate-spin text-[#00A8CC]" />
            </div>

            <p className="mt-4 text-sm font-bold text-[#71868F]">
              Loading applicants...
            </p>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="flex min-h-105 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F7FA] text-[#00A8CC]">
              <Users size={29} />
            </div>

            <h3 className="mt-4 text-base font-extrabold text-[#142832]">
              No applicants found
            </h3>

            <p className="mt-1 max-w-sm text-sm font-medium text-[#91A5AE]">
              {hasFilters
                ? "Try adjusting your filters or search keywords."
                : "There are currently no applicant records."}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-[#102B34] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#173F49]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto px-4 pb-6 pt-4 md:px-6">
            <table className="w-full min-w-262.5 border-separate border-spacing-y-3 text-left">
              <thead>
                <tr>
                  <th className="px-5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    Applicant
                  </th>

                  <th className="px-5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    School ID
                  </th>

                  <th className="px-5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    Gender
                  </th>

                  <th className="px-5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    Department
                  </th>

                  <th className="px-5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    Batch
                  </th>

                  <th className="px-5 pb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    Status
                  </th>

                  <th className="px-5 pb-2 text-center text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#91A5AE]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredApplicants.map((applicant) => (
                  <tr
                    key={applicant._id}
                    className="group transition-transform duration-200 ease-in-out hover:-translate-y-1"
                  >
                    <td className="rounded-l-2xl border-y border-l-4 border-[#E7EEF1] border-l-4 border-l-[#13A8C6] bg-white px-5 py-5 shadow-[0_3px_15px_rgba(18,45,55,0.04)] transition group-hover:bg-[#FCFEFF]">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E5F5F8] font-bold text-[#00A8CC]">
                          {applicant.fullName
                            ? applicant.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()
                            : "AP"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#142832]">
                            {applicant.fullName || "-"}
                          </p>

                          <p className="mt-1 truncate text-[11px] font-medium text-[#91A5AE]">
                            {applicant.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="border-y border-[#E7EEF1] bg-white px-5 py-5 text-sm font-bold text-[#445962] shadow-[0_3px_15px_rgba(18,45,55,0.04)]">
                      {applicant.schoolId || "-"}
                    </td>

                    <td className="border-y border-[#E7EEF1] bg-white px-5 py-5 shadow-[0_3px_15px_rgba(18,45,55,0.04)]">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase ${
                          applicant.gender?.toLowerCase() === "female"
                            ? "bg-[#FFF0F7] text-[#D84A82]"
                            : "bg-[#EDF5FF] text-[#3476B8]"
                        }`}
                      >
                        {applicant.gender || "-"}
                      </span>
                    </td>

                    <td className="border-y border-[#E7EEF1] bg-white px-5 py-5 text-sm font-bold text-[#445962] shadow-[0_3px_15px_rgba(18,45,55,0.04)]">
                      {applicant.department || "-"}
                    </td>

                    <td className="border-y border-[#E7EEF1] bg-white px-5 py-5 shadow-[0_3px_15px_rgba(18,45,55,0.04)]">
                      <div className="flex items-center gap-2 text-sm font-bold text-[#00A0C0]">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF7FA]">
                          <Layers size={14} />
                        </div>

                        <span>{getBatchName(applicant)}</span>
                      </div>
                    </td>

                    <td className="border-y border-[#E7EEF1] bg-white px-5 py-5 shadow-[0_3px_15px_rgba(18,45,55,0.04)]">
                      {getStatusBadge(applicant.status)}
                    </td>

                    <td className="rounded-r-2xl border-y border-r border-[#E7EEF1] bg-white px-5 py-5 shadow-[0_3px_15px_rgba(18,45,55,0.04)]">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedApplicant(applicant)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg  text-[#4D6872] transition hover:bg-[#E3F5F9] hover:text-[#00A8CC]"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>

                        {applicant.status !== "passed" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(applicant._id, "passed")
                            }
                            disabled={processingId === applicant._id}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#15965D] transition hover:bg-[#D7F4E5] disabled:opacity-50"
                            title="Approve"
                          >
                            {processingId === applicant._id ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Check size={20} />
                            )}
                          </button>
                        )}

                        {applicant.status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              updateStatus(applicant._id, "rejected")
                            }
                            disabled={processingId === applicant._id}
                            className="flex h-9 w-9 items-center justify-center rounded-lg  text-[#E34D59] transition hover:bg-[#FFE3E3] disabled:opacity-50"
                            title="Reject"
                          >
                            <X size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[#E7EEF1] px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p className="text-xs font-semibold text-[#91A5AE]">
            Showing{" "}
            <span className="font-bold text-[#435A63]">
              {filteredApplicants.length}
            </span>{" "}
            applicant
            {filteredApplicants.length !== 1 ? "s" : ""}
          </p>

          <p className="text-xs font-medium text-[#A1B0B5]">
            Total applicants:{" "}
            <span className="font-bold text-[#435A63]">
              {applicants.length}
            </span>
          </p>
        </div>
      </div>

      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071B23]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-[#D5E5E9] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-linear-to-r from-[#09252E] to-[#173F49] px-6 py-5 md:px-7">
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00A8CC] text-white">
                  <UserCheck size={21} />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">
                    Applicant Details
                  </h3>

                  <p className="mt-0.5 text-xs font-medium text-[#A9C2CA]">
                    {selectedApplicant.fullName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 md:p-7">
              <div className="grid gap-3 sm:grid-cols-2">
                <Detail label="Full Name" value={selectedApplicant.fullName} />

                <Detail label="Email" value={selectedApplicant.email} />

                <Detail label="Phone" value={selectedApplicant.phone} />

                <Detail label="School ID" value={selectedApplicant.schoolId} />

                <Detail label="Gender" value={selectedApplicant.gender} />

                <Detail label="Year" value={selectedApplicant.year} />

                <Detail
                  label="Department"
                  value={selectedApplicant.department}
                />

                <Detail
                  label="Experience"
                  value={selectedApplicant.experienceLevel}
                />

                <Detail label="Batch" value={getBatchName(selectedApplicant)} />

                <Detail
                  label="GitHub"
                  value={selectedApplicant.githubUrl}
                  isLink
                />

                <Detail
                  label="LeetCode"
                  value={selectedApplicant.leetcodeUrl}
                  isLink
                />

                <Detail
                  label="Codeforces"
                  value={selectedApplicant.codeforcesUrl}
                  isLink
                />

                <Detail
                  label="Applied On"
                  value={formatDate(selectedApplicant.createdAt)}
                />

                <div className="sm:col-span-2">
                  <div className="rounded-xl border border-[#E0EAED] bg-[#F7FAFB] p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#91A5AE]">
                      About Candidate
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-[#344D57]">
                      {selectedApplicant.about ||
                        "No extra information provided."}
                    </p>
                  </div>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-[#E0EAED] bg-[#F7FAFB] p-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-[#91A5AE]">
                    Status
                  </span>

                  {getStatusBadge(selectedApplicant.status)}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#E7EEF1] bg-[#F8FAFB] px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-xl border border-[#D2E2E6] bg-white px-5 py-2.5 text-xs font-bold text-[#344B55] transition hover:bg-[#EDF6F8]"
              >
                Close
              </button>

              {selectedApplicant.status !== "rejected" && (
                <button
                  type="button"
                  onClick={() =>
                    updateStatus(selectedApplicant._id, "rejected")
                  }
                  disabled={processingId === selectedApplicant._id}
                  className="rounded-xl bg-[#FFF0F0] px-5 py-2.5 text-xs font-bold text-[#E34D59] transition hover:bg-[#FFE2E2] disabled:opacity-50"
                >
                  Reject
                </button>
              )}

              {selectedApplicant.status !== "passed" && (
                <button
                  type="button"
                  onClick={() => updateStatus(selectedApplicant._id, "passed")}
                  disabled={processingId === selectedApplicant._id}
                  className="rounded-xl bg-[#00A8CC] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#008EAD] disabled:opacity-50"
                >
                  {processingId === selectedApplicant._id
                    ? "Processing..."
                    : "Approve Applicant"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {approvalMessage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#071B23]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#D5E5E9] bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F8F0] text-[#15965D]">
              <CheckCircle2 size={28} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#142832]">
              Applicant Approved
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-[#91A5AE]">
              The applicant has been successfully accepted into the batch.
            </p>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[#E0EAED] bg-[#F7FAFB] p-4 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F7FA] text-[#00A8CC]">
                <Mail size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#91A5AE]">
                  Confirmation Email
                </p>

                <p className="mt-1 truncate text-sm font-bold text-[#142832]">
                  {approvalMessage.email || "Applicant email"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setApprovalMessage(null)}
              className="mt-6 w-full rounded-xl bg-[#00A8CC] py-3 text-xs font-bold text-white transition hover:bg-[#008EAD]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value, isLink = false }) {
  return (
    <div className="rounded-xl border border-[#E0EAED] bg-[#F7FAFB] p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#91A5AE]">
        {label}
      </p>

      {isLink && value ? (
        <a
          href={value.startsWith("http") ? value : `https://${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 block truncate text-sm font-bold text-[#00A0C0] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1.5 truncate text-sm font-bold text-[#263E48]">
          {value || "-"}
        </p>
      )}
    </div>
  );
}

export default ApplicantsPage;
