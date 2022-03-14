import { BUILDX_LOCAL_STORAGE_HOUSES_KEY } from "@/CONSTANTS"
import { Houses } from "@/data/house"
import { HouseType } from "@/data/houseType"
import { Module } from "@/data/module"
import { SSR } from "@/utils"
import { useEffect } from "react"
import { proxy, subscribe, useSnapshot } from "valtio"

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

export default houses
