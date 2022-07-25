import { useSystemData } from "@/contexts/SystemsData"
import { SectionType } from "@/data/sectionType"
import { clamp, filterMapA, flattenA, mapA, reduceA } from "@/utils"
import { ThreeEvent } from "@react-three/fiber"
import { Handler } from "@use-gesture/react"
import { Foldable } from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/function"
import { none, some } from "fp-ts/lib/Option"
import { fromFoldable } from "fp-ts/lib/Record"
import { first } from "fp-ts/lib/Semigroup"
import { useState } from "react"
import houses, { useBuildingModules } from "../houses"

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

  // filter where we have the modules

  // draw thin, line-like debug planes at each type?

  // gates are always +/- .5width

  const maxWidth = pipe(
    sectionTypes,
    reduceA(0, (acc, v) => max(acc, v.width))
  )

  // sometimes working directly in X (more or less absolute)
  // sometimes working relative to current section type

  const leftClamp = clamp(-maxWidth, 0)
  const rightClamp = clamp(0, maxWidth / 2)

  const canStretchWidth = true // todo

  const delimiters = pipe(
    sectionTypes,
    mapA((st): [number, string] => [st.width, st.code])
  )

  const nearestST = (x: number) =>
    delimiters.reduce((acc, [width, code]) =>
      x > width / 2 ? acc : [width, code]
    )

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
    console.log(nearestST(x))
  }

  return {
    sectionTypes,
    canStretchWidth,
    gateLineX,
    sendWidthDrag,
  }
}
