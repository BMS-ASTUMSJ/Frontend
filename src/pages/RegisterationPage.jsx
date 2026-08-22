import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Code2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../utils/api";

function RegisterationPage() {
  const navigate = useNavigate();

  // =========================================================
  // FORM DATA
  // =========================================================
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);

  // =========================================================
  // STATES
  // =========================================================
  const [activeBatch, setActiveBatch] = useState(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Step:
  // 1 = Personal Information
  // 2 = Coding Profiles
  // 3 = Submit
  const [step, setStep] = useState(1);

  // =========================================================
  // CHECK ACTIVE BATCH / REGISTRATION STATUS
  // =========================================================
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        setCheckingRegistration(true);

        const response = await api.get("/batches/active-registration");

        if (
          response.data?.isRegistrationOpen &&
          response.data?.activeBatch
        ) {
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
      } catch (error) {
        console.error(
          "Failed to fetch registration status:",
          error
        );

        // Keep the page usable if the status endpoint fails.
        setIsRegistrationOpen(true);

        toast.error(
          error.response?.data?.message ||
            "Could not check registration status."
        );
      } finally {
        setCheckingRegistration(false);
      }
    };

    checkRegistrationStatus();
  }, []);

  // =========================================================
  // HANDLE INPUT CHANGE
  // =========================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // STEP 1 VALIDATION
  // =========================================================
  const validateStepOne = () => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address.");
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number.");
      return false;
    }

    if (!formData.schoolId.trim()) {
      toast.error("Please enter your School / Student ID.");
      return false;
    }

    if (!formData.gender) {
      toast.error("Please select your gender.");
      return false;
    }

    if (!formData.year) {
      toast.error("Please select your academic year.");
      return false;
    }

    if (!formData.department.trim()) {
      toast.error("Please enter your department.");
      return false;
    }

    return true;
  };

  // =========================================================
  // STEP 2 VALIDATION
  // =========================================================
  const validateStepTwo = () => {
    if (!formData.githubUrl.trim()) {
      toast.error("Please enter your GitHub profile URL.");
      return false;
    }

    if (!formData.leetcodeUrl.trim()) {
      toast.error("Please enter your LeetCode profile URL.");
      return false;
    }

    if (!formData.codeforcesUrl.trim()) {
      toast.error("Please enter your Codeforces profile URL.");
      return false;
    }

    if (!formData.about.trim()) {
      toast.error("Please tell us something about yourself.");
      return false;
    }

    return true;
  };

  // =========================================================
  // NEXT STEP
  // =========================================================
  const handleNext = () => {
    if (step === 1) {
      if (!validateStepOne()) return;

      setStep(2);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 2) {
      if (!validateStepTwo()) return;

      setStep(3);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // PREVIOUS STEP
  // =========================================================
  const handlePrevious = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =========================================================
  // SUBMIT APPLICATION
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStepOne()) {
      setStep(1);
      return;
    }

    if (!validateStepTwo()) {
      setStep(2);
      return;
    }

    if (!formData.agreedToRules) {
      toast.error("Please agree to the bootcamp rules.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/applicants/register",
        formData
      );

      const message =
        response.data?.message ||
        "Registration successful. Your application has been submitted.";

      setSuccessMessage(message);

      toast.success("Application submitted successfully!");

      setShowSuccessModal(true);

      setFormData({
        ...initialFormData,
        batchId: activeBatch?._id || "",
      });

      setStep(1);
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLOSE SUCCESS MODAL
  // =========================================================
  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/");
  };

  // =========================================================
  // LOADING SCREEN
  // =========================================================
  if (checkingRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#061426]">
        <div className="text-center">
          <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-[#183B5C] border-t-[#F6A15B]" />

          <p className="text-sm font-medium text-[#9FC2DD]">
            Checking registration status...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN PAGE
  // =========================================================
  return (
    <div className="min-h-screen bg-[#061426] px-4 py-8 text-white sm:px-6 lg:px-10">
      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(83,137,177,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(83,137,177,0.15) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1380px]">
        {/* =====================================================
            BACK TO HOME
        ====================================================== */}
        <Link
          to="/"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#8FB3CE] transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* =====================================================
            MAIN CARD
        ====================================================== */}
        <div className="overflow-hidden rounded-[30px] border border-[#214666] bg-[#0A1D34] shadow-2xl">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            {/* =================================================
                LEFT SIDE
            ================================================= */}
            <div className="relative hidden overflow-hidden bg-[#081A31] p-10 lg:block xl:p-14">
              {/* Decorative circles */}
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-[#31506B]" />
              <div className="absolute -right-12 -top-12 h-56 w-56 rounded-full border border-[#233F5B]" />

              <div className="relative z-10 flex h-full flex-col">
                {/* Logo */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#31506B] bg-[#102E4D] shadow-lg">
                    <span className="text-lg font-black text-white">
                      MSJ
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-black tracking-[0.35em] text-[#F6A15B]">
                      ASTU MSJ
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#83B4D5]">
                      Bootcamp
                    </p>
                  </div>
                </div>

                {/* Welcome */}
                <div className="mt-20">
                  <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-[#654C3A] bg-[#14263B] px-5 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#F6A15B]" />

                    <span className="text-sm font-bold text-[#F6A15B]">
                      Join the journey
                    </span>
                  </div>

                  <h2 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">
                    Build your
                    <br />
                    <span className="text-[#F6A15B]">
                      future.
                    </span>
                  </h2>

                  <p className="mt-8 max-w-xl text-lg leading-8 text-[#82B0CE]">
                    Apply to the ASTU MSJ Bootcamp and take
                    your coding skills to the next level through
                    projects, mentorship, contests, and
                    collaborative learning.
                  </p>
                </div>

                {/* Features */}
                <div className="mt-12 space-y-4">
                  <div className="rounded-2xl border border-[#1E3B58] bg-[#0D2540] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#183653]">
                        <ShieldCheck className="h-5 w-5 text-[#F6A15B]" />
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          Secure application
                        </p>

                        <p className="mt-1 text-sm text-[#6F9BB8]">
                          Your information is safely submitted.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#1E3B58] bg-[#0D2540] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#183653]">
                        <Code2 className="h-5 w-5 text-[#F6A15B]" />
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          Learn by doing
                        </p>

                        <p className="mt-1 text-sm text-[#6F9BB8]">
                          Build projects and improve your coding skills.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#1E3B58] bg-[#0D2540] p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#183653]">
                        <User className="h-5 w-5 text-[#F6A15B]" />
                      </div>

                      <div>
                        <p className="font-bold text-white">
                          Connect & grow
                        </p>

                        <p className="mt-1 text-sm text-[#6F9BB8]">
                          Connect with mentors and other students.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom text */}
                <div className="mt-auto pt-12">
                  <p className="text-xs font-semibold tracking-wider text-[#507B98]">
                    ASTU MSJ BOOTCAMP
                  </p>

                  <p className="mt-2 text-sm text-[#507B98]">
                    Learn. Build. Compete. Grow.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}
            <div className="bg-[#123451] p-6 sm:p-8 lg:p-10 xl:p-12">
              {/* Mobile logo */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#173E61]">
                  <span className="font-black text-white">
                    MSJ
                  </span>
                </div>

                <div>
                  <p className="text-xs font-black tracking-[0.3em] text-[#F6A15B]">
                    ASTU MSJ
                  </p>

                  <p className="text-sm font-semibold text-[#86B4D0]">
                    Bootcamp
                  </p>
                </div>
              </div>

              {/* Top header */}
              <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-1 w-10 rounded-full bg-[#F6A15B]" />

                    <span className="text-xs font-black tracking-[0.25em] text-[#8AB9D6]">
                      APPLICATION
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Apply for the Bootcamp
                  </h1>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#83A9C2]">
                    Complete the application below to join
                    the next ASTU MSJ Bootcamp cohort.
                  </p>
                </div>

                {activeBatch && (
                  <div className="hidden shrink-0 items-center gap-2 rounded-full border border-[#315674] bg-[#183E5F] px-4 py-2 sm:flex">
                    <span className="h-2 w-2 rounded-full bg-[#13C48B]" />

                    <span className="text-xs font-bold text-[#D6E7F3]">
                      {activeBatch.name}
                    </span>
                  </div>
                )}
              </div>

              {/* =================================================
                  STEPPER
              ================================================== */}
              <div className="mb-10 flex items-center">
                {/* Step 1 */}
                <div className="flex items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                      step >= 1
                        ? "bg-[#1D4B73] text-white"
                        : "bg-[#284D69] text-[#8AAEC6]"
                    }`}
                  >
                    1
                  </div>

                  <span
                    className={`ml-3 hidden text-sm font-semibold sm:block ${
                      step >= 1
                        ? "text-white"
                        : "text-[#7397B0]"
                    }`}
                  >
                    Personal Info
                  </span>
                </div>

                <div
                  className={`mx-4 h-px flex-1 ${
                    step >= 2
                      ? "bg-[#4E7D9E]"
                      : "bg-[#31536D]"
                  }`}
                />

                {/* Step 2 */}
                <div className="flex items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                      step >= 2
                        ? "bg-[#1D4B73] text-white"
                        : "bg-[#284D69] text-[#8AAEC6]"
                    }`}
                  >
                    2
                  </div>

                  <span
                    className={`ml-3 hidden text-sm font-semibold sm:block ${
                      step >= 2
                        ? "text-white"
                        : "text-[#7397B0]"
                    }`}
                  >
                    Coding Profiles
                  </span>
                </div>

                <div
                  className={`mx-4 h-px flex-1 ${
                    step >= 3
                      ? "bg-[#4E7D9E]"
                      : "bg-[#31536D]"
                  }`}
                />

                {/* Step 3 */}
                <div className="flex items-center">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                      step >= 3
                        ? "bg-[#F6A15B] text-[#07192C]"
                        : "bg-[#284D69] text-[#8AAEC6]"
                    }`}
                  >
                    3
                  </div>

                  <span
                    className={`ml-3 hidden text-sm font-semibold sm:block ${
                      step >= 3
                        ? "text-white"
                        : "text-[#7397B0]"
                    }`}
                  >
                    Submit
                  </span>
                </div>
              </div>

              {/* =================================================
                  REGISTRATION CLOSED
              ================================================== */}
              {!isRegistrationOpen ? (
                <div className="rounded-3xl border border-[#684F34] bg-[#172B3D] p-8 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#3A3028]">
                    <Lock className="h-7 w-7 text-[#F6A15B]" />
                  </div>

                  <h2 className="text-xl font-bold text-white">
                    Registration is Currently Closed
                  </h2>

                  <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#8BAABE]">
                    Applications for the upcoming bootcamp
                    cohort are not currently being accepted.
                    Please check back later or contact the
                    administrator.
                  </p>

                  <Link
                    to="/"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#F6A15B] px-6 py-3 text-sm font-bold text-[#081A2E] transition hover:bg-[#FFB477]"
                  >
                    Return to Home
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* =================================================
                      STEP 1
                  ================================================== */}
                  {step === 1 && (
                    <div>
                      <div className="mb-8">
                        <p className="text-xs font-black tracking-[0.25em] text-[#73A7C7]">
                          STEP 1
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white">
                          Personal Information
                        </h2>

                        <p className="mt-1 text-sm text-[#83A9C2]">
                          Tell us a little about yourself.
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* Full Name */}
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                            Full Name{" "}
                            <span className="text-[#F6A15B]">
                              *
                            </span>
                          </label>

                          <div className="relative">
                            <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6593B1]" />

                            <input
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Enter your full name"
                              className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] py-3.5 pl-12 pr-4 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                            />
                          </div>
                        </div>

                        {/* Email + Phone */}
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                              Email Address{" "}
                              <span className="text-[#F6A15B]">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6593B1]" />

                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="student@example.com"
                                className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] py-3.5 pl-12 pr-4 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                              Phone Number{" "}
                              <span className="text-[#F6A15B]">
                                *
                              </span>
                            </label>

                            <div className="relative">
                              <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6593B1]" />

                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="09xxxxxxxx"
                                className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] py-3.5 pl-12 pr-4 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                              />
                            </div>
                          </div>
                        </div>

                        {/* School ID + Gender */}
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                              School / Student ID{" "}
                              <span className="text-[#F6A15B]">
                                *
                              </span>
                            </label>

                            <input
                              type="text"
                              name="schoolId"
                              value={formData.schoolId}
                              onChange={handleChange}
                              placeholder="e.g., UGR/1234/14"
                              className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                              Gender{" "}
                              <span className="text-[#F6A15B]">
                                *
                              </span>
                            </label>

                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                            >
                              <option value="">
                                Select gender
                              </option>
                              <option value="Male">Male</option>
                              <option value="Female">
                                Female
                              </option>
                            </select>
                          </div>
                        </div>

                        {/* Year + Department */}
                        <div className="grid gap-5 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                              Year{" "}
                              <span className="text-[#F6A15B]">
                                *
                              </span>
                            </label>

                            <select
                              name="year"
                              value={formData.year}
                              onChange={handleChange}
                              className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                            >
                              <option value="">
                                Select year
                              </option>
                              <option value="1st Year">
                                1st Year
                              </option>
                              <option value="2nd Year">
                                2nd Year
                              </option>
                              <option value="3rd Year">
                                3rd Year
                              </option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                              Department{" "}
                              <span className="text-[#F6A15B]">
                                *
                              </span>
                            </label>

                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              placeholder="e.g., Software Engineering"
                              className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                            />
                          </div>
                        </div>

                        {/* Experience */}
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                            Experience Level{" "}
                            <span className="text-[#F6A15B]">
                              *
                            </span>
                          </label>

                          <select
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                          >
                            <option value="Beginner">
                              Beginner
                            </option>
                            <option value="Intermediate">
                              Intermediate
                            </option>
                            <option value="Advanced">
                              Advanced
                            </option>
                          </select>
                        </div>
                      </div>

                      {/* Next */}
                      <button
                        type="button"
                        onClick={handleNext}
                        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F6A15B] py-4 text-sm font-black text-[#081A2E] shadow-lg shadow-[#F6A15B]/10 transition hover:bg-[#FFB477]"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* =================================================
                      STEP 2
                  ================================================== */}
                  {step === 2 && (
                    <div>
                      <div className="mb-8">
                        <p className="text-xs font-black tracking-[0.25em] text-[#73A7C7]">
                          STEP 2
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white">
                          Coding Profiles
                        </h2>

                        <p className="mt-1 text-sm text-[#83A9C2]">
                          Share your coding and competitive programming profiles.
                        </p>
                      </div>

                      <div className="space-y-5">
                        {/* GitHub */}
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                            GitHub Profile URL{" "}
                            <span className="text-[#F6A15B]">
                              *
                            </span>
                          </label>

                          <input
                            type="url"
                            name="githubUrl"
                            value={formData.githubUrl}
                            onChange={handleChange}
                            placeholder="https://github.com/your-username"
                            className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                          />
                        </div>

                        {/* LeetCode */}
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                            LeetCode Profile URL{" "}
                            <span className="text-[#F6A15B]">
                              *
                            </span>
                          </label>

                          <input
                            type="url"
                            name="leetcodeUrl"
                            value={formData.leetcodeUrl}
                            onChange={handleChange}
                            placeholder="https://leetcode.com/your-username"
                            className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                          />
                        </div>

                        {/* Codeforces */}
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                            Codeforces Profile URL{" "}
                            <span className="text-[#F6A15B]">
                              *
                            </span>
                          </label>

                          <input
                            type="url"
                            name="codeforcesUrl"
                            value={formData.codeforcesUrl}
                            onChange={handleChange}
                            placeholder="https://codeforces.com/profile/your-username"
                            className="w-full rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                          />
                        </div>

                        {/* About */}
                        <div>
                          <label className="mb-2 block text-sm font-bold text-[#DCEAF3]">
                            About You{" "}
                            <span className="text-[#F6A15B]">
                              *
                            </span>
                          </label>

                          <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Tell us about yourself, your coding goals, and why you want to join..."
                            className="w-full resize-none rounded-2xl border border-[#41647F] bg-[#E9F1FB] px-4 py-3.5 text-sm font-medium text-[#102A43] outline-none transition placeholder:text-[#7894AE] focus:border-[#F6A15B] focus:ring-2 focus:ring-[#F6A15B]/20"
                          />
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-[#52718A] bg-transparent py-4 text-sm font-bold text-[#C5D9E6] transition hover:bg-[#173E5A]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>

                        <button
                          type="button"
                          onClick={handleNext}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#F6A15B] py-4 text-sm font-black text-[#081A2E] transition hover:bg-[#FFB477]"
                        >
                          Review Application
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      STEP 3
                  ================================================== */}
                  {step === 3 && (
                    <div>
                      <div className="mb-8">
                        <p className="text-xs font-black tracking-[0.25em] text-[#73A7C7]">
                          STEP 3
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-white">
                          Submit Application
                        </h2>

                        <p className="mt-1 text-sm text-[#83A9C2]">
                          Review your information and submit your application.
                        </p>
                      </div>

                      {/* Summary */}
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-[#31536D] bg-[#0E2944] p-5">
                          <p className="mb-4 text-xs font-black tracking-widest text-[#F6A15B]">
                            PERSONAL INFORMATION
                          </p>

                          <div className="grid gap-4 sm:grid-cols-2">
                            <SummaryItem
                              label="Full Name"
                              value={formData.fullName}
                            />

                            <SummaryItem
                              label="Email"
                              value={formData.email}
                            />

                            <SummaryItem
                              label="Phone"
                              value={formData.phone}
                            />

                            <SummaryItem
                              label="School ID"
                              value={formData.schoolId}
                            />

                            <SummaryItem
                              label="Gender"
                              value={formData.gender}
                            />

                            <SummaryItem
                              label="Year"
                              value={formData.year}
                            />

                            <SummaryItem
                              label="Department"
                              value={formData.department}
                            />

                            <SummaryItem
                              label="Experience"
                              value={formData.experienceLevel}
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#31536D] bg-[#0E2944] p-5">
                          <p className="mb-4 text-xs font-black tracking-widest text-[#F6A15B]">
                            CODING PROFILES
                          </p>

                          <div className="space-y-3">
                            <ProfileItem
                              label="GitHub"
                              value={formData.githubUrl}
                            />

                            <ProfileItem
                              label="LeetCode"
                              value={formData.leetcodeUrl}
                            />

                            <ProfileItem
                              label="Codeforces"
                              value={formData.codeforcesUrl}
                            />
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#31536D] bg-[#0E2944] p-5">
                          <p className="mb-3 text-xs font-black tracking-widest text-[#F6A15B]">
                            ABOUT YOU
                          </p>

                          <p className="text-sm leading-6 text-[#A9C3D4]">
                            {formData.about}
                          </p>
                        </div>

                        {/* Agreement */}
                        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#31536D] bg-[#0E2944] p-5">
                          <input
                            type="checkbox"
                            name="agreedToRules"
                            checked={formData.agreedToRules}
                            onChange={handleChange}
                            className="mt-1 h-5 w-5 cursor-pointer accent-[#F6A15B]"
                          />

                          <span className="text-sm leading-6 text-[#A9C3D4]">
                            I agree to follow the bootcamp
                            rules, attend sessions regularly,
                            and participate actively in
                            contests, projects, and teamwork.
                            <span className="ml-1 text-[#F6A15B]">
                              *
                            </span>
                          </span>
                        </label>
                      </div>

                      {/* Submit buttons */}
                      <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={handlePrevious}
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-[#52718A] bg-transparent py-4 text-sm font-bold text-[#C5D9E6] transition hover:bg-[#173E5A]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="flex items-center justify-center gap-2 rounded-2xl bg-[#F6A15B] py-4 text-sm font-black text-[#081A2E] shadow-lg shadow-[#F6A15B]/10 transition hover:bg-[#FFB477] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {loading ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#081A2E] border-t-transparent" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Application
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* Login */}
              <div className="mt-8 border-t border-[#31536D] pt-7 text-center">
                <p className="text-sm text-[#83A9C2]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#F6A15B] transition hover:text-[#FFB477]"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          SUCCESS MODAL
      ======================================================== */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020B16]/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#31536D] bg-[#102A44] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#173E34]">
              <CheckCircle2 className="h-10 w-10 text-[#13C48B]" />
            </div>

            <h2 className="text-2xl font-black text-white">
              Registration Successful!
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#91B1C6]">
              {successMessage}
            </p>

            <button
              onClick={handleCloseModal}
              className="mt-7 w-full rounded-2xl bg-[#F6A15B] py-3.5 text-sm font-black text-[#081A2E] transition hover:bg-[#FFB477]"
            >
              Go to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// SUMMARY COMPONENT
// =============================================================
function SummaryItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#638AA5]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#D9E8F1]">
        {value || "-"}
      </p>
    </div>
  );
}

// =============================================================
// PROFILE COMPONENT
// =============================================================
function ProfileItem({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-[#123451] px-4 py-3">
      <span className="text-xs font-semibold text-[#638AA5]">
        {label}
      </span>

      <span className="break-all text-sm font-medium text-[#D9E8F1]">
        {value || "-"}
      </span>
    </div>
  );
}

export default RegisterationPage;