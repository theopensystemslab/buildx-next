import { ScopeTypeEnum, store } from "@/store"
import React from "react"
import { useSnapshot } from "valtio"
import HouseContextMenu from "./HouseContextMenu"
import LevelContextMenu from "./LevelContextMenu"
import ModuleContextMenu from "./ModuleContextMenu"

const SiteContextMenu = () => {
  const { contextMenu } = useSnapshot(store)
  if (!contextMenu) return null

  const [pageX, pageY] = contextMenu

  const onClose = () => void (store.contextMenu = null)

  const props = { pageX, pageY, onClose }

  switch (store.scope.type) {
    case ScopeTypeEnum.Enum.LEVEL:
      return <LevelContextMenu {...props} />
    case ScopeTypeEnum.Enum.HOUSE:
      return <HouseContextMenu {...props} />
    case ScopeTypeEnum.Enum.MODULE:
      return <ModuleContextMenu {...props} />
    default:
      return null
  }
}

export default SiteContextMenu
