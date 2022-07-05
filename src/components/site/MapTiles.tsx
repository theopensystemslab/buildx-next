import MVTLoader from "@/loaders/mvt"
import mapProxy, {
  getMapPolygonCentre,
  metersPerPixel,
  toLonLatPolygon,
} from "@/stores/map"
import { mapO } from "@/utils"
import geojsonArea from "@mapbox/geojson-area"
import * as cover from "@mapbox/tile-cover"
import { useLoader } from "@react-three/fiber"
import { pipe } from "fp-ts/lib/function"
import { fromNullable, getOrElse } from "fp-ts/lib/Option"
import { useSnapshot } from "valtio"

const tileToURL = ([x, y, z]: [number, number, number]) => {
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/${z}/${x}/${y}.mvt?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`
  // console.log(url)
  return url
}

// .then((blob) => URL.createObjectURL(blob))

// const foo = "https://api.mapbox.com/v4/{tileset_id}/{zoom}/{x}/{y}.{format}"

type TileProps = {
  tile: V3
  mpp: number
  polygonCentre: [number, number]
}

const Tile = ({ tile, mpp, polygonCentre: centre }: TileProps) => {
  const foo = useLoader(MVTLoader as any, tileToURL(tile))

  console.log(foo)
  // useEffect(() => {
  //   ;(async () => {
  //     const geometryData = await load(tileToURL(tile), MVTLoader)

  //     console.log({ geometryData })
  //   })()
  // }, [])

  return null

  // return data ? (
  //   <TileWithData
  //     {...{
  //       satelliteBlobURL: satelliteBlob,
  //       terrainBlobURL: terrainBlob,
  //       tile: tile,
  //       mpp,
  //       polygonCentre: centre,
  //     }}
  //   />
  // ) : null
}

const MapTiles = () => {
  const { polygon } = useSnapshot(mapProxy) as typeof mapProxy

  const { tiles, latitude, centre } = pipe(
    polygon,
    fromNullable,
    mapO((mercatorPoly) =>
      pipe(mercatorPoly, toLonLatPolygon, (lonLatPoly) => ({
        tiles: cover.tiles(lonLatPoly, {
          min_zoom: 21,
          max_zoom: 21,
        }) as V3[],
        area: geojsonArea.geometry(lonLatPoly),
        latitude: lonLatPoly.coordinates[0][0][1],
        centre: pipe(mercatorPoly, getMapPolygonCentre) as [number, number],
      }))
    ),
    getOrElse(() => ({
      tiles: [] as V3[],
      area: 0,
      latitude: 0,
      centre: [0, 0] as [number, number],
    }))
    // mapO((poly) => pipe(poly, getMapPolygonCentre, toLonLat))
  )

  const mpp = metersPerPixel(latitude, 21 + 1)

  return (
    <group position={[0, 0.05, 0]} rotation={[0, 0, 0]}>
      {tiles.map((tile) => (
        <Tile
          key={JSON.stringify(tile)}
          {...{ tile, mpp, polygonCentre: centre }}
        />
      ))}
    </group>
  )
}

export default MapTiles
