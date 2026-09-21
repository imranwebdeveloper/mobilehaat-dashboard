import dayjs from "dayjs"

export const toDateTimeLocal = (value?: string) => {
  if (!value) return ""
  return dayjs(value).format("YYYY-MM-DDTHH:mm")
}
