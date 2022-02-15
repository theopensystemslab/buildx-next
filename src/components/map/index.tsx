import Layout from "@/components/layouts"
import type { MapPolygons } from "@/data/mapPolygon"
import {
  degreeToMeters,
  getMapPolygons,
  mapPolygonInfo,
  maxMeters,
  saveMapPolygons,
  scaleMapPolygon,
} from "@/data/mapPolygon"
import { IconButton, Modal } from "../ui"
import { AlertTriangle, Crosshair } from "../ui/icons"
import MapboxDraw from "@mapbox/mapbox-gl-draw"
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder"
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import type { Map as MapboxMap } from "mapbox-gl"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { max, reduce } from "ramda"
import React, {
  Fragment,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ""
if (mapboxgl.accessToken === "") throw new Error("Empty Mapbox access token")

const maxAllowedBound = maxMeters / degreeToMeters

const MapPageIndex = () => {
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
      center: [-0.2416811, 51.5285582], // starting position [lng, lat]
      zoom: 15, // starting zoom
    })

    // Source: https://docs.mapbox.com/mapbox-gl-js/example/hillshade/
    map.on("load", function () {
      map.addSource("dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
      })
      map.addLayer(
        {
          id: "hillshading",
          source: "dem",
          type: "hillshade",
          // insert below waterway-river-canal-shadow;
          // where hillshading sits in the Mapbox Outdoors style
        }
        // "waterway-river-canal-shadow"
      )
    })

    const draw = new MapboxDraw()
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
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl as any,
      })
    )
    map.on("draw.create", () => {
      setMapPolygons(getPolygons())
    })
    map.on("draw.update", () => {
      setMapPolygons(getPolygons())
    })
    map.on("draw.delete", () => {
      setMapPolygons(getPolygons())
    })
    mapRef.current = map
    drawRef.current = draw
    centerFirst()
    return () => {
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <Fragment>
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
        <IconButton onClick={centerFirst}>
          <Crosshair />
        </IconButton>
      </div>
      <div id="map-container" className="w-full flex-1"></div>
    </Fragment>
  )
}

MapPageIndex.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default MapPageIndex
