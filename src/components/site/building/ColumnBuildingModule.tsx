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
import { mapA, mapWithIndexM, reduceWithIndexM, StrOrd } from "@/utils"
import { GroupProps, invalidate } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import { toArray } from "fp-ts/lib/Map"
import { Ord, trivial } from "fp-ts/lib/Ord"
import { useEffect, useMemo, useRef } from "react"
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

  const rotateVector = useRotateVector(buildingId)
  const initXZ = useRef([0, 0])

  const dragModuleShifted = useRef<"UP" | "DOWN" | null>(null)

  useEffect(
    () =>
      subscribeKey(events, "dragModule", () => {
        if (
          scope.selected === null ||
          scope.selected.buildingId !== buildingId ||
          scope.selected.levelIndex !== levelIndex ||
          module.structuredDna.positionType === "END" ||
          !groupRef.current
        )
          return

        if (events.dragModule === null) {
          dragModuleShifted.current = null
          groupRef.current.position.x = 0
          groupRef.current.position.z = 0
          return
        }

        const { z0, z, length } = events.dragModule

        const [dx, dz] = rotateVector([0, length])

        // const lowZ = columnZ - module.length / 2
        // const highZ = columnZ + module.length / 2

        switch (true) {
          case dragModuleShifted.current !== "DOWN" &&
            z0 < columnZ &&
            z > columnZ:
            dragModuleShifted.current = "DOWN"
            groupRef.current.position.x = -dx
            groupRef.current.position.z = -dz
            break

          case dragModuleShifted.current !== "UP" &&
            z0 > columnZ &&
            z < columnZ:
            dragModuleShifted.current = "UP"
            groupRef.current.position.x = dx
            groupRef.current.position.z = dz
            break

          case dragModuleShifted.current !== null &&
            ((z0 < columnZ && z < columnZ) || (z0 > columnZ && z > columnZ)):
            dragModuleShifted.current = null
            groupRef.current.position.x = 0
            groupRef.current.position.z = 0
            break
        }

        invalidate()
      }),
    []
  )

  const bind = useDrag(({ first, last }) => {
    if (
      siteContext.levelIndex === null ||
      !groupRef.current ||
      module.structuredDna.positionType === "END"
    )
      return

    const [px, pz] = pointer.xz

    if (first) {
      setCameraEnabled(false)
      scope.locked = true
      initXZ.current = [px, pz]
    }

    const [x0, z0] = initXZ.current

    const [dx, dz] = rotateVector([0, pz - z0])

    if (levelIndex === siteContext.levelIndex) {
      groupRef.current.position.x = dx
      groupRef.current.position.z = dz
      events.dragModule = {
        z: columnZ + dz,
        z0: columnZ,
        length: module.length,
      }
    }

    if (last) {
      setCameraEnabled(true)
      scope.locked = false
      if (levelIndex === siteContext.levelIndex) {
        groupRef.current.position.x = 0
        groupRef.current.position.z = 0
        events.dragModule = null
      }
    }

    invalidate()
  })

  return (
    <group ref={groupRef as any} {...(bind() as any)} {...groupProps}>
      {children}
    </group>
  )
}

export default ColumnBuildingModule
