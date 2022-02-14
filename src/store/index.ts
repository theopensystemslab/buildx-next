import { Houses } from "@/data/house"
import CameraControls from "camera-controls"
import { MutableRefObject } from "react"
import { Object3D } from "three"
import { proxy, ref } from "valtio"
import { initialHouses as houses } from "./houses"
import { Scope, ScopeTypeEnum } from "./scope"

type Store = {
  houses: Houses
  scope: Scope
  camControls: CameraControls | null
  orthographic: boolean
  shadows: boolean
  lastLookAt: V6
  horizontalPointer: [number, number]
  contextMenu: [number, number] | null
  outlined: Array<MutableRefObject<Object3D | undefined>>
}

export const store = proxy<Store>({
  houses,
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
  contextMenu: null,
  outlined: ref([]),
})

export * from "./camera"
export * from "./houses"
export * from "./scope"
