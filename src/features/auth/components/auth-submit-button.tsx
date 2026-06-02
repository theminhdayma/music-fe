import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AuthSubmitButtonProps {
  label: string
  loadingLabel: string
  isLoading: boolean
}

export function AuthSubmitButton({
  label,
  loadingLabel,
  isLoading,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="h-12 w-full rounded-2xl border border-fuchsia-400/20 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(168,85,247,0.3)] transition duration-200 hover:brightness-110 hover:shadow-[0_20px_55px_rgba(168,85,247,0.4)] focus-visible:ring-4 focus-visible:ring-fuchsia-400/30"
      disabled={isLoading}
    >
      <span className="inline-flex items-center gap-2">
        {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
        {isLoading ? loadingLabel : label}
      </span>
    </Button>
  )
}
