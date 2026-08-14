import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function RegisterPage() {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.gender ||
      !formData.year ||
      !formData.department ||
      !formData.experienceLevel ||
      !formData.about
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!formData.agreedToRules) {
      setError("You must agree to the bootcamp rules.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData,
      );

      setMessage(response.data.message);

      // Clear form
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
      }, 2000);
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
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#F5F0E8] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#EBE5DA] p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-lg text-[#2B362E]">
            Please fill in your details to get started
          </h2>
        </div>

        {message && (
          <div className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            ← Back to Home
          </Link>

          <div>
            <label className="block text-sm font-medium text-[#2B362E]">
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="mt-1 w-full rounded-xl border border-[#2B362E]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2B362E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2B362E]">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@example.com"
              className="mt-1 w-full rounded-xl border border-[#2B362E]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2B362E]"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="09xxxxxxxx"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Gender
              </label>

              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Year
              </label>

              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
              >
                <option value="">Select year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Department
              </label>

              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Software Engineering"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Experience Level
            </label>

            <select
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              About You
            </label>

            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about yourself, your goals, and why you want to join the bootcamp..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreedToRules"
              checked={formData.agreedToRules}
              onChange={handleChange}
              className="mt-1 h-4 w-4"
            />

            <p className="text-sm text-slate-600">
              I agree to follow the bootcamp rules, attend sessions regularly,
              and participate actively in contests, projects, and teamwork.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#2B362E] py-3 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Registering..." : "Apply"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
