import React, { type FC, type ReactNode } from "react"
import { type DashboardData } from "../data"
import { DataPoint, ChangeDataPoint, Labeled } from "../Ui"
import StackedBarChart from "../charts/StackedBarChart"

const GridLayout: FC<{ children: ReactNode }> = (props) => (
  <div className="grid grid-cols-1 gap-x-4 space-y-16 md:grid-cols-4 md:space-y-0">
    {props.children}
  </div>
)

const OverviewTab: FC<{ dashboardData: DashboardData }> = (props) => {
  const { dashboardData } = props

  const costs = Object.values(dashboardData.byHouse).map((d) => d.costs)

  return (
    <div className="space-y-16">
      <GridLayout>
        <Labeled label="Total site area">
          <DataPoint
            value={350}
            unitOfMeasurement="m²"
            description="gross internal area"
          />
        </Labeled>
        <Labeled label="Total building area">
          <DataPoint
            value={dashboardData.areas.foundation}
            unitOfMeasurement="m²"
            description="gross internal area"
          />
        </Labeled>
        <Labeled label="Number of units">
          <DataPoint
            value={dashboardData.unitsCount}
            unitOfMeasurement=""
            description="new buildings"
          />
        </Labeled>
      </GridLayout>
      <GridLayout>
        <Labeled label="Estimated total building cost">
          <StackedBarChart
            data={[
              costs.map((cost) => cost.total),
              costs.map((cost) => cost.comparative),
            ]}
            description="Euros"
            unitOfMeasurement="€"
          />
          <ChangeDataPoint
            percentage={-30}
            description="compared to traditional construction cost"
          />
        </Labeled>
        <Labeled label="Annual energy demand">
          <StackedBarChart
            data={[
              [-2, -4],
              [2, 3],
            ]}
            unitOfMeasurement=""
            description="gross internal area"
          />
        </Labeled>
        <Labeled label="Total operational CO₂">
          <StackedBarChart
            data={[
              [4, 1],
              [2, 3],
            ]}
            unitOfMeasurement=""
            description="gross internal area"
          />
        </Labeled>
        <Labeled label="Total embodied CO₂">
          <StackedBarChart
            data={[
              [4, 1],
              [1, 2],
            ]}
            unitOfMeasurement=""
            description="gross internal area"
          />
        </Labeled>
      </GridLayout>
    </div>
  )
}

export default OverviewTab
