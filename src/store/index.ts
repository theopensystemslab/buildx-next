import { Houses } from "@/data/house"
import CameraControls from "camera-controls"
import { proxy, ref, useSnapshot } from "valtio"
import { Scope, ScopeTypeEnum } from "./scope"
// import { HorizontalSectionCut } from "./houses"
// import { Scratch } from "./scratch"

type Store = {
  houses: Houses
  scope: Scope
  camControls: CameraControls | null
  orthographic: boolean
  shadows: boolean
  // sectionCuts: {
  //   vertical: {
  //     short: boolean
  //     long: boolean
  //   }
  //   horizontal: HorizontalSectionCut | null
  // }
  // scratch: Scratch
  // contextMenu: [number, number] | null
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
  // sectionCuts: {
  //   horizontal: null,
  //   vertical: {
  //     long: false,
  //     short: false,
  //   },
  // },
  // scratch: ref({
  //   horizontalPointer: [0, 0],
  //   lastLookAt: [0, 0, 0, 0, 0, 0],
  //   meshRefs: {},
  // }),
  // contextMenu: null,
})
