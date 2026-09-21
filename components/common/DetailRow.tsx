import Link from "next/link"
import type { LucideIcon } from "lucide-react"

const DetailRow = ({
  icon: Icon,
  label,
  value,
  href,
  badge,
}: {
  icon?: LucideIcon
  label: string
  value?: string | null
  href?: string
  badge?: React.ReactNode
}) => (
  <div className="flex items-start justify-between gap-3 border-b border-muted pb-3 last:border-0 last:pb-0">
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-1.5 text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
        <span className="text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
      </div>
      {href && value ? (
        <Link
          href={href}
          className="text-sm font-medium break-all text-primary hover:underline"
        >
          {value}
        </Link>
      ) : (
        <span className="text-sm font-medium break-all">{value || "N/A"}</span>
      )}
    </div>
    {badge ? <div className="shrink-0">{badge}</div> : null}
  </div>
)

export default DetailRow
