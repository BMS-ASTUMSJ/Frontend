import { Link } from "react-router-dom";
import logo from "../../assets/ASTUMSJ-Pp.jpg";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#B3CFE5] bg-[#F6FAFD]/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#B3CFE5] bg-white">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <h1 className="text-xl font-extrabold tracking-tight text-[#0A1931]">
              ASTU MSJ
            </h1>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#4A7FA7]">
              Bootcamp
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <a
            href="#home"
            className="text-sm font-semibold text-[#7A7F85] transition hover:text-[#1A3D63]"
          >
            Home
          </a>

          <a
            href="#about"
            className="text-sm font-semibold text-[#7A7F85] transition hover:text-[#1A3D63]"
          >
            About
          </a>

          <a
            href="#tracks"
            className="text-sm font-semibold text-[#7A7F85] transition hover:text-[#1A3D63]"
          >
            Tracks
          </a>

          <a
            href="#mentors"
            className="text-sm font-semibold text-[#7A7F85] transition hover:text-[#1A3D63]"
          >
            Mentors
          </a>

          <a
            href="#faq"
            className="text-sm font-semibold text-[#7A7F85] transition hover:text-[#1A3D63]"
          >
            FAQ
          </a>

          <a
            href="#contact"
            className="text-sm font-semibold text-[#7A7F85] transition hover:text-[#1A3D63]"
          >
            Contact
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl border border-[#1A3D63] px-5 py-2.5 text-sm font-semibold text-[#1A3D63] transition hover:bg-[#B3CFE5]/40"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-[#1A3D63] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4A7FA7]"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
