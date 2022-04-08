import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import scopes, { ElementScope } from "@/stores/scope"
import React from "react"
import { useSnapshot } from "valtio"

type Props = ContextMenuProps & {
  buildingId: string
}

const BuildingContextMenu = (props: Props) => {
  const { buildingId, ...restProps } = props
  const { primary: scope } = useSnapshot(scopes)
  if (scope.selected.length !== 1) return null
  const elementName = (scope as ElementScope).selected[0].elementName
  return (
    <ContextMenu {...restProps}>
      <ContextMenuHeading>{elementName}</ContextMenuHeading>
    </ContextMenu>
  )
}

export default BuildingContextMenu
