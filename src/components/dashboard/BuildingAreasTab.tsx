import React, { type FC } from "react"
import { type DashboardData } from "./data"

const data = [
  ["Footprint area", "Total foundation area", "40", "m²"],
  ["Footprint area", "Total foundation area", "40", "m²"],
  ["Footprint area", "Total foundation area", "40", "m²"],
  ["Footprint area", "Total foundation area", "40", "m²"],
  ["Footprint area", "Total foundation area", "40", "m²"],
  ["Footprint area", "Total foundation area", "40", "m²"],
  ["Footprint area", "Total foundation area", "40", "m²"],
]

const BuildingAreasTab: FC<{ dashboardData: DashboardData }> = (props) => {
  return (
    <div className="table w-full">
      {data.map((row, rowIndex) => (
        <div key={rowIndex} className="table-row bg-white">
          {row.map((cell, cellIndex) => (
            <div key={cellIndex} className={`table-cell px-4 py-2 ${cellIndex === 1 ? "italic" : ""}`}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default BuildingAreasTab
