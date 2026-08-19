import { Toaster } from "react-hot-toast";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import ChangePassword from "./pages/ChangePassword";

import Navbar from "./components/layout/Navbar";

import BatchManagement from "./pages/admin/BatchManagement";
import AdminBatchHistory from "./pages/admin/BatchHistory";
import TeamManagement from "./pages/admin/TeamManagement";
import ApplicantsPage from "./pages/admin/ApplicantsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminProgress from "./pages/admin/AdminProgress";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminProfile from "./pages/admin/AdminProfile";
import UserManagement from "./pages/admin/UserManagement";
import AdminAssignment from "./pages/admin/Assignment";

import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorAttendance from "./pages/mentor/MentorAttendance";
import MentorAnnouncements from "./pages/mentor/Announcements";
import MentorProgress from "./pages/mentor/MentorProgress";
import MyStudents from "./pages/mentor/MyStudents";
import MentorAssignment from "./pages/mentor/Assignment";
import MentorBatchHistory from "./pages/mentor/BatchHistory";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentProgress from "./pages/student/StudentProgress";
import StudentAnnouncements from "./pages/student/Announcement";
import StudentAssignment from "./pages/student/Assignment";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ForgotPassword from "./pages/ForgotPassword";

import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";

import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  const location = useLocation();

  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ====================================================== */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterationPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/change-password" element={<ChangePassword />} />

        {/* =====================================================
            ADMIN ROUTES
        ====================================================== */}

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Dashboard */}

            <Route index element={<AdminDashboard />} />

            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Batch Management */}

            <Route path="batches" element={<BatchManagement />} />

            {/* Batch History */}

            <Route path="batch-history" element={<AdminBatchHistory />} />

            {/* Team Management */}

            <Route path="teams" element={<TeamManagement />} />

            {/* Applicants / Students */}

            <Route path="applicants" element={<ApplicantsPage />} />

            <Route path="students" element={<ApplicantsPage />} />

            {/* User Management */}

            <Route path="users" element={<UserManagement />} />

            {/* Attendance */}

            <Route path="attendance" element={<AdminAttendance />} />

            {/* Progress */}

            <Route path="progress" element={<AdminProgress />} />

            {/* Announcements */}

            <Route path="announcements" element={<AdminAnnouncements />} />

            {/* Assignments */}

            <Route path="assignments" element={<AdminAssignment />} />

            {/* Profile */}

            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* =====================================================
            MENTOR ROUTES
        ====================================================== */}

        <Route element={<ProtectedRoute allowedRole="mentor" />}>
          <Route path="/mentor" element={<MentorLayout />}>
            {/* Dashboard */}

            <Route index element={<MentorDashboard />} />

            <Route path="dashboard" element={<MentorDashboard />} />

            {/* Students */}

            <Route path="students" element={<MyStudents />} />

            {/* Attendance */}

            <Route path="attendance" element={<MentorAttendance />} />

            {/* Progress */}

            <Route path="progress" element={<MentorProgress />} />

            {/* Assignments */}

            <Route path="assignments" element={<MentorAssignment />} />

            {/* Announcements */}

            <Route path="announcements" element={<MentorAnnouncements />} />

            {/* Batch History */}

            <Route path="my-batch" element={<MentorBatchHistory />} />

            {/* Profile */}

            <Route
              path="profile"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Mentor Profile</h1>
                </div>
              }
            />
          </Route>
        </Route>

        {/* =====================================================
            STUDENT ROUTES
        ====================================================== */}

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            {/* Dashboard */}

            <Route index element={<StudentDashboard />} />

            <Route path="dashboard" element={<StudentDashboard />} />

            {/* Progress */}

            <Route path="progress" element={<StudentProgress />} />

            {/* Attendance */}

            <Route path="attendance" element={<StudentAttendance />} />

            {/* Announcements */}

            <Route path="announcements" element={<StudentAnnouncements />} />

            {/* Assignments */}

            <Route path="assignments" element={<StudentAssignment />} />

            {/* Profile */}

            <Route
              path="profile"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Student Profile</h1>
                </div>
              }
            />
          </Route>
        </Route>

        {/* =====================================================
            404
        ====================================================== */}

        <Route
          path="*"
          element={
            <div className="flex min-h-screen items-center justify-center p-20 text-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">404</h1>

                <p className="mt-2 text-slate-500">Page Not Found</p>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
