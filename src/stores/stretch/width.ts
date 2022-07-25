import { useSystemData } from "@/contexts/SystemsData"
import { SectionType } from "@/data/sectionType"
import {
  mapA,
  mapO,
  NumEq,
  NumOrd,
  pipeLog,
  pipeLogWith,
  reduceA,
} from "@/utils"
import { findFirst, Foldable, sort } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { concatAll, endo, filterFirst } from "fp-ts/lib/Magma"
import { fromFoldable } from "fp-ts/lib/Map"
import { contramap } from "fp-ts/lib/Ord"
import { first } from "fp-ts/lib/Semigroup"
import { useState } from "react"
import { useBuildingModules } from "../houses"

const { max } = Math

export const useStretchWidth = (id: string) => {
  const { sectionTypes } = useSystemData()

  const buildingModules = useBuildingModules(id)

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

  const sortedSTs = pipe(
    sectionTypes,
    sort(
      pipe(
        NumOrd,
        contramap((st: SectionType) => st.width)
      )
    )
  )

  // filter where we have the modules

  // draw thin, line-like debug planes at each type?

  // gates are always +/- .5width

  const maxWidth = pipe(
    sectionTypes,
    reduceA(0, (acc, v) => max(acc, v.width))
  )

  // sometimes working directly in X (more or less absolute)
  // sometimes working relative to current section type

  const canStretchWidth = true // todo

  // const nearestST = (x: number) =>
  //   sectionTypes.reduce((acc, st) =>
  //     x > st.width / 2 ? acc : [width, code]
  //   , sectionTypes[0])

  // const gateLineX = pipe(
  //   sectionTypes,
  //   filterMapA((st) =>
  //     st.code === current.code
  //       ? none
  //       : some([
  //           st.width / 2,
  //           //  -st.width / 2
  //         ])
  //   ),
  //   flattenA
  // )

  // const gateLineX = useState(current.)

  // could map section types with gate lines
  // then need the current X
  // hold a section type / gate line in a useState
  // also with the X value? but it's + and -...
  // it'll be a mirror though

  // just focus on RHS first

  const [gateLineX, setGateLineX] = useState(current.width / 2)

  const sendWidthDrag = (x: number) => {
    const found = pipe(
      sortedSTs,
      findFirst((st) => st.width > x),
      mapO(pipeLogWith((x) => x.code))
    )
  }

  return {
    sectionTypes,
    canStretchWidth,
    gateLineX,
    sendWidthDrag,
    maxWidth,
  }
}
