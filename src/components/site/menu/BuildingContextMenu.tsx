import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import { useLevelInteractions } from "@/hooks/levels"
import siteContext, {
  SiteContextModeEnum,
  useSiteContextMode,
} from "@/stores/context"
import scope from "@/stores/scope"
import React from "react"
import ChangeMaterials from "./ChangeMaterials"

type Props = ContextMenuProps & {
  buildingId: string
}

const BuildingContextMenu = (props: Props) => {
  const { buildingId, ...restProps } = props
  const contextMode = useSiteContextMode()

  if (contextMode !== SiteContextModeEnum.Enum.BUILDING)
    throw new Error("contextMode not BUILDING in BuildingContextMenu")

  if (scope.selected === null) throw new Error("scope.selected null")

  const { elementName, levelIndex } = scope.selected

  const editLevel = () => {
    siteContext.levelIndex = levelIndex
    props.onClose?.()
  }

  const { addFloorAbove, removeFloor, canAddFloorAbove, canRemoveFloor } =
    useLevelInteractions(buildingId, levelIndex, props.onClose)

  return (
    <ContextMenu {...restProps}>
      <ContextMenuButton onClick={editLevel}>{`Edit level`}</ContextMenuButton>
      {canAddFloorAbove && (
        <ContextMenuButton
          onClick={addFloorAbove}
        >{`Add floor above`}</ContextMenuButton>
      )}
      {canRemoveFloor && (
        <ContextMenuButton
          onClick={removeFloor}
        >{`Remove floor`}</ContextMenuButton>
      )}
      {elementName && (
        <ChangeMaterials
          buildingId={buildingId}
          elementName={elementName}
          onComplete={props.onClose}
        />
      )}
    </ContextMenu>
  )
}

export default BuildingContextMenu
