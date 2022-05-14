import React, { type FC, type ReactNode } from "react"
import { type DashboardData } from "../data"
import { ChangeDataPoint, Labeled, Titled } from "../Ui"
import StackedBarChart from "../charts/StackedBarChart"
import SquareChart from "../charts/SquareChart"
import CircleChart from "../charts/CircleChart"

const GridLayout: FC<{ children: ReactNode }> = (props) => (
  <div className="grid grid-cols-1 gap-x-4 space-y-16 md:grid-cols-4 md:space-y-0">
    {props.children}
  </div>
)

const OverviewTab: FC<{ dashboardData: DashboardData }> = (props) => {
  const { dashboardData } = props

  const costs = Object.values(dashboardData.byHouse).map((d) => d.costs)

  const embodiedCo2 = Object.values(dashboardData.byHouse).map((d) => d.embodiedCo2)

  const operationalCo2 = Object.values(dashboardData.byHouse).map((d) => d.operationalCo2)

  return (
    <div className="space-y-16">
      <GridLayout>
        <Titled title="Build cost" subtitle="Estimated EUR">
          <StackedBarChart
            data={[
              costs.map((cost) => cost.total),
              costs.map((cost) => cost.comparative),
            ]}
            unitOfMeasurement="€"
          />
        </Titled>
        <Titled title="Floor area" subtitle="Gross internal area m²">
          <SquareChart
            data={Object.values(dashboardData.byHouse).map(
              (houseInfo) => houseInfo.areas.totalFloor
            )}
            unitOfMeasurement="m²"
          />
        </Titled>
        <Titled title="Energy use" subtitle="Estimated annual">
          <CircleChart
            data={Object.values(dashboardData.byHouse).map(
              (houseInfo) => houseInfo.energyUse.totalHeatingCost
            )}
            unitOfMeasurement="€"
          />
        </Titled>
        <Titled title="Carbon emissions" subtitle="Estimated annual">
          <StackedBarChart
            data={[
              operationalCo2.map((co2) => co2.annualTotal),
              operationalCo2.map((co2) => co2.annualComparative),
            ]}
            unitOfMeasurement="T"
          />
        </Titled>
      </GridLayout>
      <GridLayout>
        <Titled title="Carbon emissions" subtitle="Estimated upfront">
          <StackedBarChart
            data={[
              embodiedCo2.map((co2) => co2.total),
              embodiedCo2.map((co2) => co2.comparative),
            ]}
            unitOfMeasurement="T"
          />
        </Titled>
      </GridLayout>
    </div>
  )
}

export default OverviewTab
