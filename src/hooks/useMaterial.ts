import { DEFAULT_MATERIAL_NAME } from "@/CONSTANTS"
import { useSystemsData } from "@/contexts/SystemsData"
import defaultMaterial from "@/materials/defaultMaterial"
import glassMaterial from "@/materials/glassMaterial"
import invisibleMaterial from "@/materials/invisibleMaterial"
import materials from "@/stores/materials"
import scopes from "@/stores/scope"
import { pipe } from "fp-ts/lib/function"
import { getOrElse, none, some } from "fp-ts/lib/Option"
import { findFirstMap } from "fp-ts/lib/ReadonlyArray"
import { useMemo, useState } from "react"
import { Color, Material } from "three"
import { subscribeKey } from "valtio/utils"

const builtInMaterials: Record<string, Material> = {
  Glazing: glassMaterial,
}

const useMaterial = (
  elementName: string,
  modifiedMaterials: Record<string, string>,
  levelIndex: number,
  visible: boolean = true
) => {
  const { elements, materials: sysMaterials } = useSystemsData()
  const [illuminated, setIlluminated] = useState(false)

  subscribeKey(scopes.secondary, "hovered", () => {
    if (scopes.secondary.hovered?.levelIndex === levelIndex && !illuminated) {
      setIlluminated(true)
    } else if (
      scopes.secondary.hovered?.levelIndex !== levelIndex &&
      illuminated
    ) {
      setIlluminated(false)
    }
  })

  return useMemo(() => {
    const materialName =
      modifiedMaterials?.[elementName] ??
      elements.find((e) => e.name === elementName)?.defaultMaterial ??
      DEFAULT_MATERIAL_NAME

    switch (true) {
      case !visible: {
        const k = { visible: false }
        const m = materials.get(k)
        if (m) return m
        else {
          materials.set(k, invisibleMaterial)
          return invisibleMaterial
        }
      }
      case illuminated: {
        const k = { name: materialName, illuminated: true }
        const m = materials.get(k)
        // console.log("returning illuminated")
        if (m) return m
        else {
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
            )
          )
          const newM = threeMaterial.clone()
          if ("color" in newM) {
            newM.color = newM.color.add(new Color("#880000"))
          }
          materials.set(k, newM)
          return newM
        }
      }
      default: {
        const k = { name: materialName }
        const m = materials.get(k)
        if (m) return m
        else {
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
            )
          )
          materials.set(k, threeMaterial)
          return threeMaterial
        }
      }
    }
  }, [elementName, sysMaterials, visible, illuminated])
}

export default useMaterial
