import { useSystemsData } from "@/data/system"
import { useHouses } from "@/stores/houses"
import { Close } from "@/components/ui/icons"
import React, { useMemo, useState, type FC } from "react"
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
  <div className="space-y-4">
    <p className="text-sm">{props.label}</p>
    <div>
      <p className="text-4xl text-gray-400">{`${props.value}${props.unitOfMeasurement}`}</p>
      <p className="text-sm text-gray-400">{props.explanation}</p>
    </div>
  </div>
)

const BasicChart: FC<{
  label: string
  data: number[]
  explanation: string
}> = (props) => {
  const max = useMemo(() => Math.max(...props.data), [props.data])
  const min = useMemo(() => Math.min(...props.data), [props.data])

  const w = 60
  const h = 100

  const baseline = min < 0 ? h / 2 : h

  const scale = (min < 0 ? h / 2 : h) * 0.85

  return (
    <div className="space-y-4">
      <p className="text-sm">{props.label}</p>
      <div className="space-y-2">
        <svg width="200" viewBox={`0 0 ${w} ${h}`}>
          {props.data.map((point, index) => {
            const width = (w / (props.data.length + 1)) * 0.6
            const height = (point * scale) / max
            const x = (w * (index + 1)) / (props.data.length + 1) - width / 2
            return (
              <>
                <rect
                  x={x}
                  y={baseline - Math.max(height, 0)}
                  width={width}
                  height={Math.abs(height)}
                  stroke="none"
                  fill={index === 0 ? "#3EFF80" : "#9D9D9D"}
                />
                <text
                  x={x + width / 2}
                  y={baseline - height - (height < 0 ? -6 : 3)}
                  fill="#9D9D9D"
                  textAnchor="middle"
                  style={{ fontSize: 4 }}
                >
                  {point}
                </text>
              </>
            )
          })}
          <line
            x1="0"
            y1={baseline - 0.25}
            x2={w}
            y2={baseline - 0.25}
            stroke="#000"
            strokeWidth="0.5"
          />
        </svg>
        <p className="text-sm text-gray-400">{props.explanation}</p>
      </div>
    </div>
  )
}

const Overview = () => {
  return (
    <div className="space-y-16">
      <div className="grid grid-cols-4 space-x-4">
        <SingleDataPoint
          label="Total site area"
          value={350}
          unitOfMeasurement="m²"
          explanation="gross internal area"
        />
        <SingleDataPoint
          label="Total building area"
          value={350}
          unitOfMeasurement="m²"
          explanation="gross internal area"
        />
        <SingleDataPoint
          label="Number of units"
          value={2}
          unitOfMeasurement=""
          explanation="new buildings"
        />
      </div>
      <div className="grid grid-cols-4 space-x-4">
        <BasicChart
          label="Total site area"
          data={[10, 20]}
          explanation="gross internal area"
        />
        <BasicChart
          label="Total building area"
          data={[-2, 8]}
          explanation="gross internal area"
        />
        <BasicChart
          label="Number of units"
          data={[4, 1]}
          explanation="gross internal area"
        />
      </div>
    </div>
  )
}

const Dashboard: FC<Props> = (props) => {
  const houses = useHouses()
  const systemsData = useSystemsData()
  const activeTab = fromSlug(props.slug)

  const [selectedBuildings, setSelectedBuildings] = useState<string[]>(
    Object.keys(houses).slice(0, 1)
  )

  return (
    <div className="w-full h-full overflow-auto bg-gray-100">
      <div className="max-w-5xl pt-20 pb-16 mx-auto space-y-8">
        <div className="flex py-4 border-b border-gray-700 space-x-2">
          <input
            list="buildings"
            className="w-40 px-2 py-1 list-none"
            value=""
            placeholder="Add house"
            onChange={(ev) => {
              const foundHouse = Object.entries(houses).find(
                ([_houseId, house]) => house.friendlyName === ev.target.value
              )
              const houseId = foundHouse?.[0]
              if (!houseId) {
                return null
              }
              setSelectedBuildings((prev) => [...prev, houseId])
            }}
          />
          <datalist id="buildings">
            {Object.entries(houses).map(([houseId, house]) =>
              selectedBuildings.includes(houseId) ? null : (
                <option
                  key={houseId}
                  value={house.friendlyName}
                  data-houseId={houseId}
                />
              )
            )}
          </datalist>
          {selectedBuildings.map((houseId) => {
            const house = houses[houseId]
            if (!house) {
              return null
            }
            return (
              <p
                key={houseId}
                className="inline-flex items-center bg-white space-x-1"
              >
                <span className="inline-block py-1 pl-3">
                  {house.friendlyName}
                </span>
                <button
                  className="h-8 w-8 p-0.5 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedBuildings((prev) =>
                      prev.filter((id) => id !== houseId)
                    )
                  }}
                >
                  <Close />
                </button>
              </p>
            )
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
        <div className="pt-8">
          {activeTab === Tab.Overview ? <Overview /> : null}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
