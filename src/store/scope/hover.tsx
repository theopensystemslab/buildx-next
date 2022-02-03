import { guardNullable } from "@/utils"
import { nearestMap } from "@/utils/three"
import { ThreeEvent, useThree } from "@react-three/fiber"
import { Handler } from "@use-gesture/core/types"
import { values } from "fp-ts-std/ReadonlyRecord"
import { pipe } from "fp-ts/lib/function"
import { getOrElse } from "fp-ts/lib/Option"
import { filter, flatten, map, reduce } from "fp-ts/lib/ReadonlyArray"
import { collect, filterWithIndex, lookup } from "fp-ts/lib/ReadonlyRecord"
import { Ord as OrdStr } from "fp-ts/lib/string"
import { MutableRefObject, useMemo } from "react"
import { Object3D } from "three"
import {
  ElementScopeItem,
  elementUniq,
  houseUniq,
  LevelScopeItem,
  levelUniq,
  ModuleScopeItem,
  moduleUniq,
  ScopeTypeEnum,
} from "."
import { store, useLevelModuleIndices, useScopeType, useStoreSnap } from ".."
import { useSelected } from "./select"

export const useElementHover = (
  meshRef: MutableRefObject<Object3D | undefined>,
  elementName: string,
  moduleIndex: number,
  houseId: string
): Handler<"hover", ThreeEvent<PointerEvent>> => {
  const scopeType = useScopeType()
  const levelModuleIndices = useLevelModuleIndices(houseId, moduleIndex)

  switch (scopeType) {
    case ScopeTypeEnum.enum.HOUSE:
      return ({ event }) => {
        nearestMap(event, meshRef, () => {
          store.scope.hovered = houseId
        })
      }
    case ScopeTypeEnum.enum.MODULE:
      return ({ event }) => {
        nearestMap(event, meshRef, () => {
          store.scope.hovered = { moduleIndex, houseId }
        })
      }

    case ScopeTypeEnum.enum.ELEMENT:
      return ({ event }) => {
        nearestMap(event, meshRef, () => {
          store.scope.hovered = { elementName, houseId }
        })
      }

    case ScopeTypeEnum.enum.LEVEL:
      return ({ event }) => {
        nearestMap(event, meshRef, () => {
          store.scope.hovered = { houseId, levelModuleIndices }
        })
      }
  }
}

export const useHovered = () => {
  const snap = useStoreSnap()
  return snap.scope.hovered
}

export const useOutlined = () => {
  const scopeType = useScopeType()
  const selected = useSelected()
  const hovered = useHovered()
  const invalidate = useThree((three) => three.invalidate)

  return useMemo(() => {
    invalidate()
    switch (scopeType) {
      case ScopeTypeEnum.enum.ELEMENT: {
        return pipe(
          [
            ...(selected as ElementScopeItem[]),
            hovered as ElementScopeItem | null,
          ],
          filter(guardNullable),
          elementUniq,
          map(({ elementName, houseId }) =>
            pipe(
              store.scratch.meshRefs[houseId],
              collect(OrdStr)((_, v) => v),
              reduce([] as Array<MutableRefObject<Object3D>>, (b, a) => [
                ...b,
                ...pipe(
                  a,
                  lookup(elementName),
                  getOrElse(
                    () => [] as Readonly<Array<MutableRefObject<Object3D>>>
                  )
                ),
              ])
            )
          ),
          flatten
        )
      }
      case ScopeTypeEnum.enum.MODULE:
        return pipe(
          [
            ...(selected as ModuleScopeItem[]),
            hovered as ModuleScopeItem | null,
          ],
          filter(guardNullable),
          moduleUniq,
          map(({ moduleIndex, houseId }) =>
            pipe(
              store.scratch.meshRefs[houseId][moduleIndex],
              collect(OrdStr)((_, v) => v),
              flatten
            )
          ),
          flatten
        )
      case ScopeTypeEnum.enum.HOUSE:
        return pipe(
          [...(selected as string[]), hovered as string],
          filter(guardNullable),
          houseUniq,
          map((houseId) =>
            pipe(
              store.scratch.meshRefs[houseId],
              collect(OrdStr)((_, v) => v),
              map(values),
              flatten,
              flatten
            )
          ),
          flatten
        )
      case ScopeTypeEnum.enum.LEVEL:
        return pipe(
          [...(selected as LevelScopeItem[]), hovered as LevelScopeItem | null],
          filter(guardNullable),
          levelUniq,
          map(({ levelModuleIndices, houseId }) =>
            pipe(
              store.scratch.meshRefs[houseId],
              filterWithIndex((i) => levelModuleIndices.includes(Number(i))),
              collect(OrdStr)((_, v) => v),
              map(values),
              flatten,
              flatten
            )
          ),
          flatten
        )
    }
  }, [hovered, selected])
}

export const useHoverZero = () => {
  return () => {
    store.scope.hovered = null
  }
}
