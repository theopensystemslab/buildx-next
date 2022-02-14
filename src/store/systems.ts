import { getElements } from "@/data/element"
import { getEnergyInfo } from "@/data/energyInfo"
import { getHouseTypes } from "@/data/houseType"
import { getInternalLayoutTypes } from "@/data/internalLayoutType"
import { getMaterials } from "@/data/material"
import { getModules } from "@/data/module"
import { System } from "@/data/system"
import { getWindowTypes } from "@/data/windowType"
import { flatten, map } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { proxy, useSnapshot } from "valtio"
import { derive } from "valtio/utils"

const systems: Array<System> = [
  {
    id: "sample",
    name: "Sample",
    airtableId: "appXYQYWjUiAT1Btm",
  },
  {
    id: "mobble",
    name: "Mobble",
    airtableId: "appYkSYalupnJmUA2",
  },
]

export const baseSystems = proxy({
  modules: Promise.all(pipe(systems, map(getModules))).then(flatten),

  windowTypes: Promise.all(pipe(systems, map(getWindowTypes))).then(flatten),

  internalLayoutTypes: Promise.all(systems.map(getInternalLayoutTypes)).then(
    flatten
  ),

  houseTypes: Promise.all(pipe(systems, map(getHouseTypes)))
    .then(flatten)
    .then((houseTypes) =>
      houseTypes.filter((houseType) => houseType.dna.length > 0)
    ),

  energyInfo: Promise.all(pipe(systems, map(getEnergyInfo))),

  materials: Promise.all(pipe(systems, map(getMaterials))).then(flatten),

  // elements: Promise.all(
})
// export const systems = proxy({})

const derivedSystems = derive({
  elements: (get) =>
    Promise.all(
      pipe(
        systems,
        map(async (system) =>
          getElements(system, await get(baseSystems).materials)
        )
      )
    ).then(flatten),
})

export const finalSystems = proxy({
  ...baseSystems,
  ...derivedSystems,
})

export const useSystems = () => useSnapshot(finalSystems)
