import React, { useState } from 'react';

export default function TextField({ id, label, error, hint, reserveFeedback = false, type = 'text', ...inputProps }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const feedback = (
    <>
      {hint && !error && <p id={`${id}-hint`} className="mt-1 font-body text-xs text-[#a7a6b8]">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 font-body text-sm text-red-300">{error}</p>}
    </>
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="block font-body text-sm font-semibold tracking-wide text-[#cac7e0]">
          {label}
        </label>
      </div>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={effectiveType}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-lg border bg-[#070714] px-3.5 py-2.5 ${isPassword ? 'pr-11' : ''} font-body text-base text-[#f6f4fc] placeholder-white/30 transition-colors focus:border-[#00e5ff] focus:outline-none focus:ring-1 focus:ring-[#00e5ff]/50 ${error ? 'border-red-400' : 'border-white/15 hover:border-white/30'}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[#a7a6b8] hover:text-[#00e5ff] transition-colors focus:outline-none"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {reserveFeedback ? <div className="min-h-12">{feedback}</div> : feedback}
    </div>
  );
}
