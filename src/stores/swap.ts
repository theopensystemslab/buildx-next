import { BareModule } from "@/data/module"
import { proxy } from "valtio"
import { ScopeItem } from "./scope"

type Swap = {
  activeBuildingMatrix: BareModule[][][] | null
  dragModulePing: {
    dpz: number
    z0: number
    length: number
  } | null
  dragModulePong: {
    scope: Omit<ScopeItem, "buildingId" | "elementName">
    diff: 1 | -1 | 0
  } | null
  // dragModuleResponder: Omit<ScopeItem, "buildingId" | "elementName"> | null
  // dragModuleShifted: "UP" | "DOWN" | null
}

const swap = proxy<Swap>({
  activeBuildingMatrix: null,
  dragModulePing: null,
  dragModulePong: null,
  // dragModuleResponder: null,
  // dragModuleShifted: null,
})

export default swap
