import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import Announcements from "./pages/admin/Announcements";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterationPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/mentor" element={<MentorDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin/announcements" element={<Announcements />} />
      </Routes>
    </Router>
  );
}

export default App;
