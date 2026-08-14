import { Link } from "react-router-dom";
function Navbar() {
  return (
    <nav className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="text-2xl font-bold text-[#2B362E]">
          Bootcamp Managment System
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#home"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600 "
          >
            Home
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            About
          </a>
          <a
            href="#tracks"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Tracks
          </a>

          <a
            href="#mentors"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Mentors
          </a>

          <a
            href="#faq"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            FAQ
          </a>

          <a
            href="#contact"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Contact
          </a>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl border border-[#2B362E] px-4 py-2 text-sm font-semibold text-[#2B362E] transition hover:bg-[#BFC4A3]/40"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-[#2B362E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063]"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
