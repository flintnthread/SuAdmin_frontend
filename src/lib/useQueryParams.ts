import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type ParamChanges = Record<string, string | number | null>;

/** List filters live in the URL so they survive a refresh and dashboard cards can link straight to a filtered list. */
export function useQueryParams() {
  const [params, setParams] = useSearchParams();

  const update = useCallback(
    (changes: ParamChanges) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          for (const [key, value] of Object.entries(changes)) {
            if (value === null || value === "" || (key === "page" && value === 0)) next.delete(key);
            else next.set(key, String(value));
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const page = Math.max(Number(params.get("page") ?? 0) || 0, 0);

  return { params, update, page };
}
