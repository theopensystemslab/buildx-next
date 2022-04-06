import { Material } from "three"
import { proxyMap } from "valtio/utils"

// type MaterialKey = {
//   name?: string
//   visible?: boolean
//   illuminated?: boolean
//   clippingPlanes?: Plane[]
// }

type MaterialKey = {
  buildingId: string
  elementName: string
  levelIndex: number
}

type MaterialValue = {
  material: Material
  illuminated: boolean
  visible: boolean
  clipped: boolean // [boolean,boolean,boolean]?
}
const materials = proxyMap<MaterialKey, MaterialValue>([])

// const materials = new Map<MaterialKey, Material>([])

// export const useMaterialsMap = () => {
//   const { materials: sysMaterials } = useSystemsData()

//   pipe(
//     sysMaterials,
//     filterMapRA(
//       ({ threeMaterial, name }): Option<[MaterialKey, Material]> =>
//         threeMaterial
//           ? some([
//               { clippingPlanes: [], illuminated: false, name },
//               threeMaterial,
//             ])
//           : none
//     )
//   ).forEach(([k, v], i) => {
//     materials.set(ref(k), ref(v))
//     console.log(i, materials.get(k))
//   })
// }

export default materials
