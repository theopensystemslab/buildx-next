import { dropRight } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { flatten, map, reduce } from "fp-ts/lib/ReadonlyArray"
import { Polygon, Position } from "geojson"
import { useMemo } from "react"
import { BufferAttribute, BufferGeometry, LineBasicMaterial } from "three"
import { useSnapshot } from "valtio"
import { store } from "."
import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "../CONSTANTS"
import { degreeToMeters } from "../data/mapPolygon"
import { SSR } from "../utils"

const emptyMapPolygon: Polygon = {
  coordinates: [],
  type: "Polygon",
}

export const initialMapPolygon = ((): Polygon => {
  if (SSR) return emptyMapPolygon
  const rawStoragePayload = localStorage.getItem(
    BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
  )
  if (!rawStoragePayload) return emptyMapPolygon
  return JSON.parse(rawStoragePayload)
})()

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

export const getMapPolygonCentre = (polygon: Polygon) =>
  pipe(polygon.coordinates[0], dropRight(1), (coords) =>
    pipe(
      coords,
      reduce<Position, Position>([0, 0], ([x0, y0], [x1, y1]) => [
        x0 + x1 / coords.length,
        y0 + y1 / coords.length,
      ])
    )
  )

export const polygonToCoordinates = (polygon: Polygon) => {
  // const { points, center } = mapPolygonInfo(polygons[0]);
  const [cx, cy] = getMapPolygonCentre(polygon)

  console.log({ cx, cy })

  const foo = pipe(
    polygon.coordinates[0],
    map(([x, y]) => [x - cx, 0.1, y - cy])
  )

  console.log({ foo })

  return foo

  // return points.map(([x, y]) => [
  //   (x - center[0]) * degreeToMeters,
  //   (y - center[1]) * degreeToMeters * 2,
  // ]);
}

// Multiply latitude by 2 so it corresponds to the same distance
// const bound = Math.max(
//   ...[
//     ...points.map(([x, _y]) => Math.abs(x - center[0])),
//     ...points.map(([_x, y]) => 2 * Math.abs(y - center[1])),
//   ]
// );

// return { center, bound, points };

export const useMapBoundary = () => {
  const { mapPolygon } = useSnapshot(store) as unknown as {
    mapPolygon: Polygon
  }

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        // color: "#454545",
        color: "#ff0000",
      }),
    []
  )

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    const coords = pipe(mapPolygon, polygonToCoordinates, flatten)

    geometry.setAttribute(
      "position",
      new BufferAttribute(
        new Float32Array(coords),
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
  }, [mapPolygon])

  return [geometry, material] as const
}
