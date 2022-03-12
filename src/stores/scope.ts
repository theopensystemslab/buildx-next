import { proxy } from "valtio"
import * as z from "zod"

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

const getInitScope = (): HouseScope => ({
  type: ScopeTypeEnum.enum.HOUSE,
  selected: [],
  hovered: null,
})

const scope = proxy<Scope>(getInitScope())

export const setScopeType = (type: ScopeType) => {
  scope.type = type
  scope.selected = []
  scope.hovered = null
}

export default scope
