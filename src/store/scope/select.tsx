import { pipeLog } from "@/utils/fp"
import { pipe } from "fp-ts/lib/function"
import { partitionWithIndex } from "fp-ts/lib/ReadonlyRecord"
import produce from "immer"
import { useSnapshot } from "valtio"
import {
  ElementScopeItem,
  elementUniq,
  HouseScope,
  houseUniq,
  LevelScopeItem,
  levelUniq,
  ModuleScopeItem,
  moduleUniq,
  ScopeTypeEnum,
  useScope,
  useScopeType,
} from "."
import { store, useHouses, useLevelModuleIndices, useStoreSnap } from ".."

export const useSelectElement = (
  houseId: string,
  moduleIndex: number,
  elementName: string
) => {
  const levelModuleIndices = useLevelModuleIndices(houseId, moduleIndex)

  return (shiftKey: boolean) => {
    // if (store.scope.type !== ScopeTypeEnum.Enum.ELEMENT) return

    // if (shiftKey) {
    //   if (!store.scope.selected.includes(houseId))
    //     store.scope.selected.push(houseId)
    // } else {
    //   store.scope.selected = [houseId]
    // }
    switch (store.scope.type) {
      case ScopeTypeEnum.Enum.ELEMENT:
        if (shiftKey) {
          if (
            !store.scope.selected.find(
              (x) => x.houseId === houseId && x.elementName === elementName
            )
          )
            store.scope.selected.push({ houseId, elementName })
        } else {
          store.scope.selected = [{ houseId, elementName }]
        }
        break
      case ScopeTypeEnum.Enum.MODULE:
        if (shiftKey) {
          if (
            !store.scope.selected.find(
              (x) => x.houseId === houseId && x.moduleIndex === moduleIndex
            )
          )
            store.scope.selected.push({ houseId, moduleIndex })
        } else {
          store.scope.selected = [{ houseId, moduleIndex }]
        }
        break
      case ScopeTypeEnum.Enum.LEVEL:
        if (shiftKey) {
          if (
            !store.scope.selected.find(
              (x) =>
                x.houseId === houseId &&
                x.levelModuleIndices.includes(moduleIndex)
            )
          )
            store.scope.selected.push({ houseId, levelModuleIndices })
        } else {
          store.scope.selected = [{ houseId, levelModuleIndices }]
        }
        break
      case ScopeTypeEnum.Enum.HOUSE:
        if (shiftKey) {
          if (!store.scope.selected.includes(houseId))
            store.scope.selected.push(houseId)
        } else {
          store.scope.selected = [houseId]
        }
        break
    }
  }
}

// export const useSelectHovered = () => {
//   const [scope] = useScope()

//   switch (scope.type) {
//     case "HOUSE":
//       return (shiftKey: boolean) => {
//         store.scope.selected = houseUniq([
//           ...(shiftKey ? scope.selected : []),
//           // ...[scope.hovered ?? ...[]],
//         ]) as string[]
//       }
//     case "LEVEL":
//       return (shiftKey: boolean) => {
//         store.scope.selected = levelUniq([
//           ...(shiftKey ? scope.selected : []),
//           // ...scope.hovered,
//         ]) as LevelScopeItem[]
//       }
//     case "MODULE":
//       return (shiftKey: boolean) => {
//         store.scope.selected = moduleUniq([
//           ...(shiftKey ? scope.selected : []),
//           // ...scope.hovered,
//         ]) as ModuleScopeItem[]
//       }
//     case "ELEMENT":
//       return (shiftKey: boolean) => {
//         store.scope.selected = elementUniq([
//           ...(shiftKey ? scope.selected : []),
//           // ...scope.hovered,
//         ]) as ElementScopeItem[]
//       }
//   }
// }

export const useSelectHouse = (houseId: string) => {
  const [, setScope] = useScope()
  return (additive: boolean) => {
    setScope(
      produce((draft) => {
        if (draft.type !== ScopeTypeEnum.enum.HOUSE) return
        if (additive) draft.selected.push(houseId)
        else draft.selected = [houseId]
      })
    )
  }
}

export const useHouseIsSelected = (houseId: string) => {
  const scopeType = useScopeType()
  if (scopeType !== ScopeTypeEnum.Enum.HOUSE) return
  return (store.scope as HouseScope).selected.includes(houseId)
}

export const useSelected = () => {
  const snap = useStoreSnap()
  return snap.scope.selected
}

export const useSelectedHouses = () => {
  const snap = useSnapshot(store)
  const [houses] = useHouses()
  const selected =
    snap.scope.type !== ScopeTypeEnum.Enum.HOUSE ? [] : snap.scope.selected
  return pipe(
    houses,
    partitionWithIndex((k, i) => selected.includes(k)),
    ({ left, right }) => ({ selected: right, rest: left }),
    pipeLog
  )
}
