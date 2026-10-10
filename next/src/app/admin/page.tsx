import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  return (
    <div className="wrap admin-wrap">
      <header className="top">
        <div className="logo">
          <b>IEEE</b>
          <span>
            Reflex Rush
            <small>Admin</small>
          </span>
        </div>
      </header>
      <AdminDashboard />
    </div>
  );
}
