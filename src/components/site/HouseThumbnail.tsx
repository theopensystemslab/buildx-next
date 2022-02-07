import React from "react"
import type { FC } from "react"
import type { HouseType } from "@/data/houseType"

const HouseThumbnail: FC<{ houseType: HouseType; onAdd: () => void }> = (
  props
) => (
  <div className="flex items-center px-4 py-4 border-b border-gray-200 space-x-2">
    <div
      className="flex-none w-20 h-20 bg-gray-200 rounded-full"
      style={{
        backgroundImage: `url(${props.houseType.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 50%",
      }}
    ></div>
    <div className="space-y-0.5">
      <h3 className="text-xl font-bold">{props.houseType.name}</h3>
      <p className="text-sm">Description</p>
      <div className="space-x-2">
        {[].map((tag, tagIndex) => (
          <span key={tagIndex} className="px-3 py-0.5 bg-gray-100 rounded-xl">
            {tag}
          </span>
        ))}
      </div>
      <button
        onClick={props.onAdd}
        className="px-3 py-1 text-sm text-white bg-gray-800 rounded hover:bg-black transition-colors duration-200 ease-in-out"
      >
        Add to site
      </button>
    </div>
  </div>
)

export default HouseThumbnail
