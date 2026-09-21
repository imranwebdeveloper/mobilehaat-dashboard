import { SiteSettings } from "@/store/global.type"
import { useAppSelector } from "@/config/reduxStoreConfig"

export const useSiteSetting = <K extends keyof SiteSettings>(
  key: K
): SiteSettings[K] | undefined => {
  const settings = useAppSelector((state) => state.global.sitSettings)

  return settings?.[key]
}
