import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth/RequireAuth";
import { Layout } from "./components/Layout";
import { AdminsPage } from "./pages/AdminsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { LogsPage } from "./pages/LogsPage";
import { SellerDetailPage } from "./pages/SellerDetailPage";
import { SellersPage } from "./pages/SellersPage";

function NotFound() {
  return (
    <div className="page">
      <h1>Page not found</h1>
      <p className="muted">
        This page doesn't exist. <Link to="/">Go to the dashboard</Link>.
      </p>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="admins" element={<AdminsPage />} />
        <Route path="logs" element={<LogsPage />} />
        <Route path="sellers" element={<SellersPage />} />
        <Route path="sellers/:id" element={<SellerDetailPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
