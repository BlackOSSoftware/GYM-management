"use client";

import { moduleTitles, type ModuleKey } from "../../lib/config/nav";
import type { AnyDoc } from "../../lib/types";

type Props = {
  results: { key: ModuleKey; row: AnyDoc }[];
  onOpen: (key: ModuleKey, row: AnyDoc) => void;
};

export default function GlobalSearchResults({ results, onOpen }: Props) {
  return (
    <section className="search-results">
      <div className="panel-head">
        <h3>Search Results</h3>
        <span>{results.length} matches</span>
      </div>
      {results.length ? (
        <div className="result-grid">
          {results.map(({ key, row }) => (
            <button key={`${key}-${row._id}`} type="button" onClick={() => onOpen(key, row)}>
              <small>{moduleTitles[key]}</small>
              <b>{row.name || row.memberName || row.invoiceNo || row.memberId}</b>
              <span>{row.mobile || row.email || row.status || row.category || row.method}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="empty">No result found. Try member name, mobile, invoice number, trainer or plan name.</div>
      )}
    </section>
  );
}
