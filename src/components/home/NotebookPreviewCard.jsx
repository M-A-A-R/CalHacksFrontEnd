import React from 'react'

const PreviewBadge = ({ label, tone }) => {
  const toneStyles = {
    indigo: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${toneStyles[tone]}`}
    >
      {label}
    </span>
  )
}

const InsightCard = ({ title, description, accent }) => (
  <div className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {accent}
    </span>
    <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
  </div>
)

const NotebookPreviewCard = () => {
  return (
    <div className="relative isolate rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_30px_70px_-30px_rgba(30,64,175,0.45)] backdrop-blur">
      <div className="absolute -top-10 right-8 h-20 w-20 rounded-full bg-[radial-gradient(circle_at_top,#c4b5fd,transparent_65%)] blur-xl" />
      <div className="absolute -bottom-14 left-4 h-24 w-24 rounded-full bg-[radial-gradient(circle_at_center,#fcd34d,transparent_60%)] blur-xl" />

      <header className="mb-5 flex flex-wrap items-center gap-2">
        <PreviewBadge label="BenchBrain AI" tone="indigo" />
        <PreviewBadge label="Live analysis" tone="emerald" />
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-inner">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex gap-2">
            {['Notebook', 'Analysis', 'Statistics', 'Cross-Reference'].map(
              (tab, index) => (
                <span
                  key={tab}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${index === 1 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500'}`}
                >
                  {tab}
                </span>
              ),
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            Last synced · 2m ago
          </span>
        </div>

        <div className="grid gap-4 px-6 py-5">
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI recommended protein edit with supporting sources
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              Interactive interaction graph anchored to citations
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              Automated statistical validation & effect size summary
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Cross-referenced datasets merged from PubMed & notebooks
            </li>
          </ul>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">
              BenchBrain Insight
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              “S65T restores the chromophore hydrogen bond network, delivering
              +34% signal gain with 95% credible interval [31, 37]. Suggested
              next: validate in HEK293 with 488nm photobleach assay.”
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <InsightCard
              accent="Protocol"
              title="Automated clean-up"
              description="BenchBrain ingests your SOP PDF and maps each step into a structured protocol canvas."
            />
            <InsightCard
              accent="Data"
              title="Live tables"
              description="Import spreadsheets and let AI surface outliers, trends, and effect sizes instantly."
            />
            <InsightCard
              accent="Sequences"
              title="Residue intelligence"
              description="Colorized sequence annotations with AI rationale for each recommended edit."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotebookPreviewCard

