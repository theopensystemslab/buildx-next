import { ScopeTypeEnum, setContextMenu, store } from "@/store"
import { all, any, undef } from "@/utils"
import { Html } from "@react-three/drei"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { useEffect, useRef, useState } from "react"
import { BufferGeometry, Material, Mesh } from "three"
import { ref, subscribe, useSnapshot } from "valtio"

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

  useEffect(() =>
    subscribe(store.scope, () => {
      switch (store.scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          if (
            all(
              any(
                store.scope.hovered === houseId,
                store.scope.selected.includes(houseId)
              ),
              !store.outlined.includes(meshRef)
            )
          ) {
            store.outlined = ref([...store.outlined, meshRef])
            invalidate()
          }
          if (
            all(
              store.outlined.includes(meshRef),
              store.scope.hovered !== houseId,
              !store.scope.selected.includes(houseId)
            )
          ) {
            store.outlined = ref(
              store.outlined.filter(
                (x) => x.current?.id !== meshRef.current?.id
              )
            )
            invalidate()
          }
      }
    })
  )

  const bind = useGesture<{
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
    onContextMenu: ThreeEvent<PointerEvent>
  }>({
    onHover: ({ event: { intersections } }) => {
      if (store.contextMenu) return
      if (undef(intersections[0])) return
      if (undef(meshRef.current)) return
      const obj = intersections[0].object ?? intersections[0].eventObject
      if (obj.id !== meshRef.current.id) return

      switch (store.scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          store.scope.hovered = houseId
      }
    },
    onContextMenu: ({ event: { intersections } }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return
      setContextMenu(true)
    },
    onPointerDown: ({ event: { intersections }, shiftKey }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return

      switch (store.scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          if (!store.scope.selected.includes(houseId)) {
            if (shiftKey) store.scope.selected.push(houseId)
            else store.scope.selected = [houseId]
          }
      }
    },
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
