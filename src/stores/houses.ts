import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { House, Houses } from "@/data/house"
import { Module } from "@/data/module"
import { GltfT, mapO, mapRA, SSR, useGLTF } from "@/utils"
import { flow, pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import {
  filterMap,
  filterMapWithIndex,
  filterWithIndex,
  findFirst,
  reduceWithIndex,
} from "fp-ts/lib/ReadonlyArray"
import produce from "immer"
import { useEffect } from "react"
import { proxy, ref, subscribe, useSnapshot } from "valtio"
import { useSystemsData } from "./systems"

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

export const useModuleRows = (house: House) => {
  const { houseTypes, modules: sysModules } = useSystemsData()

  const modules = pipe(
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

  const modelUrls = modules.map((module) => module.modelUrl)
  const gltfs = useGLTF(modelUrls)

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
    reduceWithIndex(
      [],
      (i, b: { module: Module; gltf: GltfT }[][], module: Module) => {
        return jumpIndices.includes(i)
          ? [...b, [{ module, gltf: gltfs[i] }]]
          : produce(
              (draft) =>
                void draft[draft.length - 1].push({ module, gltf: gltfs[i] })
            )(b)
      }
    ),
    mapRA((row) =>
      pipe(
        row,
        reduceWithIndex(
          [],
          (
            i,
            b: {
              module: Module
              gltf: GltfT
              z: number
            }[],
            { module, gltf }
          ) => {
            const isFirst: boolean = i === 0

            const z: number = isFirst ? 0 : b[i - 1].z + b[i - 1].module.length

            return [
              ...b,
              {
                module,
                gltf,
                z,
              },
            ]
          }
        )
      )
    ),
    reduceWithIndex(
      [],
      (
        i,
        b: { row: { module: Module; gltf: GltfT; z: number }[]; y: number }[],
        row
      ) => {
        const isFirst = i === 0
        return [
          ...b,
          { row, y: isFirst ? 0 : b[i - 1].y + row[0].module.height },
        ]
      }
    )
  )
}

export default houses
