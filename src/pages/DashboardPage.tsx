import {
  Clock,
  Package,
  PackageSearch,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ErrorBanner, Spinner } from "../components/States";
import { formatCount } from "../lib/format";
import { useApi } from "../lib/hooks";
import { fetchDashboard } from "../lib/superAdminApi";
import type { DashboardStats } from "../lib/types";

type StatCard = {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  color: string;
  to?: string;
};

const SECTIONS: { title: string; cards: StatCard[] }[] = [
  {
    title: "Admins",
    cards: [
      { key: "totalAdmins", label: "Total admins", icon: Users, color: "#4f46e5", to: "/admins" },
      { key: "activeAdmins", label: "Active admins", icon: UserCheck, color: "#16a34a", to: "/admins?status=active" },
      { key: "superAdmins", label: "Super admins", icon: ShieldCheck, color: "#9333ea", to: "/admins?role=super_admin" },
    ],
  },
  {
    title: "Sellers",
    cards: [
      { key: "totalSellers", label: "Total sellers", icon: Store, color: "#0284c7", to: "/sellers" },
      { key: "activeSellers", label: "Active sellers", icon: UserCheck, color: "#16a34a", to: "/sellers?status=active" },
      { key: "pendingSellers", label: "Pending sellers", icon: Clock, color: "#d97706", to: "/sellers?status=pending" },
    ],
  },
  {
    title: "Store",
    cards: [
      { key: "totalProducts", label: "Total products", icon: Package, color: "#0891b2" },
      { key: "pendingProducts", label: "Products awaiting approval", icon: PackageSearch, color: "#ea580c" },
      { key: "totalOrders", label: "Total orders", icon: ShoppingCart, color: "#db2777" },
      { key: "totalCustomers", label: "Customers", icon: UserRound, color: "#65a30d" },
    ],
  },
];

export function DashboardPage() {
  const { data, error, loading, reload } = useApi(fetchDashboard, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">A quick overview of the whole marketplace.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={reload} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spin" : undefined} />
          <span>Refresh</span>
        </button>
      </div>

      {error ? <ErrorBanner message={error} onRetry={reload} /> : null}
      {!data && loading ? <Spinner /> : null}

      {data
        ? SECTIONS.map((section) => (
            <section key={section.title} className="stat-section">
              <h2 className="section-title">{section.title}</h2>
              <div className="stat-grid">
                {section.cards.map((card) => {
                  const value = data[card.key];
                  const body = (
                    <>
                      <span className="stat-icon" style={{ color: card.color, background: `${card.color}1a` }}>
                        <card.icon size={22} />
                      </span>
                      <div>
                        <div className="stat-value">{formatCount(value)}</div>
                        <div className="stat-label">{card.label}</div>
                        {value === null ? <div className="stat-note">Not available right now</div> : null}
                      </div>
                    </>
                  );
                  return card.to ? (
                    <Link key={card.key} to={card.to} className="stat-card stat-card-link">
                      {body}
                    </Link>
                  ) : (
                    <div key={card.key} className="stat-card">
                      {body}
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        : null}
    </div>
  );
}
