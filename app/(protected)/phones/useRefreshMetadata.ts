import { toast } from "sonner"
import { useGenerateAndApplyPhoneMetadataMutation } from "./phones.api"

/**
 * Regenerates and saves a phone's SEO metadata from its saved data
 * (POST /ai/metadata/:phoneId?apply=true). Call it after a price, expected
 * price or BD-status change so the title/description stop showing the old
 * price or "(Expected)".
 */
export function useRefreshMetadata() {
  const [apply, { isLoading }] = useGenerateAndApplyPhoneMetadataMutation()

  const refresh = async (phoneId: string, phoneTitle?: string) => {
    try {
      await apply({ phoneId }).unwrap()
      toast.success(
        phoneTitle
          ? `${phoneTitle}: SEO metadata updated`
          : "SEO metadata updated"
      )
      return true
    } catch (error) {
      const message = (error as { data?: { message?: string } })?.data?.message
      toast.error(
        message ||
          "Price saved, but SEO metadata could not be updated — use Generate metadata on the phone."
      )
      return false
    }
  }

  return { refresh, isRefreshing: isLoading }
}
