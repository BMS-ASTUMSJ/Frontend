import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Home, Info, Layers, Users, HelpCircle, Mail } from "lucide-react";
import logo from "../../assets/ASTUMSJ-Pp.jpg";

function Navbar() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const navLinks = [
    { name: "Home", href: "#home", id: "home", icon: Home },
    { name: "About", href: "#about", id: "about", icon: Info },
    { name: "Tracks", href: "#tracks", id: "tracks", icon: Layers },
    { name: "Mentors", href: "#mentors", id: "mentors", icon: Users },
    { name: "FAQ", href: "#faq", id: "faq", icon: HelpCircle },
    { name: "Contact", href: "#contact", id: "contact", icon: Mail },
  ];

  // Synchronize active indicator with page scrolling
  useEffect(() => {
    const handleObserver = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = navLinks.findIndex(
            (link) => link.id === entry.target.id,
          );
          if (index !== -1) setActiveIndex(index);
        }
      });
    };

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    });

    navLinks.forEach((link) => {
      const section = document.getElementById(link.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const targetIndex = hoveredIndex !== null ? hoveredIndex : activeIndex;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0f2b34]/80 backdrop-blur-md shadow-lg transition-all">
      {/* DESKTOP & HEADER NAVBAR */}
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* LOGO & BRAND */}
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#0a7a93] bg-white p-0.5 shadow-sm">
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
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00a6c0]">
              Bootcamp
            </p>
          </div>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <div
          className="relative hidden items-center rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10 md:flex"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* FLOATING ACTIVE/HOVER DOT (DESKTOP) */}
          <div
            className="absolute -top-3.5 h-4 w-4 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#0a7a93] to-[#00bcd4] shadow-[0_0_14px_#00bcd4] ring-2 ring-white/80 transition-all duration-300 ease-out z-20"
            style={{
              left: `${(targetIndex + 0.5) * (100 / navLinks.length)}%`,
            }}
          />

          {/* SINKING NOTCH / CURVED CUTOUT (DESKTOP) */}
          <div
            className="pointer-events-none absolute -top-px h-4 w-12 -translate-x-1/2 transition-all duration-300 ease-out z-10"
            style={{
              left: `${(targetIndex + 0.5) * (100 / navLinks.length)}%`,
            }}
          >
            <svg viewBox="0 0 48 16" className="h-full w-full fill-[#0f2b34]">
              <path d="M0,0 C12,0 12,16 24,16 C36,16 36,0 48,0 Z" />
            </svg>
          </div>

          {navLinks.map((link, index) => {
            const isTarget = targetIndex === index;
            const isActive = activeIndex === index;

            return (
              <a
                key={link.name}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={() => setActiveIndex(index)}
                className={`relative z-10 px-4 py-1 text-sm font-medium transition-colors duration-200 ${
                  isTarget || isActive
                    ? "font-semibold text-white"
                    : "text-[#9fc4cf] hover:text-white"
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </div>

        {/* CTA BUTTONS */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-[#0a7a93] bg-[#71828a] px-5 py-2 text-xs font-bold text-white transition hover:bg-[#0a7a93]/20 hover:text-white"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-full bg-[#00a6c0] px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#076277] hover:shadow-lg"
          >
            Apply Now
          </Link>
        </div>
      </div>

      {/* MOBILE FLOATING BAR */}
      <div className="block bg-[#0f2b34]/90 backdrop-blur-lg px-4 pb-4 pt-2 md:hidden">
        <div
          className="relative mx-auto flex w-full max-w-md justify-between rounded-3xl bg-white/95 backdrop-blur-md px-3 py-2 shadow-xl border border-white/20"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* FLOATING ACTIVE/HOVER DOT (MOBILE) */}
          <div
            className="absolute -top-3.5 h-4 w-4 -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#0a7a93] to-[#00bcd4] shadow-[0_0_14px_#00bcd4] ring-2 ring-white/80 transition-all duration-300 ease-out z-20"
            style={{
              left: `${(targetIndex + 0.5) * (100 / navLinks.length)}%`,
            }}
          />

          {/* SINKING NOTCH / CURVED CUTOUT (MOBILE) */}
          <div
            className="pointer-events-none absolute -top-px h-4 w-12 -translate-x-1/2 transition-all duration-300 ease-out z-10"
            style={{
              left: `${(targetIndex + 0.5) * (100 / navLinks.length)}%`,
            }}
          >
            <svg viewBox="0 0 48 16" className="h-full w-full fill-[#0f2b34]">
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
                    isTarget ? "scale-110 text-[#0a7a93]" : "text-[#51646c]"
                  }`}
                />
                <span
                  className={`mt-0.5 text-[10px] transition-colors duration-200 ${
                    isTarget || isActive
                      ? "font-bold text-[#0a7a93]"
                      : "font-medium text-[#51646c]"
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
