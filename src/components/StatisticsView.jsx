import React, { useEffect, useState } from "react";
import { useAnalysis } from "../context/AnalysisContext.jsx";

const formatConfidence = (value) =>
  typeof value === "number" ? `${Math.round(value * 100)}%` : "N/A";

const StatisticsView = ({ isActive }) => {
  const { analysis, isLoading, error, hasFetched, load } = useAnalysis();

  useEffect(() => {
    if (!isActive || hasFetched) return;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [isActive, hasFetched, load]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bio-light px-8 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {!isActive ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500 shadow-sm">
            Select the Statistics tab to view experiment metrics.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Confidence</h2>
              <p className="mt-3 text-3xl font-bold text-slate-900">
                {formatConfidence(analysis?.confidence)}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Estimated certainty of the predicted outcome.
              </p>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    const controller = new AbortController();
                    load(controller.signal);
                  }}
                  disabled={isLoading}
                  className="rounded-full border border-bio-primary px-4 py-2 text-sm font-semibold text-bio-primary transition hover:bg-bio-primary hover:text-white"
                >
                  {isLoading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900">Statistics</h2>
              <p className="mt-3 text-slate-600">More metrics coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
