import Layout from "@/components/layouts"
import { setMapPolygon } from "@/stores/map"
import React, { Fragment, ReactElement, Suspense } from "react"
import OLMap from "./OLMap"

const MapPageIndex = () => {
  return (
    <Fragment>
      <Suspense fallback={null}>
        <OLMap onPolygonCoordinates={setMapPolygon} />
      </Suspense>
    </Fragment>
  )
}

MapPageIndex.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default MapPageIndex
