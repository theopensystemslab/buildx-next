import { LoadedModule } from "@/data/module"
import { useRotateVector } from "@/hooks/geometry"
import { setCameraEnabled } from "@/stores/camera"
import siteContext, {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import events from "@/stores/events"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import menu from "@/stores/menu"
import pointer from "@/stores/pointer"
import scope from "@/stores/scope"
import { mapWithIndexM, StrOrd } from "@/utils"
import { GroupProps } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Group, Plane, Vector3 } from "three"
import { subscribe } from "valtio"
import { subscribeKey } from "valtio/utils"
import ColumnBuildingElement from "./ColumnBuildingElement"

type Props = GroupProps & {
  module: LoadedModule
  columnIndex: number
  levelIndex: number
  groupIndex: number
  buildingId: string
  levelY: number
  verticalCutPlanes: Plane[]
  columnZ: number
}

const ColumnBuildingModule = (props: Props) => {
  const {
    buildingId,
    columnIndex,
    levelIndex,
    groupIndex,
    module,
    levelY,
    verticalCutPlanes,
    columnZ,
    ...groupProps
  } = props

  const groupRef = useRef<Group>()

  const moduleGeometries = useModuleGeometries(
    module.systemId,
    module.dna,
    module.gltf
  )

  const context = useSiteContext()

  const levelCutPlane: Plane = useMemo(
    () => new Plane(new Vector3(0, -1, 0), levelY + module.height / 2),
    []
  )

  const children = pipe(
    moduleGeometries,
    mapWithIndexM((elementName, geometry) => (
      <ColumnBuildingElement
        key={elementName}
        {...{
          elementName,
          geometry,
          systemId: module.systemId,
          buildingId,
          columnIndex,
          levelIndex,
          groupIndex,
          clippingPlanes: [
            verticalCutPlanes,
            context.levelIndex === levelIndex ? [levelCutPlane] : [],
          ].flat(),
        }}
      />
    )),
    toArray(StrOrd)
  )

  const contextMode = useSiteContextMode()

  useEffect(() => {
    if (contextMode === SiteContextModeEnum.Enum.LEVEL) {
      return subscribeKey(scope, "hovered", () => {
        if (
          !menu.open &&
          scope.hovered?.columnIndex === columnIndex &&
          context.levelIndex === levelIndex
        ) {
          outlineGroup(groupRef)
        } else {
          outlineGroup(groupRef, { remove: true })
        }
      })
    }
  }, [contextMode])

  const rotateVector = useRotateVector(buildingId)
  const initXZ = useRef([0, 0])

  const dragModuleShifted = useRef(false)

  useEffect(
    () =>
      subscribeKey(events, "dragModuleZ", () => {
        if (
          events.dragModuleZ === null ||
          scope.selected === null ||
          scope.selected.buildingId !== buildingId ||
          scope.selected.levelIndex !== levelIndex ||
          scope.selected.columnIndex === columnIndex ||
          !groupRef.current
        )
          return

        const [dx, dz] = rotateVector([0, module.width])

        // it depends on whether we're up or down of the module which shift we wanna do

        if (events.dragModuleZ > columnZ && !dragModuleShifted.current) {
          groupRef.current.position.x += dx
          groupRef.current.position.z += dz
          dragModuleShifted.current = true
        } else if (events.dragModuleZ < columnZ && dragModuleShifted.current) {
          groupRef.current.position.x -= dx
          groupRef.current.position.z -= dz
          dragModuleShifted.current = false
        }
      }),
    []
  )

  const bind = useDrag(({ first, last }) => {
    if (siteContext.levelIndex === null || !groupRef.current) return

    const [px, pz] = rotateVector(pointer.xz)

    if (first) {
      setCameraEnabled(false)
      scope.locked = true
      initXZ.current = rotateVector([px, pz])
    }

    const [x0, z0] = initXZ.current

    const dz = pz - z0

    groupRef.current.position.x = px - x0
    groupRef.current.position.z = pz - z0

    events.dragModuleZ = columnZ + dz

    if (last) {
      setCameraEnabled(true)
      scope.locked = false
      groupRef.current.position.x = 0
      groupRef.current.position.z = 0
    }
  })

  return (
    <group
      ref={groupRef as any}
      {...(bind() as any)}
      // onDrag: ({ first, last }) => {
      //   if (first) {
      //     setCameraEnabled(false)
      //   } else if (last) {
      //     setCameraEnabled(true)
      //   }
      // },
      {...groupProps}
    >
      {children}
    </group>
  )
}

export default ColumnBuildingModule
