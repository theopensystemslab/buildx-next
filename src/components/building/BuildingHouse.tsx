import { House } from "@/data/house"
import { useColumnLayout } from "@/hooks/layouts"
import { mapWithIndexRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { useState } from "react"
import BuildingHouseColumn from "./BuildingHouseColumn"
import Stretch from "./Stretch"

type Props = {
  house: House
}

const BuildingHouse = (props: Props) => {
  const { house } = props

  const {
    position: [x, z],
    id: buildingId,
  } = house

  const columnLayout = useColumnLayout(buildingId)

  const [stretch, setStretch] = useState(true)

  // split into 5
  // i) main columns
  // ii) end column 1
  // iii) end column 2
  // iv) extra 1
  // v) extra 2

  const columns = pipe(
    columnLayout,
    mapWithIndexRA((i, { columnIndex, z, gridGroups }) => (
      <BuildingHouseColumn
        key={columnIndex}
        house={house}
        columnIndex={columnIndex}
        columnZ={z}
        gridGroups={gridGroups}
        mirror={columnIndex === columnLayout.length - 1}
        visible={![0, columnLayout.length - 1].includes(i)}
      />
    ))
  )

  // house position/rotation group
  return (
    <group position={[x, 0, z]}>
      {/* house columns group */}
      <group>{columns}</group>
      <Stretch house={house} />
    </group>
  )
}

export default BuildingHouse
