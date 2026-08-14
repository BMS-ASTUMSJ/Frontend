import { Link } from "react-router-dom";
import logo from "../../assets/ASTUMSJ-Pp.jpg";
function Navbar() {
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:shadow-md">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-xl font-extrabold tracking-tight text-[#2B362E]">
              ASTU MSJ
            </h1>

            <p className="-mt-0.5 text-xs font-semibold uppercase tracking-[0.28em] text-[#6B8063]">
              Bootcamp
            </p>
          </div>
        </Link>

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
            Apply Now!
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
