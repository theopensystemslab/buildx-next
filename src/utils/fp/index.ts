export { map as mapO } from "fp-ts/lib/Option"

export const pipeLog = <T extends unknown>(x: T): T => (console.log(x), x)
