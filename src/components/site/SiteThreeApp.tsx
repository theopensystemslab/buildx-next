import { useHouses } from "@/stores/houses"
import { pipe } from "fp-ts/lib/function"
import { map } from "fp-ts/lib/ReadonlyArray"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Suspense } from "react"
import { House } from "../house"
import Loader3D from "../ui-3d/Loader3D"

const SiteThreeApp = () => {
  const houses = useHouses()

  return (
    <group>
      {pipe(
        houses,
        keys,
        map((id) => (
          <Suspense key={id} fallback={<Loader3D />}>
            <House id={id} />
          </Suspense>
        ))
      )}
    </group>
  )
}

export default SiteThreeApp
