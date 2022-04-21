import { BareModule } from "@/data/module"
import houses from "@/stores/houses"
import {
  flattenA,
  mapA,
  mapO,
  mapRA,
  pipeLog,
  reduceA,
  transposeA,
} from "@/utils"
import { lookup, replicate } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import produce from "immer"
import {
  rowMatrixToDna,
  useColumnLayout,
  useColumnMatrix,
  useRowMatrix,
} from "./layouts"
import { useGetVanillaModule } from "./modules"

export const useLevelInteractions = (
  buildingId: string,
  levelIndex: number,
  onComplete?: () => void
) => {
  const columnMatrix = useColumnMatrix<BareModule>(buildingId)

  const getVanillaModule = useGetVanillaModule()

  const thisLevel = pipe(
    columnMatrix,
    transposeA,
    lookup(levelIndex),
    mapO((levelGroups) => ({
      levelGroups,
      levelType: levelGroups[0][0].structuredDna.levelType,
    }))
    // pipeLog,
    // mapO((groups) =>
    //   pipe(
    //     groups,
    //     mapA((group) =>
    //       pipe(
    //         group,
    //         reduceA([], (acc: BareModule[], m) => {
    //           return [
    //             ...acc,
    //             ...replicate(m.structuredDna.gridUnits, getVanillaModule(m)),
    //           ]
    //         })
    //       )
    //     )
    //   )
    // ),
  )

  // level type is like...

  // source level must be G, M or T

  // add floor above must always be on G or M

  // if G add M's

  // if M keep adding M's

  const addFloorAbove = () => {
    // houses[buildingId].dna = pipe(
    //   rowMatrix,
    //   pipeLog,
    //   produce((draft) => {
    //     console.log(vanillaLevel)
    //     return [
    //       ...draft.slice(0, levelIndex + 1),
    //       vanillaLevel,
    //       ...draft.slice(levelIndex + 1),
    //     ]
    //   }),
    //   pipeLog,
    //   rowMatrixToDna,
    //   pipeLog
    // )
    // onComplete?.()
  }
  const removeFloor = () => {}

  const canAddFloorAbove = true
  const canRemoveFloor = true

  return {
    addFloorAbove,
    removeFloor,
    canAddFloorAbove,
    canRemoveFloor,
  }
}
