import Layout from "@/components/layouts"
import IconButton from "@/components/ui/IconButton"
import IconLink from "@/components/ui/IconLink"
import { AlertTriangle, Build, Site } from "@/components/ui/icons"
import Modal from "@/components/ui/Modal"
import type { MapPolygons } from "@/data/mapPolygon"
import {
  degreeToMeters,
  getMapPolygons,
  mapPolygonInfo,
  maxMeters,
  saveMapPolygons,
  scaleMapPolygon,
} from "@/data/mapPolygon"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import type { Map as MapboxMap } from "mapbox-gl"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { max, reduce } from "ramda"
import type { FC, ReactElement } from "react"
import React, { useEffect, useMemo, useRef, useState } from "react"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!

const maxAllowedBound = maxMeters / degreeToMeters

const Map = () => {
  const [mapPolygons, setMapPolygons] = useState<MapPolygons | null>(
    getMapPolygons()
  )

  const [warningModal, setWarningModal] = useState(false)

  const mapRef = useRef<MapboxMap>()

  const drawRef = useRef<MapboxDraw>()

  const centerFirst = () => {
    const map = mapRef.current
    const firstMapPolygon = mapPolygons?.[0]
    if (!map || !firstMapPolygon) {
      return
    }
    const { center } = mapPolygonInfo(firstMapPolygon)
    map.setCenter(center)
    map.setZoom(15)
  }

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: "map-container", // container id
      style: "mapbox://styles/mapbox/satellite-v9", // style URL
      center: [5, 50], // starting position [lng, lat]
      zoom: 3.8, // starting zoom
      accessToken: mapboxgl.accessToken,
    })

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl as any,
      flyTo: true,
    })

    map.addControl(geocoder)

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      // Select which mapbox-gl-draw control buttons to add to the map.
      controls: {
        polygon: true,
        trash: true,
      },
    })

    const getPolygons = (): MapPolygons => {
      return draw.getAll().features as MapPolygons
    }

    map.addControl(draw)

    if (mapPolygons) {
      draw.add({
        type: "FeatureCollection",
        features: mapPolygons,
      })
    }

    // geocoder.addTo("#geocoder")

    // geocoder.on("result", console.log)

    // map.on("draw.create", () => {
    //   setMapPolygons(getPolygons())
    // })
    // map.on("draw.update", () => {
    //   setMapPolygons(getPolygons())
    // })
    // map.on("draw.delete", () => {
    //   setMapPolygons(getPolygons())
    // })
    mapRef.current = map
    // drawRef.current = draw
    centerFirst()
    return () => {
      map.removeControl(geocoder)
      map.remove()
    }
  }, [])

  useEffect(() => {
    saveMapPolygons(mapPolygons)
  }, [mapPolygons])

  const maxBound: number = useMemo(() => {
    const bounds = mapPolygons
      ? mapPolygons.map((polygon) => {
          return mapPolygonInfo(polygon).bound
        })
      : []
    return reduce<number, number>(max, 0, bounds)
  }, [mapPolygons])

  const fixPolygons = () => {
    const newPolygons = (mapPolygons || []).map((polygon) => {
      return scaleMapPolygon((maxAllowedBound / maxBound) * 0.98, polygon)
    })
    setMapPolygons(newPolygons)
    const draw = drawRef.current
    if (draw) {
      draw.deleteAll()
      draw.add({
        type: "FeatureCollection",
        features: newPolygons,
      })
    }
    setWarningModal(false)
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      {warningModal && (
        <Modal
          title="Map bounds are too large"
          onClose={() => {
            setWarningModal(false)
          }}
        >
          <div className="flex items-center justify-end space-x-4">
            <button
              onClick={() => {
                setWarningModal(false)
              }}
            >
              Cancel
            </button>
            <button
              className="bg-gray-800 px-4 py-1 text-white hover:bg-black"
              onClick={fixPolygons}
            >
              Fix
            </button>
          </div>
        </Modal>
      )}
      <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 transform justify-center bg-white shadow">
        <IconLink to="/map">
          <Site />
        </IconLink>
        <IconLink to="/site">
          <Build />
        </IconLink>
      </div>
      <div className="absolute left-0 top-1/2 z-10 flex -translate-y-1/2 transform flex-col justify-center bg-white shadow">
        {maxBound > maxAllowedBound ? (
          <IconButton
            onClick={() => {
              setWarningModal(true)
            }}
          >
            <AlertTriangle />
          </IconButton>
        ) : null}
        {/* <IconButton onClick={centerFirst}>
          <Crosshair />
        </IconButton> */}
      </div>
      <div id="map-container" className="w-full flex-1"></div>
      {/* <div id="geocoder" className="absolute "></div> */}
    </div>
  )
}

Map.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default Map
