import { SystemsDataProvider } from "@/context/SystemsData"
import dynamic from "next/dynamic"
import React, { Fragment, ReactElement, useState } from "react"
import Layout from "../layouts"
import { IconButton, Loader } from "../ui"
import { Menu } from "../ui/icons"
import Container from "./Container"
import SiteSidebar from "./SiteSidebar"

const ThreeInit = dynamic(() => import("./SiteThreeInit"), { ssr: false })

const SitePageIndex = () => {
  const [sidebar, setSidebar] = useState(false)

  return (
    <Fragment>
      <div className="absolute top-0 right-0 z-10">
        <IconButton onClick={() => setSidebar(true)}>
          <Menu />
        </IconButton>
      </div>
      <SiteSidebar open={sidebar} close={() => setSidebar(false)} />
      <ThreeInit />
    </Fragment>
  )
}

SitePageIndex.getLayout = (page: ReactElement) => {
  return (
    <SystemsDataProvider
      onError={
        <Container>
          <p>Something went wrong.</p>
        </Container>
      }
      onLoading={
        <Container>
          <Loader />
        </Container>
      }
    >
      <Layout>{page}</Layout>
    </SystemsDataProvider>
  )
}

export default SitePageIndex
