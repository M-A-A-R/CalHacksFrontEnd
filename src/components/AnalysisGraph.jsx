import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

const GRAPH_LAYOUT_OPTIONS = {
  name: "cose",
  animate: false,
  fit: true,
  padding: 40,
  nodeDimensionsIncludeLabels: true,
  idealEdgeLength: 160,
  nodeRepulsion: 8000,
  gravity: 60,
  edgeElasticity: 120,
  nestingFactor: 0.9,
};

const BASE_STYLESHEET = [
  {
    selector: "node",
    style: {
      "background-color": "#2563eb",
      "border-color": "#1e3a8a",
      "border-width": 2,
      color: "#0f172a",
      "font-size": 14,
      "font-weight": 600,
      label: "data(label)",
      "text-valign": "center",
      "text-outline-color": "#f8fafc",
      "text-outline-width": 2,
      "text-wrap": "wrap",
      "text-max-width": 120,
    },
  },
  {
    selector: "node[type = 'entity']",
    style: {
      "background-color": "#0ea5e9",
      "border-color": "#0369a1",
    },
  },
  {
    selector: "node.edited",
    style: {
      "background-color": "#f97316",
      "border-color": "#c2410c",
      color: "#1c1917",
    },
  },
  {
    selector: "node.highlight",
    style: {
      "border-width": 4,
      "border-color": "#facc15",
      "background-color": "#fef08a",
    },
  },
  {
    selector: "edge",
    style: {
      width: 2,
      "line-color": "#94a3b8",
      "target-arrow-color": "#94a3b8",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
      "font-size": 12,
      color: "#475569",
      label: "data(interaction)",
      "text-background-color": "#f8fafc",
      "text-background-opacity": 0.85,
      "text-background-padding": 4,
    },
  },
];

const createElements = (nodes = [], edges = []) => {
  const cyNodes = nodes.map((node) => ({
    data: {
      id: node.id,
      label: node.label,
      type: node.type,
      notes: node.notes,
    },
    classes: node.isEdited ? "edited" : "",
  }));

  const cyEdges = edges.map((edge, index) => ({
    data: {
      id: `${edge.source}-${edge.target}-${index}`,
      source: edge.source,
      target: edge.target,
      interaction: edge.interaction,
      mechanism: edge.mechanism,
    },
  }));

  return [...cyNodes, ...cyEdges];
};

const AnalysisGraph = ({ nodes, edges }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: [],
      style: BASE_STYLESHEET,
      layout: GRAPH_LAYOUT_OPTIONS,
      wheelSensitivity: 0.2,
    });

    cyRef.current = cy;

    cy.on("select", "node", (event) => {
      const node = event.target;
      if (node && node.data("notes")) {
        cy.elements().removeClass("highlight");
        node.addClass("highlight");
      }
    });

    cy.on("tap", (event) => {
      if (event.target === cy) {
        cy.elements().removeClass("highlight");
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    cy.elements().remove();
    const elements = createElements(nodes, edges);
    cy.add(elements);
    cy.layout(GRAPH_LAYOUT_OPTIONS).run();
    cy.fit(undefined, 60);
  }, [nodes, edges]);

  return (
    <div
      ref={containerRef}
      className="h-[440px] w-full rounded-xl border border-slate-200 bg-white shadow-inner"
    />
  );
};

export default AnalysisGraph;
