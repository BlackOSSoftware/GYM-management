"use client";

import { moduleTitles, type ModuleKey } from "../../lib/config/nav";
import type { AnyDoc } from "../../lib/types";
import { ChartCard } from "./ChartCard";

type Props = {
  results: { key: ModuleKey; row: AnyDoc }[];
  onOpen: (key: ModuleKey, row: AnyDoc) => void;
};

/** Existing search results — same data, updated card chrome only. */
export default function GlobalSearchResults({ results, onOpen }: Props) {
  return (
    <ChartCard title="Search Results" action={<span>{results.length} matches</span>}>
      {results.length ? (
        <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2 min-[1024px]:grid-cols-3">
          {results.map(({ key, row }) => (
            <button
              key={`${key}-${row._id}`}
              type="button"
              onClick={() => onOpen(key, row)}
              className="rounded-xl border border-line/55 bg-bg/50 p-2.5 text-left transition hover:border-indigo-200"
            >
              <small className="text-[10px] font-semibold text-muted">{moduleTitles[key]}</small>
              <b className="mt-0.5 block truncate text-sm text-ink">
                {row.name || row.memberName || row.invoiceNo || row.memberId}
              </b>
              <span className="mt-0.5 block truncate text-xs text-muted">
                {row.mobile || row.email || row.status || row.category || row.method}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="m-0 py-4 text-center text-xs text-muted">
          No result found. Try member name, mobile, invoice number, trainer or plan name.
        </p>
      )}
    </ChartCard>
  );
}
