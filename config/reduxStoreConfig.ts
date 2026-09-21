import { useDispatch, useSelector, useStore } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import { configApi } from "@/config/reduxApiConfig"
import { scraperApi } from "@/config/scraperApiConfig"
import globalReducer from "@/store/global.slice"

export const makeStore = () => {
  return configureStore({
    reducer: {
      [configApi.reducerPath]: configApi.reducer,
      [scraperApi.reducerPath]: scraperApi.reducer,
      global: globalReducer,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(
        configApi.middleware,
        scraperApi.middleware
      )
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore["getState"]>
export type AppDispatch = AppStore["dispatch"]

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
