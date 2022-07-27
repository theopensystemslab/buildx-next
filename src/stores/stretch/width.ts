import { useSystemData } from "@/contexts/SystemsData"
import {
  BareModule,
  filterCompatibleModules,
  LoadedModule,
  Module,
  StructuredDnaModule,
  topCandidateByHamming,
} from "@/data/module"
import { SectionType } from "@/data/sectionType"
import { NoVanillaModuleError } from "@/errors"
import {
  ColumnLayout,
  GridGroup,
  PositionedColumn,
  PositionedModule,
  PositionedRow,
} from "@/hooks/layouts"
import { useGetVanillaModule } from "@/hooks/modules"
import {
  filterMapA,
  mapA,
  mapO,
  mapRA,
  mapToOption,
  notNullish,
  NumOrd,
  reduceA,
  reduceRA,
  reduceToOption,
} from "@/utils"
import { isNonEmpty, sort } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { groupBy, head, NonEmptyArray } from "fp-ts/lib/NonEmptyArray"
import { isNone, none, Option, some } from "fp-ts/lib/Option"
import { contramap } from "fp-ts/lib/Ord"
import { last } from "fp-ts/lib/ReadonlyNonEmptyArray"
import produce from "immer"
import { useMemo, useState } from "react"
import { useBuildingModules } from "../houses"

const { max, abs } = Math

