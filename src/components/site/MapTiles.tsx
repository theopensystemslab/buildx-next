import mapProxy, { getMapPolygonCentre } from "@/stores/map"
import { mapO } from "@/utils"
import * as cover from "@mapbox/tile-cover"
import { Plane } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import circleToPolygon from "circle-to-polygon"
import { pipe } from "fp-ts/lib/function"
import { fromNullable, getOrElse } from "fp-ts/lib/Option"
import { toLonLat } from "ol/proj"
import { useMemo } from "react"
import useSWR from "swr"
import { DoubleSide, TextureLoader } from "three"
import { useSnapshot } from "valtio"

const fetcher = (x: number, y: number, z: number, x2?: boolean) =>
  fetch(
    `https://api.mapbox.com/v4/mapbox.satellite/${z}/${x}/${y}@2x.pngraw?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
  )
    .then((res) => res.blob())
    .then((blob) => URL.createObjectURL(blob))

type TileProps = {
  xyz: V3
  xyz0: V3
}

const TileWithData = ({
  xyz: [x, y, z],
  xyz0: [x0, y0],
  data,
}: TileProps & { data: string }) => {
  const texture = useLoader(TextureLoader, data)

  return (
    <Plane
      args={[10, 10]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[(x - x0) * 10, 0, (y - y0) * 10]}
    >
      <meshBasicMaterial map={texture} side={DoubleSide} />
    </Plane>
  )
}

const Tile = ({ xyz, xyz0 }: TileProps) => {
  const { data } = useSWR(xyz, fetcher)
  return data ? <TileWithData {...{ data, xyz, xyz0 }} /> : null
}

const MapTiles = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const centreO = pipe(
    polygon,
    fromNullable,
    mapO((poly) => pipe(poly, getMapPolygonCentre, toLonLat))
  )

  const tiles: V3[] = pipe(
    centreO,
    mapO((centre) =>
      pipe(
        centre,
        (c) => circleToPolygon(c, 100, { numberOfEdges: 32 }),
        (geom) => cover.tiles(geom, { min_zoom: 18, max_zoom: 18 }) as V3[]
      )
    ),
    getOrElse(() => [] as V3[])
  )

  return (
    <group position={[-5, 0, -5]}>
      {tiles.map((xyz) => (
        <Tile key={JSON.stringify(xyz)} xyz={xyz} xyz0={tiles[0]} />
      ))}
    </group>
  )
}

export default MapTiles
