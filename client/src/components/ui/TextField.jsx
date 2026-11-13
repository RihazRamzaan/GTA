export default function TextField({ id, label, error, hint, reserveFeedback = false, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const feedback = <>
    {hint && !error && <p id={`${id}-hint`} className="mt-1 font-body text-xs text-[#a7a6b8]">{hint}</p>}
    {error && <p id={`${id}-error`} className="mt-1 font-body text-sm text-red-300">{error}</p>}
  </>;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-body text-sm font-semibold tracking-wide text-[#cac7e0]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-[#070714] px-3.5 py-2.5 font-body text-base text-[#f6f4fc] placeholder-white/30 transition-colors focus:border-[#00e5ff] focus:outline-none focus:ring-1 focus:ring-[#00e5ff]/50 ${error ? 'border-red-400' : 'border-white/15 hover:border-white/30'}`}
        {...inputProps}
      />
      {reserveFeedback ? <div className="min-h-12">{feedback}</div> : feedback}
    </div>
  );
}
