import { House } from "@/data/house"
import { useSystemSettings } from "@/data/settings"
import defaultMaterial from "@/materials/defaultMaterial"
import { setCameraEnabled } from "@/stores/camera"
import context from "@/stores/context"
import { useStretchedColumns } from "@/stores/stretch"
import { clamp, mapRA } from "@/utils"
import { Instance, Instances } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useDrag } from "@use-gesture/react"
import { pipe } from "fp-ts/lib/function"
import React, { Fragment, useMemo, useRef } from "react"
import { Color, DoubleSide, Mesh } from "three"

type Props = {
  house: House
  back?: boolean
}

const StretchHandle = (props: Props) => {
  const { house, back = false } = props
  const ref = useRef<Mesh>()

  // should you get rid of n?
  const { sendZ, sendLast, vanillaPositionedRows, n, z0 } = useStretchedColumns(
    house.id,
    back
  )

  const offset = 1

  const {
    length: { max },
  } = useSystemSettings(house.systemId)

  const stretchMaterial = useMemo(() => {
    const material = defaultMaterial.clone()
    material.color = new Color("white")
    return material
  }, [])

  const invalidate = useThree((three) => three.invalidate)

  const h0 = useMemo(() => (back ? z0 + offset : z0 - offset), [z0])

  const bind = useDrag(({ first, last }) => {
    if (!ref.current) return
    const pz = context.pointer[1] - house.position[1]
    if (first) {
      setCameraEnabled(false)
      context.outlined = []
    }

    // if z is + or - makes the difference
    // min is in metres
    // need to reduce every grid-group so far
    // if you just hide the columns (material)
    // then you don't need to store them (they're already there)

    const z = back ? clamp(h0, max)(pz) : clamp(-max, h0)(pz)
    sendZ(z)
    ref.current.position.z = z

    if (last) {
      setCameraEnabled(true)
      sendLast()
      ref.current.position.z = h0
    }

    invalidate()
  })

  return (
    <Fragment>
      <mesh
        ref={ref}
        rotation-x={-Math.PI / 2}
        position-z={h0}
        {...(bind() as any)}
      >
        <circleBufferGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="steelblue" side={DoubleSide} />
      </mesh>
      {n > 0 && (
        <group>
          {pipe(
            vanillaPositionedRows,
            mapRA(({ geometry, rowLength, y, levelIndex }) => (
              <Instances
                key={levelIndex}
                geometry={geometry}
                material={stretchMaterial}
                position-y={y}
              >
                {[...Array(n)].map((_, i) => (
                  <Instance
                    key={i}
                    position-z={z0 + (back ? 1 : -1) * rowLength * i}
                  />
                ))}
              </Instances>
            ))
          )}
        </group>
      )}
    </Fragment>
  )
}

const Stretch = (props: Props) => {
  const { house } = props

  return (
    <Fragment>
      <StretchHandle house={house} />
      <StretchHandle house={house} back />
    </Fragment>
  )
}

export default Stretch
