import { House } from "@/data/house"
import {
  useBuildingColumns,
  useHouseRows,
  usePartitionedRows,
  useRowsWithPositions,
  useUpdatePosition,
} from "@/stores/houses"
import { mapRA, mapWithIndexRA, useGLTF } from "@/utils"
import { ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { flatten } from "fp-ts/lib/ReadonlyArray"
import { useRef } from "react"
import { Group } from "three"
import SiteHouseModule from "./SiteHouseModule"

type Props = {
  house: House
}

const SiteHouse = (props: Props) => {
  const { house } = props
  const groupRef = useRef<Group>()

  const {
    position: [x, z],
  } = house

  // const rows = useRowsWithPositions(house.id)

  const { rows } = usePartitionedRows(house.id)
  const foo = useBuildingColumns(house.id)
  // console.log(rows, rows2)

  const onDrag = useUpdatePosition(house.id, groupRef)

  const bind = useGesture<{
    drag: ThreeEvent<PointerEvent>
    hover: ThreeEvent<PointerEvent>
  }>({
    onDrag,
  })

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

  // store moduleIndex in the rows store maybe?
  let moduleIndex = -1

  const modules = pipe(
    rows,
    mapWithIndexRA((rowIndex, { row, y }) => {
      const children = pipe(
        row,
        mapWithIndexRA((gridIndex, { module, z }) => {
          moduleIndex++
          const mirror = gridIndex === row.length - 1
          return (
            <SiteHouseModule
              key={`${rowIndex},${gridIndex}`}
              module={module}
              rowIndex={rowIndex}
              gridIndex={gridIndex}
              gltf={gltfs[moduleIndex]}
              house={house}
              position={[
                0,
                0,
                mirror
                  ? z + module.length / 2
                  : z - module.length + module.length / 2,
              ]}
              scale={[1, 1, mirror ? 1 : -1]}
            />
          )
        })
      )

      return (
        <group key={rowIndex} position={[0, y, 0]}>
          {children}
        </group>
      )
    })
  )
  moduleIndex = -1

  return (
    <group ref={groupRef} {...(bind() as any)}>
      {modules}
    </group>
  )
}

export default SiteHouse
