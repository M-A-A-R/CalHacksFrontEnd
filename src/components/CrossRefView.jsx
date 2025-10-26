import React from "react";

const CrossRefView = ({ isActive }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bio-light px-8 py-8">
      <div className="mx-auto w-full max-w-6xl">
        {!isActive ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-slate-500 shadow-sm">
            Select the Cross-Reference Data tab to view related datasets.
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Cross-Reference Data</h2>
            <p className="mt-3 text-slate-600">Coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrossRefView;

