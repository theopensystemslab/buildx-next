import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from "three"
import { proxy } from "valtio"

export type MaterialValue = {
  threeMaterial: MeshStandardMaterial | MeshPhysicalMaterial
  colors: {
    default: Color
    illuminated: Color
  }
}

type MaterialsCache = {
  [buildingId: string]: {
    [elementName: string]: {
      [levelIndex: number]: MaterialValue
    }
  }
}
const materials = proxy<MaterialsCache>({})

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
