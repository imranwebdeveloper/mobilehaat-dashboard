import { ImageResponse } from "next/og"
import { readFileSync } from "node:fs"
import { join } from "node:path"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

const src = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public", "favicon-32x32.png")
).toString("base64")}`

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        // The favicon is its own rounded tile, so no backdrop here
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img src={src} alt="MobileHaat" width={32} height={32} />
    </div>,
    { ...size }
  )
}
