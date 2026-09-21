import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { AuthUser, Permission, SiteSettings } from "./global.type"
import { globalApi } from "./global.api"

interface GlobalState {
  auth: AuthUser | null
  systemPermissions: Permission[]
  sitSettings: SiteSettings | null
}
const initialState: GlobalState = {
  auth: null,
  systemPermissions: [],
  sitSettings: null,
}
export const globalSlice = createSlice({
  name: "Global",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthUser>) => {
      state.auth = action.payload
    },
    logout: (state) => {
      state.auth = null
    },
    setUserInfo: (state, action: PayloadAction<AuthUser["user"]>) => {
      if (state.auth) {
        state.auth.user = action.payload
      }
    },
    setSiteSettings: (state, action: PayloadAction<SiteSettings>) => {
      state.sitSettings = action.payload
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      globalApi.endpoints.getAllPermission.matchFulfilled,
      (state, action) => {
        state.systemPermissions = action.payload.data
      }
    )
  },
})

export const { login, logout, setUserInfo, setSiteSettings } =
  globalSlice.actions
export default globalSlice.reducer
