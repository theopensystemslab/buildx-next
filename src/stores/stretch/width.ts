import { useSystemData } from "@/contexts/SystemsData"
import {
  filterCompatibleModules,
  Module,
  StructuredDnaModule,
  topCandidateByHamming,
} from "@/data/module"
import { SectionType } from "@/data/sectionType"
import { ColumnLayout } from "@/hooks/layouts"
import {
  mapA,
  mapO,
  mapRA,
  NumOrd,
  pipeLogWith,
  reduceA,
  reduceWithIndexA,
} from "@/utils"
import { findFirst, isNonEmpty, sort } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { head, NonEmptyArray } from "fp-ts/lib/NonEmptyArray"
import { contramap } from "fp-ts/lib/Ord"
import { last } from "fp-ts/lib/ReadonlyNonEmptyArray"
import { useMemo, useState } from "react"
import { useBuildingModules } from "../houses"

const { max, abs } = Math

export const useStretchWidth = (id: string, columnLayout: ColumnLayout) => {
  const { sectionTypes, modules } = useSystemData()

  const buildingModules = useBuildingModules(id)

  const canStretchWidth = true // todo

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
        st.code === buildingModules[0].structuredDna.sectionType
          ? {
              current: st,
              options,
            }
          : {
              current,
              options: [...options, st],
            }
    ),
    ({ current, options }) => {
      if (current === null) throw new Error("current sectionType null")
      return { current, options }
    }
  )

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

  const candidateModules: Module[] = useMemo(() => {
    // if (stIndex === -1) return []
    // const st = sortedSTs[stIndex]
    // return pipe(modules, filterCompatibleModules(["gridType", "gridUnits"]))
    return []
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
    pipe(
      columnLayout,
      mapA(({ gridGroups, ...column }) => ({
        ...column,
        gridGroups: pipe(
          gridGroups,
          mapRA(({ modules, ...gridGroup }) => ({
            ...gridGroup,
            modules: pipe(
              modules,
              mapRA(({ module, z }) => ({
                z,
                module: topCandidateByHamming<StructuredDnaModule>(
                  [
                    "internalLayoutType",
                    "stairsType",
                    "windowTypeEnd",
                    "windowTypeSide1",
                    "windowTypeSide2",
                    "windowTypeTop",
                  ],
                  module,
                  candidateModules
                ),
              }))
            ),
          }))
        ),
      }))
    )

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
