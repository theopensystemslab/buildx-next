import { uniq } from "fp-ts/lib/ReadonlyArray"
import { Eq as EqStr } from "fp-ts/lib/string"
import { SetStateAction, useMemo } from "react"
import { useSnapshot } from "valtio"
import * as z from "zod"
import { store } from ".."

export const ScopeTypeEnum = z.enum(["HOUSE", "LEVEL", "MODULE", "ELEMENT"])

export type ScopeType = z.infer<typeof ScopeTypeEnum>

export type HouseScope = {
  type: "HOUSE"
  selected: string[] // houseId's
  hovered: string | null
}

export type ModuleScopeItem = {
  moduleIndex: number
  houseId: string
}

export type ModuleScope = {
  type: "MODULE"
  selected: ModuleScopeItem[]
  hovered: ModuleScopeItem | null
}

export type ElementScopeItem = {
  elementName: string
  houseId: string
}

export type ElementScope = {
  type: "ELEMENT"
  selected: ElementScopeItem[]
  hovered: ElementScopeItem | null
}

export type LevelScopeItem = {
  houseId: string
  levelModuleIndices: readonly number[]
}

export type LevelScope = {
  type: "LEVEL"
  selected: LevelScopeItem[]
  hovered: LevelScopeItem | null
}

export type Scope = HouseScope | ModuleScope | ElementScope | LevelScope

export type FocusedHouseScope = ModuleScope | ElementScope

export const houseUniq = uniq(EqStr)

export const levelUniq = uniq<LevelScopeItem>({
  equals: (x, y) =>
    x.houseId === y.houseId &&
    x.levelModuleIndices[0] === y.levelModuleIndices[0],
})

export const moduleUniq = uniq<ModuleScopeItem>({
  equals: (x, y) => x.houseId === y.houseId && x.moduleIndex === y.moduleIndex,
})

export const elementUniq = uniq<ElementScopeItem>({
  equals: (x, y) => x.houseId === y.houseId && x.elementName === y.elementName,
})

export const useScope = () => {
  const snap = useSnapshot(store)
  return [
    snap.scope,
    (input: SetStateAction<Scope>): void => {
      if (typeof input === "function") {
        store.scope = input(store.scope)
      } else {
        store.scope = input
      }
    },
  ] as const
}

export const useScopeType = () => {
  const snap = useSnapshot(store)
  return useMemo(() => snap.scope.type, [snap.scope.type])
}

export const useSetScopeType = () => {
  return (type: ScopeType) => {
    store.scope = {
      type,
      selected: [],
      hovered: null,
    }
  }
}
