"use client"

import { FolderOpenIcon } from "lucide-react"
import PhoneSectionNav from "../phones/PhoneSectionNav"

const PageHeader = () => {
  return (
    <div className="flex flex-col border-b border-muted bg-background px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
          <FolderOpenIcon className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold">Phone Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage all phone categories here.
          </p>
        </div>
      </div>
      <PhoneSectionNav />
    </div>
  )
}

export default PageHeader
