import { store } from "@/store"
import React from "react"
import { useSnapshot } from "valtio"

const SiteContextMenu = () => {
  const { contextMenu } = useSnapshot(store)
  if (!contextMenu) return null
  const [pageX, pageY] = contextMenu
  return (
    <div
      style={{
        position: "absolute",
        top: pageY,
        left: pageX,
      }}
    >
      <h2>hi</h2>
    </div>
  )
}

export default SiteContextMenu
