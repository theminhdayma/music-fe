import { Input } from "@/components/ui/input"

interface AuthOtpFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  hint?: string
}

export function AuthOtpField({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  hint,
}: AuthOtpFieldProps) {
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
        type="text"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] text-center text-lg font-semibold tracking-[0.42em] text-zinc-50 shadow-inner shadow-black/20 placeholder:text-zinc-500 transition duration-200 focus-visible:border-fuchsia-400/60 focus-visible:ring-4 focus-visible:ring-fuchsia-500/20"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="123456"
        maxLength={6}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
      />
      {hint ? (
        <p id={hintId} className="text-xs leading-6 text-zinc-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
