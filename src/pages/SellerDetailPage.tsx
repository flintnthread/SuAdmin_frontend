import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { ErrorBanner, Spinner } from "../components/States";
import { formatDateTime, humanize, sellerStatusLabel, sellerStatusTone } from "../lib/format";
import { useApi } from "../lib/hooks";
import { fetchSeller } from "../lib/superAdminApi";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Check({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span className={`check ${ok ? "check-ok" : "check-no"}`}>
      {ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {ok ? yes : no}
    </span>
  );
}

export function SellerDetailPage() {
  const { id } = useParams();
  const sellerId = Number(id);
  const validId = Number.isInteger(sellerId) && sellerId > 0;
  const { data: seller, error, loading, reload } = useApi(
    () => (validId ? fetchSeller(sellerId) : Promise.reject(new Error("Seller not found."))),
    [sellerId],
  );

  return (
    <div className="page">
      <Link to="/sellers" className="back-link">
        <ArrowLeft size={16} />
        <span>Back to sellers</span>
      </Link>

      {error ? <ErrorBanner message={error} onRetry={validId ? reload : undefined} /> : null}
      {!seller && loading ? <Spinner /> : null}

      {seller ? (
        <>
          <div className="page-header">
            <div>
              <h1>{seller.businessName || seller.name}</h1>
              <p className="muted">
                {seller.sellerUniqueId || `Seller #${seller.id}`}
                {seller.businessName ? ` · ${seller.name}` : ""}
              </p>
            </div>
            <Badge tone={sellerStatusTone(seller.status)}>{sellerStatusLabel(seller.status)}</Badge>
          </div>

          <div className="detail-grid">
            <section className="card detail-card">
              <h2 className="section-title">Contact</h2>
              <dl>
                <Field label="Name">{seller.name}</Field>
                <Field label="Email">{seller.email || "—"}</Field>
                <Field label="Mobile">{seller.mobile || "—"}</Field>
                <Field label="Location">{[seller.city, seller.state].filter(Boolean).join(", ") || "—"}</Field>
              </dl>
            </section>

            <section className="card detail-card">
              <h2 className="section-title">Business</h2>
              <dl>
                <Field label="Business name">{seller.businessName || "—"}</Field>
                <Field label="Business type">{humanize(seller.businessType)}</Field>
                <Field label="Category">{humanize(seller.sellerCategory)}</Field>
              </dl>
            </section>

            <section className="card detail-card">
              <h2 className="section-title">Verification</h2>
              <dl>
                <Field label="Email">
                  <Check ok={seller.emailVerified} yes="Verified" no="Not verified" />
                </Field>
                <Field label="Mobile">
                  <Check ok={seller.mobileVerified} yes="Verified" no="Not verified" />
                </Field>
                <Field label="Profile">
                  <Check ok={seller.profileCompleted} yes="Completed" no="Not completed" />
                </Field>
                <Field label="KYC submitted">
                  <Check ok={seller.kycCompleted} yes="Yes" no="No" />
                </Field>
                <Field label="KYC verified">
                  <Check ok={seller.kycVerified} yes="Verified" no="Not verified" />
                </Field>
                <Field label="KYC verified on">{formatDateTime(seller.kycVerifiedAt)}</Field>
              </dl>
            </section>

            <section className="card detail-card">
              <h2 className="section-title">Activity</h2>
              <dl>
                <Field label="Joined">{formatDateTime(seller.createdAt)}</Field>
                <Field label="Last updated">{formatDateTime(seller.updatedAt)}</Field>
                <Field label="Last login">{formatDateTime(seller.lastLoginAt, "Never")}</Field>
              </dl>
            </section>
          </div>

          <section className="card detail-card">
            <h2 className="section-title">Admin remarks</h2>
            <p className={seller.adminRemarks ? "remarks" : "muted"}>{seller.adminRemarks || "No remarks."}</p>
          </section>

          <p className="muted small">Bank, PAN and Aadhaar details are not shown here for privacy.</p>
        </>
      ) : null}
    </div>
  );
}
