import { DEFAULT_MATERIAL_NAME } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import defaultMaterial from "@/materials/defaultMaterial"
import glassMaterial from "@/materials/glassMaterial"
import highlights from "@/stores/highlights"
import houses from "@/stores/houses"
import materials, { MaterialValue } from "@/stores/materials"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { findFirstMap } from "fp-ts/lib/ReadonlyArray"
import { useMemo, useRef } from "react"
import { Color, MeshPhysicalMaterial } from "three"
import { subscribeKey } from "valtio/utils"

const builtInMaterials: Record<string, MeshPhysicalMaterial> = {
  Glazing: glassMaterial,
}

const useMaterial = (
  buildingId: string,
  elementName: string,
  levelIndex: number
) => {
  const { elements, materials: sysMaterials } = useSystemsData()

  const { threeMaterial, colors } = useMemo(() => {
    const maybeMaterial = materials?.[buildingId]?.[elementName]?.[levelIndex]

    if (maybeMaterial) return maybeMaterial
    else {
      const materialName =
        houses[buildingId].modifiedMaterials?.[elementName] ??
        elements.find((e) => e.name === elementName)?.defaultMaterial ??
        DEFAULT_MATERIAL_NAME

      const threeMaterial = pipe(
        sysMaterials,
        findFirstMap((sysM) =>
          sysM.name === materialName && sysM.threeMaterial
            ? some(sysM.threeMaterial)
            : none
        ),
        getOrElse(() =>
          elementName in builtInMaterials
            ? builtInMaterials[elementName]
            : defaultMaterial
        ),
        (m) => m.clone()
      )
      const material: MaterialValue = {
        threeMaterial,
        colors: {
          default: threeMaterial.color.clone(),
          illuminated: threeMaterial.color.clone().add(new Color("#ff0000")),
        },
      }

      if (!(buildingId in materials)) {
        materials[buildingId] = {
          [elementName]: {
            [levelIndex]: material,
          },
        }
      } else if (!(elementName in materials[buildingId])) {
        materials[buildingId][elementName] = {
          [levelIndex]: material,
        }
      } else {
        materials[buildingId][elementName][levelIndex] = material
      }

      return material
    }
  }, [buildingId, elementName, levelIndex])

  subscribeKey(highlights, "hoveredLevelIndex", () => {
    if (highlights.hoveredLevelIndex === levelIndex) {
      threeMaterial.color = colors.illuminated
    } else if (highlights.hoveredLevelIndex !== levelIndex) {
      threeMaterial.color = colors.default
    }
  })

  // subscribe(materials[buildingId][elementName][levelIndex], () => {
  //   console.log(materials[buildingId][elementName][levelIndex].illuminated)
  //   // console.log(`${buildingId}-${elementName}-${levelIndex}`)
  //   // console.log(materials[buildingId][elementName][levelIndex])
  // })

  return threeMaterial

  // const [illuminated, setIlluminated] = useState(false)

  // subscribeKey(scopes.secondary, "hovered", () => {
  //   if (scopes.secondary.hovered?.levelIndex === levelIndex && !illuminated) {
  //     setIlluminated(true)
  //   } else if (
  //     scopes.secondary.hovered?.levelIndex !== levelIndex &&
  //     illuminated
  //   ) {
  //     setIlluminated(false)
  //   }
  // })

  // return useMemo(() => {
  //   const materialName =
  //     houses[buildingId].modifiedMaterials?.[elementName] ??
  //     elements.find((e) => e.name === elementName)?.defaultMaterial ??
  //     DEFAULT_MATERIAL_NAME

  //   switch (true) {
  //     // case !visible: {
  //     //   const k = { visible: false }
  //     //   const m = materials.get(k)
  //     //   if (m) return m
  //     //   else {
  //     //     materials.set(k, invisibleMaterial)
  //     //     return invisibleMaterial
  //     //   }
  //     // }
  //     // case illuminated: {
  //     //   const k = { name: materialName, illuminated: true }
  //     //   const m = materials.get(k)
  //     //   // console.log("returning illuminated")
  //     //   if (m) return m
  //     //   else {
  //     //     const threeMaterial = pipe(
  //     //       sysMaterials,
  //     //       findFirstMap((sysM) =>
  //     //         sysM.name === materialName && sysM.threeMaterial
  //     //           ? some(sysM.threeMaterial)
  //     //           : none
  //     //       ),
  //     //       getOrElse(() =>
  //     //         elementName in builtInMaterials
  //     //           ? builtInMaterials[elementName]
  //     //           : defaultMaterial
  //     //       )
  //     //     )
  //     //     const newM = threeMaterial.clone()
  //     //     if ("color" in newM) {
  //     //       newM.color = newM.color.add(new Color("#880000"))
  //     //     }
  //     //     materials.set(k, newM)
  //     //     return newM
  //     //   }
  //     // }
  //     default: {
  //       const k = { name: materialName }
  //       const m = materials.get(k)
  //       if (m) return m
  //       else {
  //         const threeMaterial = pipe(
  //           sysMaterials,
  //           findFirstMap((sysM) =>
  //             sysM.name === materialName && sysM.threeMaterial
  //               ? some(sysM.threeMaterial)
  //               : none
  //           ),
  //           getOrElse(() =>
  //             elementName in builtInMaterials
  //               ? builtInMaterials[elementName]
  //               : defaultMaterial
  //           )
  //         )
  //         materials.set(k, threeMaterial)
  //         return threeMaterial
  //       }
  //     }
  //   }
  // }, [elementName, elements, sysMaterials])
}

export default useMaterial
