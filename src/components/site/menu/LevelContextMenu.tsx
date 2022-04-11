import { Radio } from "@/components/ui"
import ContextMenu, { ContextMenuProps } from "@/components/ui/ContextMenu"
import ContextMenuNested from "@/components/ui/ContextMenuNested"
import { columnLayoutToDNA, useColumnLayout } from "@/hooks/layouts"
import { useLayoutOptions } from "@/hooks/modules"
import houses from "@/stores/houses"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { mapA } from "@/utils"
import { pipe } from "fp-ts/lib/function"
import produce from "immer"
import React from "react"
import { useSnapshot } from "valtio"

type Props = ContextMenuProps & {
  buildingId: string
  levelIndex: number
}

const LevelContextMenu = (props: Props) => {
  if (scopes.primary.type !== ScopeTypeEnum.Enum.MODULE)
    throw new Error("LevelContextMenu scope invalid")

  const { buildingId } = props

  const scope = useSnapshot(scopes.primary)

  const key = scope.selected[0]

  const columnLayout = useColumnLayout(buildingId)

  const module =
    columnLayout[key.columnIndex].gridGroups[key.levelIndex].modules[
      key.groupIndex
    ].module

  const layoutOpts: { label: string; value: string }[] = pipe(
    useLayoutOptions(module),
    mapA(({ dna }) => ({ label: dna, value: dna }))
  )

  const changeLayout = (dna: string) => {
    houses[buildingId].dna = pipe(
      columnLayout,
      produce((draft) => {
        draft[key.columnIndex].gridGroups[key.levelIndex].modules[
          key.groupIndex
        ].module.dna = dna
      }),
      columnLayoutToDNA
    ) as string[]
    props.onClose?.()
  }

  // const stairsOpts = useStairsOptions(module)

  const changeStairs = () => {
    // prep stair changes to record of keys to dna values
    // so integrate the thing into the opts, more natural
    // also could then preview on hover!
  }

  const canChangeStairs = true
  const canChangeLayout = true

  return (
    <ContextMenu {...props}>
      {canChangeLayout && (
        <ContextMenuNested label="Change layout">
          <Radio
            options={layoutOpts}
            selected={module.dna}
            onChange={changeLayout}
          />
        </ContextMenuNested>
      )}
      {canChangeStairs && (
        <ContextMenuNested label="Change stairs">
          <Radio
            options={layoutOpts}
            selected={module.dna}
            onChange={changeStairs}
          />
        </ContextMenuNested>
      )}
    </ContextMenu>
  )
}

export default LevelContextMenu
