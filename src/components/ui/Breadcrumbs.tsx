import houses, { useHouse } from "@/stores/houses"
import { useRoute } from "@/utils/wouter"
import React from "react"
import { Link } from "wouter"

type BreadcrumbProps = {
  path: string
  label: string
}

type Params = {
  buildingId: string
  levelIndex?: string
}

const Breadcrumb = ({ path, label }: BreadcrumbProps) => (
  <Link href={path}>{label}</Link>
)

const BreadcrumbsWithParams = (params: Params) => {
  const { buildingId, levelIndex } = params

  const { friendlyName } = houses[buildingId]

  return (
    <div className="absolute top-0 left-0 bg-pink-500">
      <Breadcrumb
        path={`/site?buildingId=${buildingId}`}
        label={friendlyName}
      />
      {levelIndex && (
        <Breadcrumb
          path={`/site?buildingId=${buildingId}&levelIndex=${levelIndex}`}
          label={`Level ${levelIndex}`}
        />
      )}
    </div>
  )
}

const Breadcrumbs = () => {
  const [, params] =
    useRoute<{ buildingId: string; levelIndex?: string }>("/site:rest*")

  return typeof params === "boolean" ||
    params === null ||
    !("buildingId" in params) ? null : (
    <BreadcrumbsWithParams {...(params as Params)} />
  )
}

export default Breadcrumbs
