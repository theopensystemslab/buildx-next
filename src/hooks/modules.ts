import { useSystemsData } from "@/contexts/SystemsData"
import {
  BareModule,
  filterCompatibleModules,
  keysFilter,
  keysHammingSort,
  LoadedModule,
  Module,
} from "@/data/module"
import { StructuredDna } from "@/data/moduleLayout"
import {
  filterA,
  filterMapA,
  filterRA,
  hamming,
  headNEA,
  mapA,
  mapNEA,
  mapO,
  pipeLog,
  reduceRA,
} from "@/utils"
import { loadModule, sortByDnaNEA } from "@/utils/modules"
import { findFirst, Foldable, isNonEmpty, sortBy, uniq } from "fp-ts/lib/Array"
import { identity, pipe } from "fp-ts/lib/function"
import { fromFoldable, reduce } from "fp-ts/lib/Map"
import { group, groupBy, NonEmptyArray, range } from "fp-ts/lib/NonEmptyArray"
import { Eq, Ord } from "fp-ts/lib/number"
import { getOrElse, toNullable } from "fp-ts/lib/Option"
import { contramap, fromCompare } from "fp-ts/lib/Ord"
import { sign } from "fp-ts/lib/Ordering"
import { head, sort } from "fp-ts/lib/ReadonlyArray"
import { Refinement } from "fp-ts/lib/Refinement"
import { first } from "fp-ts/lib/Semigroup"
import { Ord as StrOrd } from "fp-ts/lib/string"
import produce from "immer"
import { ColumnLayout, columnLayoutToDNA } from "./layouts"

export const useGetVanillaModule = () => {
  const { modules: allModules } = useSystemsData()
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

export const useSystemModules = (systemId: string) => {
  const { modules } = useSystemsData()
  return modules.filter((m) => m.systemId === systemId)
}

export type ColumnModuleKey = {
  columnIndex: number
  levelIndex: number
  groupIndex: number
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

  const options = pipe(
    systemModules,
    filterCompatibleModules([
      "sectionType",
      "positionType",
      "levelType",
      "gridType",
      "gridUnits",
      "stairsType",
    ])(module),
    mapA((module) => ({
      label: module.dna,
      value: {
        module,
        buildingDna: pipe(
          columnLayout,
          produce((draft) => {
            draft[columnIndex].gridGroups[levelIndex].modules[
              groupIndex
            ].module.dna = module.dna
          }),
          columnLayoutToDNA
        ) as string[],
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

export const stairsMe = <M extends BareModule>(
  module: M,
  modules: M[],
  stairsType: string
) =>
  pipe(
    modules,
    filterA(
      keysFilter(
        ["sectionType", "positionType", "levelType", "gridType", "gridUnits"],
        module
      )
    ),
    filterA((x) => x.structuredDna.stairsType === stairsType),
    keysHammingSort(
      [
        "internalLayoutType",
        "windowTypeSide1",
        "windowTypeSide2",
        "windowTypeTop",
        "windowTypeEnd",
      ],
      module
    )
  )

export const useStairsOptions = <T extends BareModule>(
  module: T,
  columnLayout: ColumnLayout,
  { columnIndex, levelIndex, groupIndex }: ColumnModuleKey
) => {
  const systemModules = useSystemModules(module.systemId)

  const hardModuleFilter = keysFilter<BareModule>(
    ["sectionType", "positionType", "levelType", "gridType", "gridUnits"],
    module
  )

  const compatMods = pipe(systemModules, filterA(hardModuleFilter))

  const stairsTypeOptions = pipe(compatMods, (xs) =>
    isNonEmpty(xs)
      ? pipe(
          xs,
          groupBy((module) => module.structuredDna.stairsType)
        )
      : {}
  )

  const foo = stairsMe(module, systemModules as BareModule[], "ST2")

  console.log({
    module,
    systemModules,
    stairsType: "ST0",
    stairsTypeOptions,
    compatMods,
    foo,
  })

  const roofIndex = columnLayout[columnIndex].gridGroups.length - 1
  const groundIndex = 1

  const targetGridUnits = columnLayout[columnIndex].gridGroups
    .slice(0, groupIndex)
    .reduce(
      (acc, { modules }) =>
        acc +
        modules.reduce((bcc, w) => bcc + w.module.structuredDna.gridUnits, 0),
      0
    )

  const levelModulesMap = pipe(
    range(groundIndex, roofIndex),
    mapA((i) =>
      pipe(
        columnLayout[columnIndex].gridGroups[i].modules,
        reduceRA(
          { gridUnits: 0, module: null },
          (
            acc: { gridUnits: number; module: LoadedModule | null },
            { module }
          ) => {
            const nextGridUnits = acc.gridUnits + module.structuredDna.gridUnits
            return {
              gridUnits: nextGridUnits,
              module: acc.gridUnits === targetGridUnits ? module : acc.module,
            }
          }
        ),
        ({ module }) => {
          if (module === null)
            throw new Error(
              "Appropriate stairs module not found where expected"
            )
          return [i, module] as [number, LoadedModule]
        }
      )
    ),
    fromFoldable(Eq, first<LoadedModule>(), Foldable)
  )

  // ensure stairs type consistency across level
  pipe(
    levelModulesMap,
    reduce(Ord)(module.structuredDna.stairsType, (acc, v) => {
      if (v.structuredDna.stairsType !== acc)
        throw new Error("Inconsistent stairs type at different level")
      return acc
    })
  )

  // const useStairsOptions =

  // find the options for this level
  // filter out options that aren't there for the rest of the levels
}
