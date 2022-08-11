import { proxy } from "valtio"

type Events = {
  exportBuildingGLB: string | null
  dragModule: {
    dz: number
    z0: number
    length: number
  } | null
  dragModuleShiftCount: number
}

const events = proxy<Events>({
  exportBuildingGLB: null,
  dragModule: null,
  dragModuleShiftCount: 0,
})

export const exportGLB = (buildingId: string) => {
  events.exportBuildingGLB = buildingId
}

export const glbExported = () => {
  events.exportBuildingGLB = null
}

export default events
