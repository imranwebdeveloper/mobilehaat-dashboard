import { ApiResponse, CommonQuery } from "@/store/global.type"
import { configApi } from "@/config/reduxApiConfig"
import { IContact } from "./contacts.type"
import { ContactFormValues } from "./contacts.dto"

export const contactApi = configApi.injectEndpoints({
  endpoints: (build) => ({
    getAllContacts: build.query<ApiResponse<IContact[]>, CommonQuery>({
      query: (params) => ({
        url: `/contacts`,
        params,
      }),
      providesTags: ["Contact"],
    }),

    getContactById: build.query<ApiResponse<IContact>, string>({
      query: (id) => ({
        url: `/contacts/${id}`,
      }),
      providesTags: ["Contact"],
    }),

    updateContact: build.mutation<
      ApiResponse<IContact>,
      { id: string; body: Partial<ContactFormValues> }
    >({
      query: ({ id, body }) => ({
        url: `/contacts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Contact"],
    }),

    deleteContact: build.mutation<ApiResponse<IContact>, string>({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
})

export const {
  useGetAllContactsQuery,
  useGetContactByIdQuery,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi
