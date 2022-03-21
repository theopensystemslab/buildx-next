import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import { Houses } from "@/data/house"
import { Module } from "@/data/module"
import { mapRA, snapToGrid, SSR } from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import {
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  flatten,
  reduceWithIndex,
} from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { MutableRefObject, useCallback, useEffect } from "react"
import { Group } from "three"
import { proxy, subscribe, useSnapshot } from "valtio"
import { setCameraEnabled } from "./camera"
import context, { useContext } from "./context"
import scope, { ScopeTypeEnum } from "./scope"

export const getInitialHouses = () =>
  SSR
    ? {}
    : JSON.parse(localStorage.getItem(BUILDX_LOCAL_STORAGE_HOUSES_KEY) ?? "{}")

const houses = proxy<Houses>(getInitialHouses())

export const useLocallyStoredHouses = () => {
  useEffect(
    subscribe(houses, () => {
      localStorage.setItem(
        BUILDX_LOCAL_STORAGE_HOUSES_KEY,
        JSON.stringify(houses)
      )
    }),
    []
  )
}

export const useHouses = () => useSnapshot(houses)

export const useHouse = (houseId: string) => {
  const housesSnap = useSnapshot(houses)
  return housesSnap[houseId]
}

export const useBuildingDna = (buildingId: string) => {
  const { dna } = useSnapshot(houses[buildingId])
  return dna
}

export const useHouseType = (houseId: string) => {
  const house = useHouse(houseId)
  const { houseTypes } = useSystemsData()
  const houseType = houseTypes.find((ht) => ht.id === house.houseTypeId)
  if (!houseType) throw new Error("houseType not found")
  return houseType
}

export const useUpdatePosition = (
  houseId: string,
  groupRef: MutableRefObject<Group | undefined>
): Handler<"drag", ThreeEvent<PointerEvent>> => {
  const invalidate = useThree((three) => three.invalidate)

  const onPositionUpdate = useCallback(() => {
    if (!groupRef.current) return
    const [x, z] = houses[houseId].position
    groupRef.current.position.set(x, 0, z)
  }, [houseId])

  useEffect(
    () => subscribe(houses[houseId].position, onPositionUpdate),
    [houseId, onPositionUpdate]
  )
  useEffect(onPositionUpdate, [onPositionUpdate])

  return ({ first, last }) => {
    if (scope.type !== ScopeTypeEnum.Enum.HOUSE) return
    if (first) {
      setCameraEnabled(false)
    }

    const [px, pz] = context.pointer
    const [x, z] = houses[houseId].position
    const [dx, dz] = [px - x, pz - z].map(snapToGrid)

    for (let k of scope.selected) {
      houses[k].position[0] += dx
      houses[k].position[1] += dz
    }

    invalidate()

    if (last) setCameraEnabled(true)
  }
}

export const useFocusedBuilding = () => {
  const houses = useHouses()
  const { buildingId } = useContext()
  return buildingId ? houses[buildingId] : null
}

export const useHouseRows = (buildingId: string) => {
  // const { modules: allModules, houseTypes } = useSystemsData()
  // const house = useHouse(buildingId)
  const houseModules = useHouseModules(buildingId)

  const jumpIndices = pipe(
    houseModules,
    filterMapWithIndex((i, m) =>
      m.structuredDna.positionType === "END" ? some(i) : none
    ),
    filterWithIndex((i) => i % 2 === 0)
  )

  return pipe(
    houseModules,
    reduceWithIndex([], (i, modules: Module[][], module: Module) => {
      return jumpIndices.includes(i)
        ? [...modules, [module]]
        : produce((draft) => void draft[draft.length - 1].push(module))(modules)
    })
    // mapRA((row) =>
    //   pipe(
    //     row,
    //     reduceWithIndex(
    //       [],
    //       (
    //         i,
    //         prevs: {
    //           module: Module
    //           z: number
    //         }[],
    //         module
    //       ) => {
    //         const isFirst: boolean = i === 0

    //         const z = isFirst
    //           ? module.length / 2
    //           : prevs[i - 1].z +
    //             prevs[i - 1].module.length / 2 +
    //             module.length / 2

    //         return [
    //           ...prevs,
    //           {
    //             module,
    //             z,
    //           },
    //         ]
    //       }
    //     )
    //   )
    // ),
    // reduceWithIndex(
    //   [],
    //   (
    //     i,
    //     b: {
    //       row: { module: Module; z: number }[]
    //       y: number
    //       vanillaModules: {
    //         MID: Module | null
    //         END: Module | null
    //       }
    //     }[],
    //     row
    //   ) => {
    //     const isFirst = i === 0
    //     return [
    //       ...b,
    //       {
    //         row,
    //         y: isFirst
    //           ? -row[0].module.height
    //           : i === 1
    //           ? 0
    //           : b[i - 1].y + row[0].module.height,
    //         vanillaModules: {
    //           END: pipe(
    //             allModules,
    //             filterRA(
    //               (module) =>
    //                 module.systemId === house.systemId &&
    //                 module.structuredDna.levelType ===
    //                   row[0].module.structuredDna.levelType
    //             ),
    //             sort(
    //               pipe(
    //                 StrOrd,
    //                 contramap((x: Module) => x.dna)
    //               )
    //             ),
    //             head,
    //             toNullable
    //           ),
    //           MID: pipe(
    //             allModules,
    //             filterRA(
    //               (module) =>
    //                 module.systemId === house.systemId &&
    //                 module.structuredDna.levelType ===
    //                   row[0].module.structuredDna.levelType
    //             ),
    //             sort(
    //               pipe(
    //                 StrOrd,
    //                 contramap((x: Module) => x.dna)
    //               )
    //             ),
    //             head,
    //             toNullable
    //           ),
    //         },
    //       },
    //     ]
    //   }
    // )
  )
}

