import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="alert alert-error" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      {onRetry ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
          <RefreshCw size={14} />
          <span>Try again</span>
        </button>
      ) : null}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="spinner-wrap" aria-live="polite">
      <span className="spinner" />
      <span className="muted">{label}</span>
    </div>
  );
}
