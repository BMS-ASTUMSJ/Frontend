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
    <div className="min-h-screen bg-[#F6FAFD] text-[#0A1931]">
      {/* =========================
          HOME
      ========================== */}
      <section
        id="home"
        className="relative overflow-hidden bg-[#0A1931] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          {/* Hero Text */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#1A3D63] px-4 py-2 text-sm font-medium text-[#B3CFE5]">
              <span className="h-2 w-2 rounded-full bg-[#B3CFE5]" />
              ASTU MSJ Bootcamp
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight text-white md:text-6xl">
              Learn.
              <span className="text-[#B3CFE5]"> Build.</span>
              <br />
              Compete.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#B3CFE5]">
              A practical bootcamp designed to help students develop real-world
              software engineering skills through hands-on projects, competitive
              programming, teamwork, and mentorship.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                onClick={handleApply}
                className="inline-flex items-center gap-2 rounded-xl bg-[#4A7FA7] px-6 py-3 font-bold text-white transition hover:bg-[#1A3D63]"
              >
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </Link>

              <a
                href="#about"
                onClick={handleLearnMore}
                className="rounded-xl border border-[#B3CFE5]/40 px-6 py-3 font-semibold text-white transition hover:bg-[#1A3D63]"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative">
            <div className="rounded-3xl bg-[#1A3D63] p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#B3CFE5]">Bootcamp</p>

                  <h2 className="text-2xl font-bold text-white">
                    Your journey starts here.
                  </h2>
                </div>

                <div className="rounded-xl bg-[#4A7FA7] p-3">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-[#0A1931] p-4">
                  <p className="text-sm text-[#B3CFE5]">01</p>

                  <p className="mt-1 font-semibold text-white">
                    Learn modern technologies
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0A1931] p-4">
                  <p className="text-sm text-[#B3CFE5]">02</p>

                  <p className="mt-1 font-semibold text-white">
                    Build real-world projects
                  </p>
                </div>

                <div className="rounded-2xl bg-[#0A1931] p-4">
                  <p className="text-sm text-[#B3CFE5]">03</p>

                  <div>
                    <h3 className="font-semibold text-white">
                      Create & Compete!
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-[#B3CFE5]">
                      Build projects and challenge yourself through contests.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================== */}
      <section
        id="about"
        className="scroll-mt-16 bg-[#B3CFE5] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-[#4A7FA7]">
              About the Bootcamp
            </p>

            <h2 className="text-4xl font-black text-[#0A1931] md:text-5xl">
              More than just learning how to code.
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#1A3D63]">
              The ASTU MSJ Bootcamp is a practical learning environment where
              students can turn their knowledge into real skills. Instead of
              focusing only on theory, the bootcamp gives students the
              opportunity to work on projects, solve programming challenges,
              collaborate with other students, receive guidance from mentors,
              and experience the development process from idea to completion.
            </p>

            <p className="mt-5 text-lg leading-8 text-[#1A3D63]">
              Throughout the program, students are encouraged to improve their
              problem-solving abilities, strengthen their understanding of
              software development, and develop the confidence needed to work on
              real-world technology projects.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* Practical Learning */}
            <div className="rounded-3xl bg-[#4A7FA7] p-7">
              <Code2 className="h-8 w-8 text-[#0A1931]" />

              <h3 className="mt-5 text-xl font-bold text-[#0A1931]">
                Practical Learning
              </h3>

              <p className="mt-3 leading-7 text-white">
                Learn by building projects and solving problems instead of
                relying only on theoretical lessons.
              </p>
            </div>

            {/* Mentorship */}
            <div className="rounded-3xl bg-[#1A3D63] p-7 text-white">
              <Users className="h-8 w-8 text-white" />

              <h3 className="mt-5 text-xl font-bold">Mentorship</h3>

              <p className="mt-3 leading-7 text-[#F6FAFD]">
                Get guidance, feedback, and support from experienced mentors
                throughout your learning journey.
              </p>
            </div>

            {/* Challenges */}
            <div className="rounded-3xl bg-[#0A1931] p-7 text-white">
              <Trophy className="h-8 w-8 text-[#B3CFE5]" />

              <h3 className="mt-5 text-xl font-bold">Challenges</h3>

              <p className="mt-3 leading-7 text-[#B3CFE5]">
                Improve your problem-solving skills through competitive
                programming and technical challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          TRACKS
      ========================== */}
      <section
        id="tracks"
        className="bg-[#B3CFE5] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#1A3D63]">
              Tracks
            </p>

            <h2 className="mt-3 text-4xl font-black text-[#0A1931]">
              Choose your path.
            </h2>

            <p className="mt-4 text-lg text-[#1A3D63]">
              Build a strong foundation and develop skills that match your
              interests.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Full-Stack */}
            <div className="rounded-3xl bg-[#0A1931] p-8 text-white">
              <Code2 className="h-9 w-9 text-[#B3CFE5]" />

              <h3 className="mt-6 text-2xl font-bold">
                Full-Stack Web Development
              </h3>

              <p className="mt-4 leading-7 text-[#B3CFE5]">
                Learn frontend and backend development while building complete
                web applications using modern technologies.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Frontend Development",
                  "Backend Development",
                  "REST APIs",
                  "Databases",
                  "Full-Stack Projects",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-[#B3CFE5]" />

                    <span className="font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitive Programming */}
            <div className="rounded-3xl bg-[#4A7FA7] p-8 shadow-sm">
              <Trophy className="h-9 w-9 text-[#B3CFE5]" />

              <h3 className="mt-6 text-2xl font-bold text-white">
                Competitive Programming
              </h3>

              <p className="mt-4 leading-7 text-white">
                Strengthen your algorithms, data structures, logical thinking,
                and problem-solving abilities.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Algorithms",
                  "Data Structures",
                  "Problem Solving",
                  "Contest Practice",
                  "Codeforces Preparation",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-white" />

                    <span className="font-bold text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          MENTORS
      ========================== */}
      <section
        id="mentors"
        className="scroll-mt-16 bg-[#1A3D63] px-6 py-24 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-4xl font-bold uppercase text-white">Mentors</p>

          <h2 className="mt-3 text-4xl font-black text-[#4A7FA7]">
            Learn with people who guide you.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#B3CFE5]">
            Our mentors help students understand difficult concepts, improve
            their projects, solve technical problems, and stay motivated
            throughout the bootcamp.
          </p>

          <div className="mx-auto mt-12 max-w-3xl rounded-3xl bg-[#0A1931] p-10 text-left">
            <div className="flex items-start gap-5">
              <div className="rounded-2xl bg-[#4A7FA7] p-4">
                <Users className="h-7 w-7 text-white" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white">
                  Guidance beyond the classroom
                </h3>

                <p className="mt-3 leading-7 text-[#B3CFE5]">
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
          FAQ
      ========================== */}
      <section
        id="faq"
        className="scroll-mt-16 bg-[#4A7FA7] px-6 py-20 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#0A1931]">
              FAQ
            </p>

            <h2 className="text-3xl font-bold text-[#0A1931] md:text-4xl">
              Frequently Asked Questions
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white">
              Find answers to some of the most common questions about the ASTU
              MSJ Bootcamp.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="group rounded-2xl border border-[#B3CFE5] bg-[#B3CFE5] transition hover:border-[#1A3D63]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5">
                <span className="font-semibold text-[#0A1931]">
                  Who can join the bootcamp?
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#4A7FA7] px-6 py-5">
                <p className="leading-7 text-slate-600">
                  The bootcamp is designed for students who are interested in
                  software development, competitive programming, and improving
                  their practical technical skills.
                </p>
              </div>
            </details>

            {/* FAQ 2 */}
            <details className="group rounded-2xl border border-[#B3CFE5] bg-[#B3CFE5] transition hover:border-[#1A3D63]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5">
                <span className="font-semibold text-[#0A1931]">
                  Do I need previous programming experience?
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#4A7FA7] px-6 py-5">
                <p className="leading-7 text-slate-600">
                  No. Beginners are welcome. The bootcamp provides structured
                  learning activities that help students improve their
                  programming knowledge and practical skills.
                </p>
              </div>
            </details>

            {/* FAQ 3 */}
            <details className="group rounded-2xl border border-[#B3CFE5] bg-[#B3CFE5] transition hover:border-[#1A3D63]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5">
                <span className="font-semibold text-[#0A1931]">
                  What tracks are available?
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#4A7FA7] px-6 py-5">
                <p className="leading-7 text-slate-600">
                  Students can explore tracks such as Full-Stack Web Development
                  and Competitive Programming.
                </p>
              </div>
            </details>

            {/* FAQ 4 */}
            <details className="group rounded-2xl border border-[#B3CFE5] bg-[#B3CFE5] transition hover:border-[#1A3D63]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5">
                <span className="font-semibold text-[#0A1931]">
                  Will I work on real projects?
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#4A7FA7] px-6 py-5">
                <p className="leading-7 text-slate-600">
                  Yes. Students work on practical projects that allow them to
                  apply what they learn and gain experience working with modern
                  development technologies.
                </p>
              </div>
            </details>

            {/* FAQ 5 */}
            <details className="group rounded-2xl border border-[#B3CFE5] bg-[#B3CFE5] transition hover:border-[#1A3D63]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5">
                <span className="font-semibold text-[#0A1931]">
                  How can I apply?
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4A7FA7] text-white transition group-open:rotate-180">
                  ↓
                </span>
              </summary>

              <div className="border-t border-[#4A7FA7] px-6 py-5">
                <p className="leading-7 text-slate-600">
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
        className="bg-[#0A1931] px-6 py-20 md:px-12 lg:px-20"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#4A7FA7]">
            Contact Us
          </p>

          <h2 className="mt-3 text-4xl font-black text-white md:text-5xl">
            Have a Question?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#B3CFE5]">
            Take the next step in your software engineering journey and become
            part of the ASTU MSJ Bootcamp. Connect with us through our social
            media platforms.
          </p>

          {/* Social Media Links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {/* Telegram */}
            <a
              href="https://t.me/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#229ED9] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#168ac0]"
            >
              <FaTelegramPlane className="h-4 w-4" />
              <span>Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com/your_page"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#1877F2] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#0d65d9]"
            >
              <FaFacebookF className="h-4 w-4" />
              <span>Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <FaInstagram className="h-4 w-4" />
              <span>Instagram</span>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/your_company"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#0859a8]"
            >
              <FaLinkedinIn className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/your_username"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-[#24292F] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#171a1d]"
            >
              <FaGithub className="h-4 w-4" />
              <span>GitHub</span>
            </a>

            {/* Email */}
            <a
              href="mailto:your@email.com"
              className="flex items-center gap-2 rounded-xl bg-[#4A7FA7] px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-[#1A3D63]"
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
      <footer className="border-t border-[#1A3D63] bg-[#0A1931] px-6 py-8 text-center">
        <p className="text-sm text-[#B3CFE5]">
          © 2026 ASTU MSJ Bootcamp. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
