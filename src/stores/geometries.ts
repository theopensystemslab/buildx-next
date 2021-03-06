import { useSystemsData } from "@/contexts/SystemsData"
import { filterR, fuzzyMatch, GltfT, isMesh, mapR, reduceA } from "@/utils"
import { findFirst } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { toUndefined } from "fp-ts/lib/Option"
import { toArray } from "fp-ts/lib/Record"
import produce from "immer"
import { BufferGeometry, Mesh } from "three"
import { mergeBufferGeometries } from "three-stdlib"
import { proxyMap } from "valtio/utils"

type SystemIdModuleDna = string

type ElementName = string

const geometries = proxyMap<
  SystemIdModuleDna,
  Map<ElementName, BufferGeometry>
>()

export const useModuleGeometries = (
  systemId: string,
  moduleDna: string,
  gltf: GltfT
) => {
  const { elements: systemElements } = useSystemsData()
  const elements = systemElements.filter((el) => el.systemId === systemId)

  const maybeModuleGeometries = geometries.get(moduleDna)
  if (maybeModuleGeometries) return maybeModuleGeometries

  const elementMap = new Map<ElementName, BufferGeometry>()

  const getElement = (nodeType: string) => {
    const strippedNodeType = nodeType
      .replace(/I?None.*/, "")
      .replace(/Component.*/, "")
      .replace(/Union.*/, "")
      .replaceAll(/[0-9]/g, "")
      .replace(/Object/, "")
      .replace(/(Ifc.*)(Ifc.*)/, "$1")
    const result = pipe(
      elements,
      findFirst((el) => {
        return el.ifc4Variable === strippedNodeType
      }),
      toUndefined
    )

    if (result === undefined && nodeType.startsWith("Ifc")) {
      console.log({
        unmatchedNodeType: { nodeType, strippedNodeType, moduleDna },
      })
    }

    return result
  }

  const elementMeshes = pipe(
    gltf.nodes,
    toArray,
    reduceA({}, (acc: { [e: string]: Mesh[] }, [nodeType, node]) => {
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
    mapR((meshes) =>
      mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))
    ),
    filterR((bg: BufferGeometry | null): bg is BufferGeometry => Boolean(bg))
  )

  Object.entries(elementMeshes).forEach(([k, v]) => {
    elementMap.set(k, v)
  })

  geometries.set(`${systemId}:${moduleDna}`, elementMap)

  return elementMap
}

export default geometries
