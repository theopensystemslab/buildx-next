import { useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  ColumnModuleKey,
  filterCompatibleModules,
  keysFilter,
  keysHammingSort,
  LoadedModule,
  Module,
  StructuredDnaModule,
  topCandidateByHamming,
  useChangeModuleLayout,
} from "@/data/module"
import { StairType } from "@/data/stairType"
import {
  filterA,
  filterMapA,
  filterRA,
  mapA,
  mapM,
  mapO,
  mapWithIndexM,
  reduceA,
  reduceWithIndexRA,
  StrOrd,
  upperFirst,
} from "@/utils"
import { loadModule } from "@/utils/modules"
import { findFirst } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { values } from "fp-ts/lib/Map"
import { range } from "fp-ts/lib/NonEmptyArray"
import { getOrElse, none, some, toNullable } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import {
  ColumnLayout,
  columnLayoutToDNA,
  columnLayoutToMatrix,
  columnMatrixToDna,
} from "./layouts"

export const useGetVanillaModule = <T extends BareModule>() => {
  const { modules: allModules } = useSystemsData()
  return (module: T): LoadedModule => {
    const systemModules = pipe(
      allModules,
      filterRA((module) => module.systemId === module.systemId)
    )

    const vanillaModule = pipe(
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

    if (!vanillaModule)
      throw new Error(`No vanilla module found for ${module.dna}`)

    return vanillaModule
  }
}

export const useSystemModules = (systemId: string) => {
  const { modules } = useSystemsData()
  return modules.filter((m) => m.systemId === systemId)
}

type LayoutOpt = {
  label: string
  value: { module: Module; buildingDna: string[] }
}

export const useLayoutOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: LayoutOpt[]; selected: LayoutOpt["value"] } => {
  const systemModules = useSystemModules(module.systemId)

  const changeModuleLayout = useChangeModuleLayout(columnLayout, {
    columnIndex,
    levelIndex,
    groupIndex,
  })

  const options = pipe(
    systemModules,
    filterCompatibleModules([
      "sectionType",
      "positionType",
      "levelType",
      "gridType",
      "stairsType",
    ])(module),
    mapA((m) => ({
      label: pipe(
        m.description ?? "",
        upperFirst,
        getOrElse(() => m.dna)
      ),
      value: {
        module: m,
        buildingDna: changeModuleLayout(m),
      },
    }))
  )

  const { value: selected } = pipe(
    options,
    findFirst((x) => x.value.module.dna === module.dna),
    getOrElse(() => options[0])
  )

  return { options, selected }
}

export type StairsOpt = {
  label: string
  value: { stairType: string; buildingDna: string[] }
}

