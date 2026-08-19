import { useState } from "react";
import {
  Users,
  Search,
  Mail,
  UserCircle,
  BookOpen,
  X,
} from "lucide-react";

const MyStudents = () => {
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState(null);

  /*
   * TEMPORARY DATA
   *
   * We will replace this with your backend data
   * after you send me the mentor backend endpoint.
   */
  const students = [
    {
      id: 1,
      name: "Student One",
      email: "student1@example.com",
      gender: "Female",
      batch: "Batch 1",
      progress: 75,
    },
    {
      id: 2,
      name: "Student Two",
      email: "student2@example.com",
      gender: "Female",
      batch: "Batch 1",
      progress: 50,
    },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      student.email
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            My Students
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage students assigned to you.
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Assigned Students
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {students.length}
                </h2>
              </div>

              <div className="rounded-xl bg-blue-100 p-3 dark:bg-blue-950">
                <Users
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Average Progress
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {students.length > 0
                    ? Math.round(
                        students.reduce(
                          (sum, student) =>
                            sum + student.progress,
                          0
                        ) / students.length
                      )
                    : 0}
                  %
                </h2>
              </div>

              <div className="rounded-xl bg-green-100 p-3 dark:bg-green-950">
                <BookOpen
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Students Needing Help
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  0
                </h2>
              </div>

              <div className="rounded-xl bg-yellow-100 p-3 dark:bg-yellow-950">
                <UserCircle
                  size={24}
                  className="text-yellow-600 dark:text-yellow-400"
                />
              </div>
            </div>
          </div>

        </div>

        {/* STUDENTS */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {/* TOP */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Assigned Students
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Only students assigned to you are shown here.
              </p>
            </div>

            {/* SEARCH */}
            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search student..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

          </div>

          {/* LIST */}
          <div className="mt-6 space-y-3">

            {filteredStudents.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center text-center">

                <Users
                  size={42}
                  className="text-gray-400"
                />

                <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
                  No students found
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You currently have no assigned students.
                </p>

              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-gray-200 p-5 transition hover:shadow-sm dark:border-gray-800"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* STUDENT INFO */}
                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A3D63] text-white">
                        <UserCircle size={26} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">

                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {student.email}
                          </span>

                          <span>
                            {student.gender}
                          </span>

                          <span>
                            {student.batch}
                          </span>

                        </div>
                      </div>

                    </div>

                    {/* PROGRESS */}
                    <div className="w-full lg:max-w-xs">

                      <div className="mb-2 flex justify-between text-xs">

                        <span className="text-gray-500 dark:text-gray-400">
                          Progress
                        </span>

                        <span className="font-semibold text-gray-900 dark:text-white">
                          {student.progress}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">

                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${student.progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* BUTTON */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedStudent(student)
                      }
                      className="rounded-xl bg-[#1A3D63] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A7FA7]"
                    >
                      View Student
                    </button>

                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>

      {/* STUDENT MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Student Details
              </h2>

              <button
                type="button"
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>

            </div>

            <div className="mt-6 space-y-4">

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Name
                </p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.name}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email
                </p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.email}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Gender
                </p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.gender}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Batch
                </p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.batch}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Progress
                </p>

                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedStudent.progress}%
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedStudent(null)
              }
              className="mt-6 w-full rounded-xl bg-[#1A3D63] px-4 py-3 text-sm font-medium text-white hover:bg-[#4A7FA7]"
            >
              Close
            </button>

          </div>

        </div>
      )}
    </div>
  );
};

export default MyStudents;