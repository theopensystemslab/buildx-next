import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuButton from "@/components/ui/ContextMenuButton"
import ContextMenuHeading from "@/components/ui/ContextMenuHeading"
import { useSystemsData } from "@/context/SystemsData"
import { ScopeTypeEnum, store, useHouse } from "@/store"
import React from "react"

const HouseContextMenu = (props: ContextMenuProps) => {
  if (store.scope.type !== ScopeTypeEnum.Enum.HOUSE) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const houseId = store.scope.selected[0]

  const house = useHouse(houseId)

  const { houseTypes } = useSystemsData()

  const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)

  const resetHouse = () => {
    if (!houseType) return
    store.houses[houseId].dna = houseType.dna
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>House</ContextMenuHeading>
      <ContextMenuButton onClick={resetHouse}>Reset</ContextMenuButton>
    </ContextMenu>
  )
}

export default HouseContextMenu
