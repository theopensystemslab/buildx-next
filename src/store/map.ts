import { pipe } from "fp-ts/lib/function"
import { flatten } from "fp-ts/lib/ReadonlyArray"
import { Feature, Polygon } from "geojson"
import { useMemo } from "react"
import { BufferAttribute, BufferGeometry, LineBasicMaterial } from "three"
import { useSnapshot } from "valtio"
import { store } from "."
import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "../CONSTANTS"
import { mapPolygonsToCoordinates } from "../data/mapPolygon"
import { SSR } from "../utils"

// export const initialMapPolygon = ((): Feature<Polygon> => {
//   if (SSR) return emptyMapPolygon
//   const rawStoragePayload = localStorage.getItem(
//     BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
//   )
//   if (!rawStoragePayload) return emptyMapPolygon
//   return JSON.parse(rawStoragePayload)
// })()

// export const useLocallyStoredMapPolygons = () => {
//   useEffect(
//     () =>
//       subscribeKey(store, "mapPolygon", () => {
//         // console.log("change", store.mapPolygon)
//         localStorage.setItem(
//           BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY,
//           JSON.stringify(store.mapPolygon)
//         )
//       }),
//     []
//   )
// }

export const setMapPolygon = (mapPolygon: Polygon) => {
  store.mapPolygon = mapPolygon
  console.log({ mapPolygon, storeMapPolygon: store.mapPolygon })
}

export const useMapBoundary = () => {
  const snap = useSnapshot(store)

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        color: "#454545",
      }),
    []
  )

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const coords = pipe(snap.mapPolygon.coordinates)

    console.log({ coords })

    geometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array(),
        // flatten(
        //   snap.mapPolygon.coordinates.map(([x,y]) => [x,0.1,y])
        //   // mapPolygonsToCoordinates([snap.mapPolygon]).map(([x, y]) => [
        //   //   x,
        //   //   0.1,
        //   //   y,
        //   // ])
        // )
        3
      )
    )
    return geometry
  }, [snap.mapPolygon])

  return [geometry, material] as const
}
