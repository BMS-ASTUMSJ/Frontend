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
  XCircle,
  Mail,
  Layers,
} from "lucide-react";

import api from "../../utils/api";

function ApplicantsPage() {
  const [applicants, setApplicants] = useState([]);
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // Filters
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [approvalMessage, setApprovalMessage] = useState(null);

  // ============================================================
  // FETCH BATCHES
  // ============================================================

  const fetchBatches = async () => {
    try {
      setLoadingBatches(true);

      const response = await api.get("/batches");

      setBatches(response.data?.batches || []);
    } catch (err) {
      console.error("FAILED TO FETCH BATCHES:", err);

      toast.error(err.response?.data?.message || "Failed to load batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  // ============================================================
  // FETCH APPLICANTS
  // ============================================================

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
      console.error("FAILED TO FETCH APPLICANTS:", err);

      const message =
        err.response?.data?.message || "Failed to load applicants.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    fetchBatches();
    fetchApplicants();
  }, []);

  // ============================================================
  // FRONTEND FILTERING
  // ============================================================

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const applicantGender =
        applicant.gender?.toString().trim().toLowerCase() || "";

      const selectedGender = gender?.toString().trim().toLowerCase() || "";

      const matchesGender =
        !selectedGender || applicantGender === selectedGender;

      const applicantStatus =
        applicant.status?.toString().trim().toLowerCase() || "";

      const selectedStatus = status?.toString().trim().toLowerCase() || "";

      const matchesStatus =
        !selectedStatus || applicantStatus === selectedStatus;

      return matchesGender && matchesStatus;
    });
  }, [applicants, gender, status]);

  // ============================================================
  // UPDATE STATUS
  // ============================================================

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

        setApprovalMessage({
          email,
        });

        toast.success("Applicant approved successfully.");
      } else {
        toast.success("Applicant rejected successfully.");
      }

      setSelectedApplicant(null);
    } catch (err) {
      console.error("FAILED TO UPDATE APPLICANT:", err);

      const message =
        err.response?.data?.message || "Failed to update applicant status.";

      setError(message);
      toast.error(message);
    } finally {
      setProcessingId(null);
    }
  };

  // ============================================================
  // STATUS BADGE
  // ============================================================

  const getStatusBadge = (value) => {
    switch (value) {
      case "passed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">
            <CheckCircle2 size={13} />
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
            <XCircle size={13} />
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-bold text-yellow-700">
            <AlertCircle size={13} />
            Pending
          </span>
        );
    }
  };

  // ============================================================
  // GET BATCH NAME
  // ============================================================

  const getBatchName = (applicant, batchList = batches) => {
    if (!applicant?.batch) {
      return "No batch";
    }

    if (typeof applicant.batch === "object") {
      return applicant.batch.name || "Unknown batch";
    }

    const batch = batchList.find((item) => item._id === applicant.batch);

    return batch?.name || "Unknown batch";
  };

  // ============================================================
  // GET BATCH STATUS
  // ============================================================

  const getBatchStatus = (applicant) => {
    if (!applicant?.batch || typeof applicant.batch !== "object") {
      return null;
    }

    return applicant.batch.status;
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  // ============================================================
  // RESET FILTERS
  // ============================================================

  const resetFilters = () => {
    setGender("");
    setStatus("");
  };

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
          },
        }}
      />

      <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="rounded-3xl bg-[#0A1931] p-6 text-white shadow-sm md:p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1A3D63] p-3">
                  <Users size={26} />
                </div>

                <div>
                  <h1 className="text-2xl font-black md:text-3xl">
                    Applicants
                  </h1>

                  <p className="mt-1 text-sm text-[#B3CFE5]">
                    Review applicants and their assigned bootcamp batches.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchApplicants(false)}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} />

              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto rounded-lg p-1 hover:bg-red-100"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div className="flex flex-col gap-3 md:flex-row">
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm font-medium text-[#0A1931] outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40 md:w-1/2"
            >
              <option value="">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-3 text-sm font-medium text-[#0A1931] outline-none transition focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]/40 md:w-1/2"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="passed">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {/* TOTAL */}

            <div className="rounded-2xl border border-[#B3CFE5]/70 bg-white px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-black text-[#0A1931]">
                    {filteredApplicants.length}
                  </p>
                </div>

                <div className="rounded-xl bg-[#EAF3F9] p-2.5 text-[#1A3D63]">
                  <Users size={18} />
                </div>
              </div>
            </div>

            {/* PENDING */}

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-yellow-600">
                    Pending
                  </p>

                  <p className="mt-1 text-2xl font-black text-yellow-800">
                    {
                      filteredApplicants.filter(
                        (applicant) => applicant.status === "pending",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-yellow-100 p-2.5 text-yellow-600">
                  <AlertCircle size={18} />
                </div>
              </div>
            </div>

            {/* APPROVED */}

            <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">
                    Approved
                  </p>

                  <p className="mt-1 text-2xl font-black text-green-800">
                    {
                      filteredApplicants.filter(
                        (applicant) => applicant.status === "passed",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-green-100 p-2.5 text-green-600">
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>

            {/* REJECTED */}

            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">
                    Rejected
                  </p>

                  <p className="mt-1 text-2xl font-black text-red-800">
                    {
                      filteredApplicants.filter(
                        (applicant) => applicant.status === "rejected",
                      ).length
                    }
                  </p>
                </div>

                <div className="rounded-xl bg-red-100 p-2.5 text-red-600">
                  <XCircle size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              APPLICANT TABLE
          ================================================== */}

          {/* ==================================================
    APPLICANT TABLE
================================================== */}

          <div className="space-y-3">
            {/* TABLE HEADER */}

            <div className="flex flex-col justify-between gap-2 px-1 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-bold text-[#0A1931]">Applicant List</h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Showing {filteredApplicants.length} applicant
                  {filteredApplicants.length !== 1 ? "s" : ""}
                </p>
              </div>

              {(gender || status) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-bold text-[#1A3D63] hover:underline"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* LOADING */}

            {loading ? (
              <div className="py-16 text-center">
                <Loader2
                  size={30}
                  className="mx-auto animate-spin text-[#1A3D63]"
                />
              </div>
            ) : filteredApplicants.length === 0 ? (
              /* EMPTY STATE */

              <div className="py-16 text-center">
                <Users size={42} className="mx-auto text-gray-300" />

                <h3 className="mt-4 font-semibold text-gray-700">
                  No applicants found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filters.
                </p>
              </div>
            ) : (
              /* TABLE */

              <div className="overflow-x-auto rounded-2xl border border-[#B3CFE5] bg-white">
                <table className="w-full min-w-275">
                  <thead>
                    <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD] text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">
                      <th className="px-5 py-3.5">Applicant</th>

                      <th className="px-5 py-3.5">School ID</th>

                      <th className="px-5 py-3.5">Gender</th>

                      <th className="px-5 py-3.5">Department</th>

                      <th className="px-5 py-3.5">Batch</th>

                      <th className="px-5 py-3.5">Experience</th>

                      <th className="px-5 py-3.5">Status</th>

                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplicants.map((applicant) => (
                      <tr
                        key={applicant._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-[#F6FAFD]"
                      >
                        {/* APPLICANT */}

                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-bold text-[#0A1931]">
                              {applicant.fullName}
                            </p>

                            <p className="mt-0.5 text-[11px] text-gray-500">
                              {applicant.email}
                            </p>
                          </div>
                        </td>

                        {/* SCHOOL ID */}

                        <td className="px-5 py-3.5 text-sm text-gray-700">
                          {applicant.schoolId || "-"}
                        </td>

                        {/* GENDER */}

                        <td className="px-5 py-3.5 text-sm capitalize text-gray-700">
                          {applicant.gender || "-"}
                        </td>

                        {/* DEPARTMENT */}

                        <td className="px-5 py-3.5 text-sm text-gray-700">
                          {applicant.department || "-"}
                        </td>

                        {/* BATCH */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#EAF3F9] p-1.5 text-[#1A3D63]">
                              <Layers size={14} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-[#0A1931]">
                                {getBatchName(applicant)}
                              </p>

                              {getBatchStatus(applicant) && (
                                <p className="text-[10px] capitalize text-gray-500">
                                  {getBatchStatus(applicant)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* EXPERIENCE */}

                        <td className="px-5 py-3.5 text-sm capitalize text-gray-700">
                          {applicant.experienceLevel || "-"}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-3.5">
                          {getStatusBadge(applicant.status)}
                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-3.5">
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedApplicant(applicant)}
                              className="rounded-lg border border-[#B3CFE5] p-2 text-[#1A3D63] transition hover:bg-[#EAF3F9]"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>

                            {applicant.status !== "passed" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(applicant._id, "passed")
                                }
                                disabled={processingId === applicant._id}
                                className="rounded-lg bg-green-600 p-2 text-white transition hover:bg-green-700 disabled:opacity-50"
                                title="Approve"
                              >
                                {processingId === applicant._id ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Check size={16} />
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
                                className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700 disabled:opacity-50"
                                title="Reject"
                              >
                                <X size={16} />
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
          </div>
        </div>
      </div>

      {/* ======================================================
          APPLICANT DETAILS MODAL
      ====================================================== */}

      {selectedApplicant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#B3CFE5] p-6">
              <div>
                <h2 className="text-xl font-bold text-[#0A1931]">
                  Applicant Details
                </h2>

                <p className="text-sm text-gray-500">
                  {selectedApplicant.fullName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-xl p-2 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Detail label="Full Name" value={selectedApplicant.fullName} />

              <Detail label="Email" value={selectedApplicant.email} />

              <Detail label="Phone" value={selectedApplicant.phone} />

              <Detail label="School ID" value={selectedApplicant.schoolId} />

              <Detail label="Gender" value={selectedApplicant.gender} />

              <Detail label="Year" value={selectedApplicant.year} />

              <Detail label="Department" value={selectedApplicant.department} />

              <Detail
                label="Experience"
                value={selectedApplicant.experienceLevel}
              />

              <Detail label="Batch" value={getBatchName(selectedApplicant)} />

              <Detail label="GitHub" value={selectedApplicant.githubUrl} />

              <Detail label="LeetCode" value={selectedApplicant.leetcodeUrl} />

              <Detail
                label="Codeforces"
                value={selectedApplicant.codeforcesUrl}
              />

              <Detail
                label="Applied"
                value={formatDate(selectedApplicant.createdAt)}
              />

              <div className="md:col-span-2">
                <Detail label="About" value={selectedApplicant.about} />
              </div>

              <div className="md:col-span-2">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </p>

                {getStatusBadge(selectedApplicant.status)}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#B3CFE5] p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="rounded-xl border border-[#B3CFE5] px-5 py-3 font-semibold text-[#0A1931]"
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
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  <X size={18} />
                  Reject
                </button>
              )}

              {selectedApplicant.status !== "passed" && (
                <button
                  type="button"
                  onClick={() => updateStatus(selectedApplicant._id, "passed")}
                  disabled={processingId === selectedApplicant._id}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Check size={18} />
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          APPROVAL MESSAGE
      ====================================================== */}

      {approvalMessage && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={32} />
            </div>

            <h2 className="text-center text-xl font-bold text-[#0A1931]">
              Applicant Approved Successfully
            </h2>

            <div className="mt-6 rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD] p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#1A3D63]">
                  <Mail size={22} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#0A1931]">
                    Email will be sent to
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-600">
                    {approvalMessage.email}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setApprovalMessage(null)}
              className="mt-6 w-full rounded-2xl bg-[#0A1931] py-3 text-sm font-bold text-white transition hover:bg-[#1A3D63]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// DETAIL COMPONENT
// ============================================================

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 wrap-break-word text-sm text-[#0A1931]">
        {value || "-"}
      </p>
    </div>
  );
}

export default ApplicantsPage;
