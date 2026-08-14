import { Link } from "react-router-dom";
function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#F5F0E8] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-[#EBE5DA] p-8 shadow-sm">
        <div className="text-center">
          <h2 className="block text-lg text-[#2B362E]">
            {" "}
            Please fill in your details to get started
          </h2>
        </div>
        <form className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6"
          >
            ← Back to Home
          </Link>
          <div>
            <label className="block text-sm font-medium text-[#2B362E]">
              Full Name
            </label>
            <input
              type="text"
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
              placeholder="student@example.com"
              className="mt-1 w-full rounded-xl border border-[#2B362E]/20 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#2B362E]"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="09xxxxxxxx"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gender
              </label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]">
                <option>Select</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Year
              </label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]">
                <option>Select year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineering"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Experience Level
            </label>
            <select className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]">
              <option>Beginner</option>
              <option>Intermediate</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              About You
            </label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself, your goals, and why you want to join the bootcamp...
              "
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E293B]"
            />
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-4 w-4 text-[#1E293B]" />
            <p className="text-sm text-slate-600">
              I agree to follow the bootcamp rules, attend sessions regularly,
              and participate actively in contests, projects, and teamwork.
            </p>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-[#2B362E] py-3 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063]"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
