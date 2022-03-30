import { clamp, isMesh, mapRA, reduceRA, reduceWithIndexRA } from "@/utils"
import { flow, pipe } from "fp-ts/lib/function"
import { flatten, partition } from "fp-ts/lib/ReadonlyArray"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import produce from "immer"
import { BufferGeometry, Mesh } from "three"
import {
  PositionedColumn,
  PositionedModule,
  PositionedRow,
  useColumnLayout,
} from "./layouts"
import { useGetVanillaModule } from "./modules"
import { mergeBufferGeometries } from "three-stdlib"
import { useSystemSettings } from "@/data/settings"
import { useHouse } from "@/stores/houses"
import { useMemo, useState } from "react"

type VanillaPositionedRow = PositionedRow & {
  geometry: BufferGeometry
}

const getColumnLength = (column: PositionedColumn) =>
  column.gridGroups[0].modules.reduce((acc, v) => acc + v.module.length, 0)

const getColumnsLength = flow(
  reduceRA(0, (acc, v: PositionedColumn) => acc + getColumnLength(v))
)

export const useVanillaPositionedRows = (
  gridGroups: readonly PositionedRow[]
) => {
  const getVanillaModule = useGetVanillaModule()
  return pipe(
    gridGroups,
    mapRA(({ levelIndex, levelType, y, modules: modulesIn }: PositionedRow) => {
      const modules = pipe(
        modulesIn,
        reduceWithIndexRA(
          [],
          (
            i,
            positionedModules: PositionedModule[],
            { module: moduleIn }: PositionedModule
          ) => {
            const isFirst: boolean = i === 0

            const vanillaModuleOut = getVanillaModule(moduleIn)

            if (!vanillaModuleOut) throw new Error("No vanilla module")

            const z = isFirst
              ? vanillaModuleOut.length / 2
              : positionedModules[i - 1].z +
                positionedModules[i - 1].module.length / 2 +
                vanillaModuleOut.length / 2

            return [
              ...positionedModules,
              {
                module: vanillaModuleOut,
                z,
              },
            ]
          }
        )
      )
      return {
        levelIndex,
        levelType,
        y,
        modules,
        length: modules.reduce((acc, v) => acc + v.module.length, 0),
      }
    }),
    mapRA(
      ({
        modules,
        levelIndex,
        levelType,
        y,
        length,
      }): VanillaPositionedRow => ({
        levelIndex,
        levelType,
        y,
        length,
        modules,
        geometry: pipe(
          modules,
          mapRA((module) => toReadonlyArray(module.module.gltf.nodes)),
          flatten,
          reduceRA([], (rowMeshes: Mesh[], [, node]) => {
            return produce(rowMeshes, (draft) => {
              node.traverse((child) => {
                if (isMesh(child)) {
                  draft.push(child)
                }
              })
            })
          }),
          (meshes) => {
            const geom = mergeBufferGeometries(
              meshes.map((mesh) => mesh.geometry)
            )
            if (!geom) throw new Error()
            return geom
          }
        ),
      })
    )
  )
}

export const useStretch = (buildingId: string) => {
  const columnLayout = useColumnLayout(buildingId)

  const house = useHouse(buildingId)

  const { startColumn, endColumn, midColumns } = pipe(
    columnLayout,
    partition(
      ({ columnIndex }) =>
        columnIndex === 0 || columnIndex === columnLayout.length - 1
    ),
    ({ left: midColumns, right: [startColumn, endColumn] }) => ({
      startColumn,
      endColumn,
      midColumns,
    })
  )

  const vanillaPositionedRows = useVanillaPositionedRows(startColumn.gridGroups)

  const vanillaColumnLength = vanillaPositionedRows[0].length

  const totalLength = getColumnsLength(columnLayout)

  const midRiffLength = getColumnsLength(midColumns)

  const {
    length: { max: maxLength },
  } = useSystemSettings(house.systemId)

  const startClamp = clamp(
    -(maxLength - totalLength),
    midRiffLength - vanillaColumnLength
  )

  const endClamp = clamp(
    -midRiffLength + vanillaColumnLength,
    maxLength - totalLength
  )

  const [startVanillaColumns, setStartVanillaColumns] = useState(0)
  const [endVanillaColumns, setEndVanillaColumns] = useState(0)

  const sendDrag = (
    z: number,
    { isStart }: { isStart: boolean } = { isStart: true }
  ) => {
    if (isStart) {
      // diff +/-
      const next = Math.ceil(-z / vanillaColumnLength)
      if (next !== startVanillaColumns) {
        setStartVanillaColumns(next)
      }
    } else {
      // diff +/-
      const next = Math.ceil(z / vanillaColumnLength)
      if (next !== endVanillaColumns) {
        setEndVanillaColumns(next)
      }
    }
  }

  const sendDrop = () => {}

  return {
    startColumn,
    endColumn,
    midColumns,
    columnLayout,
    startClamp,
    endClamp,
    sendDrag,
    sendDrop,
    vanillaPositionedRows,
    endVanillaColumns,
    startVanillaColumns,
  }
}
