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
      width: 80,
      height: 80,
      color: "#0f172a",
      "font-size": 12,
      "font-weight": 600,
      label: "data(label)",
      "text-valign": "center",
      "text-outline-color": "#f8fafc",
      "text-outline-width": 1.5,
      "text-wrap": "wrap",
      "text-max-width": 72,
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
  {
    selector: "edge.highlight",
    style: {
      width: 3,
      "line-color": "#f97316",
      "target-arrow-color": "#f97316",
    },
  },
];

const createElements = (nodes = [], edges = []) => {
  const cyNodes = nodes.map((node) => ({
    data: { ...node },
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

const AnalysisGraph = ({
  nodes,
  edges,
  onNodeSelect,
  onEdgeSelect,
  onClearSelection,
}) => {
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
      userZoomingEnabled: false,
      wheelSensitivity: 0.2,
    });

    console.debug('[AnalysisGraph] init');

    const handleTap = (event) => {
      const target = event.target;
      console.debug('[AnalysisGraph] tap', {
        target: target === cy ? 'background' : target?.group?.(),
        data: target && target !== cy ? target.data() : undefined,
      });

      if (target === cy) {
        cy.elements().removeClass("highlight");
        onClearSelection?.();
        return;
      }

      if (!target) {
        return;
      }

      cy.elements().removeClass("highlight");

      if (target.isNode?.()) {
        target.addClass("highlight");
        onNodeSelect?.(target.data());
        onEdgeSelect?.(null);
        return;
      }

      if (target.isEdge?.()) {
        target.addClass("highlight");
        onEdgeSelect?.(target.data());
      }
    };

    const handleTapNode = (event) => {
      const node = event.target;
      if (!node) return;
      console.debug('[AnalysisGraph] node tap', node.data());
      cy.elements().removeClass("highlight");
      node.addClass("highlight");
      onNodeSelect?.(node.data());
      onEdgeSelect?.(null);
    };

    const handleTapEdge = (event) => {
      const edge = event.target;
      if (!edge) return;
      console.debug('[AnalysisGraph] edge tap', edge.data());
      cy.elements().removeClass("highlight");
      edge.addClass("highlight");
      onEdgeSelect?.(edge.data());
    };

    cy.on("tap", handleTap);
    cy.on("tap", "node", handleTapNode);
    cy.on("tap", "edge", handleTapEdge);

    cyRef.current = cy;

    return () => {
      cy.off("tap", handleTap);
      cy.off("tap", "node", handleTapNode);
      cy.off("tap", "edge", handleTapEdge);
      cy.destroy();
      cyRef.current = null;
    };
  }, [onNodeSelect, onEdgeSelect, onClearSelection]);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    cy.elements().remove();
    const elements = createElements(nodes, edges);
    cy.add(elements);
    console.debug('[AnalysisGraph] update elements', {
      nodes: nodes?.length ?? 0,
      edges: edges?.length ?? 0,
    });
    cy.layout(GRAPH_LAYOUT_OPTIONS).run();
    cy.fit(undefined, 60);
    cy.elements().removeClass("highlight");
    onClearSelection?.();
  }, [nodes, edges, onClearSelection]);

  return (
    <div
      ref={containerRef}
      className="h-[440px] w-full rounded-xl border border-slate-200 bg-white shadow-inner"
    />
  );
};

export default AnalysisGraph;
