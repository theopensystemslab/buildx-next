import { type Module } from "@/data/module"
import { type SystemsData } from "@/data/system"
import { type Houses } from "@/data/house"

export interface DashboardData {
  byHouse: Record<string, HouseInfo>
  unitsCount: number
  areas: { total: number; roof: number }
}

export interface HouseInfo {
  houseModules: Module[]
  buildingArea: number
  roofArea: number
  cost: number
  embodiedCarbon: number
}

const calculateHouseInfo = (houseModules: Module[]): HouseInfo => {
  return {
    houseModules,
    buildingArea: houseModules.reduce((accumulator, current) => {
      return (
        accumulator +
        (current.structuredDna.level === 0 ? current.width * current.length : 0)
      )
    }, 0),
    roofArea: houseModules.reduce((accumulator, current) => {
      return (
        accumulator +
        (current.structuredDna.levelType[0] === "R"
          ? current.width * current.length
          : 0)
      )
    }, 0),
    cost: houseModules.reduce((accumulator, current) => {
      return accumulator + current.cost
    }, 0),
    embodiedCarbon: houseModules.reduce((accumulator, current) => {
      return accumulator + current.embodiedCarbon
    }, 0),
  }
}

const calculate = ({
  houses,
  systemsData,
  selectedHouses,
}: {
  houses: Houses
  systemsData: SystemsData
  selectedHouses: string[]
}): DashboardData => {
  const byHouse = (() => {
    const obj: Record<string, HouseInfo> = {}

    selectedHouses.forEach((houseId) => {
      const house = houses[houseId]
      if (!house) {
        return
      }
      const modules = house.dna
        .map((dna) =>
          systemsData.modules.find(
            (module) => module.dna === dna && module.systemId === house.systemId
          )
        )
        .filter((module): module is Module => Boolean(module))

      obj[houseId] = calculateHouseInfo(modules)
    })
    return obj
  })()

  const areas = Object.values(byHouse).reduce(
    ({ total, roof }, houseInfo) => {
      return {
        total: total + houseInfo.buildingArea,
        roof: roof + houseInfo.roofArea,
      }
    },
    { total: 0, roof: 0 }
  )

  return {
    byHouse,
    areas,
    unitsCount: selectedHouses.length,
  }
}

export default calculate
