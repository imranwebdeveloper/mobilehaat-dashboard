"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { IPagination } from "@/store/global.type"
import { useQueryContext } from "@/hooks/useQueryContext"

interface PaginationProps {
  paginate?: IPagination
  siblingCount?: number
  onPageChange?: (page: number) => void
}

export function CustomPagination({
  paginate,
  siblingCount = 1,
  onPageChange: onPageChangeProp,
}: PaginationProps) {
  const ctx = useQueryContext()
  const setQuery = onPageChangeProp ? undefined : ctx?.setQuery
  const query = onPageChangeProp ? undefined : ctx?.query

  if (!paginate || paginate.total_pages < 2) return null

  const { current_page, per_page, total, total_pages } = paginate
  const startItem = (current_page - 1) * per_page + 1
  const endItem = Math.min(current_page * per_page, total)

  const onPageChange = (page: number) => {
    if (page < 1 || page > total_pages) return
    if (onPageChangeProp) {
      onPageChangeProp(page)
    } else if (setQuery && query) {
      setQuery({ ...query, page })
    }
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const left = Math.max(1, current_page - siblingCount)
    const right = Math.min(total_pages, current_page + siblingCount)

    if (left > 1) {
      pages.push(1)
      if (left > 2) pages.push("…")
    }

    for (let i = left; i <= right; i++) {
      pages.push(i)
    }

    if (right < total_pages) {
      if (right < total_pages - 1) pages.push("…")
      pages.push(total_pages)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 rounded-lg py-4 sm:flex-row sm:justify-between">
      {/* Item Count */}
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{startItem}</span>{" "}
        to <span className="font-medium text-foreground">{endItem}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span> items
      </div>

      {/* Pagination */}
      <div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(current_page - 1)
                }}
              />
            </PaginationItem>

            {pageNumbers.map((page, idx) =>
              typeof page === "string" ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    isActive={current_page === page}
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(page)
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(current_page + 1)
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
