import { LayoutDashboard, LogOut, ShieldCheck, Store, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admins", label: "Admins", icon: Users, end: false },
  { to: "/sellers", label: "Sellers", icon: Store, end: false },
];

export function Layout() {
  const { admin, signOut } = useAuth();
  const displayName = admin?.name?.trim() || admin?.email || "Super admin";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <ShieldCheck size={20} />
          </span>
          <div>
            <div className="brand-title">Flint &amp; Thread</div>
            <div className="brand-subtitle">Super Admin</div>
          </div>
        </div>
        <nav className="nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-user">
            <span className="avatar">{displayName.charAt(0).toUpperCase()}</span>
            <div className="topbar-user-text">
              <div className="topbar-name">{displayName}</div>
              <div className="topbar-email">{admin?.email}</div>
            </div>
          </div>
          <button type="button" className="btn btn-ghost" onClick={signOut}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
