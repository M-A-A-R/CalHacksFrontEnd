# CalHacks Frontend

CalHacks Frontend is a Vite/React single-page application that models a wet lab notebook and connects it to automated analysis produced by Letta-backed services. The UI presents notebook editing, automated hypothesis summaries, statistical views, and network graphs in a unified workspace.

## Architecture Overview

- **Notebook workspace** (`NotebookLayout`) exposes a rich-text editor plus modular blocks for sequences, protein viewers, structured tables, and protocol uploads. Content saves to local storage for resilience and can be sent to the notebook API for persistence.
- **Letta integration**: the Analyze button gathers the notebook snapshot and posts it to the Letta analysis endpoint (`POST /api/letta/analyze`). During development we dispatch the same payload structure from a mock event; production should return the JSON documented in `log.md`.
- **AnalysisContext** listens for results from Letta (or mock data) and hydrates downstream tabs so they render in sync.
- **Analysis tab** highlights breakthrough summaries, recommended edits, outcomes, confidence, next steps, and a Cytoscape graph that surfaces relationships among proteins, entities, and interactions. Node and edge selections reveal contextual metadata taken directly from the analysis payload.
- **Statistics tab** visualises the `statistical_analysis` block: summary narrative, bar/error charts, interval plots, detailed test breakdowns, and source links.
- **Cross-Reference Data tab** displays literature and dataset citations tied to the analysis response, keeping references consistent with the Analysis and Statistics views.

## Data Contracts

- **Notebook save**: `POST /api/notebook/save` expects `{ savedAt, changes, snapshot }`, enabling incremental persistence of notebook state.
- **Analysis result**: `/api/analysis/result` (or `POST /api/letta/analyze`) must respond with the shape in `log.md`. Any backend change should preserve keys consumed by `AnalysisView`, `StatisticsView`, and `CrossRefView`.

## Local Development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Update `log.md` to adjust mock analysis output while iterating on the UI.

## Deployment Notes

- Provide a production API base URL (e.g., `VITE_API_BASE_URL=https://your-backend`) so fetch calls reach the deployed backend instead of localhost.
- If hosting the frontend on Vercel, ensure the backend (e.g., Replit) serves HTTPS and sets CORS to allow the Vercel domain.
- Run `npm run build` for production output in `dist/`.

## Technology Stack

- React 18 with functional components and hooks
- Vite + Tailwind CSS for rapid styling
- Cytoscape.js for graph visualisation
- Chart.js via `react-chartjs-2` for statistical plots

