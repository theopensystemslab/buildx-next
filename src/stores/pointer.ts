import { proxy } from "valtio"

const pointer = proxy([0, 0])

export const setPointer = ([x, y]: [number, number]) => {
  pointer[0] = x
  pointer[1] = y
}

export default pointer
