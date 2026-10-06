import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { Pagination } from "../components/Pagination";
import { ErrorBanner, Spinner } from "../components/States";
import { formatCount, formatDateTime, humanize, type Tone } from "../lib/format";
import { useApi, useDebouncedValue } from "../lib/hooks";
import {
  fetchActiveUsers,
  fetchActivities,
  fetchActivity,
  fetchEmployeeLog,
  fetchLogActions,
  fetchLogEmployees,
  fetchLogModules,
  fetchLoginHistory,
  fetchLogSummary,
  fetchVisits,
  type LogFilters,
} from "../lib/superAdminApi";
import type { ActivityLog, SessionLog } from "../lib/types";
import { useQueryParams } from "../lib/useQueryParams";

const PAGE_SIZE = 20;
const TABS = [
  ["activity", "All activity"],
  ["active", "Active users"],
  ["logins", "Login history"],
  ["page", "Page views"],
  ["business", "Admin actions"],
  ["visits", "Sessions"],
] as const;
const PRESETS = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["last7", "Last 7 days"],
  ["last30", "Last 30 days"],
  ["month", "This month"],
  ["custom", "Custom range"],
];

type Tab = (typeof TABS)[number][0];

function statusTone(status: string | null | undefined): Tone {
  switch (status) {
    case "ACTIVE":
    case "LOGIN_SUCCESS":
      return "green";
    case "INACTIVE":
      return "amber";
    case "EXPIRED":
    case "LOGIN_FAILED":
      return "red";
    default:
      return "gray";
  }
}

function statusLabel(status: string | null | undefined): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "INACTIVE":
      return "Inactive";
    case "LOGGED_OUT":
      return "Logged out";
    case "EXPIRED":
      return "Expired";
    case "LOGIN_FAILED":
      return "Failed";
    case "LOGIN_SUCCESS":
      return "Successful";
    case "LOGGED_IN":
      return "Logged in";
    case "GUEST":
      return "Not logged in";
    default:
      return humanize(status);
  }
}

function personName(name: string | null | undefined): string {
  return name?.trim() || "Guest";
}

