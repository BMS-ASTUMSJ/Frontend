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
          <span className="inline-block rounded-full  px-4 py-2 text-sm font-medium text-[#2B362E] bg-[#BFC4A3]">
            ASTU MSJ Bootcamp
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-6xl text-[#2B362E]">
            Build Skills.
            <span className="block text-[#6B8063]">Build Projects.</span>
            <span className="block text-[#BFC4A3]">Build Your Future.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#2B362E]">
            Learn, build, and grow through a structured bootcamp experience
            designed to turn your skills into real-world projects.
          </p>
        </div>
      </section>

      <section id="about" className="px-6 py-20 bg-[#F5F0E8]">
        <div className="mx-auto max-w-4xl text-center ">
          <h2 className="text-3xl font-bold ">About Our Bootcamp</h2>
          <p className="mt-4 text-lg leading-8 text-gray-700">
            The bootcamp is designed for{" "}
            <strong className="font-semibold text-gray-900">
              12 intensive weeks
            </strong>{" "}
            of hands-on learning and project-based training, helping students
            build practical full-stack development skills.
          </p>
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="text-xl font-bold text-gray-900">
                Competitive Programming
              </h3>
              <p className="text-gray-600 mt-1">Algorithms & problem solving</p>
            </div>
          </div>
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

          <p className="mt-8 text-base text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Students learn through{" "}
            <strong className="font-semibold text-gray-900">
              real assignments, attendance tracking, progress monitoring,
              feedback, and collaborative development
            </strong>
            , while mentors and admins manage the entire learning journey.
          </p>

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
                Competitive Programming
              </h3>

              <p className="mt-3 text-[#2B362E]/90 font-medium">
                Improve problem solving, algorithms, and data structures.
              </p>
            </div>
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
          </div>
        </div>
      </section>

      <section id="mentors" className="bg-[#F5F0E8] px-6 py-20">
        {" "}
        <div className="mx-auto max-w-6xl">
          {" "}
          <div className="text-center">
            {" "}
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#6B8063]">
              {" "}
              Mentors{" "}
            </p>{" "}
            <h2 className="text-3xl font-bold text-[#2B362E] md:text-4xl">
              {" "}
              Learn from Experienced Mentors{" "}
            </h2>{" "}
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              {" "}
              Our mentors support students through projects, contests, teamwork,
              attendance, progress tracking, and career-focused learning.{" "}
            </p>{" "}
          </div>{" "}
          <div className="mt-14 flex flex-wrap justify-center gap-8">
            {" "}
            <div className="group w-full max-w-sm rounded-3xl bg-[#EBE5DA] p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              {" "}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#2B362E] text-3xl font-bold text-[#F5F0E8]">
                {" "}
                I{" "}
              </div>{" "}
              <h3 className="mt-5 text-xl font-semibold text-[#2B362E]">
                {" "}
                Iman Ibrahim{" "}
              </h3>{" "}
              <p className="mt-1 text-sm font-medium text-[#6B8063]">
                {" "}
                Full-Stack Mentor{" "}
              </p>{" "}
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {" "}
                Guides students in React, Node.js, MongoDB, and building
                production-ready web applications.{" "}
              </p>{" "}
            </div>{" "}
            <div className="group w-full max-w-sm rounded-3xl bg-[#EBE5DA] p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
              {" "}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#2B362E] text-3xl font-bold text-[#F5F0E8]">
                {" "}
                M{" "}
              </div>{" "}
              <h3 className="mt-5 text-xl font-semibold text-[#2B362E]">
                {" "}
                Marya Tawfik{" "}
              </h3>{" "}
              <p className="mt-1 text-sm font-medium text-[#6B8063]">
                {" "}
                Competitive Programming Mentor{" "}
              </p>{" "}
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {" "}
                Helps students improve algorithms, data structures,
                problem-solving, and contest performance.{" "}
              </p>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </section>

      <section id="faq" className=" px-6 py-20 bg-[#F5F0E8]">
        <h2 className="text-center text-3xl font-bold text-[#6B8063]">
          Frequently Asked Questions-FAQ
        </h2>
        <div className="mx-auto mt-10 max-w-3xl space-y-3">
          {[
            {
              number: "01",
              question: "What is the ASTU MSJ Bootcamp?",
              answer:
                "ASTU MSJ Bootcamp is a structured learning program designed to help students strengthen their technical skills through hands-on learning, real-world projects, teamwork, and mentorship.",
            },
            {
              number: "02",
              question: "Who can apply for the bootcamp?",
              answer:
                "The bootcamp is designed for ASTU Muslim students who are interested in developing their technical skills, gaining practical experience, and working on real-world projects.",
            },
            {
              number: "03",
              question: "What tracks are available?",
              answer:
                "The bootcamp offers different technical tracks such as Web Development, Competitive Programming.",
            },
            {
              number: "04",
              question: "How do I apply?",
              answer:
                "Complete the registration form with your personal and academic information, choose your experience level, and submit your application for review.",
            },
            {
              number: "05",
              question: "What happens after I submit my application?",
              answer:
                "Your application will be reviewed by the bootcamp team and may proceed to an interview or evaluation stage. You will be informed about the acceptance state.",
            },
            {
              number: "06",
              question: "Do I need previous programming experience?",
              answer:
                "Not necessarily. The bootcamp welcomes students with different levels of experience, including beginners.",
            },
          ].map((faq, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-[#2B362E]/10 bg-[#EBE5DA] px-6 py-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#6B8063]/40 hover:shadow-md"
            >
              <div className="flex items-start gap-5">
                <span className="pt-1 text-sm font-semibold text-[#6B8063]">
                  {faq.number}
                </span>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-[#2B362E]">
                      {faq.question}
                    </h3>

                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2B362E] text-lg text-[#F5F0E8] transition-transform duration-300 group-hover:rotate-45">
                      +
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
