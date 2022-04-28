import React, { type FC } from "react"
import { type DashboardData } from "./data"
import { DataPoint, ChangeDataPoint, Labeled } from "./Ui"
import BasicChart from "./BasicChart"

const OverviewTab: FC<{ dashboardData: DashboardData }> = (props) => {
  const { dashboardData } = props
  const costs = Object.values(dashboardData.byHouse).map(d => d.cost)
  console.log(costs)
  return (
    <div className="space-y-16">
      <div className="grid grid-cols-4 space-x-4">
        <Labeled label="Total site area">
          <DataPoint
            value={350}
            unitOfMeasurement="m²"
            explanation="gross internal area"
          />
        </Labeled>
        <Labeled label="Total building area">
          <DataPoint
            value={dashboardData.areas.total}
            unitOfMeasurement="m²"
            explanation="gross internal area"
          />
        </Labeled>
        <Labeled label="Number of units">
          <DataPoint
            value={dashboardData.unitsCount}
            unitOfMeasurement=""
            explanation="new buildings"
          />
        </Labeled>
      </div>
      <div className="grid grid-cols-4 space-x-4">
        <Labeled label="Estimated total building cost">
          <BasicChart data={[...costs, 500000]} explanation="Euros" />
          <ChangeDataPoint
            percentage={-30}
            explanation="compared to traditional construction cost"
          />
        </Labeled>
        <Labeled label="Annual energy demand">
          <BasicChart data={[-2, 8]} explanation="gross internal area" />
        </Labeled>
        <Labeled label="Total operational CO₂">
          <BasicChart data={[4, 1]} explanation="gross internal area" />
        </Labeled>
        <Labeled label="Total embodied CO₂">
          <BasicChart data={[4, 1]} explanation="gross internal area" />
        </Labeled>
      </div>
    </div>
  )
}

export default OverviewTab
