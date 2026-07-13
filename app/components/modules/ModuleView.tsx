"use client";

import { Eye, Plus, Trash2, UserPlus } from "lucide-react";
import { moduleTitles, type ModuleKey } from "../../lib/config/nav";
import { tableColumns } from "../../lib/config/fields";
import type { AnyDoc } from "../../lib/types";
import { formatValue, label } from "../../lib/utils/format";
import { printInvoice } from "../../lib/utils/invoice";
import { searchableText } from "../../lib/utils/search";

type Props = {
  collection: ModuleKey;
  records: AnyDoc[];
  query: string;
  onAdd: () => void;
  onEdit: (record: AnyDoc) => void;
  onView: (record: AnyDoc) => void;
  onConvert: (record: AnyDoc) => void;
  onDelete: (collection: string, id: string) => void;
};

export default function ModuleView({ collection, records, query, onAdd, onEdit, onView, onConvert, onDelete }: Props) {
  const filtered = records.filter((r) => searchableText(r).includes(query.trim().toLowerCase()));
  const columns = tableColumns[collection] || [];

  return (
    <div className="content">
      <div className="module-head">
        <div>
          <h2>{moduleTitles[collection]}</h2>
          <p>{filtered.length} records found{query ? ` for "${query}"` : ""}</p>
        </div>
        <button type="button" className="primary-btn" onClick={onAdd}><Plus size={18} /> Add New</button>
      </div>
      <div className="table-card">
        <table>
          <thead>
            <tr>
              {columns.map((c) => <th key={c}>{label(c)}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row._id}>
                {columns.map((c) => <td key={c}>{formatValue(row[c], c)}</td>)}
                <td className="actions">
                  <button type="button" onClick={() => onView(row)} title="View"><Eye size={15} /> View</button>
                  <button type="button" onClick={() => onEdit(row)}>Edit</button>
                  {collection === "visitors" ? <button type="button" onClick={() => onConvert(row)}><UserPlus size={15} /> Convert</button> : null}
                  <button type="button" className="danger" onClick={() => onDelete(collection, row._id!)}><Trash2 size={15} /></button>
                  {collection === "payments" ? <button type="button" onClick={() => printInvoice(row)}>Invoice</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 ? <div className="empty">No matching records.</div> : null}
      </div>
    </div>
  );
}
