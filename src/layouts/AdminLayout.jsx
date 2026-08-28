import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#F6FAFD]">
      <Sidebar role="admin" />

      <main className="min-h-screen pt-16 lg:ml-64 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
