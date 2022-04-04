import { EffectsLayer } from "@/CONSTANTS"
import { useOutlined } from "@/stores/highlights"
import scopes, { ScopeTypeEnum } from "@/stores/scope"
import { useThree } from "@react-three/fiber"
import { Outline as Outline_ } from "@react-three/postprocessing"
import React, { useEffect } from "react"
import { useSnapshot } from "valtio"

const Outline = () => {
  const size = useThree((three) => three.size)
  const { type: scopeType } = useSnapshot(scopes.primary)
  const outlined = useOutlined()
  return (
    <Outline_
      blur
      selection={outlined}
      // selectionLayer={EffectsLayer.outline}
      visibleEdgeColor={0xffffff}
      hiddenEdgeColor={0xffffff}
      xRay={scopeType !== ScopeTypeEnum.Enum.HOUSE}
      edgeStrength={32}
      width={size.width / 2}
      height={size.height / 2}
    />
  )
}

export default Outline
