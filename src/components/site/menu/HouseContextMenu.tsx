import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import { useResetHouse } from "@/stores/houses"
import scope, { ScopeTypeEnum } from "@/stores/scope"
import React from "react"

const HouseContextMenu = (props: ContextMenuProps) => {
  if (scope.type !== ScopeTypeEnum.Enum.HOUSE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const houseId = scope.selected[0]

  const resetHouse = useResetHouse(houseId)

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>House</ContextMenuHeading>
      <ContextMenuButton onClick={resetHouse}>Reset</ContextMenuButton>
    </ContextMenu>
  )
}

export default HouseContextMenu
