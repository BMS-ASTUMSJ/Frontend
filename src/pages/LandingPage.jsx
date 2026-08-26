import { Link } from "react-router-dom";
import { ArrowRight, Code2, Users, Trophy, CheckCircle2 } from "lucide-react";

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
  const handleLearnMore = () => {
    toast.success("Explore the ASTU MSJ Bootcamp and discover your path!");
  };

  const handleApply = () => {
    toast.success("Let's get started with your bootcamp application!");
  };

  return (
    <div className="min-h-screen bg-[#eaf1f5] text-[#1c2d33] font-sans antialiased">
      {/* Hero Section - Circle 1 */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#07131e] px-6 pt-28 pb-44 md:px-12 lg:px-20 scroll-mt-24"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(7, 19, 30, 0.45), rgba(7, 19, 30, 0.85)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#E3F5F9]/10 pointer-events-none z-0" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              ASTU MSJ Bootcamp
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
              Bootcamp.
              <br />
              <span className="block text-[#8bc3d6]">Basecamp.</span>
              Boomcamp.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-gray-300 md:text-base">
              A practical bootcamp designed to help students develop real-world
              software engineering skills through hands-on projects, competitive
              programming, teamwork, and mentorship.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                onClick={handleApply}
                className="inline-flex items-center gap-2 rounded-lg bg-[#00a6c0] px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#076277]"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#about"
                onClick={handleLearnMore}
                className="rounded-lg border border-white/30 bg-black/20 px-6 py-3 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-10 text-center text-white shadow-2xl backdrop-blur-md">
              <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full border border-white/10 opacity-30 pointer-events-none" />

              <p
                className="text-3xl font-serif text-slate-100 tracking-wide md:text-4xl"
                dir="rtl"
              >
                رَّبِّ زِدْنِي عِلْمًا
              </p>
              <div className="my-4 mx-auto h-px w-12 bg-cyan-400/50" />
              <p className="text-sm font-medium text-gray-200">
                My Lord, increase me in knowledge.
              </p>
              <p className="mt-2 text-xs text-gray-400">(Qur'an 20:114)</p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none z-10">
          <svg
            className="relative block w-full h-16 text-[#eaf1f5]"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C150,90 350,-40 500,60 C650,160 900,10 1200,40 L1200,120 L0,120 Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
      </section>

      {/* Quick Info Cards - Circle 2 */}
      <section className="-mt-16 relative z-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div className="mx-auto max-w-7xl grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-cyan-100/80 p-3 text-[#0a7a93]">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#1c2d33]">
              Practical Learning
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Learn by building projects and solving problems instead of relying
              only on theoretical lessons.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-cyan-100/80 p-3 text-[#0a7a93]">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#1c2d33]">
              Mentorship
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Get guidance, feedback, and support from experienced mentors
              throughout your learning journey.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80 transition duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="inline-flex rounded-xl bg-cyan-100/80 p-3 text-[#0a7a93]">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-bold text-[#1c2d33]">
              Challenges
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Improve your problem-solving skills through competitive
              programming and technical challenges.
            </p>
          </div>
        </div>
      </section>

      {/* About Section - Circle 3 */}
      <section
        id="about"
        className="relative scroll-mt-20 bg-[#eaf1f5] px-6 py-24 md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full border border-[#293E4C]/70 bg-[#293E4C]/20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#00a6c0]">
              ABOUT THE BOOTCAMP
            </p>

            <h2 className="text-3xl font-extrabold text-[#1c2d33] md:text-4xl">
              More than just
              <br />
              learning how to code.
            </h2>

            <p className="mt-6 text-xs leading-relaxed text-gray-600 md:text-sm">
              The ASTU MSJ Bootcamp is a practical learning environment where
              students can turn their knowledge into real skills. Instead of
              focusing only on theory, the bootcamp gives students the
              opportunity to work on projects, solve programming challenges,
              collaborate with other students, receive guidance from mentors,
              and experience the development process from idea to completion.
            </p>

            <p className="mt-4 text-xs leading-relaxed text-gray-600 md:text-sm">
              Throughout the program, students are encouraged to improve their
              problem-solving abilities, strengthen their understanding of
              software development, and develop the confidence needed to work on
              real-world technology projects.
            </p>
          </div>

          <div className="flex justify-center lg:justify-end [perspective:1200px]">
            <div className="relative w-full max-w-md transform-gpu transition-transform duration-500 ease-out hover:rotate-y-0 hover:rotate-x-0 [transform:rotateY(-16deg)_rotateX(8deg)_rotateZ(2deg)] rounded-tl-[80px] rounded-br-[80px] rounded-tr-2xl rounded-bl-2xl border border-cyan-400/30 bg-[#071d24]/90 p-10 text-center text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#00a6c0]/20 blur-2xl pointer-events-none" />
              <div className="absolute -left-8 -bottom-8 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

              <p
                className="relative z-10 text-xl font-serif text-slate-100 tracking-wide leading-relaxed font-medium"
                dir="rtl"
              >
                مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ
                لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ
              </p>

              <div className="relative z-10 my-5 mx-auto h-px w-12 bg-cyan-400/50" />

              <p className="relative z-10 text-xs font-medium text-gray-300 leading-relaxed italic">
                "Whoever travels a path in search of knowledge, Allah will make
                easy for him a path to Paradise."
              </p>

              <p className="relative z-10 mt-2 text-[11px] font-semibold text-cyan-300">
                — Sahih Muslim 2699
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks Section - Circle 4 */}
      <section
        id="tracks"
        className="relative scroll-mt-20 bg-[#eaf1f5] px-6 pb-24 md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full border border-[#293E4C]/70 bg-[#293E4C]/20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#00a6c0]">
              TRACKS
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#1c2d33] md:text-4xl">
              Choose your path.
            </h2>

            <p className="mt-2 text-xs text-gray-600 md:text-sm">
              Build a strong foundation and develop skills that match your
              interests.
            </p>
          </div>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="inline-flex rounded-xl bg-[#0a7a93] p-3 text-white">
                <Code2 className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#1c2d33]">
                Full-Stack Web Development
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Learn frontend and backend development while building complete
                web applications using modern technologies.
              </p>

              <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
                {[
                  "Frontend Development",
                  "Backend Development",
                  "REST APIs",
                  "Databases",
                  "Full-Stack Projects",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0a7a93]" />
                    <span className="text-xs font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Code2 className="absolute -right-6 -bottom-6 h-40 w-40 opacity-5 pointer-events-none text-slate-800" />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="inline-flex rounded-xl bg-[#0a7a93] p-3 text-white">
                <Trophy className="h-6 w-6" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#1c2d33]">
                Competitive Programming
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                Strengthen your algorithms, data structures, logical thinking,
                and problem-solving abilities.
              </p>

              <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-6">
                {[
                  "Algorithms",
                  "Data Structures",
                  "Problem Solving",
                  "Contest Practice",
                  "Codeforces Preparation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-[#0a7a93]" />
                    <span className="text-xs font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <Trophy className="absolute -right-6 -bottom-6 h-40 w-40 opacity-5 pointer-events-none text-slate-800" />
            </div>
          </div>
        </div>
      </section>

      {/* Mentors Section - Circle 5 */}
      <section
        id="mentors"
        className="scroll-mt-20 relative overflow-hidden bg-[#07131e] px-6 py-24 md:px-12 lg:px-20 text-white"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(7, 19, 30, 0.85), rgba(7, 19, 30, 0.95)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute -left-28 bottom-10 h-72 w-72 rounded-full border border-[#293E4C]/60 bg-[#293E4C]/20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
              MENTORS
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
              Learn with people
              <br />
              who guide you.
            </h2>

            <p className="mt-4 max-w-xl text-xs leading-relaxed text-gray-300 md:text-sm">
              Our mentors help students understand difficult concepts, improve
              their projects, solve technical problems, and stay motivated
              throughout the bootcamp.
            </p>
          </div>

          <div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-[#0a7a93] p-3 text-white shrink-0">
                  <Users className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Guidance beyond the classroom
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-gray-300">
                    Mentorship is an important part of the bootcamp. Students
                    have access to people who can provide technical feedback,
                    project guidance, career advice, and support when they face
                    challenges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verse Banner Section - Circle 6 */}
      <section className="bg-[#07131e] px-6 pb-20 md:px-12 lg:px-20 relative overflow-hidden">
        <div className="absolute -bottom-40 right-[-80px] h-[440px] w-[440px] rounded-full border border-[#293E4C]/60 bg-[#293E4C]/20 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-2xl border border-white/10 p-10 text-center text-white shadow-2xl"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(7, 19, 30, 0.95), rgba(7, 19, 30, 0.4)), url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2000&auto=format&fit=crop')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute left-0 top-0 -ml-16 -mt-16 h-48 w-48 rounded-full border border-white/10 opacity-20 pointer-events-none" />

            <p
              className="text-3xl font-serif text-slate-100 tracking-wide md:text-4xl"
              dir="rtl"
            >
              إِنَّ مَعَ الْعُسْرِ يُسْرًا
            </p>
            <p className="mt-3 text-sm font-medium text-gray-200">
              Indeed, with hardship [will be] ease.
            </p>
            <p className="mt-1 text-xs text-gray-400">(Qur'an 94:6)</p>
          </div>
        </div>
      </section>

      {/* FAQ Section - Circle 7 */}
      <section
        id="faq"
        className="relative scroll-mt-20 bg-[#eaf1f5] px-6 py-20 md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="absolute left-[42%] top-[44%] h-24 w-24 rounded-full border border-[#B4D7E2]/10 bg-[#B4D7E2]/5 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-[#00a6c0]">
              FAQ
            </p>

            <h2 className="text-3xl font-extrabold text-[#1c2d33] md:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-2 text-xs text-gray-600 md:text-sm">
              Find answers to some of the most common questions about the ASTU
              MSJ Bootcamp.
            </p>
          </div>

          <div className="space-y-3">
            <details className="group rounded-xl bg-white p-2 shadow-sm border border-slate-200/80 transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-3 text-sm font-semibold text-[#1c2d33]">
                <span>Who can join the bootcamp?</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#0a7a93] text-xs transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  The bootcamp is designed for students who are interested in
                  software development, competitive programming, and improving
                  their practical technical skills.
                </p>
              </div>
            </details>

            <details className="group rounded-xl bg-white p-2 shadow-sm border border-slate-200/80 transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-3 text-sm font-semibold text-[#1c2d33]">
                <span>Do I need previous programming experience?</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#0a7a93] text-xs transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  No. Beginners are welcome. The bootcamp provides structured
                  learning activities that help students improve their
                  programming knowledge and practical skills.
                </p>
              </div>
            </details>

            <details className="group rounded-xl bg-white p-2 shadow-sm border border-slate-200/80 transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-3 text-sm font-semibold text-[#1c2d33]">
                <span>What tracks are available?</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#0a7a93] text-xs transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  Students can explore tracks such as Full-Stack Web Development
                  and Competitive Programming.
                </p>
              </div>
            </details>

            <details className="group rounded-xl bg-white p-2 shadow-sm border border-slate-200/80 transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-3 text-sm font-semibold text-[#1c2d33]">
                <span>Will I work on real projects?</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#0a7a93] text-xs transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  Yes. Students work on practical projects that allow them to
                  apply what they learn and gain experience working with modern
                  development technologies.
                </p>
              </div>
            </details>

            <details className="group rounded-xl bg-white p-2 shadow-sm border border-slate-200/80 transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-3 text-sm font-semibold text-[#1c2d33]">
                <span>How can I apply?</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-[#0a7a93] text-xs transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-slate-100 px-5 py-3">
                <p className="text-xs leading-relaxed text-gray-500">
                  Click the Apply Now button and complete the registration form
                  with your information.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Contact Section - Circle 8 */}
      <section
        id="contact"
        className="relative scroll-mt-20 bg-[#1a3b45] px-6 py-20 text-white md:px-12 lg:px-20 overflow-hidden"
      >
        <div className="absolute left-[15%] top-[58%] h-12 w-12 rounded-full bg-[#00A8CC]/10 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
            CONTACT US
          </p>

          <h2 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
            Have a Question?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-gray-300 md:text-sm">
            Take the next step in your software engineering journey and become
            part of the ASTU MSJ Bootcamp. Connect with us through our social
            media platforms.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://t.me/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#229ED9] text-white shadow-md transition hover:-translate-y-1 hover:brightness-110"
              aria-label="Telegram"
            >
              <FaTelegramPlane className="h-5 w-5" />
            </a>

            <a
              href="https://facebook.com/your_page"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md transition hover:-translate-y-1 hover:brightness-110"
              aria-label="Facebook"
            >
              <FaFacebookF className="h-4 w-4" />
            </a>

            <a
              href="https://instagram.com/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-md transition hover:-translate-y-1 hover:shadow-lg"
              aria-label="Instagram"
            >
              <FaInstagram className="h-5 w-5" />
            </a>

            <a
              href="https://linkedin.com/company/your_company"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A66C2] text-white shadow-md transition hover:-translate-y-1 hover:brightness-110"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn className="h-4 w-4" />
            </a>

            <a
              href="https://github.com/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#24292F] text-white shadow-md transition hover:-translate-y-1 hover:brightness-110"
              aria-label="GitHub"
            >
              <FaGithub className="h-4 w-4" />
            </a>

            <a
              href="mailto:your@email.com"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a7a93] text-white shadow-md transition hover:-translate-y-1 hover:bg-[#076277]"
              aria-label="Email"
            >
              <FaEnvelope className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#071b23] px-6 py-6 text-center">
        <p className="text-xs text-gray-500">
          © 2026 ASTU MSJ Bootcamp. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
