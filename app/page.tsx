import { Suspense } from "react";
import { requireSession } from "./lib/auth";
import { loadAppData } from "./actions";
import AdminApp from "./ui/AdminApp";

export default async function HomePage() {
  const session = await requireSession();
  const data = await loadAppData(session);
  return (
    <Suspense fallback={<div className="loading-screen">Loading...</div>}>
      <AdminApp initialData={data} />
    </Suspense>
  );
}