export const useStretchWidth = (id: string, columnLayout: ColumnLayout) => {
  const { sectionTypes, modules: systemModules } = useSystemData()

  const getVanillaModule = useGetVanillaModule()

  const module0 = columnLayout[0].gridGroups[0].modules[0].module

  const modulesBySectionType = pipe(
    systemModules,
    (ms) => {
      if (!isNonEmpty(ms)) throw new Error("Empty section types")
      return ms
    },
    groupBy((m: Module) => m.structuredDna.sectionType)
  )

  // key by code

  // store a "current"/"options" of codes
  // store a code:dna-change (validate in processing)

  const { current, options } = pipe(
    sectionTypes,
    reduceA(
      { current: null, options: [] },
      (
        {
          current,
          options,
        }: { current: SectionType | null; options: SectionType[] },
        st
      ) =>
        st.code === module0.structuredDna.sectionType
          ? {
              current: st,
              options,
            }
          : {
              current,
              options: [...options, st],
            }
    ),
    ({ current, options }) => ({
      current: pipe(current, notNullish("current sectionType nullish")),
      options,
    })
  )

  const dnaChangeOptions = pipe(
    options,
    filterMapA((st) =>
      pipe(
        columnLayout,
        mapToOption(
          ({ gridGroups, ...columnRest }): Option<PositionedColumn> =>
            pipe(
              gridGroups,
              mapToOption(
                ({ modules, ...gridGroupRest }): Option<GridGroup> => {
                  const length = modules.reduce(
                    (acc, v) => acc + v.module.length,
                    0
                  )

                  // you can probably get the vanilla module here?

                  const vanillaModule = getVanillaModule(modules[0].module, {
                    sectionType: st.code,
                  })

                  if (isNone(vanillaModule)) return none

                  // if no vanilla, shoot for none

                  // if vanilla, everything possible?

                  // try throw, catch vanillify?

                  const nextGridGroup: Option<PositionedRow> = pipe(
                    modules,
                    reduceToOption(
                      some({} as any),
                      (
                        _i,
                        acc: Option<PositionedRow>,
                        { module, z }: PositionedModule
                      ): Option<PositionedRow> => {
                        const target: StructuredDnaModule = {
                          structuredDna: {
                            ...module.structuredDna,
                            sectionType: st.code,
                          },
                        }
                        const compatModules = pipe(
                          systemModules,
                          filterCompatibleModules()(target)
                        )

                        if (compatModules.length === 0) return none

                        const nextModules: PositionedModule[] = []

                        // work here

                        // try to find a matching module

                        // if no, try vanillify

                        // if no, set some bool to filter map away
                        return pipe(
                          acc,
                          mapO(
                            (acc): PositionedRow => ({
                              ...gridGroupRest,
                              modules: nextModules,
                            })
                          )
                        )
                      }
                    )
                    // remember you go extra [] for padding
                  )

                  return nextGridGroup

                  // const foo = pipe(
                  //   nextGridGroup,
                  //   mapO((modules): PositionedColumn["gridGroups"][0] => ({
                  //     ...gridGroupRest,
                  //     modules,
                  //   }))
                  // )

                  // return foo

                  const nextLength = nextGridGroup.reduce(
                    (acc, v) => acc + v.module.length,
                    0
                  )

                  // if (nextLength !== length)
                  //   throw new Error("Length mismatch changing section type")

                  return {
                    ...gridGroupRest,
                    modules: nextGridGroup,
                  }
                }
              ),
              mapO((gridGroups) => ({
                ...columnRest,
                gridGroups,
              }))
            )
        )
      )
    )
    // filterMapA((st) => {
    //   // may also want to store END and Vanilla modules for each level

    //   // may want to for loop this so we can break

    //   // or try catch?

    //   // this try-catch stuff is nasty, just use optional properly?

    //   const nextLayout = pipe(
    //     columnLayout,
    //     mapA(({ gridGroups, ...columnRest }) => ({
    //       ...columnRest,
    //       gridGroups: pipe(
    //         gridGroups,
    //         mapRA(({ modules, ...gridGroupRest }) => {
    //           const length = modules.reduce(
    //             (acc, v) => acc + v.module.length,
    //             0
    //           )

    //           // you can probably get the vanilla module here?

    //           const vanillaModule = getVanillaModule(modules[0].module, {
    //             sectionType: st.code,
    //           })

    //           // if no vanilla, shoot for none

    //           // if vanilla, everything possible?

    //           // try throw, catch vanillify?

    //           const nextModules: PositionedModule[] = pipe(
    //             modules,
    //             reduceRA([], (acc: PositionedModule[], { module, z }) => {
    //               const target: StructuredDnaModule = {
    //                 structuredDna: {
    //                   ...module.structuredDna,
    //                   sectionType: st.code,
    //                 },
    //               }
    //               const compatModules = pipe(
    //                 systemModules,
    //                 filterCompatibleModules()(target)
    //               )

    //               if (compatModules.length === 0) throw null

    //               console.log(module.dna)

    //               const foo = undefined as any
    //               // work here

    //               // try to find a matching module

    //               // if no, try vanillify

    //               // if no, set some bool to filter map away
    //               return acc
    //             })
    //             // remember you go extra [] for padding
    //           )

    //           const nextLength = nextModules.reduce(
    //             (acc, v) => acc + v.module.length,
    //             0
    //           )

    //           // if (nextLength !== length)
    //           //   throw new Error("Length mismatch changing section type")

    //           return {
    //             ...gridGroupRest,
    //             modules: nextModules,
    //           }
    //         })
    //       ),
    //     }))
    //   )

    //   // const dna = produce(columnLayout, (draft) => {
    //   //   console.log(draft)
    //   //   for (let i = 0; i < draft.length; i++) {
    //   //     for (let j = 0; j < draft[i].gridGroups.length; j++) {
    //   //       for (let k = 0; j < draft[i].gridGroups[j].length; k++) {
    //   //         const m0 = draft[i].gridGroups[j].modules[k].module
    //   //         const target = {
    //   //           ...m0,
    //   //           structuredDna: { ...m0.structuredDna, sectionType: st.code },
    //   //         }
    //   //         const m1 = pipe(
    //   //           modulesBySectionType[st.code],
    //   //           filterCompatibleModules()(target),
    //   //           (ms) => topCandidateByHamming<BareModule>(undefined, target, ms)
    //   //         )

    //   //         // the grid groups must be maintained
    //   //         // try to find a module of same grid length
    //   //         // if no, vanilla-ify the module
    //   //       }
    //   //     }
    //   //   }
    //   // })

    //   // for each column
    //   // for each gridGroup
    //   // for each

    //   return none
    // })
  )

  const canStretchWidth = true // todo

  const sortedSTs: NonEmptyArray<SectionType> = pipe(
    sectionTypes,
    sort(
      pipe(
        NumOrd,
        contramap((st: SectionType) => st.width)
      )
    ),
    (sts) => {
      if (!isNonEmpty(sts)) throw new Error("Empty section types")
      return sts
    }
  )

  // let's say lines are like 3 8 14 20
  // x is 15
  // x is 4
  // x is

  const maxWidth = pipe(sortedSTs, last, (x) => x.width)

  const minWidth = pipe(sortedSTs, head, (x) => x.width)

  const [stIndex, setSTIndex] = useState(-1)

  const gateLineX = useMemo(() => {
    if (stIndex === -1) return current.width / 2
    return sortedSTs[stIndex].width / 2
  }, [stIndex])

  const sendWidthDrag = (x: number) => {
    const absX = abs(x)

    let distance = Infinity,
      index = -1

    for (let i = 0; i < sortedSTs.length; i++) {
      const st = sortedSTs[i]
      const d = abs(st.width / 2 - absX)
      if (d < distance) {
        distance = d
        index = i
      }
    }

    setSTIndex(index)
  }

  const sendWidthDrop = () => {
    // matrix the DNA, map swap each module for the appropriate section width
    // pipe(
    //   columnLayout,
    //   mapA(({ gridGroups, ...column }) => ({
    //     ...column,
    //     gridGroups: pipe(
    //       gridGroups,
    //       mapRA(({ modules, ...gridGroup }) => ({
    //         ...gridGroup,
    //         modules: pipe(
    //           modules,
    //           mapRA(({ module, z }) => ({
    //             z,
    //             module: topCandidateByHamming<StructuredDnaModule>(
    //               [
    //                 "internalLayoutType",
    //                 "stairsType",
    //                 "windowTypeEnd",
    //                 "windowTypeSide1",
    //                 "windowTypeSide2",
    //                 "windowTypeTop",
    //               ],
    //               module,
    //               candidateModules
    //             ),
    //           }))
    //         ),
    //       }))
    //     ),
    //   }))
    // )
    // need to vanilla-ify where necessary
    // minimum checks? has end modules for each level of new st?
    // has vanilla for each level of new st?
  }

  return {
    canStretchWidth,
    minWidth,
    maxWidth,
    gateLineX,
    sendWidthDrag,
    sendWidthDrop,
  }
}
