import type { ComponentProps } from "react";

type AuthFormFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  error?: string;
};

export function AuthFormField({
  id,
  label,
  error,
  ...inputProps
}: AuthFormFieldProps) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-gray-700"
      >
        {label}
      </label>
      <input
        {...inputProps}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="block min-h-12 w-full min-w-0 rounded border border-gray-300 bg-gray-200 px-4 py-3 text-base text-gray-700 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm font-bold text-red-500 [overflow-wrap:anywhere]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
