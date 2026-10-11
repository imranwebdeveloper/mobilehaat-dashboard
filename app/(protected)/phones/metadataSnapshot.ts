import type { GenerateMetadataBody } from "./phones.api"

export interface SnapshotSource {
  model?: string
  title?: string
  bd_status?: string
  approximate_price_bd?: number
  variants?: Array<{
    ram?: number
    official_price?: number
    unofficial_price?: number
  }>
  battery?: { capacity?: number }
  back_camera?: { cameras?: Array<{ mp?: number }> }
  display?: { size?: string }
  platform?: { chipset?: string }
  network?: { technology?: string[] }
}

const num = (value: unknown): number | undefined =>
  typeof value === "number" && !Number.isNaN(value) ? value : undefined

export function buildMetadataSnapshot(
  source: SnapshotSource,
  brandName: string
): GenerateMetadataBody {
  const variants = source.variants ?? []
  const priced =
    variants.find(
      (v) =>
        num(v.official_price) !== undefined ||
        num(v.unofficial_price) !== undefined
    ) ?? variants[0]

  const mainMp = (source.back_camera?.cameras ?? [])
    .map((c) => num(c.mp))
    .filter((mp): mp is number => mp !== undefined)
  const bestMp = mainMp.length > 0 ? Math.max(...mainMp) : undefined

  const body: GenerateMetadataBody = {
    brand: brandName,
    phone_model: source.model?.trim() ?? "",
  }

  if (source.title?.trim()) body.title = source.title.trim()
  if (source.bd_status) body.bd_status = source.bd_status
  const official = num(priced?.official_price)
  const unofficial = num(priced?.unofficial_price)
  if (official !== undefined) body.official_price = official
  if (unofficial !== undefined) body.unofficial_price = unofficial
  const approx = num(source.approximate_price_bd)
  if (approx !== undefined) body.approximate_price_bd = approx
  const capacity = num(source.battery?.capacity)
  if (capacity !== undefined && capacity > 0) body.battery_mah = capacity
  if (bestMp !== undefined) body.main_camera_mp = bestMp
  if (source.display?.size?.trim())
    body.display_size = source.display.size.trim()
  if (source.platform?.chipset?.trim())
    body.chipset = source.platform.chipset.trim()
  const ram = num(priced?.ram)
  if (ram !== undefined) body.ram_gb = ram
  const tech = source.network?.technology ?? []
  if (tech.some((t) => t.includes("5G"))) body.is_5g = true

  return body
}
