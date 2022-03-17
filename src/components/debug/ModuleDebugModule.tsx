import { Module } from "@/data/module"
import defaultMaterial from "@/materials/defaultMaterial"
import { isMesh, mapRA, useGLTF } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import { toReadonlyArray } from "fp-ts/lib/ReadonlyRecord"

const ModuleDebugModule = ({ module }: { module: Module }) => {
  const gltf = useGLTF(module.modelUrl)

  const meshes = pipe(
    gltf.nodes,
    toReadonlyArray,
    mapRA(([, node]) => {
      if (isMesh(node)) {
        return (
          <mesh
            key={node.id}
            material={defaultMaterial}
            geometry={node.geometry}
          ></mesh>
        )
      } else {
        console.log(node)
        return null
      }
    })
  )

  return <group>{meshes}</group>
  // map((meshes) => mergeBufferGeometries(meshes.map((mesh) => mesh.geometry))),
  // filter((bg: BufferGeometry | null): bg is BufferGeometry => Boolean(bg)),
  // filterWithIndex((k) => k !== "Appliance"), // model needs clean-up??
  // mapWithIndex((elementName, geometry) => (
}

export default ModuleDebugModule
