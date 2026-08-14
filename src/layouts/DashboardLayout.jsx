import Sidebar from "../components/layout/Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default DashboardLayout;
