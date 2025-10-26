import React from 'react'
import NotebookPreviewCard from './NotebookPreviewCard.jsx'
import proteinGraphImage from '../../assets/Intgraph.jpg'

const featureHighlights = [
  {
    title: 'AI-guided decisions',
    description:
      'BenchBrain synthesizes your notebook, stats, and literature to deliver edit recommendations with citations.',
    icon: '🧠',
  },
  {
    title: 'Protocol intelligence',
    description:
      'Upload SOPs and BenchBrain turns them into structured, trackable protocols ready for execution.',
    icon: '🧪',
  },
  {
    title: 'Sequence analytics',
    description:
      'Annotate sequences with biochemical context, predicted structures, and AI commentary in seconds.',
    icon: '🧬',
  },
  {
    title: 'Evidence graph',
    description:
      'Every conclusion is linked to data tables, notebook sections, and external publications.',
    icon: '🗂️',
  },
]

const workflowSteps = [
  {
    title: 'Capture experiments',
    body:
      'Free-form notes, sequence uploads, tables, and protocol steps live in a single notebook experience.',
    accent: '1',
  },
  {
    title: 'BenchBrain protein graph',
    body:
      'BenchBrain renders an interactive protein interaction graph that maps residues, edits, and literature-backed relationships—all grounded in your data tables and uploaded sequences.',
    accent: '2',
  },
  {
    title: 'Validate with statistics',
    body:
      'Instant calculations for t-tests, ANOVA, Bayesian credible intervals, and effect sizes—no manual scripting required.',
    accent: '3',
  },
  {
    title: 'Decide & share',
    body:
      'Generate shareable briefs with linked evidence, and export recommendations directly into your workflow tools.',
    accent: '4',
  },
]

const LandingPage = ({ onOpenNotebook, onRequestDemo, isLoading }) => {
  const launchLabel = isLoading ? 'Preparing…' : 'Try BenchBrain'

  return (
    <main className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#f8f5ff] via-white to-[#fff5f5] text-slate-800">
      <section className="relative overflow-hidden">
        <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,#e0e7ff_0%,transparent_65%)] blur-3xl" />
        <div className="absolute -right-16 bottom-10 hidden h-64 w-64 rounded-full bg-[radial-gradient(circle_at_bottom,#fecdd3_0%,transparent_75%)] blur-3xl lg:block" />

        <div className="mx-auto max-w-6xl px-6 pb-24 pt-20 sm:px-10 lg:flex lg:items-center lg:gap-16 lg:pt-28">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-4 py-1 text-sm font-semibold text-rose-600 shadow-sm backdrop-blur">
              BenchBrain · Intelligent Lab Notebook
            </div>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Document experiments. Let AI surface the breakthroughs.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              BenchBrain unifies note-taking, data tables, protein sequences, and
              protocols—then layers in biotech-trained AI to give you actionable
              recommendations you can trust.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onOpenNotebook}
                disabled={isLoading}
                className="rounded-full bg-notebook-red px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-notebook-red-hover disabled:opacity-60"
              >
                {launchLabel}
              </button>
              <button
                type="button"
                onClick={onRequestDemo}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-notebook-red"
              >
                Explore demo notebooks
              </button>
              <a
                href="#benchbrain-features"
                className="inline-flex items-center gap-2 rounded-full bg-white/60 px-6 py-3 text-sm font-semibold text-indigo-600 shadow border border-indigo-100 hover:bg-indigo-50 transition"
              >
                See how it works
                <span aria-hidden>↓</span>
              </a>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              <span>Sequence intelligence</span>
              <span>Interactive analysis graphs</span>
              <span>Statistical validation</span>
              <span>Cross-referenced literature</span>
            </div>
          </div>

          <div className="mt-14 flex flex-1 justify-center lg:mt-0">
            <NotebookPreviewCard />
          </div>
        </div>
      </section>

      <section
        id="benchbrain-features"
        className="bg-white py-20 text-slate-700 lg:py-28"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <header className="mb-12 space-y-3">
            <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Built for modern biotech teams
            </h2>
            <p className="max-w-2xl text-lg text-slate-500">
              From sample prep to publication, BenchBrain keeps your experiments,
              data, and AI insights stitched together—keeping scientists focused
              on discovery, not documentation.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature) => (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.12),transparent_65%)] blur-2xl transition group-hover:scale-110" />
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-xl">
                    {feature.icon}
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-500">
                  {feature.description}
                </p>
                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                  AI-first · BenchBrain platform
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-[#eef2ff] via-white to-[#e0f2fe] py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <div className="space-y-8">
              <span className="rounded-full border border-indigo-200 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-500">
                Workflow
              </span>
              <h2 className="text-3xl font-semibold text-slate-900">
                A single notebook that thinks with you
              </h2>
              <p className="text-lg text-slate-600">
                BenchBrain keeps your project context, raw data, and AI analysis
                in sync. Every step is auditable, every recommendation is tied to
                evidence.
              </p>
              <p className="text-sm leading-relaxed text-slate-500">
                The BenchBrain protein graph engine visualizes residue-level relationships, shows how recommended edits ripple through the structure, and anchors every insight to notebook citations.
              </p>

              <ol className="space-y-6">
                {workflowSteps.map((step) => (
                  <li
                    key={step.title}
                    className="flex gap-4 rounded-2xl border border-white/60 bg-white/80 p-6 shadow-md backdrop-blur"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                      {step.accent}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-500">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <figure className="relative order-2 overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-2xl backdrop-blur lg:order-none">
              <img
                src={proteinGraphImage}
                alt="BenchBrain protein interaction graph visualization"
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <figcaption className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/60 bg-white/80 p-5 text-sm text-slate-700 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    AI
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Protein graph insight
                    </p>
                    <p className="text-xs text-slate-500">
                      BenchBrain reveals residue-to-residue evidence paths, highlights destabilizing edits, and links each connection to notebook citations.
                    </p>
                  </div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="benchbrain-demos" className="bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900">
                Jump in with curated demo notebooks
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Load a ready-to-run experiment to see how BenchBrain preloads
                data tables, protocols, and AI insights—or start with a blank
                canvas tailored to your project.
              </p>
            </div>
            <button
              type="button"
              onClick={onRequestDemo}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:text-notebook-red"
            >
              View demo catalog
              <span aria-hidden>→</span>
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Liver Chip Toxicity',
                caption: 'Organ-on-chip assay with AI-derived biomarkers.',
              },
              {
                title: 'Lipase Optimization',
                caption: 'Enzyme evolution notebook with statistical pipelines.',
              },
              {
                title: 'Blank Notebook',
                caption: 'Start fresh with your own experiment context.',
              },
            ].map((demo) => (
              <article
                key={demo.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm"
              >
                <div className="space-y-3">
                  <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Demo notebook
                  </span>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {demo.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {demo.caption}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onRequestDemo}
                  className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-notebook-red px-4 py-2 text-sm font-semibold text-white shadow hover:bg-notebook-red-hover"
                >
                  Preview workflow
                  <span aria-hidden>→</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-16 text-slate-200">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h3 className="text-2xl font-semibold text-white">BenchBrain</h3>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Built by scientists for scientists. BenchBrain keeps your lab
              decisions transparent, collaborative, and grounded in evidence.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenNotebook}
              disabled={isLoading}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 disabled:opacity-60"
            >
              {launchLabel}
            </button>
            <button
              type="button"
              onClick={onRequestDemo}
              className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-white transition hover:border-white"
            >
              Talk to our team
            </button>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
