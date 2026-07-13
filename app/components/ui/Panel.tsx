export default function Panel({ title, action, children }: { title: string; action?: string; children: React.ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>{title}</h3>
        {action ? <button type="button">{action}</button> : null}
      </div>
      {children}
    </div>
  );
}
