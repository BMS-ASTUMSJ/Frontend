import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Users,
  Trophy,
  CheckCircle2,
  Sparkles,
  Rocket,
  Brain,
  Target,
  ChevronDown,
  Star,
  Zap,
  Terminal,
  Layers3,
  GraduationCap,
  GitBranch,
} from "lucide-react";

import {
  FaTelegramPlane,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";

import toast from "react-hot-toast";

function LandingPage() {
  const [activeWord, setActiveWord] = useState(0);

  const words = [
    { text: "Learn.", color: "#38BDF8" },
    { text: "Build.", color: "#A78BFA" },
    { text: "Compete.", color: "#34D399" },
    { text: "Create.", color: "#F472B6" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWord((prev) => (prev + 1) % words.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const handleLearnMore = () => {
    toast.success("Explore the ASTU MSJ Bootcamp and discover your path!");
  };

  const handleApply = () => {
    toast.success("Let's get started with your bootcamp application!");
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <style>{`
        html {
          scroll-behavior: smooth;
        }

        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.85s ease,
            transform 0.85s cubic-bezier(.2,.8,.2,1);
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .float-slow {
          animation: floatSlow 7s ease-in-out infinite;
        }

        .float-medium {
          animation: floatMedium 5s ease-in-out infinite;
        }

        .float-fast {
          animation: floatFast 3.5s ease-in-out infinite;
        }

        .pulse-soft {
          animation: pulseSoft 3s ease-in-out infinite;
        }

        .rotate-slow {
          animation: rotateSlow 22s linear infinite;
        }

        .gradient-hero-text {
          background: linear-gradient(
            90deg,
            #38BDF8,
            #A78BFA,
            #34D399,
            #F472B6,
            #38BDF8
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientMove 6s ease infinite;
        }

        .moving-word {
          animation: wordEnter 0.7s cubic-bezier(.2,.8,.2,1);
        }

        .shine {
          position: relative;
          overflow: hidden;
        }

        .shine::after {
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
          animation: shine 4.5s infinite;
        }

        .card-hover {
          transition:
            transform 0.4s cubic-bezier(.2,.8,.2,1),
            box-shadow 0.4s ease,
            border-color 0.4s ease;
        }

        .card-hover:hover {
          transform: translateY(-8px);
        }

        .grid-bg {
          background-image:
            linear-gradient(
              rgba(56, 189, 248, 0.07) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(56, 189, 248, 0.07) 1px,
              transparent 1px
            );
          background-size: 45px 45px;
        }

        @keyframes floatSlow {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-22px) translateX(10px);
          }
        }

        @keyframes floatMedium {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-16px);
          }
        }

        @keyframes floatFast {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes pulseSoft {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes rotateSlow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% center;
          }
          50% {
            background-position: 100% center;
          }
          100% {
            background-position: 0% center;
          }
        }

        @keyframes wordEnter {
          0% {
            opacity: 0;
            transform: translateY(16px);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes shine {
          0% {
            left: -120%;
          }
          35%, 100% {
            left: 140%;
          }
        }

        .arabic-text {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .code-cursor {
          display: inline-block;
          width: 3px;
          height: 18px;
          background: #34D399;
          animation: cursorBlink 1s infinite;
          vertical-align: middle;
        }

        @keyframes cursorBlink {
          0%, 50% {
            opacity: 1;
          }
          51%, 100% {
            opacity: 0;
          }
        }
      `}</style>

      <div className="min-h-screen overflow-hidden bg-[#060D1A] text-slate-100 selection:bg-[#38BDF8] selection:text-[#060D1A]">

        {/* =====================================================
            1. HERO SECTION (Cosmic Electric Blue & Purple Aura)
        ====================================================== */}
        <section
          id="home"
          className="relative min-h-[calc(100vh-90px)] overflow-hidden bg-gradient-to-b from-[#060D1A] via-[#09152B] to-[#081226] px-6 py-20 md:px-12 lg:px-20"
        >
          {/* Neon Lighting orbs */}
          <div className="absolute inset-0 grid-bg opacity-70" />
          <div className="absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-cyan-600/20 blur-[130px]" />
          <div className="absolute -right-20 top-1/4 h-[550px] w-[550px] rounded-full bg-violet-600/20 blur-[140px]" />
          <div className="absolute bottom-[-100px] left-1/3 h-[400px] w-[400px] rounded-full bg-emerald-600/15 blur-[120px]" />

          {/* Floating Neon Particles */}
          <div className="float-slow absolute left-[10%] top-[22%] h-3 w-3 rounded-full bg-[#38BDF8] shadow-[0_0_15px_#38BDF8]" />
          <div className="float-medium absolute right-[12%] top-[20%] h-3.5 w-3.5 rounded-full bg-[#A78BFA] shadow-[0_0_15px_#A78BFA]" />
          <div className="float-fast absolute bottom-[22%] left-[48%] h-2.5 w-2.5 rounded-full bg-[#34D399] shadow-[0_0_12px_#34D399]" />
          <div className="rotate-slow absolute bottom-[10%] right-[6%] h-44 w-44 rounded-full border border-dashed border-cyan-500/20" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">

            {/* HERO LEFT */}
            <div className="reveal">
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-cyan-400/30 bg-gradient-to-r from-cyan-950/60 to-violet-950/60 px-4 py-2 shadow-[0_0_20px_rgba(56,189,248,0.15)] backdrop-blur-xl">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#38BDF8]" />
                </span>
                <span className="text-xs font-black tracking-widest text-cyan-300">
                  ASTU MSJ BOOTCAMP 2026
                </span>
                <Sparkles className="h-4 w-4 text-violet-300" />
              </div>

              <div className="max-w-4xl">
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
                  ⚡ Build Your Future With Modern Code
                </p>

                <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[80px]">
                  <span className="block">Learn.</span>
                  <span
                    key={activeWord}
                    className="moving-word gradient-hero-text block min-h-[1.05em]"
                  >
                    {words[activeWord].text}
                  </span>
                  <span className="block text-white">Your Future.</span>
                </h1>
              </div>

              <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                A practical software engineering bootcamp where ambitious
                students master modern technologies, build full-stack projects,
                conquer competitive programming, and grow alongside elite mentors.
              </p>

              {/* Arabic Motivation Card */}
              <div className="mt-8 max-w-2xl rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-[#0C1B33]/80 via-[#131E3D]/80 to-[#18183B]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <p
                      dir="rtl"
                      className="arabic-text text-lg font-bold text-white md:text-xl"
                    >
                      لا تنتظر الفرصة، اصنعها بنفسك.
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-cyan-200/70">
                      Don't wait for the opportunity. Create it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-9 flex flex-wrap gap-4">
                <Link
                  to="/register"
                  onClick={handleApply}
                  className="shine group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 px-8 py-4 font-bold text-white shadow-[0_10px_30px_rgba(14,165,233,0.4)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(56,189,248,0.6)]"
                >
                  Start Your Journey
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <a
                  href="#about"
                  onClick={handleLearnMore}
                  className="group inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/60 px-8 py-4 font-semibold text-slate-200 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-slate-800/80 hover:text-white"
                >
                  Explore Bootcamp
                  <ArrowDownIcon />
                </a>
              </div>

              {/* Numbered Highlights */}
              <div className="mt-12 flex flex-wrap gap-8 border-t border-slate-800/80 pt-7">
                <MiniStat number="01" text="Learn" color="text-cyan-400" />
                <MiniStat number="02" text="Build" color="text-violet-400" />
                <MiniStat number="03" text="Compete" color="text-emerald-400" />
                <MiniStat number="04" text="Grow" color="text-pink-400" />
              </div>
            </div>

            {/* HERO RIGHT (Interactive Code IDE) */}
            <div className="reveal relative">
              <div className="float-slow absolute -right-5 -top-5 z-20 hidden rounded-2xl border border-cyan-400/30 bg-[#0B1A30]/90 p-4 shadow-[0_0_30px_rgba(56,189,248,0.2)] backdrop-blur-xl sm:block">
                <Rocket className="h-6 w-6 text-cyan-400" />
              </div>

              <div className="float-medium absolute -bottom-5 -left-5 z-20 hidden rounded-2xl border border-violet-400/30 bg-[#16122E]/90 p-4 shadow-[0_0_30px_rgba(167,139,250,0.2)] backdrop-blur-xl sm:block">
                <Brain className="h-6 w-6 text-violet-400" />
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-b from-[#0A162B] to-[#060E1D] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
                {/* Code Window Header */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-[#060F1E] px-6 py-4">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                    <span className="h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  </div>
                  <div className="rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1 font-mono text-xs text-cyan-300">
                    developer.ts
                  </div>
                  <Terminal className="h-4 w-4 text-slate-400" />
                </div>

                {/* Code Body */}
                <div className="relative overflow-hidden p-6 font-mono text-sm leading-7 md:p-8 md:text-base">
                  <p className="text-cyan-400/70">
                    {"// 🚀 Your journey starts here"}
                  </p>

                  <div className="mt-4 space-y-1">
                    <p>
                      <span className="text-violet-400 font-semibold">const </span>
                      <span className="text-cyan-200">developer </span>
                      <span className="text-pink-400">= </span>
                      <span className="text-white">{"{"}</span>
                    </p>
                    <p className="pl-6">
                      <span className="text-cyan-300">learn</span>
                      <span className="text-slate-400">: </span>
                      <span className="text-emerald-400 font-semibold">true</span>
                      <span className="text-white">,</span>
                    </p>
                    <p className="pl-6">
                      <span className="text-cyan-300">build</span>
                      <span className="text-slate-400">: </span>
                      <span className="text-emerald-400 font-semibold">true</span>
                      <span className="text-white">,</span>
                    </p>
                    <p className="pl-6">
                      <span className="text-cyan-300">dream</span>
                      <span className="text-slate-400">: </span>
                      <span className="text-amber-300">"unlimited"</span>
                      <span className="text-white">,</span>
                    </p>
                    <p className="pl-6">
                      <span className="text-cyan-300">future</span>
                      <span className="text-slate-400">: </span>
                      <span className="text-pink-300">"engineering-excellence"</span>
                    </p>
                    <p className="text-white">{"};"}</p>
                  </div>

                  <p className="mt-5 text-violet-400/70">
                    {"// ⚡ Build something extraordinary."}
                  </p>
                  <p className="mt-4 flex items-center gap-2 font-semibold text-emerald-400">
                    <span>→</span>
                    <span>Ready to launch...</span>
                    <span className="code-cursor" />
                  </p>
                </div>

                {/* IDE Embedded Cards */}
                <div className="space-y-2.5 border-t border-slate-800/90 bg-[#040A14] p-4">
                  <JourneyCard
                    number="01"
                    icon={<Code2 className="h-5 w-5" />}
                    title="Master Modern Tech"
                    description="Full-stack web architecture, React, Node & APIs."
                    color="text-cyan-400"
                    bg="bg-cyan-500/10 border-cyan-500/20"
                  />
                  <JourneyCard
                    number="02"
                    icon={<Layers3 className="h-5 w-5" />}
                    title="Build Scalable Systems"
                    description="Turn theoretical ideas into deployed production apps."
                    color="text-violet-400"
                    bg="bg-violet-500/10 border-violet-500/20"
                  />
                  <JourneyCard
                    number="03"
                    icon={<Trophy className="h-5 w-5" />}
                    title="Solve & Compete"
                    description="Sharpen algorithmic thinking with competitive programming."
                    color="text-amber-400"
                    bg="bg-amber-500/10 border-amber-500/20"
                  />
                </div>

                {/* Bottom Mindset Bar */}
                <div className="bg-[#040A14] px-4 pb-4">
                  <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-cyan-950/40 p-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Bootcamp Mindset
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-white">
                        Code. Learn. Compete. Repeat.
                      </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                      <Zap className="h-4 w-4 text-[#060D1A]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Scroll Down */}
          <a
            href="#about"
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-slate-400 transition hover:text-cyan-400 md:flex"
          >
            <span className="text-[10px] uppercase tracking-[0.3em]">
              Scroll to explore
            </span>
            <ChevronDown className="h-4 w-4 animate-bounce text-cyan-400" />
          </a>
        </section>

        {/* =====================================================
            2. VIBRANT MULTI-COLOR MARQUEE
        ====================================================== */}
        <div className="overflow-hidden border-y border-cyan-500/20 bg-gradient-to-r from-[#0E172A] via-[#1E1B4B] to-[#0E172A] py-4 shadow-inner">
          <div className="flex min-w-max animate-[marquee_25s_linear_infinite] gap-12">
            {[
              { text: "تعلم اليوم، لتقود غداً.", color: "text-cyan-300" },
              { text: "Build. Break. Learn. Repeat.", color: "text-violet-300" },
              { text: "لا تخف من البداية.", color: "text-emerald-300" },
              { text: "Your potential has no limit.", color: "text-pink-300" },
              { text: "المستقبل يبدأ بخطوة.", color: "text-amber-300" },
              { text: "Code your dreams into reality.", color: "text-sky-300" },
              { text: "اصنع مستقبلك بيديك.", color: "text-teal-300" },
            ]
              .concat([
                { text: "تعلم اليوم، لتقود غداً.", color: "text-cyan-300" },
                { text: "Build. Break. Learn. Repeat.", color: "text-violet-300" },
                { text: "لا تخف من البداية.", color: "text-emerald-300" },
                { text: "Your potential has no limit.", color: "text-pink-300" },
              ])
              .map((item, index) => (
                <div
                  key={`${item.text}-${index}`}
                  className="flex items-center gap-12"
                >
                  <span className={`whitespace-nowrap font-mono text-sm font-bold ${item.color}`}>
                    {item.text}
                  </span>
                  <span className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 shadow-[0_0_10px_#38BDF8]" />
                </div>
              ))}
          </div>
        </div>

        {/* =====================================================
            3. ABOUT SECTION (Deep Royal Twilight Theme)
        ====================================================== */}
        <section
          id="about"
          className="scroll-mt-16 bg-gradient-to-b from-[#081226] via-[#0D1B36] to-[#0A162D] px-6 py-28 md:px-12 lg:px-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="reveal grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                  About the Bootcamp
                </p>
                <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">
                  More than
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                    just coding.
                  </span>
                </h2>
              </div>

              <div>
                <p className="text-lg leading-8 text-slate-200">
                  ASTU MSJ Bootcamp is an intensive, hands-on launchpad built
                  for ambitious students who want to bridge the gap between academic theory
                  and real-world software engineering.
                </p>
                <p className="mt-4 text-base leading-8 text-slate-400">
                  Learn through rapid project cycles, live debugging, pair programming,
                  algorithmic challenges, and personalized 1-on-1 mentorship.
                </p>
              </div>
            </div>

            {/* Differentiated Color Feature Cards */}
            <div className="reveal mt-16 grid gap-6 md:grid-cols-3">
              <ColorFeatureCard
                number="01"
                icon={<Code2 className="h-6 w-6 text-cyan-400" />}
                title="Practical Learning"
                description="Learn by building production-grade software. Turn every theoretical concept into a tangible feature."
                glowClass="border-cyan-500/30 hover:border-cyan-400 hover:shadow-[0_0_35px_rgba(56,189,248,0.25)]"
                bgClass="bg-gradient-to-br from-[#0C2240] via-[#09182F] to-[#061021]"
                accentText="text-cyan-400"
                iconBg="bg-cyan-500/10 border border-cyan-500/30"
              />

              <ColorFeatureCard
                number="02"
                icon={<Users className="h-6 w-6 text-violet-400" />}
                title="Elite Mentorship"
                description="Receive architectural guidance, code reviews, and career coaching from developers who know the industry."
                glowClass="border-violet-500/30 hover:border-violet-400 hover:shadow-[0_0_35px_rgba(167,139,250,0.25)]"
                bgClass="bg-gradient-to-br from-[#1C163D] via-[#140F2D] to-[#0C081D]"
                accentText="text-violet-400"
                iconBg="bg-violet-500/10 border border-violet-500/30"
              />

              <ColorFeatureCard
                number="03"
                icon={<Trophy className="h-6 w-6 text-emerald-400" />}
                title="Contest & Challenges"
                description="Train in competitive programming, master data structures, and build high-performance problem solving habits."
                glowClass="border-emerald-500/30 hover:border-emerald-400 hover:shadow-[0_0_35px_rgba(52,211,153,0.25)]"
                bgClass="bg-gradient-to-br from-[#092B23] via-[#061E19] to-[#041410]"
                accentText="text-emerald-400"
                iconBg="bg-emerald-500/10 border border-emerald-500/30"
              />
            </div>

            {/* Arabic Mindset Banner */}
            <div className="reveal mt-10 overflow-hidden rounded-[2rem] border border-cyan-500/30 bg-gradient-to-r from-[#0C1E3C] via-[#161B40] to-[#122842] p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] md:p-12">
              <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                    Your Mindset Matters
                  </p>
                  <h3
                    dir="rtl"
                    className="arabic-text mt-4 text-3xl font-black leading-relaxed text-white md:text-4xl"
                  >
                    النجاح لا يأتي من الحظ،
                    <br />
                    بل من الاستمرار وعدم الاستسلام.
                  </h3>
                </div>

                <div className="pulse-soft flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/20 shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                  <Target className="h-9 w-9 text-cyan-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            4. TRACKS SECTION (Deep Velvet Violet & Teal Theme)
        ====================================================== */}
        <section
          id="tracks"
          className="relative overflow-hidden bg-gradient-to-b from-[#0A162D] via-[#0F0E24] to-[#0A1426] px-6 py-28 md:px-12 lg:px-20"
        >
          <div className="absolute right-0 top-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[150px]" />
          <div className="absolute left-0 bottom-1/4 h-[500px] w-[500px] rounded-full bg-cyan-600/15 blur-[150px]" />

          <div className="relative mx-auto max-w-7xl">
            <div className="reveal flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                  Learning Tracks
                </p>
                <h2 className="mt-3 text-4xl font-black text-white md:text-6xl">
                  Choose your
                  <br />
                  <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                    battlefield.
                  </span>
                </h2>
              </div>

              <p className="max-w-md text-base leading-8 text-slate-300">
                Pick your specialization, sharpen your edge, and graduate with the
                skills top technology companies demand.
              </p>
            </div>

            <div className="reveal mt-16 grid gap-8 lg:grid-cols-2">
              {/* Track 1 - Full Stack */}
              <TrackCard
                borderGlow="border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_45px_rgba(56,189,248,0.25)]"
                bgGradient="bg-gradient-to-br from-[#0C2442] via-[#091A33] to-[#061224]"
                badgeColor="border-cyan-400/40 bg-cyan-500/10 text-cyan-300"
                iconBg="bg-cyan-500/20 text-cyan-400 border border-cyan-400/30"
                icon={<Code2 className="h-7 w-7" />}
                label="TRACK 01"
                title="Full-Stack Web Engineering"
                description="Master modern full-stack application development from pixel-perfect UI to scalable microservices and databases."
                items={[
                  "Modern React & TypeScript",
                  "Node.js & Express REST APIs",
                  "PostgreSQL & MongoDB",
                  "Authentication & Security",
                  "Cloud Deployment & Docker",
                ]}
                itemCheckColor="text-cyan-400"
              />

              {/* Track 2 - Competitive Programming */}
              <TrackCard
                borderGlow="border-pink-500/40 hover:border-pink-400 hover:shadow-[0_0_45px_rgba(244,114,182,0.25)]"
                bgGradient="bg-gradient-to-br from-[#2D122E] via-[#1E0C23] to-[#120717]"
                badgeColor="border-pink-400/40 bg-pink-500/10 text-pink-300"
                iconBg="bg-pink-500/20 text-pink-400 border border-pink-400/30"
                icon={<Trophy className="h-7 w-7" />}
                label="TRACK 02"
                title="Competitive Programming"
                description="Deep dive into algorithms, dynamic programming, graph theory, and mathematical problem-solving for contests."
                items={[
                  "Advanced Data Structures",
                  "Dynamic Programming & Graphs",
                  "Math & Number Theory",
                  "Codeforces & ICPC Training",
                  "Speed & Optimization Strategies",
                ]}
                itemCheckColor="text-pink-400"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            5. JOURNEY SECTION (Neon Step Sequence)
        ====================================================== */}
        <section className="bg-gradient-to-b from-[#0A1426] via-[#060F1E] to-[#08162A] px-6 py-28 md:px-12 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <div className="reveal text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400">
                Your Path to Mastery
              </p>
              <h2 className="mt-4 text-4xl font-black text-white md:text-6xl">
                From curious
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  {" "}to capable.
                </span>
              </h2>
            </div>

            <div className="reveal relative mt-16 grid gap-6 md:grid-cols-4">
              <JourneyStep
                number="01"
                icon={<GraduationCap className="h-6 w-6 text-cyan-400" />}
                title="Learn"
                text="Grasp fundamentals, architecture patterns, and industry tools."
                borderClass="border-cyan-500/30 hover:border-cyan-400"
                badgeClass="text-cyan-400"
                iconBg="bg-cyan-500/10 border-cyan-500/30"
                glow="hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]"
              />

              <JourneyStep
                number="02"
                icon={<Code2 className="h-6 w-6 text-violet-400" />}
                title="Build"
                text="Translate knowledge into real production apps and clean code."
                borderClass="border-violet-500/30 hover:border-violet-400"
                badgeClass="text-violet-400"
                iconBg="bg-violet-500/10 border-violet-500/30"
                glow="hover:shadow-[0_0_30px_rgba(167,139,250,0.2)]"
              />

              <JourneyStep
                number="03"
                icon={<Brain className="h-6 w-6 text-amber-400" />}
                title="Challenge"
                text="Solve hard problem sets under pressure and optimize logic."
                borderClass="border-amber-500/30 hover:border-amber-400"
                badgeClass="text-amber-400"
                iconBg="bg-amber-500/10 border-amber-500/30"
                glow="hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              />

              <JourneyStep
                number="04"
                icon={<Rocket className="h-6 w-6 text-emerald-400" />}
                title="Grow"
                text="Build confidence, engineer habits, and unlock tech careers."
                borderClass="border-emerald-500/30 hover:border-emerald-400"
                badgeClass="text-emerald-400"
                iconBg="bg-emerald-500/10 border-emerald-500/30"
                glow="hover:shadow-[0_0_30px_rgba(52,211,153,0.2)]"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            6. MENTORSHIP SECTION (Deep Indigo & Cyan)
        ====================================================== */}
        <section
          id="mentors"
          className="scroll-mt-16 bg-gradient-to-b from-[#08162A] via-[#101D38] to-[#0A162B] px-6 py-28 md:px-12 lg:px-20"
        >
          <div className="mx-auto max-w-7xl">
            <div className="reveal grid items-center gap-14 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Mentorship
                </p>
                <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
                  You don't have
                  <br />
                  to build
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                    alone.
                  </span>
                </h2>
              </div>

              <div>
                <div className="card-hover rounded-[2rem] border border-cyan-500/30 bg-gradient-to-br from-[#0F2344] via-[#0B1A33] to-[#071324] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
                  <div className="flex flex-col gap-7 md:flex-row">
                    <div className="float-medium flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_25px_rgba(56,189,248,0.4)]">
                      <Users className="h-8 w-8 text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Guidance beyond the classroom
                      </h3>
                      <p className="mt-4 text-base leading-8 text-slate-300">
                        Mentors help students understand difficult concepts,
                        refactor code, architect systems, and stay motivated throughout
                        every challenge.
                      </p>

                      <div className="mt-7 flex flex-wrap gap-3">
                        {[
                          { name: "Technical Guidance", color: "border-cyan-500/40 text-cyan-300 bg-cyan-950/40" },
                          { name: "Code Reviews", color: "border-violet-500/40 text-violet-300 bg-violet-950/40" },
                          { name: "Career Coaching", color: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40" },
                          { name: "Problem Solving", color: "border-pink-500/40 text-pink-300 bg-pink-950/40" },
                        ].map((item) => (
                          <span
                            key={item.name}
                            className={`rounded-full border px-4 py-2 text-xs font-semibold ${item.color}`}
                          >
                            {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Arabic Card */}
            <div className="reveal mt-12 rounded-[2rem] border border-amber-500/30 bg-gradient-to-r from-[#1E170A]/80 via-[#261B06]/80 to-[#1A1205]/80 p-8 text-center backdrop-blur-xl">
              <Star className="mx-auto h-7 w-7 fill-amber-400 text-amber-400" />
              <p
                dir="rtl"
                className="arabic-text mx-auto mt-5 max-w-3xl text-2xl font-bold leading-relaxed text-amber-100 md:text-3xl"
              >
                كل خطوة صغيرة اليوم تقرّبك من الحلم الذي تريده غداً.
              </p>
              <p className="mt-3 text-xs font-medium text-amber-300/80">
                Every small step today brings you closer to the future you dream about.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            7. FAQ SECTION (Midnight Slate Glass Accordions)
        ====================================================== */}
        <section
          id="faq"
          className="scroll-mt-16 bg-gradient-to-b from-[#0A162B] via-[#071120] to-[#040913] px-6 py-28 md:px-12 lg:px-20"
        >
          <div className="mx-auto max-w-4xl">
            <div className="reveal text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                Frequently Asked
              </p>
              <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
                Questions?
                <span className="text-cyan-400"> We got you.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Everything you need to know about the ASTU MSJ Bootcamp.
              </p>
            </div>

            <div className="reveal mt-12 space-y-4">
              <FAQ
                question="Who can join the bootcamp?"
                answer="The bootcamp is tailored for ASTU students eager to accelerate their software engineering skills, competitive programming abilities, and portfolio."
                tagColor="border-cyan-500/40 text-cyan-300"
              />
              <FAQ
                question="Do I need prior programming experience?"
                answer="Beginners are welcome! We provide structured modules and dedicated mentors who will guide you step by step."
                tagColor="border-violet-500/40 text-violet-300"
              />
              <FAQ
                question="What tracks are available?"
                answer="You can enroll in Full-Stack Web Development or Competitive Programming, depending on your passion."
                tagColor="border-emerald-500/40 text-emerald-300"
              />
              <FAQ
                question="Will I work on real-world projects?"
                answer="Yes! Every student builds deployable full-stack applications with real databases, authentication, and modern UI frameworks."
                tagColor="border-pink-500/40 text-pink-300"
              />
              <FAQ
                question="How do I register?"
                answer="Click the Apply Now button anywhere on this page and fill out the registration form before the deadline."
                tagColor="border-amber-500/40 text-amber-300"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            8. FINAL CTA (Radiant Multi-Color Mesh)
        ====================================================== */}
        <section className="relative overflow-hidden bg-[#040913] px-6 py-28 md:px-12 lg:px-20">
          <div className="mx-auto max-w-5xl">
            <div className="reveal relative overflow-hidden rounded-[2.5rem] border border-cyan-400/40 bg-gradient-to-r from-[#0E2A47] via-[#1D1845] to-[#0A263D] p-10 text-center shadow-[0_25px_80px_rgba(0,0,0,0.7)] md:p-16">
              {/* Internal glowing highlights */}
              <div className="absolute inset-0 grid-bg opacity-30" />
              <div className="absolute left-1/2 top-0 h-[220px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[100px]" />

              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-500/20 shadow-[0_0_30px_rgba(56,189,248,0.3)] backdrop-blur-xl">
                  <Rocket className="h-8 w-8 text-cyan-300" />
                </div>

                <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">
                  Your Next Chapter Starts Today
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
                  Don't just dream about
                  <br />
                  your future.
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-pink-300 to-emerald-300 bg-clip-text text-transparent">
                    Build it.
                  </span>
                </h2>

                <p
                  dir="rtl"
                  className="arabic-text mt-6 text-2xl font-bold text-white md:text-3xl"
                >
                  ابدأ الآن، ابنِ مستقبلك، واصنع الفرق.
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  Start now. Build your future. Make a difference.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/register"
                    onClick={handleApply}
                    className="shine group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 px-9 py-4 font-bold text-[#060D1A] shadow-[0_10px_35px_rgba(56,189,248,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(56,189,248,0.7)]"
                  >
                    Apply Now
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <a
                    href="#contact"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/[0.08] px-9 py-4 font-bold text-white backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/50 hover:bg-white/[0.14]"
                  >
                    Talk to Us
                    <ArrowUpRight className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            9. CONTACT SECTION
        ====================================================== */}
        <section
          id="contact"
          className="border-t border-slate-800/80 bg-[#03070F] px-6 py-24 md:px-12 lg:px-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="reveal grid gap-12 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Connect With Us
                </p>
                <h2 className="mt-4 text-4xl font-black text-white md:text-5xl">
                  Have a question?
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                  Connect with the ASTU MSJ Bootcamp community across our social channels
                  and stay updated on upcoming challenges.
                </p>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-500/30 bg-cyan-950/40 shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                <GitBranch className="h-9 w-9 text-cyan-400" />
              </div>
            </div>

            <div className="reveal mt-12 flex flex-wrap gap-3">
              <SocialButton
                href="https://t.me/your_username"
                icon={<FaTelegramPlane />}
                label="Telegram"
                color="bg-[#229ED9]/85 hover:bg-[#229ED9]"
              />
              <SocialButton
                href="https://facebook.com/your_page"
                icon={<FaFacebookF />}
                label="Facebook"
                color="bg-[#1877F2]/85 hover:bg-[#1877F2]"
              />
              <SocialButton
                href="https://instagram.com/your_username"
                icon={<FaInstagram />}
                label="Instagram"
                color="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] hover:opacity-100 opacity-90"
              />
              <SocialButton
                href="https://linkedin.com/company/your_company"
                icon={<FaLinkedinIn />}
                label="LinkedIn"
                color="bg-[#0A66C2]/85 hover:bg-[#0A66C2]"
              />
              <SocialButton
                href="https://github.com/your_username"
                icon={<FaGithub />}
                label="GitHub"
                color="bg-[#24292F] border border-slate-700 hover:bg-[#2d333b]"
              />
              <SocialButton
                href="mailto:your@email.com"
                icon={<FaEnvelope />}
                label="Email Us"
                color="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            10. FOOTER
        ====================================================== */}
        <footer className="border-t border-slate-800/80 bg-[#02050B] px-6 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
            <div>
              <p className="font-bold text-white">ASTU MSJ Bootcamp</p>
              <p className="mt-1 text-xs text-slate-400">
                Learn. Build. Compete. Create.
              </p>
            </div>

            <p className="text-xs text-slate-500">
              © 2026 ASTU MSJ Bootcamp. All rights reserved.
            </p>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/50 hover:bg-slate-800 hover:text-white"
            >
              Back to top
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </footer>

      </div>
    </>
  );
}

/* ============================================================
   REUSABLE SUB-COMPONENTS
============================================================ */

function MiniStat({ number, text, color }) {
  return (
    <div>
      <p className={`text-2xl font-black ${color}`}>{number}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
        {text}
      </p>
    </div>
  );
}

function ArrowDownIcon() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs transition-transform duration-300 group-hover:translate-y-0.5">
      ↓
    </span>
  );
}

function JourneyCard({ number, icon, title, description, color, bg }) {
  return (
    <div className={`card-hover group rounded-xl border p-4 transition-colors ${bg}`}>
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/40 ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className={`text-xs font-mono font-bold ${color}`}>{number}</p>
            <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-white" />
          </div>
          <h3 className="mt-0.5 text-sm font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-300">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ColorFeatureCard({
  number,
  icon,
  title,
  description,
  glowClass,
  bgClass,
  accentText,
  iconBg,
}) {
  return (
    <div className={`card-hover group relative overflow-hidden rounded-[2rem] border p-8 shadow-xl backdrop-blur-xl ${glowClass} ${bgClass}`}>
      <div className="absolute right-[-10px] top-[-10px] font-mono text-7xl font-black text-white/[0.04]">
        {number}
      </div>
      <div className="relative">
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-md transition duration-300 group-hover:scale-105 ${iconBg}`}>
          {icon}
        </div>
        <p className={`mt-6 text-xs font-bold uppercase tracking-[0.2em] ${accentText}`}>
          {number}
        </p>
        <h3 className="mt-2 text-2xl font-black text-white">{title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-300">{description}</p>
      </div>
    </div>
  );
}

function TrackCard({
  borderGlow,
  bgGradient,
  badgeColor,
  iconBg,
  icon,
  label,
  title,
  description,
  items,
  itemCheckColor,
}) {
  return (
    <div
      className={`card-hover group relative overflow-hidden rounded-[2rem] border p-8 shadow-2xl backdrop-blur-xl md:p-10 ${borderGlow} ${bgGradient}`}
    >
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition duration-300 group-hover:scale-105 ${iconBg}`}>
            {icon}
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-xs font-bold tracking-[0.15em] ${badgeColor}`}>
            {label}
          </span>
        </div>

        <h3 className="mt-8 text-3xl font-black text-white">{title}</h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{description}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <CheckCircle2 className={`h-4 w-4 shrink-0 ${itemCheckColor}`} />
              <span className="text-xs font-semibold text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JourneyStep({
  number,
  icon,
  title,
  text,
  borderClass,
  badgeClass,
  iconBg,
  glow,
}) {
  return (
    <div className={`card-hover rounded-[2rem] border bg-gradient-to-b from-[#0F1E38]/70 to-[#0A1426]/70 p-7 text-center backdrop-blur-xl transition-all ${borderClass} ${glow}`}>
      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border ${iconBg}`}>
        {icon}
      </div>
      <p className={`mt-5 text-xs font-mono font-bold tracking-[0.2em] ${badgeClass}`}>
        {number}
      </p>
      <h3 className="mt-2 text-lg font-black text-white">{title}</h3>
      <p className="mt-2 text-xs leading-6 text-slate-300">{text}</p>
    </div>
  );
}

function FAQ({ question, answer, tagColor }) {
  return (
    <details className="group overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0C1A30]/80 via-[#0A162A]/80 to-[#081222]/80 transition duration-300 hover:border-cyan-500/40">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5">
        <span className="text-base font-bold text-white">{question}</span>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-black/40 ${tagColor} transition duration-300 group-open:rotate-180`}>
          <ChevronDown className="h-4 w-4" />
        </span>
      </summary>
      <div className="border-t border-slate-800/80 bg-[#050D1A]/70 px-6 py-5">
        <p className="text-sm leading-7 text-slate-300">{answer}</p>
      </div>
    </details>
  );
}

function SocialButton({ href, icon, label, color }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-2.5 rounded-xl ${color} px-5 py-3 text-xs font-bold text-white shadow-lg transition duration-300 hover:-translate-y-0.5`}
    >
      <span className="text-sm transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <span>{label}</span>
      <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
    </a>
  );
}

export default LandingPage;