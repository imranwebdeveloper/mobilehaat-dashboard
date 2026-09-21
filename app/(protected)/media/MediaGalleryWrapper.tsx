"use client"

import { LayoutGrid, Upload } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Filters } from "./Filters"
import { UploadZone } from "./UploadZone"
import { MediaDetailsModal } from "./MediaDetailsModal"
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"
import MediaGridView from "./MediaGridView"
import { Permissions } from "@/config/permissions"
import { withAuth } from "@/components/hoc"
import Permission from "@/components/common/Permission"

function MediaGalleryWrapper({ isModalView }: { isModalView?: boolean }) {
  return (
    <div className="flex min-h-[93vh] flex-col bg-background text-foreground">
      {/* Header */}
      <Tabs defaultValue="media" className="flex flex-1 flex-col gap-0">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <LayoutGrid className="h-5 w-5 text-primary-foreground" />
            </div>

            <h1 className="text-lg font-semibold">Media Library</h1>
          </div>
          <TabsList variant={"whiteLg"}>
            <TabsTrigger
              value="media"
              className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
            >
              <LayoutGrid className="mr-1 h-4 w-4" />
              Media Library
            </TabsTrigger>

            <Permission permission={Permissions.MEDIA_CREATE}>
              <TabsTrigger
                value="upload"
                className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
              >
                <Upload className="mr-1 h-4 w-4" />
                Add New
              </TabsTrigger>
            </Permission>
          </TabsList>
        </div>

        <div className="flex flex-1 flex-col">
          {/* Media Tab */}
          <TabsContent
            value="media"
            className="flex flex-col bg-muted p-4 pb-0"
          >
            <Filters />
            <div className="flex flex-1 flex-col">
              <MediaGridView isModalView={isModalView} />
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="flex flex-col bg-muted p-4">
            <UploadZone />
          </TabsContent>
        </div>
      </Tabs>
      <MediaDetailsModal />
      <DeleteConfirmationModal />
    </div>
  )
}

export default withAuth(MediaGalleryWrapper, {
  requiredPermissions: [Permissions.MEDIA_READ],
})
