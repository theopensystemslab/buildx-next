import { type Module } from "@/data/module"
import { type SystemsData } from "@/data/system"
import { type Houses } from "@/data/house"
import { type EnergyInfo } from "@/data/energyInfo"

export interface DashboardData {
  byHouse: Record<string, HouseInfo>
  unitsCount: number
  areas: Areas
  costs: Costs
  operationalCo2: OperationalCo2
  embodiedCo2: EmbodiedCo2
}

// Areas

export interface Areas {
  building: number
  foundation: number
  groundFloor: number
  firstFloor: number
  secondFloor: number
  roof: number
}

const emptyAreas = (): Areas => ({
  building: 0,
  foundation: 0,
  groundFloor: 0,
  firstFloor: 0,
  secondFloor: 0,
  roof: 0,
})

const accumulateAreas = (areas: Areas[]): Areas =>
  areas.reduce((accumulator, current) => {
    return {
      building: accumulator.building + current.building,
      foundation: accumulator.foundation + current.foundation,
      groundFloor: accumulator.groundFloor + current.groundFloor,
      firstFloor: accumulator.firstFloor + current.firstFloor,
      secondFloor: accumulator.secondFloor + current.secondFloor,
      roof: accumulator.roof + current.roof,
    }
  }, emptyAreas())

// Costs

export interface Costs {
  foundation: number
  roofStructure: number
  superstructure: number
  roofCovering: number
  internalLining: number
  cladding: number
  total: number
}

const emptyCosts = (): Costs => ({
  foundation: 0,
  roofStructure: 0,
  superstructure: 0,
  roofCovering: 0,
  internalLining: 0,
  cladding: 0,
  total: 0,
})

const accumulateCosts = (areas: Costs[]): Costs =>
  areas.reduce((accumulator, current) => {
    return {
      foundation: accumulator.foundation + current.foundation,
      roofStructure: accumulator.roofStructure + current.roofStructure,
      superstructure: accumulator.superstructure + current.superstructure,
      roofCovering: accumulator.roofCovering + current.roofCovering,
      internalLining: accumulator.internalLining + current.internalLining,
      cladding: accumulator.cladding + current.cladding,
      total: accumulator.total + current.total,
    }
  }, emptyCosts())

// Operational Co2

export interface OperationalCo2 {
  annualTotal: number
  annualComparative: number
  lifetime: number
}

const emptyOperationalCo2 = (): OperationalCo2 => ({
  annualTotal: 0,
  annualComparative: 0,
  lifetime: 0,
})

const accumulateOperationalCo2 = (values: OperationalCo2[]): OperationalCo2 =>
  values.reduce((accumulator, current) => {
    return {
      annualTotal: accumulator.annualTotal + current.annualTotal,
      annualComparative:
        accumulator.annualComparative + current.annualComparative,
      lifetime: accumulator.lifetime + current.lifetime,
    }
  }, emptyOperationalCo2())

// Embodied Co2

export interface EmbodiedCo2 {
  foundations: number
  modules: number
  cladding: number
  total: number
}

const emptyEmbodiedCo2 = (): EmbodiedCo2 => ({
  foundations: 0,
  modules: 0,
  cladding: 0,
  total: 0,
})

const accumulateEmbodiedCo2 = (values: EmbodiedCo2[]): EmbodiedCo2 =>
  values.reduce((accumulator, current) => {
    return {
      foundations: accumulator.foundations + current.foundations,
      modules: accumulator.modules + current.modules,
      cladding: accumulator.cladding + current.cladding,
      total: accumulator.total + current.total,
    }
  }, emptyEmbodiedCo2())

export interface HouseInfo {
  houseModules: Module[]
  areas: Areas
  costs: Costs
  operationalCo2: OperationalCo2
  embodiedCo2: EmbodiedCo2
  cost: number
  embodiedCarbon: number
}

const calculateHouseInfo = (
  houseModules: Module[],
  energyInfo: EnergyInfo
): HouseInfo => {
  const accumulateIf = (
    fn: (module: Module) => boolean,
    getValue: (module: Module) => number
  ) => {
    return houseModules.reduce((accumulator, current) => {
      return accumulator + (fn(current) ? getValue(current) : 0)
    }, 0)
  }

  const areas = {
    building: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "G",
      (module) => module.width * module.height
    ),
    foundation: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "F",
      (module) => module.width * module.height
    ),
    groundFloor: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "G",
      (module) => module.width * module.height
    ),
    firstFloor: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "M",
      (module) => module.width * module.height
    ),
    secondFloor: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "T",
      (module) => module.width * module.height
    ),
    roof: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "R",
      (module) => module.width * module.height
    ),
  }

  // TODO: finish calculation
  const costs = {
    foundation: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "F",
      (module) => module.cost
    ),
    roofStructure: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "R",
      (module) => module.cost
    ),
    superstructure: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "R",
      (module) => module.cost
    ),
    roofCovering: 0,
    internalLining: 0,
    cladding: 0,
    total: accumulateIf(
      () => true,
      (module) => module.cost
    ),
  }

  const annualTotalOperationalCo2 = accumulateIf(
    (module) => true,
    (module) => module.width * module.height * energyInfo.operationalCo2
  )

  const operationalCo2 = {
    annualTotal: annualTotalOperationalCo2,
    annualComparative: accumulateIf(
      (module) => true,
      // TODO: figure out calculation
      (module) => module.width * module.height * 30
    ),
    lifetime: annualTotalOperationalCo2 * 60,
  }

  const embodiedCo2 = {
    foundations: accumulateIf(
      (module) => module.structuredDna.levelType[0] === "F",
      (module) => module.embodiedCarbon
    ),
    modules: accumulateIf(
      (module) => module.structuredDna.levelType[0] !== "F",
      (module) => module.embodiedCarbon
    ),
    cladding: accumulateIf(
      (module) => module.structuredDna.levelType[0] !== "R",
      (module) => module.embodiedCarbon
    ),
    total: accumulateIf(
      () => true,
      (module) => module.embodiedCarbon
    ),
  }

  return {
    houseModules,
    areas,
    costs,
    operationalCo2,
    embodiedCo2,
    cost: accumulateIf(
      () => true,
      (module) => module.cost
    ),
    embodiedCarbon: accumulateIf(
      () => true,
      (module) => module.embodiedCarbon
    ),
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
  console.log(systemsData)

  const byHouse = (() => {
    const obj: Record<string, HouseInfo> = {}

    selectedHouses.forEach((houseId) => {
      const house = houses[houseId]
      if (!house) {
        return
      }

      const energyInfo = systemsData.energyInfo.find(
        (info) => info.systemId === house.systemId
      )

      if (!energyInfo) {
        return
      }

      const modules = house.dna
        .map((dna) =>
          systemsData.modules.find(
            (module) => module.dna === dna && module.systemId === house.systemId
          )
        )
        .filter((module): module is Module => Boolean(module))

      obj[houseId] = calculateHouseInfo(modules, energyInfo)
    })
    return obj
  })()

  return {
    byHouse,
    areas: accumulateAreas(
      Object.values(byHouse).map((houseInfo) => houseInfo.areas)
    ),
    costs: accumulateCosts(
      Object.values(byHouse).map((houseInfo) => houseInfo.costs)
    ),
    operationalCo2: accumulateOperationalCo2(
      Object.values(byHouse).map((houseInfo) => houseInfo.operationalCo2)
    ),
    embodiedCo2: accumulateEmbodiedCo2(
      Object.values(byHouse).map((houseInfo) => houseInfo.embodiedCo2)
    ),
    unitsCount: selectedHouses.length,
  }
}

export default calculate
