import { setCameraEnabled } from "@/stores/camera"
import houses from "@/stores/houses"
import pointer from "@/stores/pointer"
import { invalidate, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { Fragment, useRef } from "react"
import { DoubleSide } from "three"
import { HorizontalPlane } from "./HorizontalPlane"

type Props = {
  buildingId: string
  buildingLength: number
  buildingWidth: number
}

const RotateHandles = (props: Props) => {
  const { buildingId, buildingWidth, buildingLength } = props
  const uvAtDragStart = useRef<[number, number]>([0, 0])

  const bind = useGesture({
    onHover: (data) => {
      if (data.hovering) {
        document.body.style.cursor = "grab"
      } else {
        document.body.style.cursor = ""
      }
    },
    onDrag: ({ first, last, event }) => {
      event.stopPropagation()
      if (first) {
        setCameraEnabled(false)
        uvAtDragStart.current = pointer.xz
      }
      const [x0, y0] = uvAtDragStart.current
      const [x, y] = pointer.xz
      const angle0 = Math.atan2(y0, x0)
      const angle = Math.atan2(y, x) - angle0
      console.log(angle)
      houses[buildingId].rotation += angle
      if (last) {
        setCameraEnabled(true)
      }
      invalidate()
    },
  })
  // what should the position be?

  // useEffect(() => {
  //   debug.planes["foo"] = {
  //     position: [0, 0, buildingLength / 2],
  //     rotation: [Math.PI / 2, 0, 0],
  //     height: buildingLength + 0.8,
  //     color: "white",
  //   }
  // }, [])

  return (
    <Fragment>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[0, 0, -1.5]}
        {...(bind(0) as any)}
      >
        <circleBufferGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="steelblue" side={DoubleSide} />
      </mesh>
      <mesh
        rotation-x={-Math.PI / 2}
        position={[-buildingWidth / 2 - 1.5, 0, buildingLength / 2]}
        {...(bind(1) as any)}
      >
        <circleBufferGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="steelblue" side={DoubleSide} />
      </mesh>
    </Fragment>
  )
}

export default RotateHandles
