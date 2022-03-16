import { House as HouseT } from "@/data/house"
import { useContext } from "@/stores/context"
import { useHouse, useHouses } from "@/stores/houses"
import { mapRR } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense } from "react"
import { House } from "../house"
import Loader3D from "../ui-3d/Loader3D"

const BuildingMode = ({ buildingId }: { buildingId: string }) => {
  const house = useHouse(buildingId)

  return (
    <Suspense key={house.id} fallback={<Loader3D />}>
      <House house={house as HouseT} />
    </Suspense>
  )
}

const SiteMode = () => {
  const houses = useHouses()

  return (
    <group>
      {pipe(
        houses,
        mapRR((house) => (
          <Suspense key={house.id} fallback={<Loader3D />}>
            <House house={house as HouseT} />
          </Suspense>
        )),
        toReadonlyArray
      )}
    </group>
  )
}

const SiteThreeApp = () => {
  const { buildingId } = useContext()

  return !buildingId ? <SiteMode /> : <BuildingMode buildingId={buildingId} />
}

export default SiteThreeApp
