"use client"

import React, { useEffect } from "react"
import { userApi } from "@/app/(protected)/users/users.api"
import { globalApi } from "@/store/global.api"
import { setUserInfo } from "@/store/global.slice"
import { useAppDispatch, useAppSelector } from "@/config/reduxStoreConfig"
import Loading from "../ui/loading"

const InitialDataProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch()

  const auth = useAppSelector((state) => state.global.auth)
  const userId = auth?.user?._id

  globalApi.useGetAllPermissionQuery(
    {},
    {
      skip: !userId,
    }
  )

  const { data, isSuccess, isLoading } = userApi.useGetPermissionsByUserIdQuery(
    userId!,
    {
      skip: !userId,
    }
  )

  useEffect(() => {
    if (isSuccess && data?.data) {
      dispatch(setUserInfo(data.data))
    }
  }, [isSuccess, data, dispatch])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading />
      </div>
    )
  }

  return <>{children}</>
}

export default InitialDataProvider
