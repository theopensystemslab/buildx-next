import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import clsx from "clsx"
import mapboxgl from "mapbox-gl"
import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import "ol/ol.css"
import { fromLonLat } from "ol/proj"
import XYZ from "ol/source/XYZ"
import React, { useEffect, useRef, useState } from "react"
import css from "./index.module.css"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

const almere = fromLonLat([5.2647, 52.3508]) as [number, number]

const MapIndex = () => {
  const geocoderDiv = useRef<HTMLDivElement>(null)
  const mapDiv = useRef<HTMLDivElement>(null)

  const maxZoom = 19

  const [searchedOnce, setSearchedOnce] = useState(false)

  const [map] = useState(
    new Map({
      layers: [
        new TileLayer({
          source: new XYZ({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            maxZoom,
          }),
        }),
        // new VectorLayer({
        //   source: source,
        //   style: new Style({
        //     fill: new Fill({
        //       color: "rgba(255, 255, 255, 0.2)",
        //     }),
        //     stroke: new Stroke({
        //       color: "#ffcc33",
        //       width: 2,
        //     }),
        //   }),
        // }),
      ],
      view: new View({
        center: almere,
        zoom: 10,
        maxZoom,
      }),
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

      if (!searchedOnce) setSearchedOnce(true)
      // flyTo()
    })

    return () => {
      if (!geocoderDiv.current) return
      geocoderDiv.current.replaceChildren()
    }
  }, [])

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div ref={mapDiv} className="w-full flex-1" />
      <div
        ref={geocoderDiv}
        className={clsx(css.geocoder, searchedOnce && css.searchedGeocoder)}
      />
    </div>
  )
}

export default MapIndex
