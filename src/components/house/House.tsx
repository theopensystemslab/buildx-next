import { House } from "@/data/house"
import { useHouseRows } from "@/stores/housesRows"
import { mapRA, mapWithIndexRA, useGLTF } from "@/utils"
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

  const rows = useHouseRows(house.id)

  // const rows = useModuleRows(house)

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

  const gltfs = pipe(
    rows,
    mapRA((row) =>
      pipe(
        row.row,
        mapRA((r) => r.module.modelUrl)
      )
    ),
    flatten,
    (modelUrls) => useGLTF(modelUrls as string[])
  )

  let moduleIndex = -1
  const modules = pipe(
    rows,
    mapWithIndexRA((columnIndex, { row, y }) => (
      <group>
        {pipe(
          row,
          mapWithIndexRA((rowIndex, { module, z }) => {
            moduleIndex++
            const mirror = rowIndex === row.length
            return (
              <HouseModule
                key={`${columnIndex},${rowIndex}`}
                module={module}
                columnIndex={columnIndex}
                rowIndex={rowIndex}
                gltf={gltfs[moduleIndex]}
                house={house}
                position={[
                  0,
                  y,
                  !mirror
                    ? z + module.length / 2
                    : z - module.length + module.length / 2,
                ]}
                scale={[1, 1, !mirror ? 1 : -1]}
              />
            )
          })
        )}
      </group>
    ))
  )
  moduleIndex = -1

  return (
    <group
      ref={groupRef}
      // {...(bind() as any)}
    >
      {modules}
    </group>
  )
}

export default House
