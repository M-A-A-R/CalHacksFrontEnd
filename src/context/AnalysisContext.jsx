import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchAnalysisResult } from "../services/analysis.js";

const AnalysisContext = createContext(undefined);

export const AnalysisProvider = ({ children }) => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const load = useCallback(async (signal) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await fetchAnalysisResult(signal);
      setAnalysis(payload);
    } catch (err) {
      if (err?.name !== "AbortError") {
        setError(err instanceof Error ? err.message : "Unable to load analysis.");
      }
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, []);

  // Listen for mock analysis results dispatched from the Notebook analyze button
  useEffect(() => {
    const handleMock = (event) => {
      if (event?.detail) {
        setAnalysis(event.detail);
        setError(null);
        setHasFetched(true);
        setIsLoading(false);
      }
    };
    window.addEventListener("analysis:mock-result", handleMock);
    return () => window.removeEventListener("analysis:mock-result", handleMock);
  }, []);

  const sourceById = useMemo(() => {
    const m = Object.create(null);
    const list = analysis?.sources ?? [];
    list.forEach((s) => {
      if (!s) return;
      const id = s.id || s.name;
      const url = s.url || (s.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/` : undefined);
      m[id] = { id, name: s.name || id, url, summary: s.summary, pmid: s.pmid };
    });
    return m;
  }, [analysis]);

  const resolveSourceIds = useCallback(
    (ids) => {
      if (!Array.isArray(ids)) return [];
      return ids.map((id) => sourceById[id] || { id, name: id });
    },
    [sourceById]
  );

  const value = useMemo(
    () => ({ analysis, isLoading, error, hasFetched, setAnalysis, load, sourceById, resolveSourceIds }),
    [analysis, isLoading, error, hasFetched, load, sourceById, resolveSourceIds]
  );

  return (
    <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within an AnalysisProvider");
  return ctx;
};
