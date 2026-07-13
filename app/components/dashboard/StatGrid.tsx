"use client";

import type { ModuleKey } from "../../lib/config/nav";
import StatCard, { type StatCardData } from "./StatCard";

type Props = {
  cards: StatCardData[];
  onCardClick: (target: ModuleKey, filter: string) => void;
};

export default function StatGrid({ cards, onCardClick }: Props) {
  return (
    <section className="grid grid-cols-2 gap-2 min-[768px]:grid-cols-2 min-[1024px]:grid-cols-4 min-[1440px]:gap-2.5">
      {cards.map((card) => (
        <StatCard
          key={card.label}
          {...card}
          onClick={() => onCardClick(card.target, card.filter)}
        />
      ))}
    </section>
  );
}
