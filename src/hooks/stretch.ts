import { pipe } from "fp-ts/lib/function"
import { partition } from "fp-ts/lib/ReadonlyArray"
import { useColumnLayout } from "./layouts"
import { useGetVanillaModule } from "./modules"

export const useStretch = (buildingId: string) => {
  const getVanillaModule = useGetVanillaModule()
  const columnLayout = useColumnLayout(buildingId)

  const { startColumn, endColumn, midColumns } = pipe(
    columnLayout,
    partition(
      ({ columnIndex }) =>
        columnIndex === 0 || columnIndex === columnLayout.length - 1
    ),
    ({ left: midColumns, right: [startColumn, endColumn] }) => ({
      startColumn,
      endColumn,
      midColumns,
    })
  )

  // maybe return hiddenColumnIndices from hook
  // maybe clamps too?

  // maybe do need a z proxy...

  // use vanillaPositionedRows and instancing :)

  // "n" is like how many instances...

  // { [columnIndex]: [zDestroyAtFrom, zDestroyAtTo] } ?

  // or give each column a [z0,z1] but maybe just use the middle?

  return { startColumn, endColumn, midColumns, columnLayout }
}