export const useStairsOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
): { options: StairsOpt[]; selected: StairsOpt["value"] } => {
  const { stairTypes, modules: systemModules } = useSystemsData()

  const selected: StairsOpt["value"] = {
    stairType: module.structuredDna.stairsType,
    buildingDna: columnLayoutToDNA(columnLayout),
  }

  const columnMatrix = columnLayoutToMatrix<BareModule>(columnLayout)

  const roofIndex = columnLayout[columnIndex].gridGroups.length - 1
  const groundIndex = 1

  const targetGridUnits = columnMatrix[columnIndex][levelIndex]
    .slice(0, groupIndex)
    .reduce((acc, m) => acc + m.structuredDna.gridUnits, 0)

  const levelGroupIndices = pipe(
    range(groundIndex, roofIndex),
    mapA((levelIdx) =>
      pipe(
        columnMatrix[columnIndex][levelIdx],
        reduceWithIndexRA(
          { groupIndex: 0, gridUnits: 0, module: null },
          (
            i,
            acc: {
              groupIndex: number
              gridUnits: number
              module: StructuredDnaModule | null
            },
            module
          ) => {
            const nextGridUnits = acc.gridUnits + module.structuredDna.gridUnits
            const nextModule =
              acc.module === null && acc.gridUnits === targetGridUnits
                ? module
                : acc.module
            return {
              gridUnits: nextGridUnits,
              module: nextModule,
              groupIndex: nextModule === null ? i + 1 : acc.groupIndex,
            }
          }
        ),
        ({ groupIndex }) => {
          if (module === null)
            throw new Error(
              "Appropriate stairs module not found where expected"
            )
          return [levelIdx, groupIndex] as [number, number]
        }
      )
    )
  )

  const getStairsModule = <M extends StructuredDnaModule = StructuredDnaModule>(
    oldModule: M,
    stairType: StairType
  ) => {
    const constraints = keysFilter<M>(
      ["sectionType", "positionType", "levelType", "gridType"],
      oldModule
    )

    return pipe(
      systemModules as unknown as M[],
      filterA(constraints),
      filterA((x) => x.structuredDna.stairsType === stairType.code),
      (modules) =>
        topCandidateByHamming(
          [
            "internalLayoutType",
            "windowTypeSide1",
            "windowTypeSide2",
            "windowTypeEnd",
            "windowTypeTop",
          ],
          oldModule,
          modules
        )
    )
  }

  const options = pipe(
    stairTypes,
    reduceA(
      new Map<
        StairType["code"],
        Array<{
          levelIdx: number
          groupIdx: number
          oldModule: BareModule
          newModule: BareModule
          gridUnitDiff: number
        }>
      >(),
      (acc, stairType) => {
        const next = pipe(
          levelGroupIndices,
          filterMapA(([levelIdx, groupIdx]) => {
            const oldModule = columnMatrix[columnIndex][levelIdx][groupIdx]
            const newModule = getStairsModule(oldModule, stairType)
            if (newModule === null) return none
            const gridUnitDiff =
              newModule.structuredDna.gridUnits -
              oldModule.structuredDna.gridUnits
            return some({
              levelIdx,
              groupIdx,
              oldModule,
              newModule,
              gridUnitDiff,
            })
          })
        )

        if (next.length === roofIndex - groundIndex + 1) {
          acc.set(stairType.code, next)
        }

        return acc
      }
    ),
    mapWithIndexM((stairType, levelChanges) => {
      return pipe(
        produce(columnMatrix, (draft) => {
          levelChanges.forEach(
            ({ levelIdx, groupIdx, newModule, gridUnitDiff }) => {
              console.log(gridUnitDiff)
              draft[columnIndex][levelIdx][groupIdx] = newModule
            }
          )
        }),
        columnMatrixToDna,
        (dna) => ({
          label:
            stairTypes.find((x) => x.code === stairType)?.description ??
            stairType,
          value: { buildingDna: dna, stairType },
        })
      )
    }),

    // compute maximum grid unit diff

    // maybe just ignore grid unit diff for now

    // change me to mapM

    // (changes => {
    //   return produce(columnMatrix, draft => {
    //     changes.forEach((levelChanges,stairType) => {
    //       for (const {levelIdx, groupIdx, newModule, gridUnitDiff} of levelChanges) {
    //         draft[columnIndex][levelIdx][groupIdx] = newModule
    //       }
    //     })
    //   })
    // })
    (map) => Array.from(map.values())
  )

  return { options, selected }
}

// export const useStairsOptions = <T extends BareModule>(
//   module: T,
//   columnLayout: ColumnLayout,
//   { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
// ): { options: StairsOpt[]; selected: StairsOpt["value"] } => {
//   const systemModules = useSystemModules(module.systemId)

//   const selected: StairsOpt["value"] = {
//     stairsType: module.structuredDna.stairsType,
//     buildingDna: columnLayoutToDNA(columnLayout),
//   }

//   const roofIndex = columnLayout[columnIndex].gridGroups.length - 1
//   const groundIndex = 1

//   const targetGridUnits = columnLayout[columnIndex].gridGroups[
//     levelIndex
//   ].modules
//     .slice(0, groupIndex)
//     .reduce((acc, v) => acc + v.module.structuredDna.gridUnits, 0)

