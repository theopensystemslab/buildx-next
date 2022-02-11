import Sidebar from "@/components/ui/Sidebar"
import { useSystemsData } from "@/context/SystemsData"
import { System, systems } from "@/data/system"
import { addHouse } from "@/store"
import { nanoid } from "nanoid"
import React, { useMemo, useState } from "react"
import HouseThumbnail from "./HouseThumbnail"

type Props = {
  open: boolean
  close: () => void
}

const SiteSidebar = ({ open, close }: Props) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null)

  const selectedSystem: System | undefined = useMemo(() => {
    return systems.find((system) => system.id === selectedSystemId)
  }, [selectedSystemId])

  const systemsData = useSystemsData()

  return (
    <Sidebar expanded={open} onClose={close}>
      {!selectedSystem ? (
        <div className="space-y-2">
          <p className="px-4 font-bold">Systems</p>
          {systems.map((system) => (
            <button
              key={system.id}
              className="block w-full cursor-pointer px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => {
                setSelectedSystemId(system.id)
              }}
            >
              {system.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <button
            className="sticky top-2 ml-4 rounded bg-white px-2 py-2 text-xs text-gray-500 hover:text-gray-600"
            onClick={() => {
              setSelectedSystemId(null)
            }}
          >
            ← Back
          </button>
          <p className="px-4 font-bold">{selectedSystem.name} House types</p>
          {systemsData.houseTypes.map((houseType, index) => {
            return houseType.systemId === selectedSystem.id ? (
              <HouseThumbnail
                key={index}
                houseType={houseType}
                onAdd={() =>
                  addHouse({
                    id: nanoid(),
                    houseTypeId: houseType.id,
                    systemId: houseType.systemId,
                    position: [0, 0],
                    // addNewPoint(
                    //   Object.values(prevHouses).map((house) => house.position)
                    // ),
                    rotation: 0,
                    dna: houseType.dna,
                    modifiedMaterials: {},
                  })
                }
              />
            ) : null
          })}
        </div>
      )}
    </Sidebar>
  )
}

export default SiteSidebar
