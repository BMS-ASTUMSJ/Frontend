import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
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

  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [status, setStatus] = useState("");
  const [batchId, setBatchId] = useState("");

  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const [approvalMessage, setApprovalMessage] = useState(null);

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

  const fetchApplicants = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const params = new URLSearchParams();

      if (gender) {
        params.append("gender", gender);
      }

      if (status) {
        params.append("status", status);
      }

      if (batchId) {
        params.append("batchId", batchId);
      }

      const query = params.toString() ? `?${params.toString()}` : "";

      const response = await api.get(`/applicants${query}`);

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

  useEffect(() => {
    fetchBatches();
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [gender, status, batchId]);

  const filteredApplicants = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return applicants;
    }

    return applicants.filter((applicant) => {
      return (
        applicant.fullName?.toLowerCase().includes(value) ||
        applicant.email?.toLowerCase().includes(value) ||
        applicant.schoolId?.toLowerCase().includes(value) ||
        applicant.department?.toLowerCase().includes(value) ||
        getBatchName(applicant, batches)?.toLowerCase().includes(value)
      );
    });
  }, [applicants, search, batches]);

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

  const getStatusBadge = (value) => {
    switch (value) {
      case "passed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <CheckCircle2 size={14} />
            Approved
          </span>
        );

      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <XCircle size={14} />
            Rejected
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            <AlertCircle size={14} />
            Pending
          </span>
        );
    }
  };

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

  const getBatchStatus = (applicant) => {
    if (!applicant?.batch || typeof applicant.batch !== "object") {
      return null;
    }

    return applicant.batch.status;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString();
  };

  const clearFilters = () => {
    setSearch("");
    setGender("");
    setStatus("");
    setBatchId("");
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

      <div className="min-h-screen bg-[#F6FAFD] p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-3xl bg-[#0A1931] p-6 text-white shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-[#1A3D63] p-3">
                  <Users size={28} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold md:text-3xl">Applicants</h1>

                  <p className="mt-1 text-sm text-[#B3CFE5]">
                    Review applicants and their assigned bootcamp batches.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchApplicants(false)}
                disabled={refreshing}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={20} />

              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto"
              >
                <X size={18} />
              </button>
            </div>
          )}

          <div className="rounded-3xl border border-[#B3CFE5] bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-5">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search applicants..."
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none"
              >
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none"
              >
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="passed">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                disabled={loadingBatches}
                className="rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none disabled:bg-gray-100"
              >
                <option value="">
                  {loadingBatches ? "Loading batches..." : "All batches"}
                </option>

                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-[#B3CFE5] px-4 py-3 text-sm font-semibold text-[#1A3D63] transition hover:bg-[#F6FAFD]"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-[#B3CFE5] bg-white p-5">
              <p className="text-sm text-gray-500">Total</p>

              <p className="mt-1 text-3xl font-bold text-[#0A1931]">
                {applicants.length}
              </p>
            </div>

            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
              <p className="text-sm text-yellow-700">Pending</p>

              <p className="mt-1 text-3xl font-bold text-yellow-800">
                {applicants.filter((a) => a.status === "pending").length}
              </p>
            </div>

            <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
              <p className="text-sm text-green-700">Approved</p>

              <p className="mt-1 text-3xl font-bold text-green-800">
                {applicants.filter((a) => a.status === "passed").length}
              </p>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm text-red-700">Rejected</p>

              <p className="mt-1 text-3xl font-bold text-red-800">
                {applicants.filter((a) => a.status === "rejected").length}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#B3CFE5] bg-white shadow-sm">
            <div className="border-b border-[#B3CFE5] p-5">
              <h2 className="font-bold text-[#0A1931]">Applicant List</h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredApplicants.length} applicant
                {filteredApplicants.length !== 1 ? "s" : ""}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={30} className="animate-spin text-[#1A3D63]" />
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Users size={42} className="mx-auto text-gray-300" />

                <h3 className="mt-4 font-semibold text-gray-700">
                  No applicants found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your filters or search.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-[#B3CFE5] bg-[#F6FAFD] text-left text-xs uppercase tracking-wide text-gray-500">
                      <th className="px-5 py-4">Applicant</th>

                      <th className="px-5 py-4">School ID</th>

                      <th className="px-5 py-4">Gender</th>

                      <th className="px-5 py-4">Department</th>

                      <th className="px-5 py-4">Batch</th>

                      <th className="px-5 py-4">Experience</th>

                      <th className="px-5 py-4">Status</th>

                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredApplicants.map((applicant) => (
                      <tr
                        key={applicant._id}
                        className="border-b border-gray-100 last:border-0 hover:bg-[#F6FAFD]"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-[#0A1931]">
                              {applicant.fullName}
                            </p>

                            <p className="text-xs text-gray-500">
                              {applicant.email}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {applicant.schoolId || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm capitalize">
                          {applicant.gender || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {applicant.department || "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="rounded-lg bg-[#EAF3F9] p-2 text-[#1A3D63]">
                              <Layers size={15} />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-[#0A1931]">
                                {getBatchName(applicant)}
                              </p>

                              {getBatchStatus(applicant) && (
                                <p className="text-xs capitalize text-gray-500">
                                  {getBatchStatus(applicant)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm capitalize">
                          {applicant.experienceLevel || "-"}
                        </td>

                        <td className="px-5 py-4">
                          {getStatusBadge(applicant.status)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedApplicant(applicant)}
                              className="rounded-lg border border-[#B3CFE5] p-2 text-[#1A3D63] hover:bg-[#F6FAFD]"
                              title="View"
                            >
                              <Eye size={17} />
                            </button>

                            {applicant.status !== "passed" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateStatus(applicant._id, "passed")
                                }
                                disabled={processingId === applicant._id}
                                className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50"
                                title="Approve"
                              >
                                {processingId === applicant._id ? (
                                  <Loader2 size={17} className="animate-spin" />
                                ) : (
                                  <Check size={17} />
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
                                className="rounded-lg bg-red-600 p-2 text-white hover:bg-red-700 disabled:opacity-50"
                                title="Reject"
                              >
                                <X size={17} />
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

      {approvalMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
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

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-[#0A1931]">{value || "-"}</p>
    </div>
  );
}

export default ApplicantsPage;
