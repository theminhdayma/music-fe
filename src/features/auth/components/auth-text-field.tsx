import { Input } from "@/components/ui/input"

interface AuthTextFieldProps {
  id: string
  label: string
  type?: "text" | "email" | "password"
  placeholder?: string
  error?: string
  disabled?: boolean
  autoComplete?: string
  hint?: string
  value: string
  onChange: (value: string) => void
}

export function AuthTextField({
  id,
  label,
  type = "text",
  placeholder,
  error,
  disabled,
  autoComplete,
  value,
  onChange,
  hint,
}: AuthTextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className="space-y-2.5">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-zinc-200">
          {label}
        </label>
        {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
      </div>
      <Input
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-zinc-50 shadow-inner shadow-black/20 placeholder:text-zinc-500 transition duration-200 focus-visible:border-fuchsia-400/60 focus-visible:ring-4 focus-visible:ring-fuchsia-500/20"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p id={errorId} className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
