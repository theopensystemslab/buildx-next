import { House } from "@/data/house"
import { useModuleRows } from "@/stores/houses"
import { mapWithIndexRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { flatten } from "fp-ts/lib/ReadonlyArray"
import { useRef } from "react"
import { Group } from "three"
import HouseModule from "./HouseModule"

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
  house: House
}

const House = (props: Props) => {
  const { house } = props
  const groupRef = useRef<Group>()
  const rows = useModuleRows(house)

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

  //   const gltf = gltfs[moduleIndex]

  //   const {
  //     grid,
  //     position: [x, y, z0],
  //   } = layout.modules[moduleIndex]

  //   const mirror = grid[0] !== 0

  //   const z = !mirror
  //     ? z0 + module.length / 2
  //     : z0 + (-module.length + module.length / 2)

  //   const layoutHeight = layout.gridBounds[1] + 1

  //   const chunks = pipe(
  //     range(0, modules.length - 1),
  //     chunksOf(layoutHeight),
  //     transpose
  //   ) as number[][]

  //   const heightIndex = moduleIndex % layoutHeight

  //   return (
  //     <HouseModule
  //       key={moduleIndex}
  //       {...{ module, gltf, moduleIndex, houseId }}
  //       position={[x, y - (layout.cellHeights[0] || 0), z]}
  //       scale={!mirror ? [1, 1, 1] : [1, 1, -1]}
  //       levelModuleIndices={chunks[heightIndex]}
  //     />
  //   )
  // })

  const content = pipe(
    rows,
    mapWithIndexRA((columnIndex, { row, y }) => (
      <group>
        {pipe(
          row,
          mapWithIndexRA((rowIndex, { module, gltf, z }) => (
            <HouseModule
              key={`${columnIndex},${rowIndex}`}
              module={module}
              columnIndex={columnIndex}
              rowIndex={rowIndex}
              gltf={gltf}
              house={house}
              position={[0, y, z]}
            />
          ))
        )}
      </group>
      // <HouseRow key={i} modules={row} index={i} y={y}/>
    ))
  )

  return (
    <group
      ref={groupRef}
      // {...(bind() as any)}
    >
      {content}
    </group>
  )
}

export default House
