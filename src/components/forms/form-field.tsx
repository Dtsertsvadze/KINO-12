import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  valid?: boolean;
  compact?: boolean;
  containerClassName?: string;
};

export function FormField({
  id,
  label,
  error,
  valid = false,
  compact = false,
  containerClassName = "",
  className = "",
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <label
      className={`${compact ? "grid gap-1.5" : "grid gap-2"} ${containerClassName}`}
      htmlFor={id}
    >
      <span
        className={
          compact
            ? `text-[10px] leading-4 font-semibold ${error ? "text-error" : "text-muted"}`
            : "text-xs font-semibold text-muted"
        }
      >
        {label}
      </span>
      <span className="relative block">
        <input
          {...inputProps}
          id={id}
          className={`w-full border pr-10 text-foreground outline-none transition placeholder:text-muted focus:border-brand disabled:cursor-not-allowed disabled:opacity-60 ${
            compact
              ? "h-10 rounded-lg bg-surface px-3 text-[11px]"
              : "h-12 rounded-xl bg-surface px-4 text-sm focus:bg-surface-raised"
          } ${
            error
              ? "border-error focus:border-error"
              : valid
                ? "border-success"
                : "border-foreground/[0.1]"
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />

        {error ? (
          <svg
            aria-hidden="true"
            className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-error"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" />
            <path d="M8 4.8v3.8" stroke="currentColor" strokeLinecap="round" />
            <circle cx="8" cy="11.2" r=".65" fill="currentColor" />
          </svg>
        ) : valid ? (
          <svg
            aria-hidden="true"
            className="absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-success"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="m3.5 8.2 2.7 2.6 6.3-6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.4"
            />
          </svg>
        ) : null}
      </span>
      {error ? (
        <span
          id={errorId}
          role="alert"
          className={
            compact
              ? "text-[10px] leading-4 text-error"
              : "text-xs leading-5 text-error"
          }
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className="rounded-xl border border-error/[0.25] bg-error/[0.1] px-4 py-3 text-sm leading-5 text-error"
      role="alert"
    >
      {message}
    </p>
  );
}