export function LogsPage() {
  const { params, update, page } = useQueryParams();
  const tab = (params.get("tab") as Tab | null) || "activity";
  const preset = params.get("preset") || "today";
  const role = params.get("role") ?? "";
  const employeeId = params.get("employeeId") ?? "";
  const action = params.get("action") ?? "";
  const moduleName = params.get("module") ?? "";
  const status = params.get("status") ?? "";
  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";

  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const search = useDebouncedValue(searchInput.trim());
  const [viewId, setViewId] = useState<number | null>(null);
  const [personId, setPersonId] = useState<number | null>(null);

  useEffect(() => {
    if (search !== (params.get("search") ?? "")) update({ search, page: null });
  }, [search]);

  const activityTab = tab === "activity" || tab === "page" || tab === "business";
  const filters: LogFilters = {
    search: params.get("search") ?? "",
    employeeId,
    role,
    action,
    module: moduleName,
    status,
    group: tab === "page" ? "page" : tab === "business" ? "business" : "",
    preset,
    from,
    to,
    page,
    size: PAGE_SIZE,
  };

  const summary = useApi(fetchLogSummary, []);
  const employees = useApi(fetchLogEmployees, []);
  const actions = useApi(fetchLogActions, []);
  const modules = useApi(fetchLogModules, []);
  const activities = useApi(() => fetchActivities(filters), [activityTab ? params.toString() : "skip-activity"]);
  const logins = useApi(() => fetchLoginHistory(filters), [tab === "logins" ? params.toString() : "skip-logins"]);
  const visits = useApi(() => fetchVisits(filters), [tab === "visits" ? params.toString() : "skip-visits"]);
  const active = useApi(
    () => fetchActiveUsers({ search: filters.search, employeeId, role, page, size: PAGE_SIZE }),
    [tab === "active" ? `${params.get("search")}|${employeeId}|${role}|${page}` : "skip-active"],
  );
  const detail = useApi(() => (viewId == null ? Promise.resolve(null) : fetchActivity(viewId)), [viewId]);
  const person = useApi(
    () => (personId == null ? Promise.resolve(null) : fetchEmployeeLog(personId, { preset, from, to, page: 0, size: 50 })),
    [personId, preset, from, to],
  );

  const list = activityTab ? activities : tab === "logins" ? logins : tab === "visits" ? visits : active;
  const cards = [
    ["Total admins", summary.data?.totalAdmins],
    ["Active now", summary.data?.activeNow],
    ["Logins today", summary.data?.loginsToday],
    ["Visits today", summary.data?.visitsToday],
    ["Successful logins", summary.data?.successfulLogins],
    ["Failed logins", summary.data?.failedLogins],
    ["Activities today", summary.data?.activitiesToday],
    ["Products updated", summary.data?.productsUpdatedToday],
    ["Orders updated", summary.data?.ordersUpdatedToday],
    ["Avg session", summary.data?.averageSession ?? "—"],
  ] as const;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Logs</h1>
          <p className="muted">Monitor admin panel sessions and activity.</p>
        </div>
      </div>

      {summary.error ? <ErrorBanner message={summary.error} onRetry={summary.reload} /> : null}
      <div className="stat-grid log-stats">
        {cards.map(([label, value]) => (
          <div key={label} className="stat-card">
            <div>
              <div className="stat-value">{typeof value === "number" ? formatCount(value) : value ?? "—"}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="log-tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`log-tab${tab === id ? " active" : ""}`}
            onClick={() => update({ tab: id === "activity" ? null : id, page: null })}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search name, email, action, or record"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <select value={employeeId} onChange={(event) => update({ employeeId: event.target.value, page: null })}>
          <option value="">All employees</option>
          {(employees.data ?? []).map((personRow) => (
            <option key={personRow.id} value={personRow.id}>
              {personName(personRow.name)}
            </option>
          ))}
        </select>
        <select value={role} onChange={(event) => update({ role: event.target.value, page: null })}>
          <option value="">All roles</option>
          <option value="super_admin">Super admin</option>
          <option value="admin">Admin</option>
          <option value="product_management">Product management</option>
          <option value="order_management">Order management</option>
          <option value="sellers_management">Sellers management</option>
          <option value="category_management">Category management</option>
          <option value="finance_management">Finance management</option>
        </select>
        {activityTab ? (
          <>
            <select value={moduleName} onChange={(event) => update({ module: event.target.value, page: null })}>
              <option value="">All modules</option>
              {(modules.data ?? []).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <select value={action} onChange={(event) => update({ action: event.target.value, page: null })}>
              <option value="">All actions</option>
              {(actions.data ?? []).map((value) => (
                <option key={value} value={value}>
                  {humanize(value)}
                </option>
              ))}
            </select>
          </>
        ) : tab === "logins" || tab === "visits" ? (
          <select value={status} onChange={(event) => update({ status: event.target.value, page: null })}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="LOGGED_OUT">Logged out</option>
            <option value="EXPIRED">Expired</option>
            {tab === "logins" ? <option value="LOGIN_FAILED">Failed login</option> : null}
          </select>
        ) : null}
        {tab !== "active" ? (
          <select value={preset} onChange={(event) => update({ preset: event.target.value, page: null })}>
            {PRESETS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        ) : null}
        {tab !== "active" && preset === "custom" ? (
          <>
            <input type="date" value={from} onChange={(event) => update({ from: event.target.value, page: null })} />
            <input type="date" value={to} onChange={(event) => update({ to: event.target.value, page: null })} />
          </>
        ) : null}
      </div>

      {list.error ? <ErrorBanner message={list.error} onRetry={list.reload} /> : null}
      <div className="card table-card">
        {!list.data && list.loading ? (
          <Spinner />
        ) : activityTab ? (
          <ActivityTable
            rows={activities.data?.items ?? []}
            loading={activities.loading}
            onView={setViewId}
            onPerson={setPersonId}
          />
        ) : (
          <SessionTable
            rows={(tab === "logins" ? logins.data?.items : tab === "visits" ? visits.data?.items : active.data?.items) ?? []}
            mode={tab}
            loading={list.loading}
            onPerson={setPersonId}
          />
        )}
        {list.data ? (
          <Pagination
            page={list.data.page}
            totalPages={list.data.totalPages}
            totalItems={list.data.totalItems}
            size={list.data.size}
            onChange={(next) => update({ page: next })}
          />
        ) : null}
      </div>

      {viewId != null ? (
        <Modal title="Activity details" onClose={() => setViewId(null)}>
          {detail.error ? <ErrorBanner message={detail.error} onRetry={detail.reload} /> : null}
          {!detail.data && detail.loading ? <Spinner /> : null}
          {detail.data ? <ActivityDetail row={detail.data} onPerson={setPersonId} /> : null}
        </Modal>
      ) : null}

      {personId != null ? (
        <Modal title="Employee activity" onClose={() => setPersonId(null)}>
          {person.error ? <ErrorBanner message={person.error} onRetry={person.reload} /> : null}
          {!person.data && person.loading ? <Spinner /> : null}
          {person.data ? (
            <div className="detail-list">
              <h3>{personName(person.data.employee.name)}</h3>
              <p className="muted">{person.data.employee.email}</p>
              <p>
                <Badge tone="blue">{humanize(person.data.employee.role)}</Badge>
              </p>
              <dl>
                <div><dt>First login</dt><dd>{formatDateTime(person.data.firstLogin, "No login in this range")}</dd></div>
                <div><dt>Last activity</dt><dd>{formatDateTime(person.data.lastActivity)}</dd></div>
                <div><dt>Logout</dt><dd>{formatDateTime(person.data.logoutAt, "Still open or not recorded")}</dd></div>
                <div><dt>Session duration</dt><dd>{person.data.sessionDuration ?? "—"}</dd></div>
                <div><dt>Activities</dt><dd>{formatCount(person.data.activityCount)}</dd></div>
                <div><dt>Modules</dt><dd>{person.data.modules.length ? person.data.modules.join(", ") : "—"}</dd></div>
              </dl>
              {person.data.actionCounts.length ? (
                <ul className="log-counts">
                  {person.data.actionCounts.map((item) => (
                    <li key={item.action}>
                      <span>{humanize(item.action)}</span>
                      <strong>{formatCount(item.count)}</strong>
                    </li>
                  ))}
                </ul>
              ) : null}
              <ol className="timeline">
                {person.data.timeline.items.map((item) => (
                  <li key={item.id}>
                    <time>{formatDateTime(item.createdAt)}{item.sessionDuration ? ` · ${item.sessionDuration}` : ""}</time>
                    <div>
                      <strong>{humanize(item.action)}</strong>
                      <p>{item.description || item.record || item.module}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}

function ActivityTable({
  rows,
  loading,
  onView,
  onPerson,
}: {
  rows: ActivityLog[];
  loading: boolean;
  onView: (id: number) => void;
  onPerson: (id: number) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Click time</th>
            <th>Working time</th>
            <th>Employee</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
            <th>Module</th>
            <th>Page</th>
            <th>Details</th>
            <th>Session</th>
            <th aria-label="View" />
          </tr>
        </thead>
        <tbody className={loading ? "is-loading" : undefined}>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatDateTime(row.createdAt)}</td>
              <td>{row.sessionDuration || "—"}</td>
              <td>
                {row.employeeId ? (
                  <button type="button" className="link-btn" onClick={() => onPerson(row.employeeId!)}>
                    {personName(row.name)}
                  </button>
                ) : (
                  personName(row.name)
                )}
              </td>
              <td>{row.email || "—"}</td>
              <td>{row.role ? <Badge tone="blue">{humanize(row.role)}</Badge> : "—"}</td>
              <td>{humanize(row.action)}</td>
              <td>{row.module || "—"}</td>
              <td>{row.page || "—"}</td>
              <td>{row.description || row.record || "—"}</td>
              <td>{row.sessionLabel || "—"}</td>
              <td className="cell-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => onView(row.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={11} className="empty-cell">
                No activity matches these filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function SessionTable({
  rows,
  mode,
  loading,
  onPerson,
}: {
  rows: SessionLog[];
  mode: "logins" | "visits" | "active";
  loading: boolean;
  onPerson: (id: number) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>{mode === "visits" ? "Visit" : "Login"}</th>
            <th>Last activity</th>
            <th>Logout</th>
            <th>Working time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody className={loading ? "is-loading" : undefined}>
          {rows.map((row) => (
            <tr key={`${mode}-${row.id}`}>
              <td>
                {row.employeeId ? (
                  <button type="button" className="link-btn" onClick={() => onPerson(row.employeeId!)}>
                    {personName(row.name)}
                  </button>
                ) : (
                  personName(row.name)
                )}
              </td>
              <td>{row.email || "—"}</td>
              <td>{row.role ? <Badge tone="blue">{humanize(row.role)}</Badge> : "—"}</td>
              <td>{formatDateTime(row.loginAt || row.startedAt || row.createdAt)}</td>
              <td>
                {formatDateTime(row.lastActivityAt)}
                {row.currentPage ? <div className="cell-sub">{row.currentPage}</div> : null}
              </td>
              <td>{formatDateTime(row.logoutAt, "—")}</td>
              <td>{row.sessionDuration || "—"}</td>
              <td>
                <Badge tone={statusTone(row.status)}>{statusLabel(row.eventType === "LOGIN_FAILED" ? "LOGIN_FAILED" : row.status)}</Badge>
                {row.failureReason ? <div className="cell-sub">{row.failureReason}</div> : null}
              </td>
            </tr>
          ))}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="empty-cell">
                {mode === "active" ? "Nobody is active in the admin panel right now." : "No sessions match these filters."}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

function ActivityDetail({ row, onPerson }: { row: ActivityLog; onPerson: (id: number) => void }) {
  return (
    <div className="detail-list">
      <h3>Employee</h3>
      <dl>
        <div>
          <dt>Name</dt>
          <dd>
            {row.employeeId ? (
              <button type="button" className="link-btn" onClick={() => onPerson(row.employeeId!)}>
                {personName(row.name)}
              </button>
            ) : (
              personName(row.name)
            )}
          </dd>
        </div>
        <div><dt>Email</dt><dd>{row.email || "—"}</dd></div>
        <div><dt>Role</dt><dd>{humanize(row.role)}</dd></div>
      </dl>
      <h3>Activity</h3>
      <dl>
        <div><dt>Action</dt><dd>{humanize(row.action)}</dd></div>
        <div><dt>Module</dt><dd>{row.module || "—"}</dd></div>
        <div><dt>Page</dt><dd>{row.page || "—"}</dd></div>
        <div><dt>Record</dt><dd>{row.record || row.entityId || "—"}</dd></div>
        <div><dt>Click time</dt><dd>{formatDateTime(row.createdAt)}</dd></div>
        <div><dt>Description</dt><dd>{row.description || "—"}</dd></div>
        <div><dt>What changed</dt><dd>{row.changeSummary || "Not recorded for this action"}</dd></div>
      </dl>
      <h3>Session</h3>
      <dl>
        <div><dt>Session</dt><dd>{row.sessionLabel || "—"}</dd></div>
        <div><dt>Login</dt><dd>{formatDateTime(row.loginAt)}</dd></div>
        <div><dt>Last activity</dt><dd>{formatDateTime(row.lastActivityAt)}</dd></div>
        <div><dt>Logout</dt><dd>{formatDateTime(row.logoutAt, "—")}</dd></div>
        <div><dt>Working time</dt><dd>{row.sessionDuration || "—"}</dd></div>
        <div><dt>Status</dt><dd>{statusLabel(row.sessionStatus)}</dd></div>
      </dl>
    </div>
  );
}
