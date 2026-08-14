function LandingPage() {
  return (
    <main>
      <section
        id="home"
        className=" bg-[#F5F0E8] text- [#2B362E] relative min-h-screen bg-cover bg-center bg-no-repeat px-6 py-32"
      >
        <div className="absolute inset-0 bg-black/0"></div>

        <div className="relative z-10 mx-auto max-w-7xl text-center"></div>

        <div className="mx-auto max-w-7xl text-center"></div>

        <div className="mx-auto max-w-7xl text-center">
          -
          <span className="inline-block rounded-full  px-4 py-2 text-sm font-medium text-[#2B362E] bg-[#BFC4A3]">
            ASTU MSJ Bootcamp
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight  md:text-6xl">
            Manage Your Bootcamp
            <span className="block text-[#2B362E]">Smarter and Better</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#2B362E]">
            A centralized platform for managing students, mentors, attendance,
            progress, assignments, grades, and announcements.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button className="rounded-lg bg-[#2B362E] px-6 py-3 font-medium text-white transition hover:bg-#BFC4A3">
              Get Started
            </button>

            <button className="rounded-lg  bg-[#2B362E]  px-6 py-3 font-medium text-white transition hover:bg-#BFC4A3">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20 bg-[#F5F0E8]">
        <div className="mx-auto max-w-4xl text-center ">
          <h2 className="text-3xl font-bold ">About Our Bootcamp</h2>
          {/* 2. Second Paragraph */}
          <p className="mt-4 text-lg leading-8 text-gray-700">
            The bootcamp is designed for{" "}
            <strong className="font-semibold text-gray-900">
              12 intensive weeks
            </strong>{" "}
            of hands-on learning and project-based training, helping students
            build practical full-stack development skills.
          </p>

          {/* 3. Tech Stack Grid */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">🌐</div>
              <h3 className="text-xl font-bold text-gray-900">HTML & CSS</h3>
              <p className="text-gray-600 mt-1">Responsive web design</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">📄</div>
              <h3 className="text-xl font-bold text-gray-900">JavaScript</h3>
              <p className="text-gray-600 mt-1">Interactive web apps</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">⚛️</div>
              <h3 className="text-xl font-bold text-gray-900">React</h3>
              <p className="text-gray-600 mt-1">Modern frontend UI</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">💻</div>
              <h3 className="text-xl font-bold text-gray-900">
                Node & Express
              </h3>
              <p className="text-gray-600 mt-1">Backend APIs</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">🛢️</div>
              <h3 className="text-xl font-bold text-gray-900">MongoDB</h3>
              <p className="text-gray-600 mt-1">Database & Mongoose</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">🌿</div>
              <h3 className="text-xl font-bold text-gray-900">Git & GitHub</h3>
              <p
                className="text
            -gray-600 mt-1"
              >
                Version control
              </p>
            </div>
          </div>

          {/* 4. Highlights Bar */}
          <div className="mt-12 pt-8 border-t border-gray-300 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <h4 className="text-2xl font-bold text-gray-900">12 Weeks</h4>
              <p className="text-sm text-gray-600">Intensive Duration</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Hands-on</h4>
              <p className="text-sm text-gray-600">Project-Based Learning</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">Mentor-Led</h4>
              <p className="text-sm text-gray-600">Guided Support</p>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900">MERN Stack</h4>
              <p className="text-sm text-gray-600">Industry-Focused Skills</p>
            </div>
          </div>

          {/* 5. Methodology Paragraph */}
          <p className="mt-8 text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Students learn through{" "}
            <strong className="font-semibold text-gray-900">
              real assignments, attendance tracking, progress monitoring,
              feedback, and collaborative development
            </strong>
            , while mentors and admins manage the entire learning journey.
          </p>

          {/* 6. Goal Box */}
          <div className="mt-10 bg-white border border-gray-200 p-8 rounded-2xl shadow-sm max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Goal</h3>
            <p className="text-gray-700 leading-relaxed">
              To provide a professional, organized, and engaging environment
              where students can grow from beginners into confident full-stack
              developers ready for real-world projects.
            </p>
          </div>
        </div>
      </section>

      <section id="tracks" className="px-6 py-20 bg-[#F5F0E8]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#2B362E]">
              Learning Tracks
            </h2>

            <p className="mt-3 text-[#2B362E]/80 font-medium">
              Track your learning progress across different topics.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-[#2B362E]/10 bg-[#BFC4A3] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#2B362E]">
                Frontend Development
              </h3>

              <p className="mt-3 text-[#2B362E]/90 font-medium">
                Learn modern frontend technologies and build responsive web
                applications.
              </p>
            </div>

            <div className="rounded-xl border border-[#2B362E]/10 bg-[#BFC4A3] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#2B362E]">
                Backend Development
              </h3>

              <p className="mt-3 text-[#2B362E]/90 font-medium">
                Build APIs and backend systems using modern technologies.
              </p>
            </div>

            <div className="rounded-xl border border-[#2B362E]/10 bg-[#BFC4A3] p-6 shadow-sm">
              <h3 className="text-xl font-bold text-[#2B362E]">
                Competitive Programming
              </h3>

              <p className="mt-3 text-[#2B362E]/90 font-medium">
                Improve problem solving, algorithms, and data structures.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section id="faq" className=" px-6 py-20 bg-[#F5F0E8]">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 space-y-4 ">
            <div
              className="rounded-lg border border-slate-200 bg-white p-5
            "
            >
              <h3 className="font-semibold text-slate-900">
                Who can use the system?
              </h3>

              <p className="mt-2 text-slate-600">
                Administrators, mentors, and students can use the Bootcamp
                Management System.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-900">
                Can students see their progress?
              </h3>

              <p className="mt-2 text-slate-600">
                Yes. Students can view their attendance, progress, assignments,
                grades, and announcements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="mentors" className="px-6 py-20 bg-[#F5F0E8]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Our Mentors</h2>

          <p className="mt-4 text-lg text-slate-600">
            Our mentors guide students and manage their attendance, progress,
            assignments, and feedback.
          </p>
        </div>
      </section>

      <section id="contact" className="px-6 py-20 bg-[#F5F0E8]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900">Contact Us</h2>

          <p className="mt-4 text-lg text-slate-600">
            Have questions? Get in touch with the bootcamp team.
          </p>

          <button className="rounded-xl  bg-[#2B362E] px-4 py-2 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063]/40">
            Contact Us
          </button>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-[#2B362E] px-6 py-8 text-center text-white">
        <p>© 2026 ASTU MSJ Bootcamp Management System</p>
      </footer>
    </main>
  );
}

export default LandingPage;
