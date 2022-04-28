import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import React, { useMemo, useState, type FC } from "react"
import Link from "next/link"
import calculate, { type DashboardData } from "./data"
import HouseMultiSelect from "./HouseMultiSelect"
import { Tab, tabs, fromSlug } from "./dashboardTabs"
import { type House } from "@/data/house"
import OverviewTab from "./OverviewTab"
import BuildingAreasTab from "./BuildingAreasTab"

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
      <div className="max-w-5xl pt-20 pb-16 mx-auto space-y-8">
        <HouseMultiSelect
          houses={houses}
          selectedHouses={selectedHouses}
          setSelectedHouses={setSelectedHouses}
        />
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
        {dashboardData && (
          <div className="pt-8">
            {activeTab === Tab.Overview ? (
              <OverviewTab dashboardData={dashboardData} />
            ) : null}
            {activeTab === Tab.BuildingAreas ? (
              <BuildingAreasTab dashboardData={dashboardData} />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
