import { proxy, useSnapshot } from "valtio"
import scope, { Scope } from "./scope"

type ContextProxy = {
  scope: Scope
  menu: [number, number] | null
}

const context = proxy<ContextProxy>({
  scope,
  menu: null,
})

export const useContext = () => useSnapshot(context)

export default context
