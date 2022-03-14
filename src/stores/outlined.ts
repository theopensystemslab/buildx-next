import { MutableRefObject } from "react"
import { Object3D } from "three"
import { proxy, ref, useSnapshot } from "valtio"

const outlined = proxy<Array<MutableRefObject<Object3D | undefined>>>(ref([]))

export const useOutlined = () => useSnapshot(outlined)

export default outlined
