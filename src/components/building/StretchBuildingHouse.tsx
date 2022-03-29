import { House } from "@/data/house"
import { useSystemSettings } from "@/data/settings"
import { PositionedColumn, useColumnLayout } from "@/hooks/layouts"
import { useStretch } from "@/hooks/stretch"
import { setCameraEnabled } from "@/stores/camera"
import context from "@/stores/context"
import { mapRA } from "@/utils"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { Handler, useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { partition } from "fp-ts/lib/ReadonlyArray"
import { useRef } from "react"
import { DoubleSide, Group } from "three"
import BuildingHouseColumn from "./BuildingHouseColumn"

type StretchHandleProps = MeshProps & {
  onDrag: Handler<"drag", ThreeEvent<PointerEvent>>
}

const StretchHandle = (props: StretchHandleProps) => {
  const { onDrag, ...meshProps } = props
  const bind = useDrag<ThreeEvent<PointerEvent>>((state) => {
    const { first, last } = state
    if (first) setCameraEnabled(false)
    if (last) setCameraEnabled(true)
    onDrag(state)
    invalidate()
  })
  return (
    <mesh rotation-x={-Math.PI / 2} {...meshProps} {...(bind() as any)}>
      <circleBufferGeometry args={[0.5, 10]} />
      <meshBasicMaterial color="steelblue" side={DoubleSide} />
    </mesh>
  )
}

type Props = {
  house: House
}

const StretchBuildingHouse = (props: Props) => {
  const { house } = props

  const {
    position: [x, z],
    id: buildingId,
  } = house

  const { startColumn, midColumns, endColumn, columnLayout } =
    useStretch(buildingId)

  // const [startColumn, ...restColumns] = columnLayout
  // const midColumns = restColumns.slice()

  // split into 5
  // i) main columns
  // ii) end column 1
  // iii) end column 2
  // iv) extra 1
  // v) extra 2

  const renderColumn = (
    { columnIndex, z, gridGroups }: PositionedColumn,
    visible: boolean = true
  ) => (
    <BuildingHouseColumn
      key={columnIndex}
      house={house}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columnLayout.length - 1}
      visible={visible}
    />
  )

  const startRef = useRef<Group>()
  const endRef = useRef<Group>()

  const handleOffset = 1

  const {
    length: { max },
  } = useSystemSettings(house.systemId)

  return (
    <group position={[x, 0, z]}>
      <group ref={startRef}>
        {renderColumn(startColumn)}
        <StretchHandle
          onDrag={() => {
            if (!startRef.current) return
            const z = context.pointer[1] - house.position[1]
            startRef.current.position.z = z
          }}
          position-z={startColumn.z - handleOffset}
        />
      </group>
      <group>{pipe(midColumns, mapRA(renderColumn))}</group>
      <group ref={endRef}>
        {renderColumn(endColumn)}
        <StretchHandle
          onDrag={() => {
            if (!endRef.current) return
            const z = context.pointer[1] - house.position[1]
            endRef.current.position.z = z
          }}
          position-z={endColumn.z + handleOffset}
        />
      </group>
    </group>
  )
}

export default StretchBuildingHouse
