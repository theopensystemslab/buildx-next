import { useBuildSystemsData } from "@/contexts/BuildSystemsData"
import { LoadedModule, Module } from "@/data/module"
import {
  filterRA,
  isMesh,
  mapO,
  mapRA,
  mapWithIndexRA,
  reduceRA,
  reduceWithIndexRA,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { pipe } from "fp-ts/lib/function"
import { toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { flatten, head, sort } from "fp-ts/lib/ReadonlyArray"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import { Ord as StrOrd } from "fp-ts/lib/string"
import produce from "immer"
import { useMemo, useState } from "react"
import { BufferGeometry, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import {
  PositionedColumn,
  PositionedModule,
  PositionedRow,
  useColumnLayout,
} from "./layouts"

type VanillaPositionedRow = PositionedRow & {
  geometry: BufferGeometry
  rowLength: number
}

// type VanillaPositionedColumn = {
//   vanillaPositionedRows: Readonly<Array<VanillaPositionedRow>>
//   z: number
//   columnIndex: number
// }

// or map of levelIndex to geometry
// then n * dz

const useGetVanillaModule = () => {
  const { modules: allModules } = useBuildSystemsData()
  return (module: LoadedModule): LoadedModule | null => {
    const systemModules = pipe(
      allModules,
      filterRA((module) => module.systemId === module.systemId)
    )

    return pipe(
      systemModules,
      filterRA(
        (sysModule) =>
          sysModule.structuredDna.sectionType ===
            module.structuredDna.sectionType &&
          sysModule.structuredDna.levelType ===
            module.structuredDna.levelType &&
          sysModule.structuredDna.positionType === "MID"
      ),
      sort(
        pipe(
          StrOrd,
          contramap((m: Module) => m.dna)
        )
      ),
      head,
      mapO(loadModule),
      toNullable
    )
  }
}

// I think you can definitely use instancing for this
export const useStretchedColumns = (
  buildingId: string,
  back: boolean = false
) => {
  const [n, setN] = useState(0)
  const getVanillaModule = useGetVanillaModule()

  const columnLayout = useColumnLayout(buildingId)

  const endColumn = columnLayout[back ? columnLayout.length - 1 : 0]

  // may need rowLength

  const positionedRows: readonly PositionedRow[] = pipe(
    endColumn.gridGroups,
    mapRA(({ levelIndex, levelType, y, modules }: PositionedRow) => ({
      levelIndex,
      levelType,
      y,
      modules: pipe(
        modules,
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
      ),
    }))
  )

  const vanillaPositionedRows: readonly VanillaPositionedRow[] = pipe(
    positionedRows,
    mapRA(
      ({ modules, levelIndex, levelType, y }): VanillaPositionedRow => ({
        levelIndex,
        levelType,
        y,
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
        rowLength: pipe(
          modules,
          reduceRA(0, (acc, v) => acc + v.module.length)
        ),
      })
    )
  )

  // want geometry + y

  // const geometry = pipe(
  //   vanillaGridGroups,
  //   reduceRA([], (gridGroupMeshes: Mesh[], positionedRow) => [
  //     ...gridGroupMeshes,
  //     ...pipe(
  //       positionedRow.modules,
  //       mapRA((module) => toReadonlyArray(module.module.gltf.nodes)),
  //       flatten,
  //       reduceRA([], (rowMeshes: Mesh[], [, node]) => {
  //         return produce(rowMeshes, (draft) => {
  //           node.traverse((child) => {
  //             if (isMesh(child)) {
  //               draft.push(child)
  //             }
  //           })
  //         })
  //       })
  //     ),
  //   ]),
  //   (meshes) => mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))
  // )

  // if (!geometry) throw new Error("no vanillaColumnGeometry")

  // console.log(geometry)

  // see next comment
  const z0 = endColumn.z

  // const extraCols = useMemo(
  //   () =>
  //     pipe(
  //       [...Array(n)],
  //       mapWithIndexRA(
  //         (columnIndex): VanillaPositionedColumn => ({
  //           columnIndex,
  //           // should work with z0
  //           // logic on front vs. back
  //           z: z0 + vanillaWidth * columnIndex,
  //           vanillaPositionedRows,
  //         })
  //       )
  //     ),
  //   [n]
  // )

  const columnLength = vanillaPositionedRows[0].rowLength

  const newDeltaZ = (dz: number, last: boolean = false) => {
    const next = Math.max(Math.floor(dz / columnLength), 0)
    if (next !== n) setN(next)
    if (last && n !== 0) {
      setN(0)
    }
  }

  return [newDeltaZ, vanillaPositionedRows, n] as const
}
