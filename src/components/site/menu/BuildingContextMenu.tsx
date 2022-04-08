import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import context from "@/stores/context"
import scopes, { ElementScope, ScopeTypeEnum } from "@/stores/scope"
import React from "react"
import { useSnapshot } from "valtio"

type Props = ContextMenuProps & {
  buildingId: string
}

const BuildingContextMenu = (props: Props) => {
  const { buildingId, ...restProps } = props
  const { primary, secondary } = useSnapshot(scopes)
  if (
    primary.type !== ScopeTypeEnum.Enum.ELEMENT ||
    secondary.type !== ScopeTypeEnum.Enum.LEVEL
  )
    throw new Error("Unexpected scopes in BuildingContextMenu")

  if (primary.selected.length > 1 || secondary.selected.length > 1)
    throw new Error("Multi-select not yet supported in building context")
  // if (scope.selected.length !== 1) return null
  const elementName = primary.selected[0].elementName
  const levelIndex = secondary.selected[0].levelIndex

  const editLevel = () => {
    context.levelIndex = levelIndex
    props.onClose?.()
  }

  return (
    <ContextMenu {...restProps}>
      <ContextMenuHeading>{elementName}</ContextMenuHeading>
      <ContextMenuHeading>{`Level ${levelIndex}`}</ContextMenuHeading>
      <ContextMenuButton onClick={editLevel}>Edit Level</ContextMenuButton>
    </ContextMenu>
  )
}

export default BuildingContextMenu
