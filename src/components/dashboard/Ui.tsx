import React, { type FC, type ReactNode } from "react"

export const colorScheme = [
  "#FAFF00",
  "#ADFF00",
  "#3EFF80",
  "#7DFFE0",
  "#90EBFF",
  "#4193FF",
  "#E09EFF",
  "#FFA1E4",
  "#F73063",
  "#FF7426",
]

export const DataPoint: FC<{
  value: number
  unitOfMeasurement: string
  description: string
}> = (props) => {
  return (
    <div className="text-white space-y-2">
      <p className="text-5xl">{`${props.value.toLocaleString("en-GB", {
        maximumFractionDigits: 1,
      })}${props.unitOfMeasurement}`}</p>
      <p className="text-sm">{props.description}</p>
    </div>
  )
}

export const ChangeDataPoint: FC<{
  percentage: number
  description: string
}> = (props) => {
  return (
    <div className="flex text-gray-300 space-x-1">
      <span className="inline-block pt-4 text-2xl">
        {props.percentage < 0 ? "↓" : "↑"}
      </span>
      <div className="space-y-2">
        <p className="text-5xl">{`${Math.abs(props.percentage).toLocaleString(
          "en-GB",
          {
            maximumFractionDigits: 0,
          }
        )}%`}</p>
        <p className="text-sm">{props.description}</p>
      </div>
    </div>
  )
}

export const Labeled: FC<{ label: string; children: ReactNode }> = (props) => (
  <div className="space-y-8">
    <p className="text-sm text-white">{props.label}</p>
    <div className="space-y-4">{props.children}</div>
  </div>
)
