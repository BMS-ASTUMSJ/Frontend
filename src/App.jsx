import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ForgotPassword from "./pages/ForgotPassword";

import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import UserManagement from "./pages/admin/UserManagement";

import AdminAnnouncements from "./pages/admin/Announcements";
import MentorAnnouncements from "./pages/mentor/Announcements";
import StudentAnnouncements from "./pages/student/Announcements";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminProfile from "./pages/admin/AdminProfile.jsx";

function AppContent() {
  const location = useLocation();

  const showNavbar =
    location.pathname === "/" || location.pathname.startsWith("/#");

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterationPage />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />

            <Route path="announcements" element={<AdminAnnouncements />} />

            <Route path="profile" element={<AdminProfile />} />

            <Route path="users" element={<UserManagement />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="mentor" />}>
          <Route path="/mentor" element={<MentorLayout />}>
            <Route index element={<MentorDashboard />} />

            <Route path="announcements" element={<MentorAnnouncements />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="student" />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />

            <Route path="announcements" element={<StudentAnnouncements />} />
          </Route>
        </Route>
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
