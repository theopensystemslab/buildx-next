import { getPositions } from "@/data/layout"
import { moduleLayout } from "@/data/moduleLayout"
import { store, useHouseModules, useUpdatePosition } from "@/store"
import { useGLTF } from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { mapWithIndex } from "fp-ts/lib/ReadonlyArray"
import { useRef } from "react"
import { Group } from "three"
import HouseModule from "./HouseModule"

type Props = {
  id: string
}

const House = (props: Props) => {
  const houseId = props.id
  const groupRef = useRef<Group>()
  const modules = useHouseModules(houseId)
  const gltfs = useGLTF(modules.map((module) => module.modelUrl))
  const layout = moduleLayout(modules)
  // const layout2 = getPositions(modules)

  const onDrag = useUpdatePosition(houseId, groupRef)
  // const invalidate = useThree((three) => three.invalidate)

  const bind = useGesture<{
    drag: ThreeEvent<PointerEvent>
    hover: ThreeEvent<PointerEvent>
  }>({
    onDrag,
  })

  return (
    <group ref={groupRef} {...(bind() as any)}>
      {pipe(
        modules,
        mapWithIndex((moduleIndex, module) => {
          const gltf = gltfs[moduleIndex]

          const {
            grid,
            position: [x, y, z0],
          } = layout.modules[moduleIndex]

          const mirror = grid[0] !== 0

          const z = !mirror
            ? z0 + module.length / 2
            : z0 + (-module.length + module.length / 2)

          return (
            <HouseModule
              key={moduleIndex}
              {...{ module, gltf, moduleIndex, houseId }}
              position={[x, y - (layout.cellHeights[0] || 0), z]}
              scale={!mirror ? [1, 1, 1] : [1, 1, -1]}
            />
          )
        })
      )}
    </group>
  )
}

export default House
