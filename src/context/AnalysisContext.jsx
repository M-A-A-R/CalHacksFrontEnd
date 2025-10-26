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

  const value = useMemo(
    () => ({ analysis, isLoading, error, hasFetched, setAnalysis, load }),
    [analysis, isLoading, error, hasFetched, load]
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

