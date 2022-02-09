import {
  ElementScopeItem,
  LevelScopeItem,
  ModuleScopeItem,
  ScopeTypeEnum,
  store,
} from "@/store"
import { all, any, undef } from "@/utils"
import { invalidate, MeshProps, ThreeEvent } from "@react-three/fiber"
import { useGesture } from "@use-gesture/react"
import React, { useEffect, useRef, useState } from "react"
import { BufferGeometry, Material, Mesh } from "three"
import { ref, subscribe } from "valtio"

type Props = MeshProps & {
  elementName: string
  moduleIndex: number
  levelModuleIndices: number[]
  houseId: string
  geometry: BufferGeometry
  material: Material
}

const HouseModuleElement = (props: Props) => {
  const {
    geometry,
    material,
    elementName,
    moduleIndex,
    houseId,
    levelModuleIndices,
  } = props
  const meshRef = useRef<Mesh>()

  useEffect(() =>
    subscribe(store.scope, () => {
      let isOutlined = store.outlined.includes(meshRef),
        isHovered = false,
        isSelected = false
      switch (store.scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          isHovered = store.scope.hovered === houseId
          isSelected = store.scope.selected.includes(houseId)
          break

        case ScopeTypeEnum.Enum.ELEMENT:
          isHovered =
            store.scope.hovered?.houseId === houseId &&
            store.scope.hovered.elementName === elementName
          isSelected = !undef(
            store.scope.selected.find(
              (x) => x.houseId === houseId && x.elementName === elementName
            )
          )
          break

        case ScopeTypeEnum.Enum.MODULE:
          isHovered =
            store.scope.hovered?.houseId === houseId &&
            store.scope.hovered.moduleIndex === moduleIndex
          isSelected = !undef(
            store.scope.selected.find(
              (x) => x.houseId === houseId && x.moduleIndex === moduleIndex
            )
          )
          break

        case ScopeTypeEnum.Enum.LEVEL:
          isHovered =
            store.scope.hovered?.houseId === houseId &&
            store.scope.hovered.levelModuleIndices.includes(moduleIndex)
          isSelected = !undef(
            store.scope.selected.find(
              (x) =>
                x.houseId === houseId &&
                x.levelModuleIndices.includes(moduleIndex)
            )
          )
          break
      }

      if ((isHovered || isSelected) && !isOutlined) {
        store.outlined = ref([...store.outlined, meshRef])
        invalidate()
      }
      if (all(isOutlined, !isHovered, !isSelected)) {
        store.outlined = ref(
          store.outlined.filter((x) => x.current?.id !== meshRef.current?.id)
        )
        invalidate()
      }
    })
  )

  const bind = useGesture<{
    hover: ThreeEvent<PointerEvent>
    onPointerDown: ThreeEvent<PointerEvent>
    onContextMenu: ThreeEvent<PointerEvent> &
      React.MouseEvent<EventTarget, MouseEvent>
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
          break
        case ScopeTypeEnum.Enum.ELEMENT:
          store.scope.hovered = { houseId, elementName }
          break
        case ScopeTypeEnum.Enum.MODULE:
          store.scope.hovered = { houseId, moduleIndex }
          break
        case ScopeTypeEnum.Enum.LEVEL:
          store.scope.hovered = { houseId, levelModuleIndices }
      }
    },
    onContextMenu: ({ event: { intersections, pageX, pageY } }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return
      store.contextMenu = [pageX, pageY]
    },
    onPointerDown: ({ event: { intersections }, shiftKey }) => {
      const returnIf = any(
        undef(intersections?.[0]),
        intersections[0].object.id !== meshRef.current?.id
      )
      if (returnIf) return

      let isSelected = false
      let payload: any

      switch (store.scope.type) {
        case ScopeTypeEnum.Enum.HOUSE:
          isSelected = store.scope.selected.includes(houseId)
          payload = houseId
          break
        case ScopeTypeEnum.Enum.MODULE:
          isSelected = !undef(
            store.scope.selected.find(
              (x) => x.houseId === houseId && x.moduleIndex === moduleIndex
            )
          )
          payload = { houseId, moduleIndex } as ModuleScopeItem
          break
        case ScopeTypeEnum.Enum.ELEMENT:
          isSelected = !undef(
            store.scope.selected.find(
              (x) => x.houseId === houseId && x.elementName === elementName
            )
          )
          payload = { houseId, elementName } as ElementScopeItem
          break
        case ScopeTypeEnum.Enum.LEVEL:
          isSelected = !undef(
            store.scope.selected.find(
              (x) =>
                x.houseId === houseId &&
                x.levelModuleIndices.includes(moduleIndex)
            )
          )
          payload = { houseId, levelModuleIndices } as LevelScopeItem
          break
      }

      if (!isSelected) {
        if (shiftKey) store.scope.selected.push(payload)
        else store.scope.selected = [payload]
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
