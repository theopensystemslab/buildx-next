import { pipe } from "fp-ts/lib/function"
import { range } from "fp-ts/lib/NonEmptyArray"
import { isNone, none, Option, some } from "fp-ts/lib/Option"
import { mapO, reduceA, reduceToOption } from ".."

const things = range(0, 10)

const myReduceWithIndex: <A, B>(
  b: Option<B>,
  f: (i: number, b: Option<B>, a: A) => Option<B>
) => (fa: ReadonlyArray<A>) => Option<B> = (b, f) => (fa) => {
  const len = fa.length
  let out = b
  for (let i = 0; i < len; i++) {
    out = f(i, out, fa[i])
    if (isNone(out)) break
  }
  return out
}

describe("breakout", () => {
  test("basic", () => {
    let j = 0
    pipe(
      things,
      myReduceWithIndex(some(0), (i, acc, v) => {
        j = i
        if (v === 5) return none
        return pipe(
          acc,
          mapO((y) => y + v)
        )
      })
    )
    expect(j).toEqual(5)
  })
})

export {}
