import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import logo from "./../assets/ASTUMSJ-Pp.jpg";
import {
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Please enter your phone number.");
      return;
    }

    if (!formData.schoolId.trim()) {
      toast.error("Please enter your School / Student ID Number.");
      return;
    }

    if (!formData.gender) {
      toast.error("Please select your gender.");
      return;
    }

    if (!formData.year) {
      toast.error("Please select your academic year.");
      return;
    }

    if (!formData.department.trim()) {
      toast.error("Please enter your department.");
      return;
    }

    if (!formData.experienceLevel) {
      toast.error("Please select your experience level.");
      return;
    }

    if (!formData.githubUrl.trim()) {
      toast.error("Please enter your GitHub profile URL.");
      return;
    }

    if (!formData.leetcodeUrl.trim()) {
      toast.error("Please enter your LeetCode profile URL.");
      return;
    }

    if (!formData.codeforcesUrl.trim()) {
      toast.error("Please enter your Codeforces profile URL.");
      return;
    }

    if (!formData.about.trim()) {
      toast.error("Please tell us something about yourself.");
      return;
    }

    if (!formData.agreedToRules) {
      toast.error("Please agree to the bootcamp rules.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/applicants/register", formData);

      const message =
        response.data?.message ||
        "Registration successful. Your application has been submitted.";

      setSuccessMessage(message);

      toast.success("Application submitted successfully!");

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

      const message =
        err.response?.data?.message || "Registration failed. Please try again.";

      toast.error(message);
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
      <div className="flex min-h-screen items-center justify-center bg-[#14222B]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[#00A8CC] border-t-transparent" />

          <p className="text-sm font-medium text-[#14222B]">
            Checking registration status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06151c] px-2 py-2 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
      <div className="mx-auto flex min-h-[calc(100vh-16px)] max-w-330 overflow-hidden rounded-[22px] bg-[#FFFFFF] shadow-2xl sm:min-h-[calc(100vh-32px)]">
        <div
          className="relative hidden w-[35%] overflow-hidden lg:block"
          style={{
            background:
              "linear-gradient(160deg, #1C2E3A 0%, #14222B 48%, #0E171E 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute -bottom-32 -left-28 h-92.5 w-92.5 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #daf3f6 0%, #b0d3da 38%, #7b9fa8 68%, #526f78 100%)",
              boxShadow:
                "inset -35px -35px 70px rgba(43,69,78,0.6), inset 25px 20px 50px rgba(216,241,244,0.3)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-8 xl:p-10">
            <div>
              <div className="h-16 w-16 overflow-hidden rounded-full xl:h-20 xl:w-20">
                <img
                  src={logo}
                  alt="ASTUMSJ Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="mt-8 max-w-sm xl:mt-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#00A8CC] xl:text-sm">
                  Welcome to
                </p>

                <h2 className="mt-2 text-3xl font-black leading-[1.05] tracking-tight text-white xl:text-5xl">
                  ASTUMSJ
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#9fc4cf] xl:mt-4 xl:text-base xl:leading-7">
                  Build projects.
                  <br />
                  Solve problems.
                  <br />
                  Grow together.
                </p>

                <div className="mt-4 h-1 w-12 rounded-full bg-[#00A8CC]" />
              </div>
            </div>

            <div className="my-6 space-y-4 xl:space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f768e]/40 text-[#00A8CC]">
                  <Users size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Team Projects</p>

                  <p className="text-[11px] text-[#9fc4cf]">
                    Collaborate and build real-world apps
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f768e]/40 text-[#00A8CC]">
                  <Trophy size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Weekly Contests
                  </p>

                  <p className="text-[11px] text-[#9fc4cf]">
                    Compete and improve your skills
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f768e]/40 text-[#00A8CC]">
                  <BookOpen size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Workshops</p>

                  <p className="text-[11px] text-[#9fc4cf]">
                    Learn from experts and mentors
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f768e]/40 text-[#00A8CC]">
                  <Users size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">Networking</p>

                  <p className="text-[11px] text-[#9fc4cf]">
                    Connect and grow together
                  </p>
                </div>
              </div>
            </div>

            <div />
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#F8F9FA]">
          <div
            className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #d8f1f4 0%, #aacfd6 38%, #7698a1 70%, #4d6b74 100%)",
              boxShadow:
                "inset -25px -25px 50px rgba(43,69,78,0.45), inset 20px 15px 30px rgba(216,241,244,0.3)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col overflow-y-auto px-5 py-7 sm:px-8 md:px-10 lg:px-12 xl:px-14">
            <div className="mb-7 lg:hidden">
              <button
                type="button"
                onClick={handleBackToHome}
                className="inline-flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00A8CC] text-white">
                  <Code2 size={21} />
                </div>
              </button>
            </div>

            <div className="relative mb-7 max-w-4xl">
              <div>
                <p className="text-xs font-bold tracking-wide text-[#0f768e]">
                  ASTU MSJ BOOTCAMP
                </p>

                <button
                  type="button"
                  onClick={handleBackToHome}
                  className="mt-2 inline-flex text-[14px] font-semibold text-[#00a6c0] transition hover:text-[#0b596b]"
                >
                  ← Back to Home
                </button>

                <h1 className="mt-2 text-3xl font-black tracking-tight text-[#14222B] sm:text-4xl">
                  Create Your Account
                </h1>
              </div>

              {activeBatch && (
                <div className="mt-3 inline-block rounded-full bg-[#E3F5F9] px-5 py-2.5 text-xs font-bold text-[#0f768e] shadow-sm sm:absolute sm:right-0 sm:top-0 sm:mt-0">
                  {activeBatch.name}
                </div>
              )}
            </div>

            {!isRegistrationOpen ? (
              <div className="my-auto py-8">
                <div className="relative z-20 mx-auto max-w-xl rounded-3xl border border-[#B4D7E2] bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E3F5F9] text-[#0f768e]">
                    <Lock className="h-7 w-7" />
                  </div>

                  <h2 className="text-xl font-bold text-[#14222B]">
                    Registration is Currently Closed
                  </h2>

                  <p className="mt-2 text-sm leading-relaxed text-[#8FA3B0]">
                    Applications for the upcoming bootcamp cohort are not
                    currently being accepted. Please check back later or contact
                    the admin.
                  </p>

                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#00A8CC] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0088A6]"
                  >
                    Return to Home
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <form
                  onSubmit={handleSubmit}
                  className="relative z-10 space-y-7"
                >
                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F5F9] text-[#0f768e]">
                        <User size={17} />
                      </div>

                      <div>
                        <h2 className="text-sm font-black text-[#14222B]">
                          Personal Information
                        </h2>

                        <p className="text-xs text-[#8FA3B0]">
                          Tell us a little about yourself.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Full Name <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <User
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Email Address <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Mail
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="yourmail@gmail.com"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Phone Number <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Phone
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+251 9XX XXX XXX"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          School / Student ID{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <GraduationCap
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="text"
                            name="schoolId"
                            value={formData.schoolId}
                            onChange={handleChange}
                            placeholder="e.g. UGR/37681/17"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Academic Year <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <GraduationCap
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full appearance-none rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#14222B] outline-none transition focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          >
                            <option value="">Select year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Department <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Building2
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="e.g. Software Engineering"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-sm text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Gender <span className="text-red-500">*</span>
                        </label>

                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-[#B4D7E2] bg-white px-4 py-3.5 text-sm text-[#14222B] outline-none transition focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F5F9] text-[#0f768e]">
                        <Code2 size={17} />
                      </div>

                      <div>
                        <h2 className="text-sm font-black text-[#14222B]">
                          Coding Profiles
                        </h2>

                        <p className="text-xs text-[#8FA3B0]">
                          Share your competitive programming profiles.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          GitHub URL <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Code2
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="url"
                            name="githubUrl"
                            value={formData.githubUrl}
                            onChange={handleChange}
                            placeholder="https://github.com/username"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-xs text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          LeetCode URL <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Code2
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="url"
                            name="leetcodeUrl"
                            value={formData.leetcodeUrl}
                            onChange={handleChange}
                            placeholder="https://leetcode.com/username"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-xs text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-[#22353c]">
                          Codeforces URL <span className="text-red-500">*</span>
                        </label>

                        <div className="relative">
                          <Trophy
                            size={17}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8FA3B0]"
                          />

                          <input
                            type="url"
                            name="codeforcesUrl"
                            value={formData.codeforcesUrl}
                            onChange={handleChange}
                            placeholder="https://codeforces.com/profile/username"
                            className="w-full rounded-xl border border-[#B4D7E2] bg-white py-3.5 pl-11 pr-4 text-xs text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F5F9] text-[#0f768e]">
                        <Trophy size={17} />
                      </div>

                      <div>
                        <h2 className="text-sm font-black text-[#14222B]">
                          Experience Level{" "}
                          <span className="text-red-500">*</span>
                        </h2>

                        <p className="text-xs text-[#8FA3B0]">
                          Choose the option that best describes you.
                        </p>
                      </div>
                    </div>

                    <select
                      name="experienceLevel"
                      value={formData.experienceLevel}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-[#B4D7E2] bg-white px-4 py-3.5 text-sm text-[#14222B] outline-none transition focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                    </select>
                  </section>

                  <section>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E3F5F9] text-[#0f768e]">
                        <User size={17} />
                      </div>

                      <div>
                        <h2 className="text-sm font-black text-[#14222B]">
                          About You <span className="text-red-500">*</span>
                        </h2>

                        <p className="text-xs text-[#8FA3B0]">
                          Tell us about your coding goals.
                        </p>
                      </div>
                    </div>

                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows={4}
                      required
                      placeholder="Tell us about yourself, your coding goals, and why you want to join..."
                      className="w-full resize-none rounded-xl border border-[#B4D7E2] bg-white px-4 py-3.5 text-sm text-[#14222B] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#0f768e] focus:ring-2 focus:ring-[#B4D7E2]/40"
                    />
                  </section>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#B4D7E2] bg-white p-4">
                    <input
                      type="checkbox"
                      name="agreedToRules"
                      checked={formData.agreedToRules}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[#00A8CC]"
                    />

                    <span className="text-xs leading-6 text-[#51646c]">
                      I agree to follow the bootcamp rules, attend sessions
                      regularly, and participate actively in contests, projects,
                      and teamwork.
                      <span className="ml-1 text-red-500">*</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A8CC] py-4 text-sm font-bold text-white shadow-lg shadow-[#00A8CC]/20 transition hover:bg-[#0088A6] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                <p className="relative z-10 mt-6 pb-5 text-center text-sm text-[#8FA3B0]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-[#0f768e] hover:text-[#0b596b]"
                  >
                    Sign In
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06151c]/80 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div
              className="absolute -right-12 -top-12 h-32 w-32 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #d8f1f4 0%, #aacfd6 40%, #7698a1 75%, #4d6b74 100%)",
              }}
            />

            <div
              className="absolute -bottom-16 -left-10 h-32 w-32 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #daf3f6 0%, #b0d3da 40%, #7b9fa8 75%, #526f78 100%)",
              }}
            />

            <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E3F5F9]">
                <CheckCircle2 className="h-9 w-9 text-[#00A8CC]" />
              </div>

              <h2 className="text-xl font-bold text-[#14222B]">
                Registration Successful!
              </h2>

              <p className="mt-3 text-sm leading-6 text-[#8FA3B0]">
                {successMessage}
              </p>

              <button
                type="button"
                onClick={handleCloseModal}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00A8CC] py-3.5 text-sm font-semibold text-white transition hover:bg-[#0088A6]"
              >
                Go to Home
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterationPage;