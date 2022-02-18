import { flow } from "fp-ts/lib/function"
import { concatAll } from "fp-ts/lib/Monoid"
import { map as mapO } from "fp-ts/lib/Option"
import { modifyAt } from "fp-ts/lib/ReadonlyArray"
import { Monoid, split, toUpperCase } from "fp-ts/lib/string"

export { mapO }

export {
  map as mapRR,
  filter as filterRR,
  reduce as reduceRR,
} from "fp-ts/lib/ReadonlyRecord"
export {
  map as mapR,
  filter as filterR,
  reduce as reduceR,
} from "fp-ts/lib/Record"
export {
  map as mapRA,
  filter as filterRA,
  reduce as reduceRA,
} from "fp-ts/lib/ReadonlyArray"
export {
  map as mapA,
  filter as filterA,
  reduce as reduceA,
} from "fp-ts/lib/Array"

export { map as mapT } from "fp-ts/lib/Task"

export const pipeLog = <T extends unknown>(x: T): T => (console.log(x), x)

export const upperFirst = flow(
  split(""),
  modifyAt(0, toUpperCase),
  mapO(concatAll(Monoid))
)

export const any = (...args: boolean[]) =>
  args.reduce((acc, v) => acc || v, false)
export const all = (...args: boolean[]) =>
  args.reduce((acc, v) => acc && v, true)
// export const all = concatAll(MonoidAll)
