import { useSystemsData } from "@/context/SystemsData"
import { findCollisions, House, Houses } from "@/data/house"
import { HouseType } from "@/data/houseType"
import { Module } from "@/data/module"
import { moduleLayout } from "@/data/moduleLayout"
import { snapToGrid } from "@/utils"
import { mapO } from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { transpose } from "fp-ts-std/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { chunksOf, range } from "fp-ts/lib/NonEmptyArray"
import { getOrElse } from "fp-ts/lib/Option"
import { filterMap, findFirst } from "fp-ts/lib/ReadonlyArray"
import {
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
} from "react"
import { Group, Plane } from "three"
import { subscribe } from "valtio"
import { ScopeTypeEnum, store, useSetCameraEnabled, useStoreSnap } from "."

export type HorizontalSectionCut = {
  levelType: string
  height: number
  totalHeight: number
  heightIndex: number
  plane: Plane
}

export const useHouses = () => {
  const snap = useStoreSnap()
  return [
    snap.houses,
    (input: SetStateAction<Houses>): void => {
      if (typeof input === "function") {
        store.houses = input(store.houses)
      } else {
        store.houses = input
      }
    },
  ] as const
}

export const useAddHouse = () => (house: House) =>
  (store.houses[house.id] = house)

export const useCollisions = () => {
  const { modules, houseTypes } = useSystemsData()
  const snap = useStoreSnap()
  return useMemo(() => {
    return findCollisions(store.houses, houseTypes, modules)
  }, [snap.houses, houseTypes, modules])
}

export const useSetHouse = (id: string) => {
  return (input: SetStateAction<House>): void => {
    if (typeof input === "function") {
      store.houses[id] = input(store.houses[id])
    } else {
      store.houses[id] = input
    }
  }
}

export const useHouseModules = (houseId: string) => {
  const { houseTypes, modules: sysModules } = useSystemsData()
  const [houses] = useHouses()
  const house = houses[houseId]
  return !house
    ? []
    : pipe(
        houseTypes,
        findFirst((ht: HouseType) => ht.id === house.houseTypeId),
        mapO((houseType) => house.modifiedDna ?? houseType.dna),
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
}

export const useLevelModuleIndices = (
  houseId: string,
  moduleIndex: number
): number[] => {
  const modules = useHouseModules(houseId)
  const layout = moduleLayout(modules)

  const layoutHeight = layout.gridBounds[1] + 1
  const heightIndex = moduleIndex % layoutHeight

  const chunks = pipe(
    range(0, modules.length - 1),
    chunksOf(layoutHeight),
    transpose
  ) as number[][]

  return chunks[heightIndex]
}

export const useUpdatePosition = (
  houseId: string,
  groupRef: MutableRefObject<Group | undefined>
): Handler<"drag", ThreeEvent<PointerEvent>> => {
  const setCameraEnabled = useSetCameraEnabled()
  const invalidate = useThree((three) => three.invalidate)

  const onPositionUpdate = useCallback(() => {
    if (!groupRef.current) return
    const [x, z] = store.houses[houseId].position
    groupRef.current.position.set(x, 0, z)
  }, [houseId])

  useEffect(
    () => subscribe(store.houses[houseId].position, onPositionUpdate),
    [houseId, onPositionUpdate]
  )
  useEffect(onPositionUpdate, [onPositionUpdate])

  return ({ first, last, shiftKey }) => {
    if (store.scope.type !== ScopeTypeEnum.Enum.HOUSE) return
    if (first) {
      setCameraEnabled(false)
    }

    const [px, pz] = store.scratch.horizontalPointer
    const [x, z] = store.houses[houseId].position
    const [dx, dz] = [px - x, pz - z].map(snapToGrid)

    for (let k of store.scope.selected) {
      store.houses[k].position[0] += dx
      store.houses[k].position[1] += dz
    }

    invalidate()

    if (last) setCameraEnabled(true)
  }
}
