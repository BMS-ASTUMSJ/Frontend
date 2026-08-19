import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";

// Admin pages
import BatchManagement from "./pages/admin/BatchManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import ApplicantsPage from "./pages/admin/ApplicantsPage";
import AdminAttendance from "./pages/admin/AdminAttendance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

// Mentor pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorAttendance from "./pages/mentor/MentorAttendance";
import MentorAnnouncements from "./pages/mentor/Announcements";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentAnnouncements from "./pages/student/Announcements";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ForgotPassword from "./pages/ForgotPassword";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";

// Route protection
import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  const location = useLocation();

  const showNavbar =
    location.pathname === "/" || location.pathname.startsWith("/#");

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

            {/* Batch Management */}
            <Route path="batches" element={<BatchManagement />} />

            {/* Team Management */}
            <Route path="teams" element={<TeamManagement />} />

            {/* Applicants */}
            <Route path="applicants" element={<ApplicantsPage />} />

            {/* Students */}
            <Route path="students" element={<ApplicantsPage />} />

            {/* Attendance */}
            <Route path="attendance" element={<AdminAttendance />} />

            {/* Announcements */}
            <Route path="announcements" element={<AdminAnnouncements />} />

            {/* Users */}
            <Route path="users" element={<UserManagement />} />

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

            {/* Attendance */}
            <Route path="attendance" element={<MentorAttendance />} />

            {/* Announcements */}
            <Route path="announcements" element={<MentorAnnouncements />} />
          </Route>
        </Route>

        {/* =====================================================
            STUDENT ROUTES
        ===================================================== */}

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            {/* Dashboard */}
            <Route index element={<StudentDashboard />} />

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
