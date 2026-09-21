export type MediaType = "image" | "video"

export interface MediaFilters {
  search: string
  type: MediaType | "all"
  dateRange: string
}
