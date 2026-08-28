import { Toaster } from "react-hot-toast";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import ChangePassword from "./pages/ChangePassword";
import Navbar from "./components/layout/Navbar";

// Admin Imports
import AdminSessions from "./pages/admin/AdminSession";
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
import AIDocumentation from "./pages/admin/AIDocumentation";
// Mentor Imports
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorAttendance from "./pages/mentor/MentorAttendance";
import MentorAnnouncements from "./pages/mentor/Announcements";
import MentorProgress from "./pages/mentor/MentorProgress";
import MyStudents from "./pages/mentor/MyStudents";
import MentorAssignment from "./pages/mentor/Assignment";
import MentorBatchHistory from "./pages/mentor/BatchHistory";
import MentorProfile from "./pages/mentor/MentorProfile";

// Student Imports
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendance from "./pages/student/StudentAttendance";
import StudentProgress from "./pages/student/StudentProgress";
import StudentAnnouncements from "./pages/student/Announcement";
import StudentAssignment from "./pages/student/Assignment";
import StudentProfile from "./pages/student/StudentProfile";

// General Imports
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ForgotPassword from "./pages/ForgotPassword";

// Layouts & Protection
import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// AI Assistant
import AIAssistant from "./components/ai/AIAssistant";

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
            <Route index element={<AdminDashboard />} />

            <Route path="dashboard" element={<AdminDashboard />} />

            <Route path="sessions" element={<AdminSessions />} />

            <Route path="batches" element={<BatchManagement />} />

            <Route path="batch-history" element={<AdminBatchHistory />} />

            <Route path="teams" element={<TeamManagement />} />

            <Route path="applicants" element={<ApplicantsPage />} />

            <Route path="users" element={<UserManagement />} />

            <Route path="attendance" element={<AdminAttendance />} />

            <Route path="progress" element={<AdminProgress />} />

            <Route path="announcements" element={<AdminAnnouncements />} />

            <Route path="assignments" element={<AdminAssignment />} />

            <Route path="profile" element={<AdminProfile />} />
            <Route path="documentation" element={<AIDocumentation />} />
          </Route>
        </Route>

        {/* =====================================================
            MENTOR ROUTES
        ====================================================== */}

        <Route element={<ProtectedRoute allowedRole="mentor" />}>
          <Route path="/mentor" element={<MentorLayout />}>
            <Route index element={<MentorDashboard />} />

            <Route path="dashboard" element={<MentorDashboard />} />

            <Route path="students" element={<MyStudents />} />

            <Route path="attendance" element={<MentorAttendance />} />

            <Route path="progress" element={<MentorProgress />} />

            <Route path="assignments" element={<MentorAssignment />} />

            <Route path="announcements" element={<MentorAnnouncements />} />

            <Route path="my-batch" element={<MentorBatchHistory />} />

            <Route path="profile" element={<MentorProfile />} />
          </Route>
        </Route>

        {/* =====================================================
            STUDENT ROUTES
        ====================================================== */}

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />

            <Route path="dashboard" element={<StudentDashboard />} />

            <Route path="progress" element={<StudentProgress />} />

            <Route path="attendance" element={<StudentAttendance />} />

            <Route path="announcements" element={<StudentAnnouncements />} />

            <Route path="assignments" element={<StudentAssignment />} />

            <Route path="profile" element={<StudentProfile />} />
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

      <AIAssistant />
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
