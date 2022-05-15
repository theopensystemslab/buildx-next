import React, { useMemo, type FC } from "react"
import { colorScheme } from "../Ui"

const formatWithUnit = (d: number, unitOfMeasurement: string) => {
  const formatted =
    Math.abs(d) > 1000
      ? `${Math.floor(d / 1000)}k`
      : d.toLocaleString("en-GB", {
          maximumFractionDigits: 1,
        })
  const formattedWithUnit =
    unitOfMeasurement === "€"
      ? `${unitOfMeasurement}${formatted}`
      : `${formatted}${unitOfMeasurement}`
  return formattedWithUnit
}

/*
 * NOTE: this chart is not designed to handle all edge cases. Specifically:
 * - within one data set, all values have the same sign, e.g. [[-1, -2], [3, 4]]
 * - the case where all values are negative are not handled
 */
const StackedBarChart: FC<{
  data: number[][]
  unitOfMeasurement: string
}> = (props) => {
  const aggregates = useMemo(
    () => props.data.map((d) => d.reduce((a, b) => a + b, 0)),
    [props.data]
  )

  const { max, min } = useMemo(
    () => ({
      max: Math.max(...aggregates),
      min: Math.min(...aggregates),
    }),
    [aggregates]
  )

  if (max === min) {
    return null
  }

  const w = 60
  const h = 80

  const baseline = min < 0 ? (h * max) / (max - min) : h

  const scale = (min < 0 ? (h * max) / (max - min) : h) * 0.95

  return (
    <svg width="200" viewBox={`0 0 ${w} ${h}`}>
      {
        /* render bounding box for debugging purposes */
        false && (
          <rect
            x="0"
            y="0"
            width={w}
            height={h}
            stroke="teal"
            strokeWidth="1"
            fill="none"
          />
        )
      }
      {props.data.map((stack, index) => {
        const width = (w / (props.data.length + 1)) * 0.8
        const x = (w * (index + 1)) / (props.data.length + 1) - width / 2
        // Start an accumulating y coordinate to stack bars on top of each other
        let accumulatedY = 0
        return (
          <g key={index}>
            {stack.map((point, pointIndex) => {
              const height = (point * scale) / max
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
                    fill={
                      index < props.data.length - 1
                        ? colorScheme[pointIndex]
                        : `hsl(0,0%,${
                            70 +
                            (stack.length === 1
                              ? 0
                              : (15 * pointIndex) / (stack.length - 1))
                          }%)`
                    }
                  />
                  <text
                    x={x + width / 2}
                    y={y + Math.abs(height) / 2 + 2}
                    fill="#000"
                    textAnchor="middle"
                    style={{ fontSize: 4 }}
                  >
                    {formatWithUnit(point, props.unitOfMeasurement)}
                  </text>
                </g>
              )
            })}
          </g>
        )
      })}
      <line
        x1="0"
        y1={baseline - 0.25}
        x2={w}
        y2={baseline - 0.25}
        stroke="#fff"
        strokeWidth="0.5"
      />
    </svg>
  )
}

export default StackedBarChart
