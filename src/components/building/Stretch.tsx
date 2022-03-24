import { House } from "@/data/house"
import defaultMaterial from "@/materials/defaultMaterial"
import { setCameraEnabled } from "@/stores/camera"
import context from "@/stores/context"
import { useStretchedColumns } from "@/stores/stretch"
import { mapRA } from "@/utils"
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

const StretchHandle2 = (props: Props) => {
  const { house, back = false } = props
  const ref = useRef<Mesh>()

  const { sendZ, vanillaPositionedRows, n, z0 } = useStretchedColumns(
    house.id,
    back
  )

  const stretchMaterial = useMemo(() => {
    const material = defaultMaterial.clone()
    material.color = new Color("white")
    return material
  }, [])

  const invalidate = useThree((three) => three.invalidate)

  const bind = useDrag(({ first, last }) => {
    if (!ref.current) return
    const [, pz] = context.pointer
    if (first) {
      setCameraEnabled(false)
    }

    // clamp the length here
    ref.current.position.z = !back ? Math.min(pz, z0) : Math.max(pz, z0)

    sendZ(ref.current.position.z)

    // check if abs(pz - z0) / rowLength !== n
    // set n

    // sendZ(pz - z0)

    if (last) {
      setCameraEnabled(true)
    }

    invalidate()
  })

  return (
    <Fragment>
      <mesh
        ref={ref}
        rotation-x={-Math.PI / 2}
        position-z={z0}
        {...(bind() as any)}
      >
        <circleBufferGeometry args={[0.5, 10]} />
        <meshBasicMaterial color="steelblue" side={DoubleSide} />
      </mesh>
      <group>
        {pipe(
          vanillaPositionedRows,
          mapRA(({ geometry, rowLength, y }) => (
            <Instances
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
        {/* for each level... */}
        {/* {pipe(
          extraCols,
          mapRA(({ columnIndex, vanillaPositionedRows, z }) => (
            <group key={columnIndex}>
              {pipe(
                vanillaPositionedRows,
                mapRA(({ geometry, y, modules, levelIndex }) => (
                  <group key={levelIndex} position-y={y}>
                    <Instances geometry={geometry} material={defaultMaterial}>
                      <Instance position-z={modules[0].z} />
                    </Instances>
                  </group>
                ))
              )}
            </group>
          ))
        )} */}
      </group>
    </Fragment>
  )
}

const Stretch = (props: Props) => {
  const { house } = props

  return (
    <Fragment>
      <StretchHandle2 house={house} />
      <StretchHandle2 house={house} back />
    </Fragment>
  )
}

export default Stretch

// const StretchHandles = () => {
//   // const {
//   //   house: {
//   //     position: [x0, z0],
//   //   },
//   //   row0: { row, vanillaModules },
//   // } = props
//   // const z1 = row[0].z + 3
//   // const z2 = row[row.length - 1].z - 3

//   return (
//     <Fragment>
//       <StretchHandle />
//       {/* <StretchHandle back /> */}
//     </Fragment>
//   )
// }

// export default StretchHandles

// have vanilla module
// every time hits new vanilla module length from origin
// either just move the first column
// or... fill?

// would also have to de-fill on other direction

// min max (constrain)

// prob leave the state house alone
// create modules in transient space?

// maybe you can just update state on house...
// but you're depending on row 0 ...

// in any case you need to calculate the additional modules

// each row has vanilla modules for END and MID
// so attach to houseRows?

// could you update stretch handles based on
// subscribe
// to dna and drag?

// would need to not take props

// experiment:
// stretch handles takes no props
// when drag, update house dna
// see if stretch handles re-renders

// if it does, try SoC components

// what about do everything in the drag handler but simply
// read the relevant proxies?

// maybe try without moving the handles first
// (stick the handle at the side, maybe it goes both ways)
