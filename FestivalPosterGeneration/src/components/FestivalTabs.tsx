"use client";

import { useState } from "react";
import { FestivalWithTemplates } from "@/lib/types";
import TemplateCard from "./TemplateCard";

interface Props {
  festivalsWithTemplates: FestivalWithTemplates[];
}

export default function FestivalTabs({ festivalsWithTemplates }: Props) {
  const activeFestivals = festivalsWithTemplates.filter(
    (f) => f.templates.length > 0
  );
  const [activeFestivalId, setActiveFestivalId] = useState<number | null>(
    activeFestivals[0]?.id || null
  );

  const activeFestival = activeFestivals.find(
    (f) => f.id === activeFestivalId
  );

  if (activeFestivals.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">暂无节日模板</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {activeFestivals.map((festival) => (
          <button
            key={festival.id}
            onClick={() => setActiveFestivalId(festival.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFestivalId === festival.id
                ? "bg-primary text-white shadow-lg scale-105"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
            }`}
            style={
              activeFestivalId === festival.id
                ? { backgroundColor: festival.color }
                : {}
            }
          >
            <span className="mr-1">{festival.icon}</span>
            {festival.name}
            <span className="ml-1 text-xs opacity-75">
              ({festival.templates.length})
            </span>
          </button>
        ))}
      </div>

      {activeFestival && (
        <div
          className="rounded-2xl p-6 mb-6"
          style={{
            background: `linear-gradient(135deg, ${activeFestival.color}15 0%, ${activeFestival.color}05 100%)`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{activeFestival.icon}</span>
            <div>
              <h2 className="text-xl font-bold" style={{ color: activeFestival.color }}>
                {activeFestival.name}
              </h2>
              <p className="text-gray-500 text-sm">
                {activeFestival.date} · 共 {activeFestival.templates.length} 个模板
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeFestival.templates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
