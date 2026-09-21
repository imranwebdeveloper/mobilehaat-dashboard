"use client"

import MediaGalleryWrapper from "./MediaGalleryWrapper"
import MediaProviderWrapper from "./MediaProviderWrapper"

const Wrapper = () => {
  return (
    <div>
      <MediaProviderWrapper>
        <MediaGalleryWrapper />
      </MediaProviderWrapper>
    </div>
  )
}

export default Wrapper
