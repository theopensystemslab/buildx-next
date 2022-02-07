import { useSystemsData } from "@/context/SystemsData"
import { findCollisions, House } from "@/data/house"
import { HouseType } from "@/data/houseType"
import { Module } from "@/data/module"
import { moduleLayout } from "@/data/moduleLayout"
import { mapO, snapToGrid } from "@/utils"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { transpose } from "fp-ts-std/Array"
import { flow, pipe } from "fp-ts/lib/function"
import { chunksOf, range } from "fp-ts/lib/NonEmptyArray"
import { getOrElse } from "fp-ts/lib/Option"
import { filterMap, findFirst } from "fp-ts/lib/ReadonlyArray"
import { MutableRefObject, useCallback, useEffect, useMemo } from "react"
import { Group, Plane } from "three"
import { subscribe, useSnapshot } from "valtio"
import { ScopeTypeEnum, setCameraEnabled, store } from ".."

export type HorizontalSectionCut = {
  levelType: string
  height: number
  totalHeight: number
  heightIndex: number
  plane: Plane
}

export const addHouse = (house: House) => void (store.houses[house.id] = house)

export const useCollisions = () => {
  const snap = useSnapshot(store)
  const { modules, houseTypes } = useSystemsData()
  return useMemo(() => {
    return findCollisions(store.houses, houseTypes, modules)
  }, [snap.houses, houseTypes, modules])
}

export const useHouseModules = (houseId: string) => {
  const { houseTypes, modules: sysModules } = useSystemsData()
  const { houses } = useSnapshot(store)
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

    const [px, pz] = store.horizontalPointer
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
