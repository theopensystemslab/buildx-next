import { LoadedModule } from "@/data/module"
import { useRotateVector } from "@/hooks/geometry"
import { setCameraEnabled } from "@/stores/camera"
import {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import menu from "@/stores/menu"
import pointer from "@/stores/pointer"
import scope from "@/stores/scope"
import { mapWithIndexM, reduceWithIndexM, StrOrd } from "@/utils"
import { GroupProps, invalidate } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import { and, not, or, Predicate } from "fp-ts/lib/Predicate"
import React, { useEffect, useMemo, useRef } from "react"
import { Group, Plane, Vector3 } from "three"
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
    ...groupProps
  } = props

  const groupRef = useRef<Group>(null)

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
    reduceWithIndexM(StrOrd)(
      [],
      (elementName, acc: JSX.Element[], geometry) => [
        ...acc,
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
        />,
      ]
    )
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

  const isSelected: Predicate<void> = pipe(
    () => scope.selected?.buildingId === buildingId,
    and(() => scope.selected?.columnIndex === columnIndex),
    and(() => scope.selected?.levelIndex === levelIndex),
    and(() => scope.selected?.groupIndex === groupIndex)
  )

  const isDragResponsive: Predicate<void> = pipe(
    () => scope.selected === null,
    or(() => scope.selected?.buildingId !== buildingId),
    or(() => scope.selected?.levelIndex === levelIndex),
    or(isSelected),
    or(() => module.structuredDna.positionType === "END"),
    not
  )

  const rotateVector = useRotateVector(buildingId)
  const pointerXZ0 = useRef([0, 0])
  const dragModuleXZ0 = useRef([0, 0])

  const bind = useDrag(({ first, last }) => {
    if (!groupRef.current) return
    const [px, pz] = pointer.xz

    if (first) {
      setCameraEnabled(false)
      pointerXZ0.current = [px, pz]
      dragModuleXZ0.current = [
        groupRef.current.position.x ?? 0,
        groupRef.current.position.z ?? 0,
      ]
    }

    const [, initZ] = pointerXZ0.current
    const [dragModuleX0, dragModuleZ0] = dragModuleXZ0.current
    const [dx, dz] = rotateVector([0, pz - initZ])

    if (isSelected()) {
      groupRef.current.position.x = dragModuleX0 + dx
      groupRef.current.position.z = dragModuleZ0 + dz
    }

    if (last) {
      setCameraEnabled(true)

      // handle drop...

      // has something changed or am I snapping back to 0 change?
      if (true) {
        groupRef.current.position.x = dragModuleX0
        groupRef.current.position.z = dragModuleZ0
      }
    }

    invalidate()
  })

  return (
    <group ref={groupRef} {...groupProps} {...(bind() as any)}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
