import { safeLocalStorageGet } from '@/utils'
import { filterMap, findFirst } from 'fp-ts/lib/Array'
import { flow, pipe } from 'fp-ts/lib/function'
import { getOrElse, map as optMap } from 'fp-ts/lib/Option'
import { map } from 'fp-ts/lib/ReadonlyRecord'
import type { Rectangle } from './collisions'
import { checkRectangleIntersection } from './collisions'
import type { HouseType } from './houseType'
import type { Module } from './module'
import { moduleLayout } from './moduleLayout'

export interface House {
  id: string
  houseTypeId: string
  systemId: string
  position: [number, number]
  rotation: number
  modifiedDna?: Array<string>
  modifiedDnaPreview?: Array<string>
  modifiedMaterials: Record<string, string>
}

export type Houses = Record<string, House>

export const findCollisions = (
  houses: Houses,
  houseTypes: Array<HouseType>,
  modules: Array<Module>
): Record<string, boolean> => {
  const rectangles: Record<string, Rectangle> = {}
  const collisions: Record<string, boolean> = {}
  Object.entries(houses).forEach(([houseId, house]) => {
    const houseType = houseTypes.find(
      (houseType) => houseType.id === house.houseTypeId
    )

    if (!houseType) {
      return
    }

    const dna = house.modifiedDna || houseType.dna

    const houseModules: Array<Module> = dna
      .map((sequence) =>
        modules.find(
          (module) =>
            house.systemId === module.systemId && sequence === module.dna
        )
      )
      .filter((val: Module | undefined): val is Module => !!val)

    const moduleLayoutComputed = moduleLayout(houseModules)

    rectangles[houseId] = {
      wy: moduleLayoutComputed.totalLength,
      wx: moduleLayoutComputed.cellWidths[0] || 1,
      position: house.position,
      rotation: house.rotation,
    }
  })

  Object.entries(rectangles).forEach(([houseId1, rectangle1]) => {
    Object.entries(rectangles).forEach(([houseId2, rectangle2]) => {
      if (
        houseId1 !== houseId2 &&
        checkRectangleIntersection(rectangle1, rectangle2)
      ) {
        collisions[houseId1] = true
        collisions[houseId2] = true
      }
    })
  })

  return collisions
}

const localStorageKey: string = 'buildx-houses-v8'

export const saveHouses = (houses: Houses) => {
  localStorage.setItem(localStorageKey, JSON.stringify(houses))
}

export const getHouses = (): Record<string, House> =>
  pipe(
    safeLocalStorageGet(localStorageKey) ?? {},
    map((house: any) => ({
      ...house,
      houseTypeId: house.houseTypeId ?? house.id,
    }))
  )

export const getHouseModules = (
  house: House,
  sysModules: Module[],
  houseTypes: HouseType[]
) =>
  pipe(
    houseTypes,
    findFirst((ht: HouseType) => ht.id === house.houseTypeId),
    optMap((houseType) => house.modifiedDna ?? houseType.dna),
    optMap(
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
    getOrElse(() => [] as Module[])
  )
