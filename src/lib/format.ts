const dateTimeFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const numberFormat = new Intl.NumberFormat("en-IN");

function parse(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value: string | null | undefined, empty = "—"): string {
  const date = parse(value);
  return date ? dateTimeFormat.format(date) : empty;
}

export function formatDate(value: string | null | undefined, empty = "—"): string {
  const date = parse(value);
  return date ? dateFormat.format(date) : empty;
}

export function formatCount(value: number | null | undefined): string {
  return value === null || value === undefined ? "—" : numberFormat.format(value);
}

/** "sellers_management" -> "Sellers Management" */
export function humanize(value: string | null | undefined, empty = "—"): string {
  if (!value) return empty;
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const SELLER_STATUS_LABELS: Record<string, string> = {
  email_pending: "Email pending",
  deact_req: "Deactivation requested",
  act_req: "Activation requested",
};

export function sellerStatusLabel(status: string | null | undefined): string {
  if (!status) return "Pending";
  return SELLER_STATUS_LABELS[status] ?? humanize(status);
}

export type Tone = "green" | "amber" | "red" | "gray" | "blue" | "purple";

export function sellerStatusTone(status: string | null | undefined): Tone {
  switch (status) {
    case "active":
      return "green";
    case "pending":
    case "email_pending":
    case null:
    case undefined:
    case "":
      return "amber";
    case "suspended":
    case "rejected":
      return "red";
    case "deact_req":
    case "act_req":
      return "blue";
    default:
      return "gray";
  }
}
