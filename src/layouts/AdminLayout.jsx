import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <Sidebar role="admin" />

      <main className="ml-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
