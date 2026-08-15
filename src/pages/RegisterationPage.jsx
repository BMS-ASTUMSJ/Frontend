import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "",
    year: "",
    department: "",
    experienceLevel: "Beginner",
    about: "",
    agreedToRules: false,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setMessage("");
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

    if (!formData.gender) {
      setError("Please select your gender.");
      return;
    }

    if (!formData.year) {
      setError("Please select your year.");
      return;
    }

    if (!formData.department.trim()) {
      setError("Please enter your department.");
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

      const response = await axios.post(
        "http://localhost:5000/api/applicant/register",
        formData,
      );

      setMessage(
        response.data.message ||
          "Registration successful. Your application has been submitted.",
      );

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        gender: "",
        year: "",
        department: "",
        experienceLevel: "Beginner",
        about: "",
        agreedToRules: false,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#B3CFE5] px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-lg ring-1 ring-[#B3CFE5] sm:p-10">
        <div className="mb-8">
          <Link
            to="/"
            className="mb-6 inline-flex text-sm font-medium text-[#7A7F85] hover:text-[#1A3D63]"
          >
            ← Back to Home
          </Link>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4A7FA7]">
            ASTU MSJ Bootcamp
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#0A1931]">
            Apply for the Bootcamp
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#7A7F85]">
            Fill in your information below to submit your application.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
            <p className="font-semibold">Registration Successful!</p>
            <p className="mt-1">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="grid gap-5 md:grid-cols-2">
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
                placeholder="e.g. Software Engineering"
                className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
              />
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
              rows={5}
              placeholder="Tell us about yourself, your goals, and why you want to join..."
              className="w-full resize-none rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm outline-none focus:border-[#4A7FA7] focus:ring-2 focus:ring-[#B3CFE5]"
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] p-4">
            <input
              type="checkbox"
              name="agreedToRules"
              checked={formData.agreedToRules}
              onChange={handleChange}
              className="mt-1 h-4 w-4 accent-[#1A3D63]"
            />

            <span className="text-sm leading-6 text-[#7A7F85]">
              I agree to follow the bootcamp rules, attend sessions regularly,
              and participate actively in contests, projects, and teamwork.
              <span className="ml-1 text-red-500">*</span>
            </span>
          </label>

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
      </div>
    </div>
  );
}

export default RegisterationPage;
