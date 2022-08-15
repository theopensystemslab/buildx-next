import { LoadedModule } from "@/data/module"
import { useRotateVector } from "@/hooks/geometry"
import { setCameraEnabled } from "@/stores/camera"
import siteContext, {
  SiteContextModeEnum,
  useSiteContext,
  useSiteContextMode,
} from "@/stores/context"
import { useModuleGeometries } from "@/stores/geometries"
import { outlineGroup } from "@/stores/highlights"
import menu from "@/stores/menu"
import pointer from "@/stores/pointer"
import scope from "@/stores/scope"
import swap from "@/stores/swap"
import { mapWithIndexM, reduceWithIndexM, StrOrd } from "@/utils"
import { GroupProps, invalidate } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import { and, not, or, Predicate } from "fp-ts/lib/Predicate"
import React, { useEffect, useMemo, useRef } from "react"
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

  const { position } = groupProps

  // so these positions are relative to the column
  const [positionX0, positionZ0] =
    position instanceof Vector3
      ? [position.x, position.z]
      : typeof position === "object"
      ? [position[0], position[1]]
      : [0, 0]

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

  const isSelected = (): boolean =>
    scope.selected?.buildingId === buildingId &&
    scope.selected?.columnIndex === columnIndex &&
    scope.selected?.levelIndex === levelIndex &&
    scope.selected?.groupIndex === groupIndex

  const isDragResponsive = (): boolean =>
    buildingId === siteContext.buildingId && // the right building
    levelIndex === siteContext.levelIndex && // the right level
    module.structuredDna.positionType !== "END" && // not an end
    !isSelected() // not selected

  const rotateVector = useRotateVector(buildingId)

  useEffect(() => {
    return subscribe(swap, () => {
      if (!groupRef.current) return
      if (!isDragResponsive()) return

      const { dragModule } = swap

      if (dragModule === null) return

      const v = new Vector3()
      const { z: z0 } = v.setFromMatrixPosition(groupRef.current.matrixWorld)

      const thisLow = z0,
        thisHigh = z0 + module.length,
        current = dragModule.z0 + dragModule.length / 2 + dragModule.dpz,
        isHigherModule = thisLow > dragModule.z0,
        isLowerModule = !isHigherModule

      // console.log({
      //   gridUnits: module.structuredDna.gridUnits,
      //   isLowerModule,
      //   isHigherModule,
      // })

      switch (true) {
        case dragModule === null:
        default:
          break
      }
    })
  }, [])

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
    const [dpx, dpz] = rotateVector([0, pz - initZ])

    if (isSelected()) {
      groupRef.current.position.x = dragModuleX0 + dpx
      groupRef.current.position.z = dragModuleZ0 + dpz

      swap.dragModule = {
        dpz: dpz,
        z0: dragModuleZ0,
        length: module.length,
      }
    }

    if (last) {
      setCameraEnabled(true)

      if (isSelected()) {
        // handle drop...

        // has something changed or am I snapping back to 0 change?
        if (true) {
          groupRef.current.position.x = dragModuleX0
          groupRef.current.position.z = dragModuleZ0
        }

        swap.dragModule = null
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
