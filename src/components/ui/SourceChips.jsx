import React from "react";
import { useAnalysis } from "../../context/AnalysisContext.jsx";

const SourceChips = ({ ids }) => {
  const { resolveSourceIds } = useAnalysis();
  const sources = resolveSourceIds(ids);
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {sources.map((s) => (
        s.url ? (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-bio-primary hover:bg-bio-primary hover:text-white"
            title={s.summary || s.url}
          >
            {s.name}
          </a>
        ) : (
          <span
            key={s.id}
            className="inline-flex items-center rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium text-slate-600"
            title={s.summary || s.id}
          >
            {s.name}
          </span>
        )
      ))}
    </div>
  );
};

export default SourceChips;

