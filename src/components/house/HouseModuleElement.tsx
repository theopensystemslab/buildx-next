import { MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { useRef } from "react"
import { BufferGeometry, Material, Mesh } from "three"

type Props = MeshProps & {
  elementName: string
  moduleIndex: number
  houseId: string
  geometry: BufferGeometry
  material: Material
}

const HouseModuleElement = (props: Props) => {
  const { geometry, material, elementName, moduleIndex, houseId } = props
  const meshRef = useRef<Mesh>()

  const bind = useGesture<{
    hover: ThreeEvent<PointerEvent>
    onPointerLeave: ThreeEvent<PointerEvent>
  }>({
    // onHover: (state) => {
    //   if (store.contextMenu) return
    //   else elementHover(state)
    // },
    // onPointerDown: ({ shiftKey }) => selectElement(shiftKey),
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      {...(bind() as any)}
    />
  )
}

export default HouseModuleElement
