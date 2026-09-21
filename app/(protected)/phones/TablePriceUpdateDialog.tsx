"use client"

import { usePhoneTable } from "./usePhoneTable"
import UpdatePriceDialog from "./UpdatePriceDialog"

interface TablePriceUpdateDialogProps {
  phoneTable: ReturnType<typeof usePhoneTable>
}

const TablePriceUpdateDialog = ({
  phoneTable,
}: TablePriceUpdateDialogProps) => {
  const { priceUpdatePhone, setPriceUpdatePhoneId } = phoneTable

  if (!priceUpdatePhone) return null

  return (
    <UpdatePriceDialog
      phone={priceUpdatePhone}
      open={!!priceUpdatePhone}
      onOpenChange={(open) => {
        if (!open) {
          setPriceUpdatePhoneId(null)
        }
      }}
    />
  )
}

export default TablePriceUpdateDialog
