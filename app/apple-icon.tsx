import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const size = {
  width: 180,
  height: 180,
}
export const contentType = "image/png"

const src = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "apple-touch-icon.png")
).toString("base64")}`

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 24,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={src} alt="MobileHaat" width={180} height={180} />
    </div>,
    { ...size }
  )
}
