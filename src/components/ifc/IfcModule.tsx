import { useSystemsData } from "@/contexts/SystemsData"
import { filterA } from "@/utils"
import { useBVH, useHelper } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import { pipe } from "fp-ts/lib/function"
import { useEffect, useMemo, useRef, useState } from "react"
import { Group, Mesh, MeshLambertMaterial } from "three"
import { MeshBVHVisualizer } from "three-mesh-bvh"
import { IFCLoader } from "web-ifc-three"

const IfcModule = () => {
  const groupRef = useRef<Group>(null)
  const meshRef = useRef<Mesh>()

  const { modules } = useSystemsData()

  const ifcModules = pipe(
    modules,
    filterA((module) => !!module.ifcUrl)
  )

  const url = ifcModules[1].ifcUrl

  const { geometry, material, ifcManager, modelID } = useLoader(
    IFCLoader,
    url,
    (loader) => {
      if (loader instanceof IFCLoader) {
        loader.ifcManager.setWasmPath("../../../wasm/")
      }
    }
  )

  useBVH(meshRef)

  // useEffect(() => {
  //   if (ifcManager === null) return
  //   ifcManager.setupThreeMeshBVH(
  //     acceleratedRaycast,
  //     computeBoundsTree,
  //     disposeBoundsTree
  //   )
  // }, [ifcManager])

  // useHelper(meshRef, MeshBVHVisualizer)

  const fooMaterial = useMemo(
    () =>
      new MeshLambertMaterial({
        // transparent: true,
        // opacity: 0.6,
        color: 0xff88ff,
        depthTest: false,
      }),
    []
  )

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        {...{ geometry, material }}
        onClick={({ faceIndex }) => {
          const group = groupRef.current
          if (!ifcManager || !faceIndex || !group) {
            console.log({ ifcManager, faceIndex, group })
            return
          }
          const expressID = ifcManager.getExpressId(geometry, faceIndex)
          const ifcType = ifcManager.getIfcType(modelID, expressID)

          console.log(ifcType)

          ifcManager.createSubset({
            ids: [expressID],
            modelID,
            removePrevious: true,
            scene: group,
            material: fooMaterial,
          })
        }}
      />
    </group>
  )
}
export default IfcModule
