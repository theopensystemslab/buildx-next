import { Houses } from "@/data/house"
import CameraControls from "camera-controls"
import { proxy } from "valtio"
import { Scope, ScopeTypeEnum } from "./scope"

type Store = {
  houses: Houses
  scope: Scope
  camControls: CameraControls | null
  orthographic: boolean
  shadows: boolean
  lastLookAt: V6
  horizontalPointer: [number, number]
}

export const store = proxy<Store>({
  houses: {},
  scope: {
    type: ScopeTypeEnum.enum.HOUSE,
    selected: [],
    hovered: null,
  },
  camControls: null,
  orthographic: false,
  shadows: true,
  horizontalPointer: [0, 0],
  lastLookAt: [0, 0, 0, 0, 0, 0],
})

export const setCameraEnabled = (b: boolean) => {
  if (store.camControls) store.camControls.enabled = b
}

export const defaultCamPos: [number, number, number] = [12, 24, 12]
export const defaultCamTgt: [number, number, number] = [0, 0, 0]

export * from "./houses"
export * from "./scope"
