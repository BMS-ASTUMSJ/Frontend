import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";

// =====================================================
// ADMIN PAGES
// =====================================================

import BatchManagement from "./pages/admin/BatchManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import ApplicantsPage from "./pages/admin/ApplicantsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminProgress from "./pages/admin/AdminProgress";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminProfile from "./pages/admin/AdminProfile.jsx";
import UserManagement from "./pages/admin/UserManagement";

// =====================================================
// MENTOR PAGES
// =====================================================

import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorAttendance from "./pages/mentor/MentorAttendance";
import MentorAnnouncements from "./pages/mentor/Announcements";
import MentorProgress from "./pages/mentor/MentorProgress";
import MyStudents from "./pages/mentor/MyStudents";

// =====================================================
// STUDENT PAGES
// =====================================================

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentProgress from "./pages/student/StudentProgress";
import StudentAnnouncements from "./pages/student/Announcements";

// =====================================================
// PUBLIC PAGES
// =====================================================

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ForgotPassword from "./pages/ForgotPassword";

// =====================================================
// LAYOUTS
// =====================================================

import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";

// =====================================================
// ROUTE PROTECTION
// =====================================================

import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  const location = useLocation();

  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterationPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* =====================================================
            ADMIN ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Dashboard */}
            <Route index element={<AdminDashboard />} />

            <Route path="dashboard" element={<AdminDashboard />} />

            {/* Batch Management */}
            <Route path="batches" element={<BatchManagement />} />

            {/* Team Management */}
            <Route path="teams" element={<TeamManagement />} />

            {/* Applicants */}
            <Route path="applicants" element={<ApplicantsPage />} />

            {/* Students */}
            <Route path="students" element={<ApplicantsPage />} />

            {/* Users */}
            <Route path="users" element={<UserManagement />} />

            {/* Attendance */}
            <Route path="attendance" element={<AdminAttendance />} />

            {/* Progress */}
            <Route path="progress" element={<AdminProgress />} />

            {/* Announcements */}
            <Route path="announcements" element={<AdminAnnouncements />} />

            {/* Profile */}
            <Route path="profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* =====================================================
            MENTOR ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute allowedRole="mentor" />}>
          <Route path="/mentor" element={<MentorLayout />}>
            {/* Dashboard */}
            <Route index element={<MentorDashboard />} />

            <Route path="dashboard" element={<MentorDashboard />} />

            {/* My Students */}
            <Route path="students" element={<MyStudents />} />

            {/* Attendance */}
            <Route path="attendance" element={<MentorAttendance />} />

            {/* Progress */}
            <Route path="progress" element={<MentorProgress />} />

            {/* Assignments */}
            <Route
              path="assignments"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Mentor Assignments</h1>
                </div>
              }
            />

            {/* Announcements */}
            <Route path="announcements" element={<MentorAnnouncements />} />

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
        ===================================================== */}

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            {/* Dashboard */}
            <Route index element={<StudentDashboard />} />

            {/* Progress */}
            <Route path="progress" element={<StudentProgress />} />

            {/* Attendance */}
            <Route path="attendance" element={<StudentAttendance />} />

            {/* Announcements */}
            <Route path="announcements" element={<StudentAnnouncements />} />
          </Route>
        </Route>

        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={<div className="p-20 text-center">404 - Page Not Found</div>}
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