export const useBuildingTransforms = () => {
  const { buildingId } = useContext()
  if (buildingId === null)
    throw new Error("useStretchTransforms called with null buildingId")

  const building = houses[buildingId]
  const rows = useHouseRows(buildingId)

  // const rowsWithUnits = pipe(
  //   rows,
  //   mapRA(({ row }) =>
  //     pipe(
  //       row,
  //       reduceRA(0, (gridUnits, { module }) => {
  //         return gridUnits + module.structuredDna.gridUnits
  //         // return gridUnits + module.structuredDna.
  //       })
  //     )
  //   )
  // )

  // const deleteRow = (rowIndex: number) => {
  //   building.dna = pipe(
  //     rows,
  //     filterWithIndex((i) => i !== rowIndex),
  //     mapRA(({ row }) =>
  //       pipe(
  //         row,
  //         mapRA(({ module }) => module.dna)
  //       )
  //     ),
  //     flatten
  //   ) as string[]
  // }

  const insertFrontColumn = () => {
    const col = pipe(
      rows
      // z changes, hmmm...
      //
      // mapRA(({ row, vanillaModules, y }) => ({
      //   row: pipe(
      //     row,
      //     reduceWithIndex([], (i, b, {module, z}) => {
      //       return i === 1 ? [...b, [{module: vanillaModules.MID, }, { module, z }]] :
      //     })
      //   ),
      //   vanillaModules,
      //   y,
      // }))
    )
  }

  const insertBackColumn = () => {}

  const deleteColumn = (back: boolean) => {
    // var modules -> repeats

    const foo = pipe(rows)

    // skip the ends (verify ends?)

    // find the biggest grid unit of the column
    // delete that one
    // check if lengths are even
    // otherwise delete from longest row(s)

    // f: getRowLengths
  }

  // func to go from house dna to rows/cols of modules

  // func to go from rows/cols of modules to position/scale etc

  return {
    // insertRow,
    // insertColumn,
    // deleteRow,
    // deleteColumn
  }

  // return
  //    f : dna -> dna // new row @
  //    g : dna -> dna // new col @
  //    h : dna -> dna // del row
  //    i : dna -> dna // del col
}

export const useHouseModules = (houseId: string) => {
  const { modules: sysModules } = useSystemsData()
  const house = useSnapshot(houses)[houseId]

  return pipe(
    house.dna,
    filterMap((dna) =>
      pipe(
        sysModules,
        findFirst(
          (sysM: Module) => sysM.systemId === house.systemId && sysM.dna === dna
        )
      )
    )
  )
}

export const modulesToRows = (modules: readonly Module[]): Module[][] => {
  const jumpIndices = pipe(
    modules,
    filterMapWithIndex((i, m) =>
      m.structuredDna.positionType === "END" ? some(i) : none
    ),
    filterWithIndex((i) => i % 2 === 0)
  )

  return pipe(
    modules,
    reduceWithIndex([], (i, modules: Module[][], module: Module) => {
      return jumpIndices.includes(i)
        ? [...modules, [module]]
        : produce((draft) => void draft[draft.length - 1].push(module))(modules)
    })
  )
}

export const rowsToColumns = (rows: Module[][]) => {
  let bookStart = 0,
    bookEnd = 0

  let rowIndex = 0
  let gridUnits = 1

  let finished = false
  // console.log({ rows })

  while (!finished) {
    // let modules = rows[rowIndex].slice(bookStart, bookEnd)
    // console.log(modules)
    finished = true
    // let gridUnits = rows[rowIndex][]

    //   // const row = rows[rowIndex]
    //   // let gridIndex = 0;
    //   // while (gridIndex < row.length) {

    //   // }
    //   rowIndex++
  }

  return []
}
export default houses
