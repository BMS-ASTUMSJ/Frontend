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
    <div className="min-h-screen bg-[#f8f9fa] text-[#1c2d33] font-sans antialiased">
      {/* =========================
          HOME / HERO SECTION
      ========================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-[#1b3c47] via-[#0f2b34] to-[#071b23] px-6 pt-16 pb-32 md:px-12 lg:px-20"
      >
        {/* Subtle Radial Glow Effects */}
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#48636c]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 h-80 w-80 rounded-full bg-[#1a3b45]/40 blur-2xl pointer-events-none" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          {/* Hero Text */}
          <div className="z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#89bdcb]/30 bg-[#0f2b34]/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#9fc4cf] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#d8f1f4]" />
              ASTU MSJ Bootcamp
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              Bootcamp.
              <span className="text-[#9bc5d0]">
                {" "}
                <br />
                Basecamp.
              </span>
              <br />
              Boomcamp.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#cbe0e5] md:text-lg">
              A practical bootcamp designed to help students develop real-world
              software engineering skills through hands-on projects, competitive
              programming, teamwork, and mentorship.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                onClick={handleApply}
                className="inline-flex items-center gap-2 rounded-full bg-[#0a7a93] px-7 py-3 font-bold text-white shadow-lg transition duration-200 hover:bg-[#076277]"
              >
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#about"
                onClick={handleLearnMore}
                className="rounded-full border border-[#89bdcb]/40 px-7 py-3 font-semibold text-[#cbe0e5] transition duration-200 hover:bg-[#1a3b45]/60 hover:text-white"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero UI Floating Card */}
          <div className="relative z-10">
            <div className="rounded-[2.5rem] bg-[#ffffff] p-6 shadow-2xl border border-[#d1e0e4]">
              <div className="mb-6 flex items-center justify-between border-b border-[#d5e0e3] pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#71828a]">
                    Bootcamp
                  </p>
                  <h2 className="text-2xl font-bold text-[#1c2d33]">
                    Your journey starts here.
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#0a7a93] p-3 text-white shadow-md">
                  <Code2 className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-2xl bg-[#f0f5f7] p-4 transition hover:bg-[#e8f4f7] border border-[#d1e0e4]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f768e] text-sm font-bold text-white">
                    01
                  </span>
                  <p className="font-semibold text-[#22353c]">
                    Learn modern technologies
                  </p>
                </div>

                <div className="flex items-center gap-4 rounded-2xl bg-[#f0f5f7] p-4 transition hover:bg-[#e8f4f7] border border-[#d1e0e4]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f768e] text-sm font-bold text-white">
                    02
                  </span>
                  <p className="font-semibold text-[#22353c]">
                    Build real-world projects
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f0f5f7] p-4 transition hover:bg-[#e8f4f7] border border-[#d1e0e4]">
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f768e] text-sm font-bold text-white">
                      03
                    </span>
                    <h3 className="font-semibold text-[#22353c]">
                      Create & Compete!
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#51646c] pl-14">
                    Build projects and challenge yourself through contests.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved Wave Bottom Divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            className="relative block w-full h-16 text-[#f0f5f7]"
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

      {/* =========================
          ABOUT SECTION
      ========================== */}
      <section
        id="about"
        className="scroll-mt-16 bg-[#f0f5f7] px-6 py-24 md:px-12 lg:px-20 relative"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0f768e]">
              About the Bootcamp
            </p>

            <h2 className="text-3xl font-black text-[#1c2d33] md:text-5xl">
              More than just learning how to code.
            </h2>

            <p className="mt-6 text-base leading-relaxed text-[#354850] md:text-lg">
              The ASTU MSJ Bootcamp is a practical learning environment where
              students can turn their knowledge into real skills. Instead of
              focusing only on theory, the bootcamp gives students the
              opportunity to work on projects, solve programming challenges,
              collaborate with other students, receive guidance from mentors,
              and experience the development process from idea to completion.
            </p>

            <p className="mt-4 text-base leading-relaxed text-[#354850] md:text-lg">
              Throughout the program, students are encouraged to improve their
              problem-solving abilities, strengthen their understanding of
              software development, and develop the confidence needed to work on
              real-world technology projects.
            </p>
          </div>

          {/* Cards styled with light theme palette */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Practical Learning */}
            <div className="rounded-3xl bg-[#ffffff] p-8 shadow-md border border-[#d1e0e4] transition duration-300 hover:-translate-y-1">
              <div className="inline-flex rounded-2xl bg-[#e8f4f7] p-4 text-[#0f768e]">
                <Code2 className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#1c2d33]">
                Practical Learning
              </h3>

              <p className="mt-3 leading-relaxed text-[#51646c]">
                Learn by building projects and solving problems instead of
                relying only on theoretical lessons.
              </p>
            </div>

            {/* Mentorship */}
            <div className="rounded-3xl bg-[#ffffff] p-8 shadow-md border border-[#d1e0e4] transition duration-300 hover:-translate-y-1">
              <div className="inline-flex rounded-2xl bg-[#0a7a93] p-4 text-white">
                <Users className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#1c2d33]">
                Mentorship
              </h3>

              <p className="mt-3 leading-relaxed text-[#51646c]">
                Get guidance, feedback, and support from experienced mentors
                throughout your learning journey.
              </p>
            </div>

            {/* Challenges */}
            <div className="rounded-3xl bg-[#ffffff] p-8 shadow-md border border-[#d1e0e4] transition duration-300 hover:-translate-y-1">
              <div className="inline-flex rounded-2xl bg-[#1b3c47] p-4 text-white">
                <Trophy className="h-8 w-8" />
              </div>

              <h3 className="mt-6 text-xl font-bold text-[#1c2d33]">
                Challenges
              </h3>

              <p className="mt-3 leading-relaxed text-[#51646c]">
                Improve your problem-solving skills through competitive
                programming and technical challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TRACKS SECTION
      ========================== */}
      <section
        id="tracks"
        className="bg-[#ffffff] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#0f768e]">
              Tracks
            </p>

            <h2 className="mt-2 text-3xl font-black text-[#1c2d33] md:text-4xl">
              Choose your path.
            </h2>

            <p className="mt-3 text-base text-[#51646c] md:text-lg">
              Build a strong foundation and develop skills that match your
              interests.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {/* Full-Stack */}
            <div className="rounded-3xl border border-[#d1e0e4] bg-[#f0f5f7] p-8 shadow-md transition hover:shadow-xl">
              <div className="inline-flex rounded-2xl bg-[#1b3c47] p-3 text-white">
                <Code2 className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#1c2d33]">
                Full-Stack Web Development
              </h3>

              <p className="mt-3 leading-relaxed text-[#51646c]">
                Learn frontend and backend development while building complete
                web applications using modern technologies.
              </p>

              <div className="mt-6 space-y-3 border-t border-[#d5e0e3] pt-6">
                {[
                  "Frontend Development",
                  "Backend Development",
                  "REST APIs",
                  "Databases",
                  "Full-Stack Projects",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0f768e]" />
                    <span className="font-medium text-[#22353c]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Programming */}
            <div className="rounded-3xl border border-[#d1e0e4] bg-[#f0f5f7] p-8 shadow-md transition hover:shadow-xl">
              <div className="inline-flex rounded-2xl bg-[#0a7a93] p-3 text-white">
                <Trophy className="h-7 w-7" />
              </div>

              <h3 className="mt-6 text-2xl font-bold text-[#1c2d33]">
                Competitive Programming
              </h3>

              <p className="mt-3 leading-relaxed text-[#51646c]">
                Strengthen your algorithms, data structures, logical thinking,
                and problem-solving abilities.
              </p>

              <div className="mt-6 space-y-3 border-t border-[#d5e0e3] pt-6">
                {[
                  "Algorithms",
                  "Data Structures",
                  "Problem Solving",
                  "Contest Practice",
                  "Codeforces Preparation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#0f768e]" />
                    <span className="font-medium text-[#22353c]">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          MENTORS SECTION
      ========================== */}
      <section
        id="mentors"
        className="scroll-mt-16 bg-gradient-to-br from-[#1b3c47] via-[#0f2b34] to-[#071b23] px-6 py-24 md:px-12 lg:px-20 text-white"
      >
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#9fc4cf]">
            Mentors
          </p>

          <h2 className="mt-2 text-3xl font-black text-white md:text-5xl">
            Learn with people who guide you.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#cbe0e5] md:text-lg">
            Our mentors help students understand difficult concepts, improve
            their projects, solve technical problems, and stay motivated
            throughout the bootcamp.
          </p>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl bg-[#0f2b34]/90 p-8 text-left border border-[#89bdcb]/30 shadow-2xl md:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <div className="rounded-2xl bg-[#0a7a93] p-4 text-white shadow-md shrink-0">
                <Users className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Guidance beyond the classroom
                </h3>

                <p className="mt-3 leading-relaxed text-[#cbe0e5]">
                  Mentorship is an important part of the bootcamp. Students have
                  access to people who can provide technical feedback, project
                  guidance, career advice, and support when they face
                  challenges.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FAQ SECTION
      ========================== */}
      <section
        id="faq"
        className="scroll-mt-16 bg-[#f0f5f7] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0f768e]">
              FAQ
            </p>

            <h2 className="text-3xl font-bold text-[#1c2d33] md:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 max-w-xl mx-auto text-base text-[#51646c]">
              Find answers to some of the most common questions about the ASTU
              MSJ Bootcamp.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group rounded-2xl bg-[#ffffff] p-2 shadow-sm border border-[#d1e0e4] transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 font-semibold text-[#1c2d33]">
                <span>Who can join the bootcamp?</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f4f7] text-[#0f768e] transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#d5e0e3] px-6 py-4">
                <p className="leading-relaxed text-[#51646c]">
                  The bootcamp is designed for students who are interested in
                  software development, competitive programming, and improving
                  their practical technical skills.
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group rounded-2xl bg-[#ffffff] p-2 shadow-sm border border-[#d1e0e4] transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 font-semibold text-[#1c2d33]">
                <span>Do I need previous programming experience?</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f4f7] text-[#0f768e] transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#d5e0e3] px-6 py-4">
                <p className="leading-relaxed text-[#51646c]">
                  No. Beginners are welcome. The bootcamp provides structured
                  learning activities that help students improve their
                  programming knowledge and practical skills.
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group rounded-2xl bg-[#ffffff] p-2 shadow-sm border border-[#d1e0e4] transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 font-semibold text-[#1c2d33]">
                <span>What tracks are available?</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f4f7] text-[#0f768e] transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#d5e0e3] px-6 py-4">
                <p className="leading-relaxed text-[#51646c]">
                  Students can explore tracks such as Full-Stack Web Development
                  and Competitive Programming.
                </p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group rounded-2xl bg-[#ffffff] p-2 shadow-sm border border-[#d1e0e4] transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 font-semibold text-[#1c2d33]">
                <span>Will I work on real projects?</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f4f7] text-[#0f768e] transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#d5e0e3] px-6 py-4">
                <p className="leading-relaxed text-[#51646c]">
                  Yes. Students work on practical projects that allow them to
                  apply what they learn and gain experience working with modern
                  development technologies.
                </p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="group rounded-2xl bg-[#ffffff] p-2 shadow-sm border border-[#d1e0e4] transition hover:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-4 font-semibold text-[#1c2d33]">
                <span>How can I apply?</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8f4f7] text-[#0f768e] transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#d5e0e3] px-6 py-4">
                <p className="leading-relaxed text-[#51646c]">
                  Click the Apply Now button and complete the registration form
                  with your information.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* =========================
          CONTACT / SOCIAL MEDIA
      ========================== */}
      <section
        id="contact"
        className="bg-[#071b23] px-6 py-24 md:px-12 lg:px-20 text-white"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0f768e]">
            Contact Us
          </p>

          <h2 className="mt-2 text-3xl font-black text-white md:text-5xl">
            Have a Question?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#cbe0e5]/80 md:text-lg">
            Take the next step in your software engineering journey and become
            part of the ASTU MSJ Bootcamp. Connect with us through our social
            media platforms.
          </p>

          {/* Social Media Links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {/* Telegram */}
            <a
              href="https://t.me/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#229ED9] px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-1 hover:brightness-110"
            >
              <FaTelegramPlane className="h-4 w-4" />
              <span>Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/your_page"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#1877F2] px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-1 hover:brightness-110"
            >
              <FaFacebookF className="h-4 w-4" />
              <span>Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <FaInstagram className="h-4 w-4" />
              <span>Instagram</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/your_company"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#0A66C2] px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-1 hover:brightness-110"
            >
              <FaLinkedinIn className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#24292F] px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-1 hover:brightness-110"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            {/* Email */}
            <a
              href="mailto:your@email.com"
              className="flex items-center gap-2 rounded-full bg-[#0a7a93] px-5 py-3 text-sm font-semibold text-white shadow-md transition duration-300 hover:-translate-y-1 hover:bg-[#076277]"
            >
              <FaEnvelope className="h-4 w-4" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================
          FOOTER
      ========================== */}
      <footer className="border-t border-[#1a3b45] bg-[#06151c] px-6 py-8 text-center">
        <p className="text-sm text-[#7d959e]">
          © 2026 ASTU MSJ Bootcamp. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