//   const levelModulesMap = pipe(
//     range(groundIndex, roofIndex),
//     mapA((levelIdx) =>
//       pipe(
//         columnLayout[columnIndex].gridGroups[levelIdx].modules,
//         reduceWithIndexRA(
//           { groupIndex: 0, gridUnits: 0, module: null },
//           (
//             i,
//             acc: {
//               groupIndex: number
//               gridUnits: number
//               module: LoadedModule | null
//             },
//             { module }
//           ) => {
//             const nextGridUnits = acc.gridUnits + module.structuredDna.gridUnits
//             const nextModule =
//               acc.module === null && acc.gridUnits === targetGridUnits
//                 ? module
//                 : acc.module
//             return {
//               gridUnits: nextGridUnits,
//               module: nextModule,
//               groupIndex: nextModule === null ? i : acc.groupIndex,
//             }
//           }
//         ),
//         ({ groupIndex }) => {
//           if (module === null)
//             throw new Error(
//               "Appropriate stairs module not found where expected"
//             )
//           return [levelIdx, groupIndex] as [number, number]
//         }
//       )
//     ),
//     fromFoldable(NumEq, first<number>(), Foldable)
//   )

//   // ensure stairs type consistency across level
//   pipe(
//     levelModulesMap,
//     reduceM(NumOrd)(module.structuredDna.stairsType, (acc, groupIdx) => {
//       if (
//         columnLayout[columnIndex].gridGroups[levelIndex].modules[groupIdx]
//           .module.structuredDna.stairsType !== acc
//       )
//         throw new Error("Inconsistent stairs type at different level")
//       return acc
//     })
//   )

//   const getStairTypeOptions = <M extends T>(module: M) => {
//     const constraints = keysFilter<BareModule>(
//       ["sectionType", "positionType", "levelType", "gridType"],
//       module
//     )

//     const compatMods = pipe(systemModules, filterA(constraints))

//     return pipe(compatMods, (xs) =>
//       isNonEmpty(xs)
//         ? pipe(
//             xs,
//             groupBy((module) => module.structuredDna.stairsType),
//             mapR((modules) =>
//               topCandidateByHamming(
//                 [
//                   "internalLayoutType",
//                   "windowTypeSide1",
//                   "windowTypeSide2",
//                   "windowTypeEnd",
//                   "windowTypeTop",
//                 ],
//                 module,
//                 modules as BareModule[]
//               )
//             ),
//             mapR((m) => ({
//               module: m,
//               gridUnitDiff:
//                 m.structuredDna.gridUnits - module.structuredDna.gridUnits,
//             }))
//           )
//         : {}
//     )
//   }

//   const selectedStairTypeOptions = getStairTypeOptions(module)

//   const foo = pipe(
//     selectedStairTypeOptions,
//     mapWithIndexR((stairsType, stairsTypeOption) =>
//       pipe(
//         columnLayout,
//         produce((draft: ColumnLayout) => {
//           levelModulesMap.forEach(({ groupIdx, module }, levelIdx) => {
//             if (levelIdx === levelIndex) {
//               draft[columnIndex].gridGroups[levelIndex].modules[
//                 groupIndex
//               ].module = stairsTypeOption.module as LoadedModule
//               // if stairsTypeOption.gridUnitDiff is negative
//               // stick some vanilla here
//             } else {
//               const gridUnitDiff =
//                 module.structuredDna.gridUnits -
//                 stairsTypeOption.module.structuredDna.gridUnits
//               // if stairsTypeOption.gridUnitDiff is positive
//               // subtract local gridUnitDiff from it
//               // if this diff is now negative
//               draft[columnIndex].gridGroups[levelIndex].modules[
//                 groupIdx
//               ].module = module
//             }
//           })
//           // next DNA here
//           // [] if nothing
//           // filter [] at end
//         })
//       )
//     )
//   )

//   return undefined as any
// }
