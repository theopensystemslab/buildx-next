import { dropRight, flatten, map, reduce } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { Polygon, Position } from "geojson"
import { useMemo } from "react"
import { BufferAttribute, BufferGeometry, LineBasicMaterial } from "three"
import { proxy, useSnapshot } from "valtio"
import { BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY } from "../CONSTANTS"
import { SSR } from "../utils"

const localStorageKey: string = "buildx-v1-polygon-features"

export const initialMapPolygon = ((): Polygon | null => {
  if (SSR) return null
  const rawStoragePayload = localStorage.getItem(
    BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY
  )
  if (!rawStoragePayload) {
    return null
  }
  return JSON.parse(rawStoragePayload)
})()

const mapProxy = proxy<{
  polygon: Polygon | null
  mode: "SEARCH" | "DRAW"
}>({
  polygon: initialMapPolygon,
  mode: "SEARCH",
})

export const setMapPolygon = (mapPolygon: Polygon) => {
  mapProxy.polygon = mapPolygon
  localStorage.setItem(localStorageKey, JSON.stringify(mapPolygon))
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
  const [cx, cy] = getMapPolygonCentre(polygon)

  return pipe(
    polygon.coordinates[0],
    map(([x, y]) => [x - cx, 0.1, y - cy])
  )
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
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const material = useMemo(
    () =>
      new LineBasicMaterial({
        color: "#454545",
      }),
    []
  )

  const geometry = useMemo(() => {
    const geometry = new BufferGeometry()
    if (polygon !== null && polygon.coordinates.length > 0) {
      geometry.setAttribute(
        "position",
        new BufferAttribute(
          new Float32Array(pipe(polygon, polygonToCoordinates, flatten)),
          3
        )
      )
    }
    return geometry
  }, [polygon])

  return [geometry, material] as const
}

export const useMapMode = () => {
  const { mode } = useSnapshot(mapProxy)

  const setMode = (m: typeof mode) => {
    mapProxy.mode = m
  }

  return [mode, setMode] as const
}

export const useMapPolygon = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const setMapPolygon = (mp: typeof mapProxy.polygon) => {
    mapProxy.polygon = mp
  }

  return [polygon, setMapPolygon] as const
}

export default mapProxy
