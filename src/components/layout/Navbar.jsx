import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Menu, X } from "lucide-react";
import logo from "../../assets/ASTUMSJ-Pp.jpg";

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        .nav-shine-btn {
          position: relative;
          overflow: hidden;
        }

        .nav-shine-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 70%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.25),
            transparent
          );
          transform: skewX(-20deg);
          animation: navShine 4.5s infinite;
        }

        @keyframes navShine {
          0% { left: -120%; }
          30%, 100% { left: 140%; }
        }
      `}</style>

      <nav
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "border-b border-white/10 bg-[#07162E]/90 shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
            : "border-b border-white/5 bg-[#07162E]/70 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          
          {/* ========================================================
              BRAND LOGO & BADGE
          ======================================================== */}
          <Link to="/" className="group flex items-center gap-3.5">
            <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-0.5 shadow-[0_0_20px_rgba(126,200,245,0.15)] transition duration-300 group-hover:scale-105 group-hover:border-[#7EC8F5]/50">
              <img
                src={logo}
                alt="ASTU MSJ Logo"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black tracking-tight text-white transition group-hover:text-[#7EC8F5]">
                  ASTU MSJ
                </h1>
                <span className="h-1.5 w-1.5 rounded-full bg-[#F97316] shadow-[0_0_8px_#F97316]" />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#7EC8F5]">
                Bootcamp
              </p>
            </div>
          </Link>

          {/* ========================================================
              DESKTOP NAV LINKS
          ======================================================== */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 transition duration-200 hover:text-[#7EC8F5]"
            >
              Home
            </a>

            <a
              href="#about"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 transition duration-200 hover:text-[#7EC8F5]"
            >
              About
            </a>

            <a
              href="#tracks"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 transition duration-200 hover:text-[#7EC8F5]"
            >
              Tracks
            </a>

            <a
              href="#mentors"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 transition duration-200 hover:text-[#7EC8F5]"
            >
              Mentors
            </a>

            <a
              href="#faq"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 transition duration-200 hover:text-[#7EC8F5]"
            >
              FAQ
            </a>

            <a
              href="#contact"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 transition duration-200 hover:text-[#7EC8F5]"
            >
              Contact
            </a>
          </div>

          {/* ========================================================
              ACTION BUTTONS (Login & Apply Now)
          ======================================================== */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-bold text-slate-200 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#7EC8F5]/40 hover:bg-white/10 hover:text-white"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="nav-shine-btn group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#F97316] via-[#F59E0B] to-[#EA580C] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[0_10px_25px_rgba(249,115,22,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(249,115,22,0.5)]"
            >
              <span>Apply Now</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ========================================================
              MOBILE MENU HAMBURGER BUTTON
          ======================================================== */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              to="/login"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-white"
            >
              Login
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-xl border border-white/15 bg-white/5 p-2 text-white transition hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* ========================================================
            MOBILE DROPDOWN MENU
        ======================================================== */}
        {mobileMenuOpen && (
          <div className="border-b border-white/10 bg-[#07162E]/95 p-6 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col space-y-4">
              <a
                href="#home"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 transition hover:text-[#7EC8F5]"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 transition hover:text-[#7EC8F5]"
              >
                About Bootcamp
              </a>
              <a
                href="#tracks"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 transition hover:text-[#7EC8F5]"
              >
                Learning Tracks
              </a>
              <a
                href="#mentors"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 transition hover:text-[#7EC8F5]"
              >
                Mentorship
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 transition hover:text-[#7EC8F5]"
              >
                FAQ
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-bold text-slate-300 transition hover:text-[#7EC8F5]"
              >
                Contact
              </a>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3 text-xs font-black uppercase text-white shadow-lg"
                >
                  <span>Apply Now</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

export default Navbar;