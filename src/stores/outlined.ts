import { proxy, ref, useSnapshot } from "valtio"

const outlined = proxy(ref([]))

export const useOutlined = () => useSnapshot(outlined)

export default outlined
