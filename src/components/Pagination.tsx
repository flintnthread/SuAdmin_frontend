import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCount } from "../lib/format";

type PaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  size: number;
  onChange: (page: number) => void;
};

export function Pagination({ page, totalPages, totalItems, size, onChange }: PaginationProps) {
  if (totalItems === 0) return null;
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, totalItems);

  return (
    <div className="pagination">
      <span className="muted">
        Showing {formatCount(from)}–{formatCount(to)} of {formatCount(totalItems)}
      </span>
      <div className="pagination-buttons">
        <button type="button" className="btn btn-ghost" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          <ChevronLeft size={16} />
          <span>Previous</span>
        </button>
        <span className="muted">
          Page {page + 1} of {Math.max(totalPages, 1)}
        </span>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
