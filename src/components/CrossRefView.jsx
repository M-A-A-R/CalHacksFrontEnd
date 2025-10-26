import React, { useEffect } from "react";
import { useAnalysis } from "../context/AnalysisContext.jsx";

const CrossRefView = ({ isActive }) => {
  const { hasFetched, load } = useAnalysis();

  useEffect(() => {
    if (!isActive || hasFetched) return;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [isActive, hasFetched, load]);
  const { analysis } = useAnalysis();

  const sources = analysis?.sources ?? [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bio-light px-8 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {!isActive ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500 shadow-sm">
            Select the Cross-Reference Data tab to view related datasets.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Cross-Reference Data</h2>
            {sources.length === 0 ? (
              <p className="mt-3 text-slate-600">No sources available.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {sources.map((src, idx) => (
                  <li key={`${src.url ?? src.name}-${idx}`} className="rounded-lg border border-slate-100 p-4">
                    <p className="text-base font-semibold text-slate-900">{src.name}</p>
                    {src.url && (
                      <p className="mt-1 text-sm">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bio-primary hover:underline break-all"
                        >
                          {src.url}
                        </a>
                      </p>
                    )}
                    {src.summary && (
                      <p className="mt-2 text-sm text-slate-700">{src.summary}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossRefView;
