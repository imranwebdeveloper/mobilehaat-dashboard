import { cache } from "react"
import { ApiResponse, SiteSettings } from "@/store/global.type"
import { config } from "@/config/config"

export const getData = async <T>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const url = `${config.env.API_URL}${path}`
    const res = await fetch(url, {
      headers: { ...config.headers, "Content-Type": "application/json" },
      ...options,
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "Unknown error")
      throw new Error(`API error ${res.status} ${res.statusText}: ${errorBody}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    throw new Error(JSON.stringify(error))
  }
}

export const patchData = async <T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const res = await fetch(`${config.env.API_URL}/${path}`, {
      method: "PATCH",
      headers: {
        ...config.headers,
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...options,
    })

    if (!res.ok) {
      const errorBody = await res.text().catch(() => "Unknown error")
      throw new Error(`API error ${res.status} ${res.statusText}: ${errorBody}`)
    }

    const data = await res.json()
    return data
  } catch (error) {
    throw new Error(JSON.stringify(error))
  }
}

export const getSiteSettings = cache(async () =>
  getData<ApiResponse<SiteSettings>>("/web-settings/public")
)
