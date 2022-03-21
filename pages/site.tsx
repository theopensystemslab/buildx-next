import Layout from "@/components/layouts"
import { SiteContextMenu } from "@/components/menu"
import Container from "@/components/site/Container"
import HtmlUi from "@/components/site/HtmlUi"
import SiteThreeApp from "@/components/site/SiteThreeApp"
import { Loader } from "@/components/ui"
import { SystemsDataProvider } from "@/contexts/SystemsData"
import { useLocallyStoredHouses } from "@/stores/houses"
import dynamic from "next/dynamic"
import React, { Fragment, ReactElement, Suspense } from "react"

const SiteThreeInit = dynamic(() => import("@/components/site/SiteThreeInit"), {
  ssr: false,
})

const SiteIndexPage = () => {
  useLocallyStoredHouses()

  return (
    <Fragment>
      <Layout>
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
          <HtmlUi />
          <SiteThreeInit>
            <SiteThreeApp />
          </SiteThreeInit>
        </SystemsDataProvider>
      </Layout>
      <Suspense fallback={<Loader />}>
        <SiteContextMenu />
      </Suspense>
    </Fragment>
  )
}

SiteIndexPage.getLayout = (page: ReactElement) => {
  return <Layout>{page}</Layout>
}

export default SiteIndexPage
