import { useSystemsData } from "@/context/SystemsData"
import { Module } from "@/data/module"
import defaultMaterial from "@/materials/defaultMaterial"
import glassMaterial from "@/materials/glassMaterial"
import { useHouse } from "@/store"
import { fuzzyMatch, GltfT, isMesh } from "@/utils"
import { GroupProps } from "@react-three/fiber"
import { pipe } from "fp-ts/lib/function"
import { flatten, getOrElse, none, some } from "fp-ts/lib/Option"
import { findFirstMap, map as mapA, reduce } from "fp-ts/lib/ReadonlyArray"
import {
  filter,
  filterWithIndex,
  map,
  mapWithIndex,
  toReadonlyArray,
} from "fp-ts/lib/ReadonlyRecord"
import produce from "immer"
import React from "react"
import { BufferGeometry, Material, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import HouseModuleElement from "./HouseModuleElement"

type Props = GroupProps & {
  module: Module
  moduleIndex: number
  gltf: GltfT
  houseId: string
}

const builtInMaterials: Record<string, Material> = {
  Glazing: glassMaterial,
}

const HouseModule = (props: Props) => {
  const { module, moduleIndex, gltf, houseId, ...groupProps } = props

  const { elements, materials } = useSystemsData()
  const house = useHouse(houseId)

  const getElement = (nodeType: string) =>
    fuzzyMatch(elements, {
      keys: ["ifc4Variable"],
      threshold: 0.5,
    })(nodeType)

  const getMaterial = (elementName: string) => {
    if (house.modifiedMaterials?.[elementName]) {
      return pipe(
        materials,
        findFirstMap((m) =>
          m.name === house.modifiedMaterials[elementName] && m.threeMaterial
            ? some(m.threeMaterial)
            : none
        ),
        getOrElse(() =>
          elementName in builtInMaterials
            ? builtInMaterials[elementName]
            : defaultMaterial
        )
      )
    } else {
      return pipe(
        elements,
        findFirstMap((e) =>
          e.name === elementName
            ? some(
                pipe(
                  materials,
                  findFirstMap((m) =>
                    m.name === e.defaultMaterial && m.threeMaterial
                      ? some(m.threeMaterial)
                      : none
                  )
                )
              )
            : none
        ),
        flatten,
        getOrElse(() =>
          elementName in builtInMaterials
            ? builtInMaterials[elementName]
            : defaultMaterial
        )
      )
    }
  }

  const meshes = pipe(
    gltf.nodes,
    toReadonlyArray,
    reduce({}, (acc: { [e: string]: Mesh[] }, [nodeType, node]) => {
      const element = getElement(nodeType)
      if (!element) return acc
      return produce(acc, (draft) => {
        node.traverse((child) => {
          if (isMesh(child)) {
            if (element.name in draft) draft[element.name].push(child)
            else draft[element.name] = [child]
          }
        })
      })
    }),
    map((meshes) => mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))),
    filter((bg: BufferGeometry | null): bg is BufferGeometry => Boolean(bg)),
    filterWithIndex((k) => k !== "Appliance"), // model needs clean-up??
    mapWithIndex((elementName, geometry) => (
      <HouseModuleElement
        key={elementName}
        {...{
          elementName,
          geometry,
          material: getMaterial(elementName),
          houseId,
          moduleIndex,
        }}
      />
    )),
    toReadonlyArray,
    mapA(([_k, v]) => v)
  )

  return <group {...groupProps}>{meshes}</group>
}

export default HouseModule
