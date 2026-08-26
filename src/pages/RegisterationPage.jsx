import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import logo from "./../assets/ASTUMSJ-Pp.jpg";
import {
  CheckCircle2,
  Lock,
  User,
  Code2,
  Trophy,
  Users,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

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
  const [loading, setLoading] = useState(false);

  // ============================================================
  // CHECK ACTIVE REGISTRATION
  // ============================================================

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

        toast.error(
          err.response?.data?.message ||
            "Could not check registration status. Please try again.",
        );
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // BACK TO HOME
  // ============================================================

  const handleBackToHome = () => navigate("/");

  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "schoolId",
      "gender",
      "year",
      "department",
      "experienceLevel",
      "githubUrl",
      "leetcodeUrl",
      "codeforcesUrl",
      "about",
    ];

    for (let field of requiredFields) {
      if (!formData[field]?.trim?.() && !formData[field]) {
        toast.error("Please fill in all required fields.");
        return;
      }
    }

    if (!formData.agreedToRules) {
      toast.error("Please agree to the bootcamp rules.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/applicants/register", formData);

      setSuccessMessage(response.data?.message || "Registration successful!");

      toast.success("Application submitted successfully!");

      setShowSuccessModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CLOSE SUCCESS MODAL
  // ============================================================

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  // ============================================================
  // CHECKING REGISTRATION
  // ============================================================

  if (checkingRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#14222B]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#00A8CC] border-t-transparent" />

          <p className="text-sm font-medium text-[#14222B]">
            Checking status...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#06151c] px-2 py-2 font-sans sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-16px)] max-w-[1320px] overflow-hidden rounded-[22px] bg-white shadow-2xl sm:min-h-[calc(100vh-32px)]">
        {/* =========================================================
            LEFT BRANDING PANEL
        ========================================================= */}

        <div
          className="relative hidden w-[35%] flex-col overflow-hidden lg:flex"
          style={{
            background:
              "linear-gradient(160deg, #1C2E3A 0%, #14222B 48%, #0E171E 100%)",
          }}
        >
          {/* =====================================================
              S-CURVE DIVIDER
          ===================================================== */}

          <div className="pointer-events-none absolute right-[-1px] top-0 z-20 h-full w-24">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M100 0 C 30 0 70 50 0 50 C 70 50 30 100 100 100 Z"
                fill="#F8F9FA"
              />
            </svg>
          </div>

          {/* =====================================================
              GLASS SPHERE - BOTTOM LEFT
          ===================================================== */}

          <div
            className="pointer-events-none absolute -bottom-36 -left-32 h-[420px] w-[420px] rounded-full"
            style={{
              background: `
                radial-gradient(
                  circle at 30% 22%,
                  rgba(255,255,255,0.55) 0%,
                  rgba(190,235,242,0.28) 18%,
                  rgba(80,150,165,0.18) 45%,
                  rgba(20,50,60,0.08) 70%,
                  rgba(255,255,255,0.03) 100%
                )
              `,
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: `
                inset 18px 18px 45px rgba(255,255,255,0.22),
                inset -30px -35px 70px rgba(0,30,40,0.35),
                0 25px 80px rgba(0,0,0,0.18)
              `,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {/* Main reflection */}
            <div
              className="absolute left-[18%] top-[12%] h-24 w-36 rounded-full opacity-60 blur-xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.8), transparent 70%)",
                transform: "rotate(-25deg)",
              }}
            />

            {/* Inner glass highlight */}
            <div
              className="absolute inset-[8%] rounded-full border border-white/10"
              style={{
                boxShadow: "inset 10px 10px 25px rgba(255,255,255,0.12)",
              }}
            />
          </div>

          {/* =====================================================
              LEFT CONTENT
          ===================================================== */}

          <div className="relative z-30 flex h-full flex-col p-10 pr-20 xl:p-12">
            {/* =================================================
                LOGO
            ================================================= */}

            <div>
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 shadow-xl">
                <img
                  src={logo}
                  alt="ASTUMSJ Logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* =================================================
                ARABIC EDUCATIONAL SECTION
            ================================================= */}

            <div className="mt-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#00A8CC]">
                ASTU MSJ BOOTCAMP
              </p>

              <h2
                className="mt-4 text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl"
                dir="rtl"
              >
                العلمُ يبني الإنسان
              </h2>

              <p
                className="mt-4 max-w-md text-base font-medium leading-8 text-[#9fc4cf]"
                dir="rtl"
              >
                بالتعلّم نطوّر مهاراتنا، وبالعمل الجماعي نبني مستقبلنا.
              </p>

              <div className="mt-5 h-1 w-14 rounded-full bg-[#00A8CC]" />

              {/* SECOND QUOTE */}

              <div className="mt-7 max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg backdrop-blur-sm">
                <p className="text-lg font-bold leading-8 text-white" dir="rtl">
                  "وَقُلْ رَبِّ زِدْنِي عِلْمًا"
                </p>

                <p className="mt-2 text-[11px] font-medium tracking-wide text-[#9fc4cf]">
                  Learn. Build. Collaborate. Grow.
                </p>
              </div>
            </div>

            {/* =================================================
                FEATURES - MIDDLE LEFT
            ================================================= */}

            <div className="mt-10 space-y-4">
              {/* TEAM PROJECTS */}

              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC]/15 text-[#00A8CC]">
                  <Users size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Team Projects</p>

                  <p className="mt-0.5 text-[11px] text-[#9fc4cf]">
                    Collaborate and build real-world solutions
                  </p>
                </div>
              </div>

              {/* WEEKLY CONTESTS */}

              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC]/15 text-[#00A8CC]">
                  <Trophy size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Weekly Contests
                  </p>

                  <p className="mt-0.5 text-[11px] text-[#9fc4cf]">
                    Challenge yourself and sharpen your skills
                  </p>
                </div>
              </div>

              {/* WORKSHOPS */}

              <div className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#00A8CC]/15 text-[#00A8CC]">
                  <BookOpen size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Workshops</p>

                  <p className="mt-0.5 text-[11px] text-[#9fc4cf]">
                    Learn from mentors and experienced developers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT FORM PANEL
        ========================================================= */}

        <div className="relative flex-1 overflow-hidden bg-[#F8F9FA]">
          {/* =====================================================
              GLASS SPHERE - TOP RIGHT
          ===================================================== */}

          <div
            className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full"
            style={{
              background: `
                radial-gradient(
                  circle at 30% 22%,
                  rgba(255,255,255,0.65) 0%,
                  rgba(210,245,248,0.32) 20%,
                  rgba(100,170,182,0.18) 48%,
                  rgba(20,50,60,0.08) 72%,
                  rgba(255,255,255,0.02) 100%
                )
              `,
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: `
                inset 20px 20px 50px rgba(255,255,255,0.28),
                inset -30px -30px 65px rgba(0,35,45,0.32),
                0 30px 90px rgba(20,60,70,0.16)
              `,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}
          >
            {/* Main reflection */}
            <div
              className="absolute left-[18%] top-[12%] h-20 w-32 rounded-full opacity-70 blur-xl"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255,255,255,0.9), transparent 70%)",
                transform: "rotate(-25deg)",
              }}
            />

            {/* Small reflection */}
            <div className="absolute right-[25%] top-[35%] h-3 w-3 rounded-full bg-white/50 blur-[1px]" />

            {/* Inner glass border */}
            <div
              className="absolute inset-[8%] rounded-full border border-white/15"
              style={{
                boxShadow: "inset 8px 8px 25px rgba(255,255,255,0.14)",
              }}
            />
          </div>

          {/* =====================================================
              FORM CONTENT
          ===================================================== */}

          <div className="relative z-10 h-full overflow-y-auto px-6 py-10 md:px-14 lg:px-16 xl:px-20">
            {/* HEADER */}

            <div className="mb-10">
              <button
                onClick={handleBackToHome}
                className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#00a6c0] hover:underline"
              >
                ← Back to Home
              </button>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-[#14222B]">
                Create Your Account
              </h1>

              {activeBatch && (
                <div className="mt-4 inline-block rounded-full bg-[#E3F5F9] px-4 py-1.5 text-xs font-bold text-[#0f768e]">
                  {activeBatch.name}
                </div>
              )}
            </div>

            {/* =================================================
                REGISTRATION CLOSED
            ================================================= */}

            {!isRegistrationOpen ? (
              <div className="rounded-3xl border border-[#B4D7E2] bg-white p-10 text-center shadow-sm">
                <Lock className="mx-auto mb-4 h-12 w-12 text-[#0f768e]" />

                <h2 className="text-xl font-bold text-[#14222B]">
                  Registration Closed
                </h2>

                <p className="mt-2 text-sm text-[#8FA3B0]">
                  Check back later for future cohorts.
                </p>

                <button
                  onClick={handleBackToHome}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00A8CC] px-6 py-3 font-bold text-white transition hover:bg-[#0088A6]"
                >
                  Return to Home
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* =================================================
                 REGISTRATION FORM
              ================================================= */

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-full bg-[#E3F5F9] p-2 text-[#0f768e]">
                      <User size={20} />
                    </div>

                    <h2 className="text-lg font-bold text-[#14222B]">
                      Personal Information
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {[
                      "fullName",
                      "email",
                      "phone",
                      "schoolId",
                      "department",
                    ].map((field) => (
                      <div key={field}>
                        <label className="mb-2 block text-xs font-bold uppercase text-[#22353c]">
                          {field.replace(/([A-Z])/g, " $1")}{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <input
                          type={field === "email" ? "email" : "text"}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          placeholder={`Enter your ${field}`}
                          className="w-full rounded-xl border border-[#B4D7E2] bg-white p-4 text-sm outline-none transition-all focus:border-[#00A8CC] focus:ring-2 focus:ring-[#00A8CC]/20"
                        />
                      </div>
                    ))}

                    {/* ACADEMIC YEAR */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase text-[#22353c]">
                        Academic Year *
                      </label>

                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#B4D7E2] bg-white p-4 text-sm outline-none focus:border-[#00A8CC]"
                      >
                        <option value="">Select Year</option>

                        <option value="1st Year">1st Year</option>

                        <option value="2nd Year">2nd Year</option>

                        <option value="3rd Year">3rd Year</option>
                      </select>
                    </div>

                    {/* GENDER */}

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase text-[#22353c]">
                        Gender *
                      </label>

                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#B4D7E2] bg-white p-4 text-sm outline-none focus:border-[#00A8CC]"
                      >
                        <option value="">Select Gender</option>

                        <option value="Male">Male</option>

                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    CODING PROFILES
                ================================================= */}

                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-full bg-[#E3F5F9] p-2 text-[#0f768e]">
                      <Code2 size={20} />
                    </div>

                    <h2 className="text-lg font-bold text-[#14222B]">
                      Coding Profiles
                    </h2>
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    {["githubUrl", "leetcodeUrl", "codeforcesUrl"].map(
                      (field) => (
                        <div key={field}>
                          <label className="mb-2 block text-xs font-bold uppercase text-[#22353c]">
                            {field.replace("Url", "")} URL *
                          </label>

                          <input
                            type="url"
                            name={field}
                            value={formData[field]}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white p-3.5 text-xs outline-none transition focus:border-[#00A8CC]"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </section>

                {/* =================================================
                    ABOUT
                ================================================= */}

                <section className="space-y-6">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase text-[#22353c]">
                      Tell us about yourself *
                    </label>

                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows={4}
                      className="w-full resize-none rounded-xl border border-[#B4D7E2] bg-white p-4 text-sm outline-none focus:border-[#00A8CC]"
                    />
                  </div>

                  {/* AGREEMENT */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#B4D7E2] bg-white p-4 transition hover:border-[#00A8CC]">
                    <input
                      type="checkbox"
                      name="agreedToRules"
                      checked={formData.agreedToRules}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[#00A8CC]"
                    />

                    <span className="text-xs leading-5 text-[#51646c]">
                      I agree to attend sessions regularly and participate
                      actively in all bootcamp activities. *
                    </span>
                  </label>
                </section>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A8CC] py-4 font-bold text-white shadow-lg shadow-[#00A8CC]/20 transition-all hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          SUCCESS MODAL
      ========================================================= */}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-in rounded-3xl bg-white p-8 text-center shadow-2xl zoom-in-95 duration-300">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-[#00A8CC]" />

            <h2 className="text-2xl font-bold text-[#14222B]">
              Registration Successful!
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-[#8FA3B0]">
              {successMessage}
            </p>

            <button
              onClick={handleCloseModal}
              className="mt-8 w-full rounded-xl bg-[#00A8CC] py-3 font-bold text-white transition hover:bg-[#0088A6]"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterationPage;
