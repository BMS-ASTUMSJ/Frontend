import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import ForgotPassword from "./pages/ForgotPassword";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";

import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

import AdminAnnouncements from "./pages/admin/Announcements";
import MentorAnnouncements from "./pages/mentor/Announcements";
import StudentAnnouncements from "./pages/student/Announcements";

function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterationPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />

          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>

        <Route path="/mentor" element={<MentorLayout />}>
          <Route index element={<MentorDashboard />} />

          <Route path="announcements" element={<MentorAnnouncements />} />
        </Route>

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
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
