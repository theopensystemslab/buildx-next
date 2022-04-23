import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import React, { useState, type FC } from "react"
import Link from "next/link"
import { nativeEnum } from "zod"

export interface Props {
  slug?: string
}

export enum Tab {
  Overview = "overview",
  BuildingAreas = "building-areas",
  BuildCosts = "build-costs",
  EnergyUse = "energy-use",
  OperationalCo2 = "operational-co2",
  EmbodiedCo2 = "embodied-co2",
}

const TabEnum = nativeEnum(Tab)

const tabs: { id: Tab; label: string }[] = [
  { id: Tab.Overview, label: "Overview" },
  { id: Tab.BuildingAreas, label: "Building Areas" },
  { id: Tab.BuildCosts, label: "Build Costs" },
  { id: Tab.EnergyUse, label: "Energy Use" },
  { id: Tab.OperationalCo2, label: "Operational CO₂" },
  { id: Tab.EmbodiedCo2, label: "Embodied CO₂" },
]

const fromSlug = (slug: string | undefined): Tab => {
  const parsed = TabEnum.safeParse(slug)
  if (parsed.success) {
    return parsed.data
  }
  return Tab.Overview
}

const SingleDataPoint: FC<{
  label: string
  value: number
  unitOfMeasurement: string
  explanation: string
}> = (props) => (
  <div>
    <p>{props.label}</p>
    <p>{`${props.value}${props.unitOfMeasurement}`}</p>
    <p>{props.explanation}</p>
  </div>
)

const Dashboard: FC<Props> = (props) => {
  const houses = useHouses()
  const systemsData = useSystemsData()
  const activeTab = fromSlug(props.slug)

  const [selectedBuildings, setSelectedBuildings] = useState<string[]>(
    Object.keys(houses).slice(0, 1)
  )

  return (
    <div className="w-full h-full bg-gray-100">
      <div className="max-w-5xl pt-20 mx-auto space-y-8">
        <div className="flex py-4 border-b border-gray-700 space-x-4">
          {selectedBuildings.map((houseId) => {
            const house = houses[houseId]
            if (!house) {
              return null
            }
            return <p key={houseId} className="px-2 py-1 bg-white">{house.friendlyName}</p>
          })}
        </div>
        <div className="flex items-center justify-start space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <Link key={tab.id} href={`/dashboard/${tab.id}`}>
                <span
                  className={[
                    "inline-block cursor-pointer whitespace-pre px-2 py-1 font-bold",
                    isActive ? "text-gray-700" : "text-gray-300",
                  ].join(" ")}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
