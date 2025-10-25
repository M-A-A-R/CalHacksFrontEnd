import React, { useEffect, useRef, useState } from 'react';

const DEFAULT_PROTOCOL = {
  title: '',
  description: '',
  steps: [''],
  notes: '',
};

const ProtocolUploader = ({
  storageKey = 'protocolUploaderState',
  compact = false,
  className = '',
}) => {
  const [protocol, setProtocol] = useState(DEFAULT_PROTOCOL);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const isHydrated = useRef(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProtocol({
          title: parsed?.title ?? '',
          description: parsed?.description ?? '',
          steps:
            Array.isArray(parsed?.steps) && parsed.steps.length
              ? parsed.steps
              : [''],
          notes: parsed?.notes ?? '',
        });
      }
    } catch (error) {
      console.error('Failed to load protocol data', error);
    } finally {
      isHydrated.current = true;
    }
  }, [storageKey]);

  useEffect(() => {
    if (!isHydrated.current) return;

    setIsSaving(true);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(protocol));
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Failed to save protocol data', error);
    } finally {
      setIsSaving(false);
    }
  }, [protocol, storageKey]);

  const updateField = (field, value) =>
    setProtocol((prev) => ({ ...prev, [field]: value }));

  const updateStep = (index, value) =>
    setProtocol((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? value : step)),
    }));

  const addStep = () =>
    setProtocol((prev) => ({ ...prev, steps: [...prev.steps, ''] }));

  const removeStep = (index) =>
    setProtocol((prev) => ({
      ...prev,
      steps:
        prev.steps.length <= 1
          ? ['']
          : prev.steps.filter((_, stepIndex) => stepIndex !== index),
    }));

  const wrapperClasses = compact
    ? `flex w-[420px] max-w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-md ${className}`
    : `flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg ${className}`;

  return (
    <div className={wrapperClasses}>
      {!compact && (
        <header className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-slate-800">Protocol Editor</h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Draft procedures and keep them saved locally.
          </p>
        </header>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Title
        </span>
        <input
          type="text"
          value={protocol.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="e.g., PCR Amplification"
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Overview
        </span>
        <textarea
          rows={compact ? 3 : 4}
          value={protocol.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Brief summary of the procedure..."
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
        />
      </label>

      <section className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50/60 p-3">
        <header className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Steps
          </span>
          <button
            type="button"
            onClick={addStep}
            className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-bio-primary hover:text-bio-primary"
          >
            + Step
          </button>
        </header>

        <ul className="flex flex-col gap-2">
          {protocol.steps.map((step, index) => (
            <li key={`${storageKey}-step-${index}`} className="flex gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-bio-primary/10 text-xs font-semibold text-bio-primary">
                {index + 1}
              </div>
              <textarea
                rows={compact ? 2 : 3}
                value={step}
                onChange={(event) => updateStep(index, event.target.value)}
                placeholder={`Describe step ${index + 1}...`}
                className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
              />
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="self-start rounded-md border border-red-200 px-2 py-1 text-xs text-red-500 transition hover:bg-red-50"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes
        </span>
        <textarea
          rows={compact ? 2 : 3}
          value={protocol.notes}
          onChange={(event) => updateField('notes', event.target.value)}
          placeholder="Other considerations or observations..."
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-bio-primary focus:outline-none focus:ring-1 focus:ring-bio-primary/30"
        />
      </label>

      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>{protocol.steps.length} steps</span>
        <span>
          {isSaving
            ? 'Saving…'
            : lastSaved
            ? `Saved ${new Date(lastSaved).toLocaleTimeString()}`
            : 'No saves yet'}
        </span>
      </div>
    </div>
  );
};

export default ProtocolUploader;
