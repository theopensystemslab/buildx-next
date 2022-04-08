import { useRouting } from "@/hooks/routing"
import context, { useContext } from "@/stores/context"
import highlights from "@/stores/highlights"
import { useHouses } from "@/stores/houses"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapRA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { keys } from "fp-ts/lib/ReadonlyRecord"
import React, { Fragment, Suspense, useEffect } from "react"
import { subscribe } from "valtio"
import { useLocation } from "wouter"
import Loader3D from "../ui-3d/Loader3D"
import BuildingBuilding from "./building/BuildingBuilding"
import SiteBuilding from "./building/SiteBuilding"

const BuildingMode = ({ buildingId }: { buildingId: string }) => {
  return <BuildingBuilding id={buildingId} />
}

const SiteMode = () => {
  const houses = useHouses()

  return (
    <Fragment>
      <group>
        {pipe(
          keys(houses),
          mapRA((id) => <SiteBuilding key={id} id={id} />)
        )}
      </group>
    </Fragment>
  )
}

const SiteThreeApp = () => {
  const { buildingId, levelIndex } = useContext()

  useRouting()

  useEffect(() => {
    if (buildingId === null) {
      scopes.primary = {
        type: ScopeTypeEnum.Enum.HOUSE,
        hovered: null,
        selected: [],
      }
    } else {
      scopes.primary = {
        type: ScopeTypeEnum.Enum.ELEMENT,
        hovered: null,
        selected: [],
      }
    }
    highlights.outlined = []
  }, [buildingId])

  return (
    <Suspense fallback={<Loader3D />}>
      {!buildingId ? <SiteMode /> : <BuildingMode buildingId={buildingId} />}
    </Suspense>
  )
}

export default SiteThreeApp
