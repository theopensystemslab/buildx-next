import { useSystemsData } from "@/context/SystemsData"
import { Module } from "@/data/module"
import { moduleLayout, ModuleLayoutItem } from "@/data/moduleLayout"
import { ScopeTypeEnum, store, useHouseModules } from "@/store"
import {
  chunksOf,
  filterMap,
  filterWithIndex,
  flatten,
  head,
  map,
  sort,
  splitAt,
} from "fp-ts/lib/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { none, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { Ord } from "fp-ts/lib/string"
import React from "react"
import { useSnapshot } from "valtio"
import ContextMenu, { ContextMenuProps } from "../ui/ContextMenu"
import ContextMenuButton from "../ui/ContextMenuButton"
import ContextMenuHeading from "../ui/ContextMenuHeading"

const LevelContextMenu = (props: ContextMenuProps) => {
  if (store.scope.type !== ScopeTypeEnum.Enum.LEVEL) {
    console.error("LevelContextMenu called with different scope type")
    return null
  }

  const levels = store.scope.selected.length
  const levelIndex = store.scope.selected[0].levelModuleIndices[0]
  const { modules: allModules } = useSystemsData()
  const houseId = store.scope.selected[0].houseId
  const houseModules = useHouseModules(houseId)
  const layout = moduleLayout(houseModules)
  const systemModules = allModules.filter(
    (m) => m.systemId === houseModules[0].systemId
  )

  const heading =
    levels === 1
      ? `Level ${store.scope.selected[0].levelModuleIndices[0]}`
      : `Levels ${store.scope.selected.map((x) => x.levelModuleIndices[0])}`

  const height = layout.gridBounds[1] + 1

  const addFloor = () => {
    const getIntermediateModule = (
      moduleLayoutItem: ModuleLayoutItem
    ): ModuleLayoutItem | null => {
      const targetType = height - levelIndex <= 3 ? "T" : "M"

      return pipe(
        systemModules,
        filterMap<Module, ModuleLayoutItem>((module) =>
          module.dna.slice(0, 6) === moduleLayoutItem.dna.slice(0, 6) &&
          module.structuredDna.levelType.startsWith(targetType)
            ? some({
                dna: module.dna,
                position: moduleLayoutItem.position,
                grid: moduleLayoutItem.grid,
              })
            : none
        ),
        sort(
          pipe(
            Ord,
            contramap((m: ModuleLayoutItem) => m.dna)
          )
        ),
        head,
        toNullable
      )
    }

    store.houses[houseId].dna = pipe(
      layout.modules,
      chunksOf(height),
      map(
        flow(
          splitAt(levelIndex + 1),
          ([init, rest]) => {
            console.log({ init, rest })
            return [
              ...init,
              getIntermediateModule(init[init.length - 1]),
              ...rest,
            ]
          },
          filterMap((x) => (x !== null ? some(x.dna) : none))
        )
      ),
      flatten
    )
  }

  const removeFloor = () => {
    const height = layout.gridBounds[1] + 1
    store.houses[houseId].dna = pipe(
      layout.modules,
      chunksOf(height),
      map((x) =>
        pipe(
          x,
          filterWithIndex((i, a) => i !== levelIndex + 1),
          map((x) => x.dna)
        )
      ),
      flatten
    )
  }

  return (
    <ContextMenu {...props}>
      <ContextMenuHeading>{heading}</ContextMenuHeading>
      <ContextMenuButton onClick={addFloor}>Add floor above</ContextMenuButton>
      {/* <ContextMenuButton onClick={() => addFloorAbove(i - 1)}>
        Add floor below
      </ContextMenuButton> */}
      <ContextMenuButton onClick={removeFloor}>Remove floor</ContextMenuButton>
    </ContextMenu>
  )
}

const SiteContextMenu = () => {
  const { contextMenu } = useSnapshot(store)
  if (!contextMenu) return null

  const [pageX, pageY] = contextMenu

  const onClose = () => void (store.contextMenu = null)

  const props = { pageX, pageY, onClose }

  switch (store.scope.type) {
    case ScopeTypeEnum.Enum.LEVEL:
      return <LevelContextMenu {...props} />
    default:
      return null
  }
}

export default SiteContextMenu
