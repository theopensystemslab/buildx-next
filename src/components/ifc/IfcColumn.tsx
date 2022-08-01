import { PositionedRow } from "@/hooks/layouts"
import { Plane } from "three"
import { mapRA, mapWithIndexRA, pipeLogWith } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import IfcModule from "./IfcModule"

type Props = {
  buildingId: string
  columnZ: number
  columnIndex: number
  mirror?: boolean
  gridGroups: readonly PositionedRow[]
  verticalCutPlanes: Plane[]
}

const IfcColumn = (props: Props) => {
  const {
    buildingId,
    columnIndex,
    columnZ,
    gridGroups,
    mirror = false,
    verticalCutPlanes,
  } = props
  const levels = pipe(
    gridGroups.slice(1, 2),
    pipeLogWith((x) => x[0].modules[0].module.dna),
    mapRA(({ levelIndex, modules, y }) =>
      pipe(
        modules,
        mapWithIndexRA((groupIndex, { module, z }) => {
          return (
            <IfcModule
              key={`${columnIndex}-${levelIndex}-${groupIndex}`}
              module={module}
              columnIndex={columnIndex}
              levelIndex={levelIndex}
              levelY={y}
              groupIndex={groupIndex}
              buildingId={buildingId}
              position={[
                0,
                y,
                mirror
                  ? z + module.length / 2
                  : z - module.length + module.length / 2,
              ]}
              scale={[1, 1, mirror ? 1 : -1]}
              verticalCutPlanes={verticalCutPlanes}
            />
          )
        })
      )
    )
  )
  return <group position-z={columnZ}>{levels}</group>
}
export default IfcColumn
