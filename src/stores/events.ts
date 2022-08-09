import { proxy } from "valtio"

type Events = {
  exportBuildingGLB: string | null
  dragModuleZ: number | null
}

const events = proxy<Events>({
  exportBuildingGLB: null,
  dragModuleZ: null,
})

export const exportGLB = (buildingId: string) => {
  events.exportBuildingGLB = buildingId
}

export const glbExported = () => {
  events.exportBuildingGLB = null
}

export default events
