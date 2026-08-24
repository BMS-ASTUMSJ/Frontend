import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Info, Layers, Users, HelpCircle, Mail } from "lucide-react";
import logo from "../../assets/ASTUMSJ-Pp.jpg";

function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const navLinks = [
    { name: "Home", href: "#home", icon: Home },
    { name: "About", href: "#about", icon: Info },
    { name: "Tracks", href: "#tracks", icon: Layers },
    { name: "Mentors", href: "#mentors", icon: Users },
    { name: "FAQ", href: "#faq", icon: HelpCircle },
    { name: "Contact", href: "#contact", icon: Mail },
  ];

  // The dip position moves to whichever item is hovered; defaults to active selection
  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1A4B56] text-white shadow-md">
      {/* DESKTOP & HEADER NAVBAR */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* LOGO & BRAND */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#00BCD4] bg-white p-0.5 shadow-sm">
            <img
              src={logo}
              alt="ASTU MSJ Logo"
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <h1 className="font-serif text-xl font-bold tracking-tight text-white">
              ASTU MSJ
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00BCD4]">
              Bootcamp
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setActiveIndex(index)}
              className={`text-sm font-medium transition ${
                activeIndex === index
                  ? "font-semibold text-[#00BCD4]"
                  : "text-[#A0C4CC] hover:text-[#00BCD4]"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* CTA BUTTONS */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-[#00BCD4] px-5 py-2 text-xs font-bold text-[#00BCD4] transition hover:bg-[#00BCD4]/10"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-[#00BCD4] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#00ACC1]"
          >
            Apply Now
          </Link>
        </div>
      </div>

      {/* MOBILE FLOATING BAR WITH HOVER SINK / DIP EFFECT */}
      <div className="block bg-[#1A4B56] px-4 pb-4 pt-2 md:hidden">
        <div
          className="relative mx-auto flex w-full max-w-md justify-between rounded-3xl bg-white px-3 py-2 shadow-lg"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* FLOATING ACTIVE/HOVER DOT */}
          <div
            className="absolute -top-3.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#00BCD4] shadow-md transition-all duration-300 ease-in-out"
            style={{
              left: `${(targetIndex + 0.5) * (100 / navLinks.length)}%`,
            }}
          />

          {/* SINKING NOTCH / CURVED CUTOUT */}
          <div
            className="pointer-events-none absolute -top-px h-3.5 w-12 -translate-x-1/2 transition-all duration-300 ease-in-out"
            style={{
              left: `${(targetIndex + 0.5) * (100 / navLinks.length)}%`,
            }}
          >
            <svg viewBox="0 0 48 16" className="h-full w-full fill-[#1A4B56]">
              <path d="M0,0 C12,0 12,16 24,16 C36,16 36,0 48,0 Z" />
            </svg>
          </div>

          {/* NAVIGATION BUTTONS */}
          {navLinks.map((item, index) => {
            const Icon = item.icon;
            const isTarget = targetIndex === index;
            const isActive = activeIndex === index;

            return (
              <a
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => setActiveIndex(index)}
                className="relative z-10 flex flex-1 flex-col items-center justify-center pt-1 transition-colors duration-200"
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 ${
                    isTarget ? "scale-110 text-[#00BCD4]" : "text-[#527C88]"
                  }`}
                />
                <span
                  className={`mt-0.5 text-[10px] transition-colors duration-200 ${
                    isTarget || isActive
                      ? "font-bold text-[#00BCD4]"
                      : "font-medium text-[#527C88]"
                  }`}
                >
                  {item.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
