import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IPaymentRecord } from "./payment-record.type"

export const paymentRecordApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllPaymentRecords: build.query<
      ApiResponse<IPaymentRecord[]>,
      CommonQuery
    >({
      query: (params) => ({
        url: `/payment-records`,
        params,
      }),
      providesTags: ["PaymentRecord"],
    }),

    getPaymentRecordById: build.query<ApiResponse<IPaymentRecord>, string>({
      query: (id) => ({
        url: `/payment-records/${id}`,
      }),
      providesTags: ["PaymentRecord"],
    }),

    updatePaymentRecord: build.mutation<
      ApiResponse<IPaymentRecord>,
      { id: string; body: { payment_method?: string; amount?: number; transaction_reference?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/payment-records/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PaymentRecord"],
    }),

    submitPaymentRecord: build.mutation<
      ApiResponse<IPaymentRecord>,
      { id: string; body: { transaction_reference?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/payment-records/${id}/submit`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PaymentRecord"],
    }),

    verifyPaymentRecord: build.mutation<ApiResponse<IPaymentRecord>, string>({
      query: (id) => ({
        url: `/payment-records/${id}/verify`,
        method: "PATCH",
        body: {},
      }),
      invalidatesTags: ["PaymentRecord", "SellerSubscription", "Seller"],
    }),

    rejectPaymentRecord: build.mutation<
      ApiResponse<IPaymentRecord>,
      { id: string; body: { rejection_reason: string } }
    >({
      query: ({ id, body }) => ({
        url: `/payment-records/${id}/reject`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["PaymentRecord", "SellerSubscription"],
    }),
  }),
})

export const {} = paymentRecordApi

/**
 * Download invoice PDF for a payment record.
 * Uses direct fetch + blob since the endpoint returns binary PDF, not JSON.
 */
export const downloadInvoicePdf = async (
  paymentId: string,
  token?: string,
): Promise<void> => {
  const url = `${process.env.API_URL}/payment-records/${paymentId}/invoice`
  const headers: Record<string, string> = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    throw new Error(`Failed to download invoice: ${response.statusText}`)
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = `invoice-${paymentId}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000)
}
