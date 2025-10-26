const ANALYSIS_RESULT_ENDPOINT = "http://localhost:8000/api/analysis/result";

export const fetchAnalysisResult = async (signal) => {
  const response = await fetch(ANALYSIS_RESULT_ENDPOINT, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Analysis request failed: ${response.status}`);
  }

  return response.json();
};

