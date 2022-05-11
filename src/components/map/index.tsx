import { TrashCan32 } from "@carbon/icons-react"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import clsx from "clsx"
import { Feature, Polygon } from "geojson"
import mapboxgl from "mapbox-gl"
import { Map, View } from "ol"
import GeoJSON from "ol/format/GeoJSON"
import { Draw, Modify, Snap } from "ol/interaction"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import "ol/ol.css"
import { fromLonLat } from "ol/proj"
import VectorSource from "ol/source/Vector"
import XYZ from "ol/source/XYZ"
import Fill from "ol/style/Fill"
import Stroke from "ol/style/Stroke"
import Style from "ol/style/Style"
import React, { useEffect, useRef, useState } from "react"
import { IconButton } from "../ui"
import { Search } from "../ui/icons"
import css from "./index.module.css"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

const almere = fromLonLat([5.2647, 52.3508]) as [number, number]

const MapIndex = () => {
  const geocoderDiv = useRef<HTMLDivElement>(null)
  const mapDiv = useRef<HTMLDivElement>(null)

  const maxZoom = 19

  const [mode, setMode] = useState<"SEARCH" | "DRAW">("SEARCH")

  const vectorSource = useRef(new VectorSource())

  const [map] = useState(
    new Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            maxZoom,
          }),
        }),
        new VectorLayer({
          source: vectorSource.current,
          style: new Style({
            fill: new Fill({
              color: "rgba(255, 255, 255, 0.2)",
            }),
            stroke: new Stroke({
              color: "#ffcc33",
              width: 2,
            }),
          }),
        }),
      ],
      view: new View({
        center: almere,
        zoom: 10,
        maxZoom,
      }),
      controls: [],
    })
  )

  useEffect(() => {
    if (!mapDiv.current) return
    map.setTarget(mapDiv.current)
    return () => {
      map.setTarget(undefined)
    }
  }, [map])

  useEffect(() => {
    if (!geocoderDiv.current) return

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any,
      flyTo: true,
      marker: false,
      placeholder: "Enter the location of your site",
    })

    geocoder.addTo(geocoderDiv.current!)

    geocoder.on("result", ({ result }) => {
      const target = fromLonLat(result.center) as [number, number]
      map.getView().setCenter(target)
      map.getView().setZoom(maxZoom)

      console.log("setting mode draw")
      setMode("DRAW")
    })

    return () => {
      if (!geocoderDiv.current) return
      geocoderDiv.current.replaceChildren()
    }
  }, [])

  useEffect(() => {
    const source = vectorSource.current

    const modify = new Modify({ source })
    map.addInteraction(modify)

    const draw = new Draw({
      source,
      type: "Polygon",
    })

    draw.on("drawstart", (event) => {
      source.clear()
    })

    draw.on("drawend", ({ feature }) => {
      const polyFeature = JSON.parse(
        new GeoJSON().writeFeature(feature)
      ) as Feature<Polygon>

      console.log({ polyFeature })

      // onPolygonCoordinates?.(polyFeature.geometry)
    })

    const snap = new Snap({ source })

    if (mode === "DRAW") {
      map.addInteraction(draw)
      map.addInteraction(snap)
    } else {
      map.removeInteraction(draw)
      map.removeInteraction(snap)
    }
  }, [mode])

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div ref={mapDiv} className="w-full flex-1" />
      <div
        ref={geocoderDiv}
        className={clsx(css.geocoder, mode === "DRAW" && "hidden")}
      />
      {mode === "DRAW" && (
        <div className="absolute left-0 flex flex-col items-center justify-center bg-white">
          <IconButton onClick={() => void setMode("SEARCH")}>
            <Search />
          </IconButton>
          <IconButton onClick={() => void vectorSource.current.clear()}>
            <div className="flex items-center justify-center">
              <TrashCan32 />
            </div>
          </IconButton>
        </div>
      )}
    </div>
  )
}

export default MapIndex
