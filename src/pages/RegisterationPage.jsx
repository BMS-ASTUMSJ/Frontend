import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { CheckCircle2, AlertCircle, Lock } from "lucide-react";

function RegisterationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    schoolId: "",
    gender: "",
    year: "",
    department: "",
    experienceLevel: "Beginner",
    githubUrl: "",
    leetcodeUrl: "",
    codeforcesUrl: "",
    about: "",
    agreedToRules: false,
    batchId: "",
  });

  const [activeBatch, setActiveBatch] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        setCheckingRegistration(true);

        const response = await api.get("/batches/active-registration");

        if (response.data?.isRegistrationOpen && response.data?.activeBatch) {
          setIsRegistrationOpen(true);
          setActiveBatch(response.data.activeBatch);

          setFormData((prev) => ({
            ...prev,
            batchId: response.data.activeBatch._id,
          }));
        } else {
          setIsRegistrationOpen(false);
          setActiveBatch(null);
        }
      } catch (err) {
        console.error("Failed to fetch registration status:", err);

        setIsRegistrationOpen(true);
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (!formData.schoolId.trim()) {
      setError("Please enter your School / Student ID Number.");
      return;
    }

    if (!formData.gender) {
      setError("Please select your gender.");
      return;
    }

    if (!formData.year) {
      setError("Please select your academic year.");
      return;
    }

    if (!formData.department.trim()) {
      setError("Please enter your department.");
      return;
    }

    if (!formData.githubUrl.trim()) {
      setError("Please enter your GitHub profile URL.");
      return;
    }

    if (!formData.leetcodeUrl.trim()) {
      setError("Please enter your LeetCode profile URL.");
      return;
    }

    if (!formData.codeforcesUrl.trim()) {
      setError("Please enter your Codeforces profile URL.");
      return;
    }

    if (!formData.about.trim()) {
      setError("Please tell us something about yourself.");
      return;
    }

    if (!formData.agreedToRules) {
      setError("Please agree to the bootcamp rules.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/applicants/register", formData);

      setSuccessMessage(
        response.data?.message ||
          "Registration successful. Your application has been submitted.",
      );

      setShowSuccessModal(true);

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        schoolId: "",
        gender: "",
        year: "",
        department: "",
        experienceLevel: "Beginner",
        githubUrl: "",
        leetcodeUrl: "",
        codeforcesUrl: "",
        about: "",
        agreedToRules: false,
        batchId: activeBatch?._id || "",
      });
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  if (checkingRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#B3CFE5]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#1A3D63] border-t-transparent"></div>

          <p className="text-sm font-medium text-[#0A1931]">
            Checking registration status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#B3CFE5] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-[#B3CFE5] sm:p-10">
        {/* ==========================================
            Header
        ========================================== */}
        <div className="mb-8">
          <Link
            to="/"
            className="mb-6 inline-flex text-sm font-medium text-[#7A7F85] hover:text-[#1A3D63]"
          >
            ← Back to Home
          </Link>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4A7FA7]">
              ASTU MSJ Bootcamp
            </p>

            {activeBatch && (
              <span className="rounded-full bg-[#1A3D63]/10 px-3 py-1 text-xs font-bold text-[#1A3D63]">
                {activeBatch.name}
              </span>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-bold text-[#0A1931]">
            Apply for the Bootcamp
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#7A7F85]">
            Fill in your information below to submit your application.
          </p>
        </div>

        {/* ==========================================
            Registration Closed
        ========================================== */}
        {!isRegistrationOpen ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Lock className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-bold text-[#0A1931]">
              Registration is Currently Closed
            </h2>

            <p className="mt-2 text-sm text-[#7A7F85]">
              Applications for the upcoming bootcamp cohort are not currently
              being accepted. Please check back later or contact the admin.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-[#1A3D63] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7]"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          <>
            {/* ==========================================
                Error Message
            ========================================== */}
            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />

                <span>{error}</span>
              </div>
            )}

            {/* ==========================================
                Registration Form
            ========================================== */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Full Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="09xxxxxxxx"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>
              </div>

              {/* School ID & Gender */}
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    School / Student ID <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="schoolId"
                    value={formData.schoolId}
                    onChange={handleChange}
                    placeholder="e.g., UGR/1234/14"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Gender <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Year <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  >
                    <option value="">Select year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="5th Year">5th Year</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                    Department <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g., Software Engineering"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-[#B3CFE5] bg-[#F6FAFD]/50 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A3D63]">
                  Coding & Competitive Profiles
                </h3>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#0A1931]">
                    GitHub Profile URL <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/your-username"
                    className="w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#0A1931]">
                      LeetCode Profile URL{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="url"
                      name="leetcodeUrl"
                      value={formData.leetcodeUrl}
                      onChange={handleChange}
                      placeholder="https://leetcode.com/your-username"
                      className="w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[#0A1931]">
                      Codeforces Profile URL{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="url"
                      name="codeforcesUrl"
                      value={formData.codeforcesUrl}
                      onChange={handleChange}
                      placeholder="https://codeforces.com/profile/your-username"
                      className="w-full rounded-xl border border-[#B3CFE5] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  Experience Level <span className="text-red-500">*</span>
                </label>

                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                  About You <span className="text-red-500">*</span>
                </label>

                <textarea
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about yourself, your coding goals, and why you want to join..."
                  className="w-full resize-none rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
                />
              </div>

              {/* Agreement */}
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">
                <input
                  type="checkbox"
                  name="agreedToRules"
                  checked={formData.agreedToRules}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 accent-[#1A3D63]"
                />

                <span className="text-sm leading-6 text-[#7A7F85]">
                  I agree to follow the bootcamp rules, attend sessions
                  regularly, and participate actively in contests, projects, and
                  teamwork.
                  <span className="ml-1 text-red-500">*</span>
                </span>
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#1A3D63] py-3.5 text-sm font-semibold text-white transition hover:bg-[#4A7FA7] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Submitting Application..." : "Submit Application"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-[#7A7F85]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#1A3D63] hover:text-[#4A7FA7]"
              >
                Login
              </Link>
            </p>
          </>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <CheckCircle2 className="h-9 w-9 text-green-600" />
              </div>

              <h2 className="text-xl font-bold text-[#0A1931]">
                Registration Successful!
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#7A7F85]">
                {successMessage}
              </p>

              <button
                onClick={handleCloseModal}
                className="mt-7 w-full rounded-xl bg-[#1A3D63] py-3 text-sm font-semibold text-white transition hover:bg-[#4A7FA7]"
              >
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterationPage;
