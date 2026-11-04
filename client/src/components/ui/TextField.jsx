export default function TextField({ id, label, error, hint, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 block font-body text-base font-semibold text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={id}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-night px-3 py-2.5 font-body text-lg text-white placeholder-slate-500 focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan ${error ? 'border-red-400' : 'border-neon-purple/50'}`}
        {...inputProps}
      />
      {hint && !error && <p id={`${id}-hint`} className="mt-1 font-body text-sm text-slate-400">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 font-body text-base text-red-300">{error}</p>}
    </div>
  );
}
