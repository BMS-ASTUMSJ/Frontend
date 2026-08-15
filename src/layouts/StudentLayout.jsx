import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <Sidebar role="student" />

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
