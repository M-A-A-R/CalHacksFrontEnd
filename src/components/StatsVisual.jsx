import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

// Simple palette fallback
const palette = [
  "#2563eb",
  "#22c55e",
  "#f97316",
  "#0ea5e9",
  "#a855f7",
  "#ef4444",
];

// Plugin to draw vertical error bars on bar chart
const errorBarPlugin = {
  id: "errorBarPlugin",
  afterDatasetsDraw(chart, _args, _pluginOptions) {
    const { ctx, data, scales } = chart;
    const yScale = scales["y"];
    const xScale = scales["x"];
    const ds = data.datasets?.[0];
    const errors = ds?.errorBars;
    if (!ds || !Array.isArray(errors)) return;

    ctx.save();
    ctx.strokeStyle = "#334155"; // slate-700
    ctx.lineWidth = 1.5;

    ds.data.forEach((v, i) => {
      const meta = chart.getDatasetMeta(0);
      const elem = meta.data?.[i];
      if (!elem) return;
      const x = elem.x;
      const y = elem.y;
      const err = errors[i] ?? 0;
      const yTop = yScale.getPixelForValue(v + err);
      const yBot = yScale.getPixelForValue(v - err);

      // vertical line
      ctx.beginPath();
      ctx.moveTo(x, yTop);
      ctx.lineTo(x, yBot);
      ctx.stroke();

      // caps
      const cap = 6;
      ctx.beginPath();
      ctx.moveTo(x - cap, yTop);
      ctx.lineTo(x + cap, yTop);
      ctx.moveTo(x - cap, yBot);
      ctx.lineTo(x + cap, yBot);
      ctx.stroke();
    });

    ctx.restore();
  },
};

// Plugin to draw horizontal intervals for scatter points
const intervalPlugin = {
  id: "intervalPlugin",
  afterDatasetsDraw(chart) {
    const { ctx, data, scales } = chart;
    const xScale = scales["x"];
    const yScale = scales["y"];
    const ds = data.datasets?.[0];
    const intervals = ds?.intervals;
    if (!ds || !Array.isArray(intervals)) return;

    ctx.save();
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1.5;

    intervals.forEach((iv, i) => {
      const meta = chart.getDatasetMeta(0);
      const pt = meta.data?.[i];
      if (!pt) return;
      const y = pt.y;
      const xL = xScale.getPixelForValue(iv[0]);
      const xU = xScale.getPixelForValue(iv[1]);

      // horizontal line
      ctx.beginPath();
      ctx.moveTo(xL, y);
      ctx.lineTo(xU, y);
      ctx.stroke();

      // caps
      const cap = 6;
      ctx.beginPath();
      ctx.moveTo(xL, y - cap);
      ctx.lineTo(xL, y + cap);
      ctx.moveTo(xU, y - cap);
      ctx.lineTo(xU, y + cap);
      ctx.stroke();
    });

    ctx.restore();
  },
};

ChartJS.register(errorBarPlugin, intervalPlugin);

const StatsVisual = ({ visual }) => {
  if (!visual) return null;
  const type = visual.type;

  if (type === "bar_with_error") {
    const labels = visual.x_labels ?? [];
    const values = visual.values ?? [];
    const errors = visual.error_bars ?? [];
    const color = palette[0];
    const data = {
      labels,
      datasets: [
        {
          label: visual.y_axis_label ?? visual.title ?? "",
          data: values,
          backgroundColor: color,
          borderColor: color,
          errorBars: errors,
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: { enabled: true },
      },
      scales: {
        x: { ticks: { color: "#334155" } },
        y: {
          title: visual.y_axis_label
            ? { display: true, text: visual.y_axis_label }
            : undefined,
          ticks: { color: "#334155" },
          beginAtZero: true,
        },
      },
    };
    return (
      <>
        <div className="h-[360px] w-full">
          <Bar data={data} options={options} />
        </div>
        {visual.description && (
          <p className="mt-4 text-sm text-slate-600">{visual.description}</p>
        )}
      </>
    );
  }

  if (type === "interval_plot") {
    const metrics = visual.metrics ?? [];
    const labels = metrics.map((m) => m.label);
    const points = metrics.map((m, i) => ({ x: m.point, y: labels[i] }));
    const intervals = metrics.map((m) => [m.ci_lower, m.ci_upper]);
    const data = {
      labels,
      datasets: [
        {
          label: visual.x_axis_label ?? visual.title ?? "",
          data: points,
          showLine: false,
          pointBackgroundColor: palette[2],
          pointBorderColor: palette[2],
          pointRadius: 5,
          intervals,
        },
      ],
    };
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const { raw } = ctx;
              const m = metrics[ctx.dataIndex];
              return `${m.label}: ${raw.x} [${m.ci_lower}, ${m.ci_upper}]`;
            },
          },
        },
      },
      scales: {
        x: {
          title: visual.x_axis_label
            ? { display: true, text: visual.x_axis_label }
            : undefined,
          ticks: { color: "#334155" },
          beginAtZero: true,
        },
        y: {
          type: "category",
          labels,
          ticks: { color: "#334155" },
          offset: true,
        },
      },
    };
    return (
      <>
        <div className="h-[360px] w-full">
          <Scatter data={data} options={options} />
        </div>
        {visual.description && (
          <p className="mt-4 text-sm text-slate-600">{visual.description}</p>
        )}
      </>
    );
  }

  return null;
};

export default StatsVisual;
