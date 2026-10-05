import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/Badge";
import { Pagination } from "../components/Pagination";
import { ErrorBanner, Spinner } from "../components/States";
import { formatDate, sellerStatusLabel, sellerStatusTone } from "../lib/format";
import { useApi, useDebouncedValue } from "../lib/hooks";
import { SELLER_STATUSES, fetchSellers } from "../lib/superAdminApi";
import { useQueryParams } from "../lib/useQueryParams";

const PAGE_SIZE = 20;

export function SellersPage() {
  const navigate = useNavigate();
  const { params, update: updateParams, page } = useQueryParams();
  const status = params.get("status") ?? "";

  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");
  const search = useDebouncedValue(searchInput.trim());

  useEffect(() => {
    if (search !== (params.get("search") ?? "")) updateParams({ search, page: null });
  }, [search]);

  const sellers = useApi(
    () => fetchSellers({ search: params.get("search") ?? "", status, page, size: PAGE_SIZE }),
    [params.toString()],
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Sellers</h1>
          <p className="muted">Every seller on the marketplace. Click a seller to see their details.</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search by name, business, email, mobile or seller ID"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <select value={status} onChange={(event) => updateParams({ status: event.target.value, page: null })}>
          <option value="">All statuses</option>
          {SELLER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {sellerStatusLabel(value)}
            </option>
          ))}
        </select>
      </div>

      {sellers.error ? <ErrorBanner message={sellers.error} onRetry={sellers.reload} /> : null}

      <div className="card table-card">
        {!sellers.data && sellers.loading ? (
          <Spinner />
        ) : (
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Seller ID</th>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>KYC</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody className={sellers.loading ? "is-loading" : undefined}>
                {(sellers.data?.items ?? []).map((row) => (
                  <tr
                    key={row.id}
                    className="row-link"
                    tabIndex={0}
                    onClick={() => navigate(`/sellers/${row.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") navigate(`/sellers/${row.id}`);
                    }}
                  >
                    <td className="mono">{row.sellerUniqueId || `#${row.id}`}</td>
                    <td className="cell-strong">{row.name}</td>
                    <td>{row.businessName || "—"}</td>
                    <td>
                      <div>{row.email || "—"}</div>
                      {row.mobile ? <div className="cell-sub">{row.mobile}</div> : null}
                    </td>
                    <td>
                      <Badge tone={sellerStatusTone(row.status)}>{sellerStatusLabel(row.status)}</Badge>
                    </td>
                    <td>
                      <Badge tone={row.kycVerified ? "green" : "gray"}>
                        {row.kycVerified ? "Verified" : "Not verified"}
                      </Badge>
                    </td>
                    <td>{formatDate(row.createdAt)}</td>
                  </tr>
                ))}
                {sellers.data && sellers.data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-cell">
                      No sellers match these filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
        {sellers.data ? (
          <Pagination
            page={sellers.data.page}
            totalPages={sellers.data.totalPages}
            totalItems={sellers.data.totalItems}
            size={sellers.data.size}
            onChange={(next) => updateParams({ page: next })}
          />
        ) : null}
      </div>
    </div>
  );
}
