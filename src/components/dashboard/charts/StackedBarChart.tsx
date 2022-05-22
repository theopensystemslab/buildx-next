import React, { useMemo, type FC } from "react"
import { defaultColor } from "../Ui"
import { formatWithUnit } from "../data"

/**
 * Returns whether members of an array have alternating signs
 * alternatingSigns([0, 1, 2, 3]) === false
 * alternatingSigns([0, 1, -2, 3]) === true
 */
const alternatingSigns = (list: number[]): boolean => {
  let foundNegative = false
  let foundPositive = false
  for (const member of list) {
    if (member < 0) {
      foundNegative = true
      if (foundPositive) {
        return true
      }
    } else if (member > 0) {
      foundPositive = true
      if (foundNegative) {
        return true
      }
    }
  }
  return false
}

/*
 * NOTE: this chart is not designed to handle all edge cases. Specifically:
 * - the case where all values are negative are not handled
 */
const StackedBarChart: FC<{
  data: { value: number; color: string }[][]
  unitOfMeasurement: string
}> = (props) => {
  const aggregates = useMemo(
    () =>
      props.data.map((d) =>
        d.reduce((accumulator, v) => accumulator + v.value, 0)
      ),
    [props.data]
  )

  const { max, min, absoluteMax } = useMemo(
    () => ({
      max: Math.max(...aggregates),
      min: Math.min(...aggregates),
      absoluteMax: Math.max(...aggregates.map(Math.abs)),
    }),
    [aggregates]
  )

  const w = 60
  const h = 60

  if (max === min) {
    return (
      <svg viewBox={`0 0 ${w} ${h}`}>
        <rect x="0" y="0" width={w} height={h} fill="rgba(0,0,0,0.08)"></rect>
        <text
          x={w / 2}
          y={h / 2}
          fill="#fff"
          textAnchor="middle"
          style={{ fontSize: 3 }}
        >
          No data available
        </text>
      </svg>
    )
  }

  const baseline = min < 0 ? (h * max) / (max - min) : h

  const scale = (min < 0 ? (h * max) / (max - min) : h) * 0.95

  return (
    <svg viewBox={`0 0 ${w} ${h}`}>
      {props.data.map((stack, index) => {
        const width = (w / (props.data.length + 1)) * 0.8
        const x = (w * (index + 1)) / (props.data.length + 1) - width / 2
        // Start an accumulating y coordinate to stack bars on top of each other
        let accumulatedY = 0
        const renderAggregate = alternatingSigns(stack.map((v) => v.value))
        const renderedStack = renderAggregate
          ? [{ value: aggregates[index], color: defaultColor}]
          : stack
        return (
          <g key={index}>
            {renderedStack.map((point, pointIndex) => {
              const height = (point.value * scale) / max
              const y = baseline - Math.max(height, 0)
              const currentAccummulatedY = accumulatedY
              accumulatedY -= height
              return (
                <g
                  key={pointIndex}
                  transform={`translate(0 ${currentAccummulatedY})`}
                >
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={Math.abs(height)}
                    stroke="none"
                    fill={point.color}
                  />
                  {Math.abs(point.value) > absoluteMax * 0.05 && (
                    <text
                      x={x + width / 2}
                      y={y + Math.abs(height) / 2 + 1.5}
                      fill="#000"
                      textAnchor="middle"
                      style={{ fontSize: 3.5 }}
                    >
                      {formatWithUnit(point.value, props.unitOfMeasurement)}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
      <line
        x1="0"
        y1={baseline - 0.15}
        x2={w}
        y2={baseline - 0.15}
        stroke="#fff"
        strokeWidth="0.3"
      />
    </svg>
  )
}

export default StackedBarChart
