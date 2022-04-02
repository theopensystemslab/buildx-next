import { House } from "@/data/house"
import { PositionedColumn } from "@/hooks/layouts"
import { stretch, useStretch, VanillaPositionedRow } from "@/hooks/stretch"
import defaultMaterial from "@/materials/defaultMaterial"
import { setCameraEnabled } from "@/stores/camera"
import context from "@/stores/context"
import { mapRA } from "@/utils"
import { Instance, Instances } from "@react-three/drei"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { Handler, useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { Fragment, useMemo, useRef } from "react"
import { Color, DoubleSide, Group } from "three"
import { useSnapshot } from "valtio"
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

type StretchedColumnsProps = {
  startColumn: PositionedColumn
  endColumn: PositionedColumn
  vanillaPositionedRows: readonly VanillaPositionedRow[]
}

const StretchedColumns = (props: StretchedColumnsProps) => {
  const { startColumn, endColumn, vanillaPositionedRows } = props
  const { startVanillaColumns, endVanillaColumns } = useSnapshot(stretch)

  const stretchMaterial = useMemo(() => {
    const material = defaultMaterial.clone()
    material.color = new Color("white")
    return material
  }, [])

  return (
    <Fragment>
      <group position-z={startColumn.length}>
        {pipe(
          vanillaPositionedRows,
          mapRA(({ geometry, length, y, levelIndex }) => (
            <Instances
              key={levelIndex}
              geometry={geometry}
              material={stretchMaterial}
              position-y={y}
            >
              {[...Array(Math.max(0, startVanillaColumns))].map((_, i) => (
                <Instance key={i} position-z={-length * i} />
              ))}
            </Instances>
          ))
        )}
      </group>
      <group position-z={endColumn.z + endColumn.length}>
        {pipe(
          vanillaPositionedRows,
          mapRA(({ geometry, length, y, levelIndex }) => (
            <Instances
              key={levelIndex}
              geometry={geometry}
              material={stretchMaterial}
              position-y={y}
            >
              {[...Array(Math.max(0, endVanillaColumns))].map((_, i) => (
                <Instance key={i} position-z={length * i} />
              ))}
            </Instances>
          ))
        )}
      </group>
    </Fragment>
  )
}

type MidColumnsProps = {
  house: House
  columnLayout: PositionedColumn[]
  midColumns: readonly PositionedColumn[]
}

const MidColumns = (props: MidColumnsProps) => {
  const { house, columnLayout, midColumns } = props

  const { visibleStartIndex, visibleEndIndex } = useSnapshot(stretch)

  const renderColumn = ({ columnIndex, z, gridGroups }: PositionedColumn) => (
    <BuildingHouseColumn
      key={columnIndex}
      house={house}
      columnIndex={columnIndex}
      columnZ={z}
      gridGroups={gridGroups}
      mirror={columnIndex === columnLayout.length - 1}
      visible={
        columnIndex >= visibleStartIndex && columnIndex <= visibleEndIndex
      }
    />
  )

  return <group>{pipe(midColumns, mapRA(renderColumn))}</group>
}

type Props = {
  house: House
}

const StretchBuildingHouse = (props: Props) => {
  const { house } = props

  const {
    startColumn,
    midColumns,
    endColumn,
    columnLayout,
    startClamp,
    endClamp,
    vanillaPositionedRows,
    sendDrag,
    sendDrop,
  } = useStretch(house.id)

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

  return (
    <group position={[house.position[0], 0, house.position[1]]}>
      <group ref={startRef}>
        {renderColumn(startColumn)}
        <StretchHandle
          onDrag={({ last }) => {
            if (!startRef.current) return
            const z = pipe(
              handleOffset + context.pointer[1] - house.position[1],
              startClamp
            )
            startRef.current.position.z = z
            sendDrag(z, { isStart: true })
            if (last) {
              startRef.current.position.z = 0
              sendDrop()
            }
          }}
          position-z={startColumn.z - handleOffset}
        />
      </group>
      <group ref={endRef}>
        {renderColumn(endColumn)}
        <StretchHandle
          onDrag={({ last }) => {
            if (!endRef.current) return
            const z = pipe(
              -(endColumn.z + handleOffset) +
                context.pointer[1] -
                house.position[1],
              endClamp
            )
            endRef.current.position.z = z
            sendDrag(z, { isStart: false })
            if (last) {
              endRef.current.position.z = 0
              sendDrop()
            }
          }}
          position-z={endColumn.z + handleOffset}
        />
      </group>
      <MidColumns
        columnLayout={columnLayout}
        house={house}
        midColumns={midColumns}
      />
      <StretchedColumns
        {...{ endColumn, startColumn, vanillaPositionedRows }}
      />
    </group>
  )
}

export default StretchBuildingHouse
