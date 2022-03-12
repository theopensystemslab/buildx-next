import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { SSR } from "@/utils"
import { useEffect } from "react"
import { proxy, subscribe, useSnapshot } from "valtio"
import { useSystemsData } from "./systems"

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

export const useHouse = (houseId: string) => {
  const { houseTypes, modules: sysModules } = useSystemsData()
  const { houses } = useHouses()
  // const house = houses[houseId]

  console.log("hello", houses)

  // const modules = !house
  //   ? []
  //   : pipe(
  //       houseTypes,
  //       findFirst((ht) => ht.id === house.houseTypeId),
  //       mapO((houseType) => house.dna ?? houseType.dna),
  //       mapO(
  //         flow(
  //           filterMap((dna) =>
  //             pipe(
  //               sysModules,
  //               findFirst(
  //                 (sysM: Module) =>
  //                   sysM.systemId === house.systemId && sysM.dna === dna
  //               )
  //             )
  //           )
  //         )
  //       ),
  //       getOrElse((): readonly Module[] => [])
  //     )

  // return { modules }
}

export default houses
