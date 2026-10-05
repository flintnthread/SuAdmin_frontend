import type { ReactNode } from "react";
import type { Tone } from "../lib/format";

export function Badge({ tone = "gray", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
