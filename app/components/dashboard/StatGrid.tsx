"use client";

import type { ModuleKey } from "../../lib/config/nav";

type StatCard = {
  label: string;
  value: string | number;
  sub: string;
  icon: any;
  color: string;
  target: ModuleKey;
  filter: string;
};

type Props = {
  cards: StatCard[];
  onCardClick: (target: ModuleKey, filter: string) => void;
};

export default function StatGrid({ cards, onCardClick }: Props) {
  return (
    <section className="stat-grid stat-grid--dashboard">
      {cards.map((card) => (
        <button
          key={card.label}
          type="button"
          className={`stat-card stat-button stat-card--${card.color}`}
          onClick={() => onCardClick(card.target, card.filter)}
        >
          <div className="stat-card-header">
            <span className={`stat-icon stat-icon--${card.color}`}>
              <card.icon size={20} strokeWidth={2.2} />
            </span>
            <span className="stat-card-tag">{card.sub}</span>
          </div>
          <div className="stat-card-body">
            <b className="stat-value">{card.value}</b>
            <p className="stat-label">{card.label}</p>
          </div>
        </button>
      ))}
    </section>
  );
}
