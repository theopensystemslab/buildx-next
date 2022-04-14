import { DEFAULT_MATERIAL_NAME } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import builtInMaterials from "@/materials/builtInMaterials"
import defaultMaterial from "@/materials/defaultMaterial"
import { findFirstMap } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { useCallback, useEffect } from "react"
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three"
import { useSnapshot } from "valtio"
import { proxyMap, subscribeKey } from "valtio/utils"
import houses from "./houses"

export type ColorOpts = {
  default: Color
  illuminated: Color
}

export type MaterialKey = {
  buildingId: string
  elementName: string
  materialName: string
  levelIndex: number
}

export type MaterialValue = {
  key: MaterialKey
  threeMaterial: MeshStandardMaterial | MeshPhysicalMaterial
  colorOpts: ColorOpts
  colorValue: keyof ColorOpts
}

type MaterialKeyHash = string

const materials = proxyMap<MaterialKeyHash, MaterialValue>()

export const hashMaterialKey = ({
  buildingId,
  levelIndex,
  elementName,
}: MaterialKey) => JSON.stringify([buildingId, elementName, levelIndex])

export const pushMaterial = (material: MaterialValue) => {
  const hashKey = hashMaterialKey(material.key)
  if (!(hashKey in hashMaterialKey)) materials.set(hashKey, material)
}

export const setMaterialColor = (
  material: MaterialValue,
  color: keyof ColorOpts
) => {
  material.threeMaterial.color.set(material.colorOpts[color])
  material.colorValue = color
}

// export const useGetMaterial = (buildingId: string) => {
//   const { modifiedMaterials } = useSnapshot(houses[buildingId])

//   const { elements, materials: sysMaterials } = useSystemsData()

//   return useCallback(
//     (elementName: string) => {
//       const materialName =
//         modifiedMaterials?.[elementName] ??
//         elements.find((e) => e.name === elementName)?.defaultMaterial ??
//         DEFAULT_MATERIAL_NAME

//       return pipe(
//         sysMaterials,
//         findFirstMap((sysM) =>
//           sysM.name === materialName && sysM.threeMaterial
//             ? some(sysM.threeMaterial)
//             : none
//         ),
//         getOrElse(() =>
//           elementName in builtInMaterials
//             ? builtInMaterials[elementName]
//             : defaultMaterial
//         ),
//         (m) => m.clone()
//       )
//     },
//     [modifiedMaterials]
//   )
// }

export const useSyncModifiedMaterials = (buildingId: string) => {
  // const getMaterial = useGetMaterial(buildingId)

  useEffect(
    () =>
      subscribeKey(houses[buildingId], "modifiedMaterials", () => {
        materials.forEach((v, k) => {
          // materials.set(k, {
          //   ...v,
          //   threeMaterial: getMaterial(v.key.elementName),
          // })
        })
      }),
    []
  )
}

export default materials
