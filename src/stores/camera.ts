import { House } from "@/data/house"
import CameraControls from "camera-controls"
import { useEffect } from "react"
import { Vector3 } from "three"
import { proxy } from "valtio"
import { useContext } from "./context"
import { useFocusedBuilding } from "./houses"

type CameraProxy = {
  controls: CameraControls | null
  lastLookAt: V6
}

export const defaultCamPos: [number, number, number] = [12, 24, 12]
export const defaultCamTgt: [number, number, number] = [0, 0, 0]

const camera = proxy<CameraProxy>({
  controls: null,
  lastLookAt: [...defaultCamPos, ...defaultCamTgt],
})

export const setCameraEnabled = (b: boolean) => {
  if (camera.controls) camera.controls.enabled = b
}

export const useCameraFocus = () => {
  const building = useFocusedBuilding()

  useEffect(() => {
    if (!camera.controls) return

    setCameraEnabled(true)

    if (!building) {
      camera.controls.setLookAt(...camera.lastLookAt, true)
    } else {
      const {
        position: [x, z],
      } = building
      const v3Pos = new Vector3()
      const v3Tgt = new Vector3()
      camera.controls.getPosition(v3Pos)
      camera.controls.getTarget(v3Tgt)
      camera.lastLookAt = [...v3Pos.toArray(), ...v3Tgt.toArray()]
      camera.controls.setLookAt(x + 12, 24, z + 12, x, 0, z, true)
    }
  }, [building])
}

export default camera