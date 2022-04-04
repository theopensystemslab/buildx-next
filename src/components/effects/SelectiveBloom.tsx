import { CameraLayer } from "@/CONSTANTS"
import { useIlluminated } from "@/stores/highlights"
import { SelectiveBloom as SelectiveBloom_ } from "@react-three/postprocessing"
import React, { Fragment, useEffect, useMemo, useRef } from "react"
import { AmbientLight } from "three"

const SelectiveBloom = () => {
  const lightRef = useRef()
  const illuminated = useIlluminated()
  useEffect(() => void console.log(illuminated), [illuminated])
  const intensity = illuminated.length > 0 ? 1 : 0
  return (
    <Fragment>
      <pointLight
        ref={lightRef}
        position={[-10, -10, -10]}
        color="red"
        intensity={intensity}
        layers={CameraLayer.invisible}
      />
      <SelectiveBloom_
        kernelSize={4}
        luminanceThreshold={0}
        intensity={intensity}
        luminanceSmoothing={0}
        selection={illuminated}
        selectionLayer={CameraLayer.visible}
        lights={[lightRef]}
      />
    </Fragment>
  )
}

export default SelectiveBloom
