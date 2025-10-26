import React, { useCallback, useEffect, useMemo, useState } from "react";
import AnalysisGraph from "./AnalysisGraph.jsx";
import { useAnalysis } from "../context/AnalysisContext.jsx";
import SourceChips from "./ui/SourceChips.jsx";

const formatConfidence = (value) =>
  typeof value === "number" ? `${Math.round(value * 100)}%` : "N/A";

const AnalysisView = ({ isActive }) => {
  const { analysis, isLoading, error, hasFetched, load } = useAnalysis();
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  useEffect(() => {
    if (!isActive || hasFetched) {
      return undefined;
    }
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [hasFetched, isActive, load]);

  useEffect(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [analysis]);

  const handleRetry = () => {
    const controller = new AbortController();
    load(controller.signal);
  };

  const handleNodeSelect = useCallback((nodeData) => {
    console.debug('[AnalysisView] node selected', nodeData);
    setSelectedNode(nodeData || null);
    if (nodeData) {
      setSelectedEdge(null);
    }
  }, []);

  const handleEdgeSelect = useCallback((edgeData) => {
    console.debug('[AnalysisView] edge selected', edgeData);
    setSelectedEdge(edgeData);
    if (edgeData) {
      setSelectedNode(null);
    }
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const analysisGraph = useMemo(
    () => ({
      nodes: analysis?.graph?.nodes ?? [],
      edges: analysis?.graph?.edges ?? [],
    }),
    [analysis]
  );

  const idToNode = useMemo(() => {
    const map = Object.create(null);
    for (const n of analysisGraph.nodes) {
      if (n && n.id) map[n.id] = n;
    }
    return map;
  }, [analysisGraph.nodes]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-6 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {!hasFetched && !isActive && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500 shadow-sm">
            Select the Analysis tab to retrieve the latest experiment insights.
          </div>
        )}

        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Loading analysis…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="font-semibold text-red-700">
              Failed to load analysis results.
            </p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={handleRetry}
              className="mt-4 inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {analysis && (
          <>
            <section className="grid gap-6 lg:grid-cols-1">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900">Breakthrough Summary</h2>
                <p className="mt-3 text-slate-700">
                  {analysis.breakthrough_summary?.text || "No breakthrough summary yet."}
                </p>
                <SourceChips ids={analysis.breakthrough_summary?.source_ids} />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <h3 className="text-base font-semibold text-slate-900">Recommended Protein Edit</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Proposed edits derived from the analysis engine.
                </p>
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-900">
                      Target:
                    </span>{" "}
                    {analysis.recommended_protein_edit?.target_protein?.text || "—"}
                  </p>
                  <SourceChips ids={analysis.recommended_protein_edit?.target_protein?.source_ids} />
                  <p>
                    <span className="font-semibold text-slate-900">
                      Edit Type:
                    </span>{" "}
                    {analysis.recommended_protein_edit?.edit_type?.text || "—"}
                  </p>
                  <SourceChips ids={analysis.recommended_protein_edit?.edit_type?.source_ids} />
                  {analysis.recommended_protein_edit?.edit_details?.text && (
                    <p>{analysis.recommended_protein_edit.edit_details.text}</p>
                  )}
                  <SourceChips ids={analysis.recommended_protein_edit?.edit_details?.source_ids} />
                  {analysis.recommended_protein_edit?.rationale?.text && (
                    <p className="text-slate-600">{analysis.recommended_protein_edit.rationale.text}</p>
                  )}
                  <SourceChips ids={analysis.recommended_protein_edit?.rationale?.source_ids} />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Expected Outcome
                </h3>
                <p className="mt-3 text-sm text-slate-700">{analysis.expected_outcome?.text || "No expected outcome provided."}</p>
                <SourceChips ids={analysis.expected_outcome?.source_ids} />
              </div>
            </section>

            

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Interaction Graph
                  </h3>
                  <p className="text-sm text-slate-500">
                    Visualizes proteins, entities, and their relationships from
                    the analysis.
                  </p>
                </div>
                {/* Refresh removed: results are fixed post-analysis */}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
                <div>
                  <AnalysisGraph
                    nodes={analysisGraph.nodes}
                    edges={analysisGraph.edges}
                    onNodeSelect={handleNodeSelect}
                    onEdgeSelect={handleEdgeSelect}
                    onClearSelection={handleClearSelection}
                  />
                </div>
                <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-inner">
                  {selectedNode ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {selectedNode.type?.toUpperCase?.() || "NODE"}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-900">
                          {selectedNode.label}
                        </h4>
                      </div>
                      {selectedNode.notes && (
                        <p className="text-sm leading-relaxed text-slate-700">{selectedNode.notes}</p>
                      )}
                      {selectedNode.relationship_to_edited && (
                        <p className="text-sm text-slate-700"><span className="font-semibold">Relation:</span> {selectedNode.relationship_to_edited}</p>
                      )}
                      {selectedNode.role_summary && (
                        <p className="text-sm text-slate-700">{selectedNode.role_summary}</p>
                      )}
                      <SourceChips ids={selectedNode.source_ids} />
                    </div>
                  ) : selectedEdge ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Interaction
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-900">
                          {selectedEdge.interaction || "Relationship"}
                        </h4>
                      </div>
                      <dl className="space-y-2 text-sm text-slate-700">
                        <div>
                          <dt className="font-semibold text-slate-900">Source</dt>
                          <dd>{idToNode[selectedEdge.source]?.label || selectedEdge.source}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">Target</dt>
                          <dd>{idToNode[selectedEdge.target]?.label || selectedEdge.target}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-900">
                            Mechanism
                          </dt>
                          <dd>
                            {selectedEdge.mechanism ||
                              "No mechanism description provided."}
                          </dd>
                        </div>
                        {selectedEdge.explanation && (
                          <div>
                            <dt className="font-semibold text-slate-900">Explanation</dt>
                            <dd>{selectedEdge.explanation}</dd>
                          </div>
                        )}
                      </dl>
                      <SourceChips ids={selectedEdge.source_ids} />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-slate-500">
                      Select a node or interaction to view its details.
                    </div>
                  )}
                </aside>
              </div>

              {/* Removed node summary list below graph; details now shown in side panel */}
            </section>

            {/* Analysis summary and Next steps moved below graph */}
            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Analysis Summary</h3>
                <p className="mt-3 text-sm text-slate-700">{analysis.analysis_summary?.text}</p>
                <SourceChips ids={analysis.analysis_summary?.source_ids} />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Next Steps</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
                  {(analysis.next_steps ?? []).map((s, idx) => (
                    <li key={idx}>
                      {s?.text}
                      <SourceChips ids={s?.source_ids} />
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
