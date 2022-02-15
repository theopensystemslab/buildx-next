import { Feature, Polygon } from "geojson"
import { Geolocation, Map, View } from "ol"
import OLGeoJson from "ol/format/GeoJSON"
import { Draw, Modify, Snap } from "ol/interaction"
import TileLayer from "ol/layer/Tile"
import VectorLayer from "ol/layer/Vector"
import "ol/ol.css"
import OSM from "ol/source/OSM"
import VectorSource from "ol/source/Vector"
import { Fill, Stroke, Style } from "ol/style"
import { useEffect, useRef } from "react"

const useOpenLayersMap = ({
  onPolygonCoordinates,
}: {
  onPolygonCoordinates?: (x: Feature<Polygon>) => void
} = {}) => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const source = new VectorSource()

    const view = new View({
      center: [0, 0],
      zoom: 16,
    })

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        new VectorLayer({
          source: source,
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
      view,
    })

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
      const GeoJSON = new OLGeoJson()
      const polygon = JSON.parse(
        GeoJSON.writeFeature(feature)
      ) as Feature<Polygon>

      onPolygonCoordinates?.(polygon)
    })
    map.addInteraction(draw)

    const snap = new Snap({ source })
    map.addInteraction(snap)

    var geolocation = new Geolocation({
      projection: view.getProjection(),
      tracking: true,
    })

    geolocation.on("change", function (evt) {
      const pos = geolocation.getPosition()
      if (!pos) return
      map.getView().setCenter(pos)
    })
  }, [])

  return mapRef
}

export default useOpenLayersMap
