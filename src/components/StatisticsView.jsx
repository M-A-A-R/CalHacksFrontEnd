import React, { useEffect, useState } from "react";
import { useAnalysis } from "../context/AnalysisContext.jsx";
import StatsVisual from "./StatsVisual.jsx";

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
          <>
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
              {/* Refresh removed: analysis is single-shot */}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900">Statistical Analysis</h2>
              <p className="mt-3 text-slate-700">
                {analysis?.statistical_analysis?.summary || 'No statistical summary available.'}
              </p>
            </div>
          </div>

          {/* Visualizations */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            {(analysis?.visualizations ?? []).map((v) => (
              <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">{v.title}</h3>
                <div className="mt-3">
                  <StatsVisual visual={v} />
                </div>
              </div>
            ))}
            {(!analysis?.visualizations || analysis.visualizations.length === 0) && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <p className="text-sm text-slate-600">No visuals available.</p>
              </div>
            )}
          </section>

          {/* Data Sources */}
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Data Sources</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-700">
                {(analysis?.statistical_analysis?.data_sources ?? []).map((ds, idx) => (
                  <li key={idx} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <p className="font-semibold text-slate-900">{ds.name}</p>
                    {ds.description && <p className="mt-1">{ds.description}</p>}
                    {Array.isArray(ds.conditions) && ds.conditions.length > 0 && (
                      <p className="mt-1 text-slate-600">Conditions: {ds.conditions.join(', ')}</p>
                    )}
                    {ds.replicates_per_condition && (
                      <p className="mt-1 text-slate-600">Replicates/condition: {ds.replicates_per_condition}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tests */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Tests</h3>
              <ul className="mt-3 space-y-4 text-sm text-slate-700">
                {(analysis?.statistical_analysis?.tests ?? []).map((t, idx) => (
                  <li key={idx} className="rounded-md border border-slate-100 p-4">
                    <p className="font-semibold text-slate-900">{t.test_name}</p>
                    <p className="text-slate-600">{t.comparison}</p>
                    {t.metric && <p className="mt-1">Metric: {t.metric}</p>}
                    {t.sample_sizes && (
                      <p className="mt-1 text-slate-600">Samples: {Object.entries(t.sample_sizes).map(([k,v]) => `${k}: ${v}`).join(', ')}</p>
                    )}
                    {typeof t.p_value === 'number' && (
                      <p className="mt-1">p-value: {t.p_value}</p>
                    )}
                    {typeof t.statistic === 'number' && (
                      <p className="mt-1">Statistic: {t.statistic}</p>
                    )}
                    {(t.effect_size_cohens_d || t.effect_size_partial_omega_squared) && (
                      <p className="mt-1">
                        Effect size: {t.effect_size_cohens_d ?? t.effect_size_partial_omega_squared}
                      </p>
                    )}
                    {t.interpretation && (
                      <p className="mt-2 text-slate-700">{t.interpretation}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </section>
          </>
        )}
      </div>
    </div>
  );
};

export default StatisticsView;
