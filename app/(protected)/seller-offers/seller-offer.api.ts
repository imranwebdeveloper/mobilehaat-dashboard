import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { ISellerOffer } from "./seller-offer.type"

export const sellerOfferApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllSellerOffers: build.query<
      ApiResponse<ISellerOffer[]>,
      CommonQuery & { seller_id?: string }
    >({
      query: (params) => ({
        url: `/admin/seller-offers`,
        params,
      }),
      providesTags: ["SellerOffer"],
    }),

    getSellerOfferById: build.query<ApiResponse<ISellerOffer>, string>({
      query: (id) => ({
        url: `/admin/seller-offers/${id}`,
      }),
      providesTags: ["SellerOffer"],
    }),

    updateSellerOfferStatus: build.mutation<
      ApiResponse<ISellerOffer>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/admin/seller-offers/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["SellerOffer"],
    }),

    deleteSellerOffer: build.mutation<ApiResponse<ISellerOffer>, string>({
      query: (id) => ({
        url: `/admin/seller-offers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SellerOffer"],
    }),
  }),
})

export const {
  useGetAllSellerOffersQuery,
  useGetSellerOfferByIdQuery,
  useUpdateSellerOfferStatusMutation,
  useDeleteSellerOfferMutation,
} = sellerOfferApi
