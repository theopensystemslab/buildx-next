import { type Module } from "@/data/module"
import { type SystemsData } from "@/data/system"
import { type Houses } from "@/data/house"

export interface DashboardData {
  unitsCount: number
  areas: { total: number; roof: number }
}

export interface HouseInfo {
  houseModules: Module[]
  buildingArea: number
  roofArea: number
}

const truncate = (val: number): number => {
  return Math.floor(val * 10) / 10
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
  const housesInfo = (() => {
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

  const areas = Object.values(housesInfo).reduce(
    ({ total, roof }, houseInfo) => {
      return {
        total: total + houseInfo.buildingArea,
        roof: roof + houseInfo.roofArea,
      }
    },
    { total: 0, roof: 0 }
  )

  return {
    areas: {
      total: truncate(areas.total),
      roof: truncate(areas.roof),
    },
    unitsCount: selectedHouses.length,
  }
}

export default calculate
