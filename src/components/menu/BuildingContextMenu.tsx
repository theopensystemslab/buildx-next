import React from "react"
import ContextMenu, { ContextMenuProps } from "../ui/ContextMenu"
import ContextMenuHeading from "../ui/ContextMenuHeading"

type Props = ContextMenuProps & {
  buildingId: string
}

const BuildingContextMenu = (props: Props) => {
  const { buildingId, ...restProps } = props
  return (
    <ContextMenu {...restProps}>
      <ContextMenuHeading>Building Menu</ContextMenuHeading>
    </ContextMenu>
  )
}

export default BuildingContextMenu
