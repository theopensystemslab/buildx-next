import type { ReactNode } from "react"
import React, { useState } from "react"
import useMeasure from "react-use-measure"
import { useWindowSize } from "usehooks-ts"

export interface Props {
  label: string
  children?: ReactNode
  long?: boolean
}

export default function ContextMenuNested(props: Props) {
  const [hovered, setHovered] = useState(false)

  const [ref, { right, bottom }] = useMeasure()

  const windowSize = useWindowSize()

  const flip = right > windowSize.width

  const shift = bottom > windowSize.height

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      onMouseEnter={() => {
        setHovered(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
      }}
    >
      <div
        className={`py-2 px-3 text-left text-sm ${
          hovered ? "bg-gray-100" : ""
        }`}
      >
        {props.label}
      </div>
      {hovered ? (
        <div
          ref={ref}
          className={`absolute ${shift ? "bottom-0" : "top-0"} ${
            flip ? "right-full" : "left-full"
          } z-20 bg-white ${props.long ? "w-64" : "w-48"}`}
        >
          {props.children}
        </div>
      ) : null}
    </div>
  )
}
