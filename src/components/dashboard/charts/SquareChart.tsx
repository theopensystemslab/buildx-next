import React, { type FC } from "react"
import { colorScheme } from "../Ui"

interface Props {
  data: number[]
  unitOfMeasurement: string
}

const SquareChart: FC<Props> = (props) => {
  const w = 60
  const h = 80

  const total = props.data.reduce((a, b) => a + b, 0)

  // Start an accumulating y coordinate to stack bars on top of each other
  let accumulatedY = 0

  return (
    <svg width="200" viewBox={`0 0 ${w} ${h}`}>
      {props.data.map((d, index) => {
        const currentAccummulatedY = accumulatedY
        const height = (d / total) * h
        accumulatedY += height
        return (
          <rect
            key={index}
            x="0"
            y={currentAccummulatedY}
            fill={colorScheme[index]}
            width={w}
            height={height}
          />
        )
      })}
    </svg>
  )
}

export default SquareChart
