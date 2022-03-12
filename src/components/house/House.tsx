import { useHouse } from "@/stores/houses"
import { useRef } from "react"
import { Group } from "three"

// change house type in airtable
// hard code the house type for now

// or not?
// it still goes END to END
// our prev heuristic was F < R etc
// new heuristic is ...

// which modules are in house type A?
// dup those modules over to new airtable
// but with unit type / length

type Props = {
  id: string
}

const House = (props: Props) => {
  const houseId = props.id
  const groupRef = useRef<Group>()
  const foo = useHouse(houseId)
  // const modelUrls = modules.map((module) => module.modelUrl)
  // const gltfs = useGLTF(modelUrls)

  // const layout = moduleLayout(modules)

  // const layout2 = getPositions(modules)

  // const onDrag = useUpdatePosition(houseId, groupRef)
  // const invalidate = useThree((three) => three.invalidate)

  // const bind = useGesture<{
  //   drag: ThreeEvent<PointerEvent>
  //   hover: ThreeEvent<PointerEvent>
  // }>({
  //   onDrag,
  // })

  return (
    <group
      ref={groupRef}
      // {...(bind() as any)}
    >
      {/* {pipe(
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

          const layoutHeight = layout.gridBounds[1] + 1

          const chunks = pipe(
            range(0, modules.length - 1),
            chunksOf(layoutHeight),
            transpose
          ) as number[][]

          const heightIndex = moduleIndex % layoutHeight

          return (
            <HouseModule
              key={moduleIndex}
              {...{ module, gltf, moduleIndex, houseId }}
              position={[x, y - (layout.cellHeights[0] || 0), z]}
              scale={!mirror ? [1, 1, 1] : [1, 1, -1]}
              levelModuleIndices={chunks[heightIndex]}
            />
          )
        })
      )} */}
    </group>
  )
}

export default House
