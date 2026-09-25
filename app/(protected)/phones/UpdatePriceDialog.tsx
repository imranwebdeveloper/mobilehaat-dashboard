"use client"

import { useState } from "react"
import type { ChangeEvent } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useUpdateVariantsPriceMutation } from "./priceHistoryApi"
import { IPhone } from "./phones.type"
import { PhoneStatus, BDStatus } from "./phones.constant"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller } from "react-hook-form"
import FormFieldWrapper from "@/components/ui/FormFieldWrapper"
import { formatBDT, formatDate } from "@/lib/utils"

const handleNumberInput =
  (onChange: (value: number) => void) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    onChange(value === "" ? Number.NaN : Number(value))
  }

const variantPriceSchema = z.object({
  official_price: z.union([z.number(), z.nan()]).optional(),
  unofficial_price: z.union([z.number(), z.nan()]).optional(),
  currency: z.string().default("BDT"),
})

const updatePricesSchema = z
  .object({
    variants: z.array(variantPriceSchema),
    status: z.string().default(PhoneStatus.DRAFT),
    bd_status: z.string().default(BDStatus.UNKNOWN),
    reason: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.variants.some((v) => {
        const hasOfficial =
          v.official_price !== undefined && !Number.isNaN(v.official_price)
        const hasUnofficial =
          v.unofficial_price !== undefined && !Number.isNaN(v.unofficial_price)
        return hasOfficial || hasUnofficial
      }),
    {
      message: "At least one price must be provided",
      path: ["variants"],
    }
  )

type UpdatePricesFormValues = z.input<typeof updatePricesSchema>

interface UpdatePriceDialogProps {
  phone: IPhone
  children?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onUpdated?: () => void
}

const UpdatePriceDialog = ({
  phone,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onUpdated,
}: UpdatePriceDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [updateVariantsPrice, { isLoading }] = useUpdateVariantsPriceMutation()

  const open = controlledOpen ?? internalOpen
  const setOpen = controlledOnOpenChange ?? setInternalOpen

  const variants = phone.variants || []

  const form = useForm<UpdatePricesFormValues>({
    resolver: zodResolver(updatePricesSchema),
    defaultValues: {
      variants: variants.map((v) => ({
        official_price: v.official_price,
        unofficial_price: v.unofficial_price,
        currency: v.currency || "BDT",
      })),
      status: phone.status,
      bd_status: phone.bd_status || BDStatus.UNKNOWN,
      reason: "",
    },
  })

  const handleSubmit = async (values: UpdatePricesFormValues) => {
    try {
      const items = values.variants
        .map((v, i) => {
          const hasOfficial =
            v.official_price !== undefined && !Number.isNaN(v.official_price)
          const hasUnofficial =
            v.unofficial_price !== undefined &&
            !Number.isNaN(v.unofficial_price)
          if (!hasOfficial && !hasUnofficial) return null
          return {
            variantId: variants[i]._id,
            official_price: hasOfficial ? v.official_price : undefined,
            unofficial_price: hasUnofficial ? v.unofficial_price : undefined,
            currency: v.currency,
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

      if (items.length === 0) {
        toast.error("At least one price must be provided")
        return
      }

      await updateVariantsPrice({
        phoneId: phone._id,
        variants: items,
        status: values.status,
        bd_status: values.bd_status,
        reason: values.reason || undefined,
      }).unwrap()

      toast.success("Prices updated successfully")
      setOpen(false)
      onUpdated?.()
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } }
      toast.error(err?.data?.message || "Failed to update prices")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">Update Price</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Update Variant Prices</DialogTitle>
          <DialogDescription>
            Update prices for {phone.title}. Prices for all variants will be
            saved and recorded in price history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
          <span className="text-sm text-muted-foreground">
            Approximate price
          </span>
          <span className="text-base font-bold">
            {formatBDT(phone.approximate_price_bd || 0)}
          </span>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No variants found for this phone.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>Official price</TableHead>
                    <TableHead>Unofficial price</TableHead>
                    <TableHead>Last updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant, index) => (
                    <TableRow key={variant._id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {variant.ram}GB / {variant.storage}GB
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={form.control}
                          name={`variants.${index}.official_price`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="0"
                              min={0}
                              aria-label={`Official price for ${variant.ram}GB ${variant.storage}GB`}
                              {...field}
                              value={
                                Number.isNaN(field.value)
                                  ? ""
                                  : (field.value ?? "")
                              }
                              onChange={handleNumberInput(field.onChange)}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          control={form.control}
                          name={`variants.${index}.unofficial_price`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              placeholder="0"
                              min={0}
                              aria-label={`Unofficial price for ${variant.ram}GB ${variant.storage}GB`}
                              {...field}
                              value={
                                Number.isNaN(field.value)
                                  ? ""
                                  : (field.value ?? "")
                              }
                              onChange={handleNumberInput(field.onChange)}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(variant.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="space-y-3 rounded-lg border p-4">
            <span className="text-sm font-medium">Phone Details</span>
            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Status
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      {Object.values(PhoneStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="bd_status"
                render={({ field }) => (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      BD Status
                    </label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...field}
                    >
                      {Object.values(BDStatus).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              />
            </div>
          </div>

          <FormFieldWrapper
            label="Reason (optional)"
            error={form.formState.errors.reason?.message}
          >
            <Controller
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Textarea placeholder="Why is the price changing?" {...field} />
              )}
            />
          </FormFieldWrapper>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Update Prices"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UpdatePriceDialog
