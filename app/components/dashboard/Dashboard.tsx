"use client";

import type { ModuleKey } from "../../lib/config/nav";
import type { AnyDoc, AppData } from "../../lib/types";
import { seedSampleDataApi } from "../../lib/api/client";
import GlobalSearchResults from "./GlobalSearchResults";
import StatGrid from "./StatGrid";
import RevenueCard from "./RevenueCard";
import ExpiryCard from "./ExpiryCard";
import QuickAccess from "./QuickAccess";
import { RecentMembers, RecentPayments, UpcomingExpiries } from "./RecentLists";

type Props = {
  data: AppData;
  stats: ReturnType<typeof import("../../lib/utils/stats").buildStats>;
  query: string;
  results: { key: ModuleKey; row: AnyDoc }[];
  onNavigate: (key: ModuleKey, filter?: string) => void;
  onEdit: (collection: string) => void;
  onView: (key: ModuleKey, row: AnyDoc) => void;
  onRefresh: () => Promise<void>;
};

export default function Dashboard({
  data,
  stats,
  query,
  results,
  onNavigate,
  onEdit,
  onView,
  onRefresh
}: Props) {
  const handleSeed = async () => {
    await seedSampleDataApi();
    await onRefresh();
  };

  return (
    <div className="content flex w-full min-w-0 flex-col gap-2.5 pb-6 min-[768px]:gap-3">
      {query.trim() ? <GlobalSearchResults results={results} onOpen={onView} /> : null}

      <StatGrid cards={stats.cards} onCardClick={onNavigate} />

      <section className="grid grid-cols-1 gap-2.5 min-[768px]:grid-cols-2 min-[1280px]:grid-cols-[1.2fr_1fr_1fr] min-[768px]:gap-3 min-[1280px]:items-stretch">
        <RevenueCard monthRevenue={stats.monthRevenue} revenueBars={stats.revenueBars} />
        <ExpiryCard
          activePct={stats.activePct}
          expiringPct={stats.expiringPct}
          activeMemberships={stats.activeMemberships}
          expiring30={stats.expiring30}
          expiredMemberships={stats.expiredMemberships}
        />
        <div className="min-[768px]:col-span-2 min-[1280px]:col-span-1">
          <QuickAccess onNavigate={onNavigate} onEdit={onEdit} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-2.5 min-[768px]:grid-cols-2 min-[1280px]:grid-cols-3 min-[768px]:gap-3 min-[1280px]:items-stretch">
        <RecentMembers rows={data.members.slice(0, 5)} />
        <RecentPayments rows={data.payments.slice(0, 5)} />
        <div className="min-[768px]:col-span-2 min-[1280px]:col-span-1">
          <UpcomingExpiries rows={stats.upcoming} />
        </div>
      </section>

      {data.members.length === 0 ? (
        <div className="flex justify-center py-2">
          <button type="button" className="primary-btn" onClick={handleSeed}>
            Load Sample Data
          </button>
        </div>
      ) : null}
    </div>
  );
}
