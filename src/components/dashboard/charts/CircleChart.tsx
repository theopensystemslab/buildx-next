import React, { type FC } from "react"
import { colorScheme } from "../Ui"
import { format } from "../data"

interface Props {
  value: number
  comparative: number
  unitOfMeasurement: string
}

const CircleChart: FC<Props> = (props) => {
  const w = 60
  const h = 60

  const t = 5

  const total = props.value + props.comparative

  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      <circle
        cx={w / 2}
        cy={h / 2}
        r={w / 3 + t / 2 - (t * props.value) / total / 2}
        fill="none"
        stroke={colorScheme[0]}
        strokeWidth={(t * props.value) / total}
      />
      <circle
        cx={w / 2}
        cy={h / 2}
        r={w / 3 - t / 2 + (t * props.comparative) / total / 2}
        fill="none"
        stroke="#dedede"
        strokeWidth={(5 * props.comparative) / total}
      />
      <text
        x={w / 2}
        y={h / 2}
        fill="#fff"
        textAnchor="middle"
        style={{ fontSize: 8 }}
      >
        {format(props.value)}
      </text>
      <text
        x={w / 2}
        y={h / 2 + 5}
        fill="#fff"
        textAnchor="middle"
        style={{ fontSize: 4 }}
      >
        {props.unitOfMeasurement}
      </text>
    </svg>
  )
}

export default CircleChart
