import { flow } from "fp-ts/lib/function"
import { concatAll } from "fp-ts/lib/Monoid"
import { modifyAt } from "fp-ts/lib/ReadonlyArray"
import { Monoid, split, toUpperCase } from "fp-ts/lib/string"
import { map as mapO } from "fp-ts/lib/Option"
import { MonoidAll, MonoidAny } from "fp-ts/boolean"

export { mapO }

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
