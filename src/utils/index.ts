import Fuse from "fuse.js"
import { MutableRefObject } from "react"

export const safeLocalStorageGet = (key: string): any => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null")
    return saved
  } catch (err) {
    return null
  }
}

export const fuzzyMatch =
  <T extends unknown>(list: ReadonlyArray<T>, options?: Fuse.IFuseOptions<T>) =>
  (queriedToken: string) => {
    const fuse = new Fuse(list, options)
    return fuse.search(queriedToken)[0]?.item
  }

export const guardRef = <T extends unknown>(
  r: MutableRefObject<T | undefined>
): r is MutableRefObject<T> => Boolean(r.current)

export const guardNullable = <T extends unknown>(t: T | null): t is T =>
  t !== null

export const snapToGrid = (x: number) => {
  return Math.round(x)
}

export * from "./three"
export * from "./fp"
