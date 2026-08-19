import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import BatchManagement from "./pages/admin/BatchManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import ApplicantsPage from "./pages/admin/ApplicantsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import AdminProgress from "./pages/admin/AdminProgress";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminProfile from "./pages/admin/AdminProfile";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterationPage from "./pages/RegisterationPage";
import ForgotPassword from "./pages/ForgotPassword";
import AdminLayout from "./layouts/AdminLayout";
import MentorLayout from "./layouts/MentorLayout";
import StudentLayout from "./layouts/StudentLayout";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorAnnouncements from "./pages/mentor/Announcements";
import MentorProgress from "./pages/mentor/MentorProgress";
import MyStudents from "./pages/mentor/MyStudents";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProgress from "./pages/student/StudentProgress";
import StudentAnnouncements from "./pages/student/Announcements";
import ProtectedRoute from "./routes/ProtectedRoute";

function AppContent() {
  const location = useLocation();

  const showNavbar = location.pathname === "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>


        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterationPage />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        

        <Route
          element={<ProtectedRoute allowedRole="admin" />}
        >
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="batches"
              element={<BatchManagement />}
            />

            <Route
              path="teams"
              element={<TeamManagement />}
            />

            <Route
              path="applicants"
              element={<ApplicantsPage />}
            />

            <Route
              path="students"
              element={<ApplicantsPage />}
            />

            <Route
              path="users"
              element={<UserManagement />}
            />

            <Route
              path="progress"
              element={<AdminProgress />}
            />

            <Route
              path="announcements"
              element={<AdminAnnouncements />}
            />

            <Route
              path="profile"
              element={<AdminProfile />}
            />
          </Route>
        </Route>

       

        <Route
          element={<ProtectedRoute allowedRole="mentor" />}
        >
          <Route
            path="/mentor"
            element={<MentorLayout />}
          >
           
            <Route
              index
              element={<MentorDashboard />}
            />
          
            <Route
              path="dashboard"
              element={<MentorDashboard />}
            />

            <Route
              path="students"
              element={<MyStudents />}
            />

            
            <Route
              path="attendance"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">
                    Mentor Attendance
                  </h1>
                </div>
              }
            />

            
            <Route
              path="progress"
              element={<MentorProgress />}
            />

            
            <Route
              path="assignments"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">
                    Mentor Assignments
                  </h1>
                </div>
              }
            />

            <Route
              path="announcements"
              element={<MentorAnnouncements />}
            />

           
            <Route
              path="profile"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">
                    Mentor Profile
                  </h1>
                </div>
              }
            />
          </Route>
        </Route>

     

        <Route
          element={<ProtectedRoute allowedRole="student" />}
        >
          <Route
            path="/student"
            element={<StudentLayout />}
          >
          
            <Route
              index
              element={<StudentDashboard />}
            />

          
            <Route
              path="progress"
              element={<StudentProgress />}
            />

           
            <Route
              path="announcements"
              element={<StudentAnnouncements />}
            />
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