import { Pencil, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { AdminFormModal } from "../components/AdminFormModal";
import { Badge } from "../components/Badge";
import { Pagination } from "../components/Pagination";
import { ErrorBanner, Spinner } from "../components/States";
import { formatDateTime, humanize } from "../lib/format";
import { useApi, useDebouncedValue } from "../lib/hooks";
import { fetchAdminRoles, fetchAdmins } from "../lib/superAdminApi";
import type { AdminUser } from "../lib/types";
import { useQueryParams } from "../lib/useQueryParams";

const PAGE_SIZE = 20;

export function AdminsPage() {
  const { admin: me } = useAuth();
  const { params, update: updateParams, page } = useQueryParams();
  const role = params.get("role") ?? "";
  const status = params.get("status") ?? "";

  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const search = useDebouncedValue(searchInput.trim());

  useEffect(() => {
    if (search !== (params.get("search") ?? "")) updateParams({ search, page: null });
  }, [search]);

  const roles = useApi(fetchAdminRoles, []);
  const admins = useApi(
    () => fetchAdmins({ search: params.get("search") ?? "", role, status, page, size: PAGE_SIZE }),
    [params.toString()],
  );

  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Admins</h1>
          <p className="muted">Add admins, change their roles, and turn their access on or off.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
          <Plus size={16} />
          <span>Add admin</span>
        </button>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by name or email"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <select value={role} onChange={(event) => updateParams({ role: event.target.value, page: null })}>
          <option value="">All roles</option>
          {(roles.data ?? []).map((value) => (
            <option key={value} value={value}>
              {humanize(value)}
            </option>
          ))}
        </select>
        <select value={status} onChange={(event) => updateParams({ status: event.target.value, page: null })}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {admins.error ? <ErrorBanner message={admins.error} onRetry={admins.reload} /> : null}

      <div className="card table-card">
        {!admins.data && admins.loading ? (
          <Spinner />
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last login</th>
                  <th>Added on</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody className={admins.loading ? "is-loading" : undefined}>
                {(admins.data?.items ?? []).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="cell-strong">{row.name?.trim() || "—"}</div>
                      {row.id === me?.id ? <div className="cell-sub">This is you</div> : null}
                    </td>
                    <td>{row.email}</td>
                    <td>
                      <Badge tone={row.role === "super_admin" ? "purple" : "blue"}>{humanize(row.role)}</Badge>
                    </td>
                    <td>
                      <Badge tone={row.active ? "green" : "gray"}>{row.active ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td>{formatDateTime(row.lastLogin, "Never")}</td>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td className="cell-actions">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(row)}>
                        <Pencil size={14} />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.data && admins.data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      No admins match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
        {admins.data ? (
          <Pagination
            page={admins.data.page}
            totalPages={admins.data.totalPages}
            totalItems={admins.data.totalItems}
            size={admins.data.size}
            onChange={(next) => updateParams({ page: next })}
          />
        ) : null}
      </div>

      {editing ? (
        <AdminFormModal
          admin={editing === "new" ? null : editing}
          roles={roles.data ?? []}
          isSelf={editing !== "new" && editing.id === me?.id}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            admins.reload();
          }}
        />
      ) : null}
    </div>
  );
}
