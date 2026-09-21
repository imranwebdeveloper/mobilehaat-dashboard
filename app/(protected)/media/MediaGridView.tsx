import { LayoutGrid } from "lucide-react"
import { MediaItemCard } from "./MediaItemCard"
import { CustomPagination } from "../../../components/CustomPagination"
import { mediaApi } from "./media.api"
import { useQueryContext } from "@/hooks/useQueryContext"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

const MediaGridView = ({ isModalView }: { isModalView?: boolean }) => {
  const { query } = useQueryContext()

  const { data, isLoading } = mediaApi.useGetAllMediaQuery({
    ...query,
    limit: 16,
  })

  const media = data?.data || []
  const pagination = data?.paginate

  /* ---------------- Skeleton Loader ---------------- */

  if (isLoading) {
    return (
      <div className="grid grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  /* ---------------- Empty State ---------------- */

  if (!media.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center py-32 text-center">
        <LayoutGrid className="mb-4 h-10 w-10 text-muted-foreground" />

        <h3 className="text-xl font-semibold">No media files found</h3>

        <p className="mb-6 text-muted-foreground">
          Try adjusting your filters or upload new files.
        </p>

        <TabsList variant={"whiteLg"}>
          <TabsTrigger
            value="upload"
            className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <LayoutGrid className="mr-1 h-4 w-4" />
            Media Library
          </TabsTrigger>
        </TabsList>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div
        className={`flex-1 overflow-y-auto ${isModalView ? "md:max-h-[calc(100vh-50vh)]" : "flex-1"} `}
      >
        <div
          className={`m-0.5 grid grid-cols-1 gap-2 sm:grid-cols-2 ${isModalView ? "md:grid-cols-6 xl:grid-cols-8" : "md:grid-cols-4 xl:grid-cols-6"}`}
        >
          {media.map((item) => (
            <MediaItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
      <CustomPagination paginate={pagination} />
    </div>
  )
}

export default MediaGridView

/* ---------------- Skeleton Component ---------------- */

function MediaCardSkeleton() {
  return (
    <div className="space-y-2 bg-background p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  )
}
