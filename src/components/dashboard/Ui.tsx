import React, { type FC, type ReactNode } from "react"

export const DataPoint: FC<{
  value: number
  unitOfMeasurement: string
  explanation: string
}> = (props) => (
  <div className="text-gray-400 space-y-2">
    <p className="text-5xl">{`${props.value}${props.unitOfMeasurement}`}</p>
    <p className="text-sm">{props.explanation}</p>
  </div>
)

export const ChangeDataPoint: FC<{
  percentage: number
  explanation: string
}> = (props) => (
  <div className="flex text-gray-400 space-x-1">
    <span className="inline-block pt-4 text-2xl">
      {props.percentage < 0 ? "↓" : "↑"}
    </span>
    <div className="space-y-2">
      <p className="text-5xl">{`${Math.abs(props.percentage)}%`}</p>
      <p className="text-sm">{props.explanation}</p>
    </div>
  </div>
)

export const Labeled: FC<{ label: string; children: ReactNode }> = (props) => (
  <div className="space-y-8">
    <p className="text-sm">{props.label}</p>
    <div className="space-y-4">{props.children}</div>
  </div>
)
