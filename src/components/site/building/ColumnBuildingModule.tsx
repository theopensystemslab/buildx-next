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
import { reduceWithIndexM, StrOrd } from "@/utils"
import { GroupProps, invalidate } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { useEffect, useMemo, useRef } from "react"
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

  const { position } = groupProps

  // so these positions are relative to the column
  const [groupPosX0, groupPosZ0] =
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

  const shifted = useRef<"DOWN" | "UP" | null>(null)

  useEffect(() => {
    return subscribe(swap, () => {
      if (!groupRef.current) return
      if (!isDragResponsive()) return

      const { dragModulePing: dragModule } = swap

      if (dragModule === null) return

      // const v = new Vector3()
      // const { z: z0 } = v.setFromMatrixPosition(groupRef.current.matrixWorld)

      const thisLow = columnZ + groupPosZ0,
        thisHigh = thisLow + module.length,
        current = dragModule.z0 + dragModule.length / 2 + dragModule.dpz,
        isHigherModule = thisLow > dragModule.z0,
        isLowerModule = !isHigherModule,
        dragThreshold = Math.min(dragModule.length, module.length)

      // console.log({
      //   gridUnits: module.structuredDna.gridUnits,
      //   isLowerModule,
      //   isHigherModule,
      // })

      const nullToDown =
        isHigherModule &&
        shifted.current !== "DOWN" &&
        current + dragThreshold > thisHigh

      const downToNull =
        isHigherModule &&
        shifted.current === "DOWN" &&
        current + dragThreshold <= thisHigh

      const nullToUp =
        isLowerModule &&
        shifted.current !== "UP" &&
        current - dragThreshold < thisLow

      const upToNull =
        isLowerModule &&
        shifted.current === "UP" &&
        current - dragThreshold >= thisLow

      switch (true) {
        // needs shifting down
        case nullToDown: {
          shifted.current = "DOWN"
          groupRef.current.position.z = groupPosZ0 - dragModule.length
          break
        }

        // down needs shifting back up
        case downToNull: {
          shifted.current = null
          groupRef.current.position.z = groupPosZ0
          break
        }

        case nullToUp:
          shifted.current = "UP"
          groupRef.current.position.z = groupPosZ0 + dragModule.length
          break

        case upToNull:
          shifted.current = null
          groupRef.current.position.z = groupPosZ0
          break

        case dragModule === null:
        default:
          break
      }
    })
  }, [])

  const pointerXZ0 = useRef([0, 0])

  const bind = useDrag(({ first, last }) => {
    if (!groupRef.current) return
    const [px, pz] = pointer.xz

    if (first) {
      setCameraEnabled(false)
      pointerXZ0.current = [px, pz]
    }

    const [, initZ] = pointerXZ0.current
    const [dpx, dpz] = rotateVector([0, pz - initZ])

    if (isSelected()) {
      groupRef.current.position.x = groupPosX0 + dpx
      groupRef.current.position.z = groupPosZ0 + dpz

      swap.dragModulePing = {
        dpz: dpz,
        z0: columnZ + groupPosZ0,
        length: module.length,
      }
    }

    if (last) {
      setCameraEnabled(true)

      if (isSelected()) {
        // handle drop...

        // has something changed or am I snapping back to 0 change?
        if (true) {
          groupRef.current.position.x = groupPosX0
          groupRef.current.position.z = groupPosZ0
        }

        swap.dragModulePing = null
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
