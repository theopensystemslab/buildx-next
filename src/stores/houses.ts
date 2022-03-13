import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { Module } from "@/data/module"
import { mapA, mapO, mapRA, SSR } from "@/utils"
import { flow, pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import {
  chunksOf,
  dropLeft,
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  mapWithIndex,
  reduceWithIndex,
  scanLeft,
} from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { useEffect } from "react"
import { proxy, subscribe, useSnapshot } from "valtio"
import { useSystemsData } from "./systems"

type AugmentedModule = {
  module: Module
  position: readonly [number, number, number]
  scale: readonly [number, number, number]
}

export const getInitialHouses = () =>
  SSR
    ? {}
    : JSON.parse(localStorage.getItem(BUILDX_LOCAL_STORAGE_HOUSES_KEY) ?? "{}")

const houses = proxy(getInitialHouses())

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

export const useModuleRows = (houseId: string) => {
  const { houseTypes, modules: sysModules } = useSystemsData()
  const houses = useHouses()
  const house = houses[houseId]

  const modules = !house
    ? []
    : pipe(
        houseTypes,
        findFirst((ht) => ht.id === house.houseTypeId),
        mapO((houseType) => house.dna ?? houseType.dna),
        mapO(
          flow(
            filterMap((dna) =>
              pipe(
                sysModules,
                findFirst(
                  (sysM: Module) =>
                    sysM.systemId === house.systemId && sysM.dna === dna
                )
              )
            )
          )
        ),
        getOrElse((): readonly Module[] => [])
      )

  const jumpIndices = pipe(
    modules,
    filterMapWithIndex((i, m) =>
      m.structuredDna.positionType === "END" ? some(i) : none
    ),
    filterWithIndex((i) => i % 2 === 0)
  )
  // could just chunksOf(2) to get END to END

  return pipe(
    modules,
    reduceWithIndex([], (i, b: Module[][], module: Module) => {
      return jumpIndices.includes(i)
        ? [...b, [module]]
        : produce((draft) => void draft[draft.length - 1].push(module))(b)
    }),
    mapRA((row) =>
      pipe(
        row,
        reduceWithIndex(
          [],
          (
            i,
            b: {
              module: Module
              z: number
            }[],
            module
          ) => {
            const isFirst: boolean = i === 0

            const z: number = isFirst ? 0 : b[i - 1].z + b[i - 1].module.length

            return [
              ...b,
              {
                module,
                z,
              },
            ]
          }
        )
      )
    ),
    reduceWithIndex(
      [],
      (i, b: { row: { module: Module; z: number }[]; y: number }[], row) => {
        const isFirst = i === 0
        return [
          ...b,
          { row, y: isFirst ? 0 : b[i - 1].y + row[0].module.height },
        ]
      }
    )
  )

  // can I write FP function that just has access to last element?
  // first in row is special (just use length)
  // next is accumulated

  // oh, scan can be reduce?
  // just reduce the whole thing
  // but add some scratch space then pluck the gubbins out...

  // you need to scan/accumulate the lengths per row
  // also the heights?
  // and the scale
  // maybe scale first easiest with the END END bit above

  // remember to stop merging geometries
  // perhaps do share materials in a scratch?
  // premature optimisation is the root of all...

  // figure out
  //    gltf
  //    position (implicit from [][] coords?)
}

export default houses
