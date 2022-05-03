import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import React, { useMemo, useState, type FC } from "react"
import Link from "next/link"
import calculate, { type DashboardData } from "./data"
import HouseMultiSelect from "./HouseMultiSelect"
import { Tab, tabs, fromSlug } from "./dashboardTabs"
import { type House } from "@/data/house"
import Overview from "./TabContents/Overview"
import BuildingAreas from "./TabContents/BuildingAreas"
import BuildCosts from "./TabContents/BuildCosts"
import EnergyUse from "./TabContents/EnergyUse"
import BuildingFabric from "./TabContents/BuildingFabric"
import OperationalCo2 from "./TabContents/OperationalCo2"
import EmbodiedCo2 from "./TabContents/EmbodiedCo2"

export interface Props {
  slug?: string
}

const Dashboard: FC<Props> = (props) => {
  const houses = useHouses() as Record<string, House>
  const systemsData = useSystemsData()
  const activeTab = fromSlug(props.slug)

  // Select the first building by default
  const [selectedHouses, setSelectedHouses] = useState<string[]>(
    Object.keys(houses).slice(0, 1)
  )

  const dashboardData = useMemo<DashboardData | null>(() => {
    if (!systemsData || systemsData === "error") {
      return null
    }
    return calculate({
      houses,
      systemsData,
      selectedHouses,
    })
  }, [systemsData, houses, selectedHouses])

  return (
    <div className="w-full h-full overflow-auto bg-gray-100">
      <div className="max-w-5xl pt-20 pb-16 pl-4 pr-4 mx-auto space-y-8">
        <HouseMultiSelect
          houses={houses}
          selectedHouses={selectedHouses}
          setSelectedHouses={setSelectedHouses}
        />
        <div className="flex flex-wrap items-center justify-start space-x-4">
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
        {dashboardData && (
          <div className="pt-8">
            {activeTab === Tab.Overview ? (
              <Overview dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.BuildingAreas ? (
              <BuildingAreas dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.BuildCosts ? (
              <BuildCosts dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.EnergyUse ? (
              <EnergyUse dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.BuildingFabric ? (
              <BuildingFabric dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.OperationalCo2 ? (
              <OperationalCo2 dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.EmbodiedCo2 ? (
              <EmbodiedCo2 dashboardData={dashboardData} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
