import { useControls } from "leva"
import React from "react"
import Line from "./Line"

const shadowProps = {
  "shadow-camera-far": 100,
  "shadow-camera-near": 2,
  "shadow-camera-left": -100,
  "shadow-camera-right": 100,
  "shadow-camera-top": 100,
  "shadow-camera-bottom": -100,
  "shadow-mapSize": [4096, 4096],
}

interface LightSetting {
  position: [number, number, number]
  color: string
  intensity: number
  castShadow?: boolean
}

const intensityScale = 0.76

const VISUALIZE_LIGHTS = false

const Lighting = () => {
  const eveningLights: Array<LightSetting> = [
    {
      position: [0, 20, -20],
      color: "#fffcdb",
      intensity: 0.8 * intensityScale,
      castShadow: true,
    },

    {
      position: [0, 20, 20],
      color: "#b5d7fc",
      intensity: 0.8 * intensityScale,
    },

    {
      position: [-20, 20, 0],
      color: "#fff",
      intensity: 0.3 * intensityScale,
    },

    {
      position: [20, 20, 0],
      color: "#9bb9c6",
      intensity: 0.3 * intensityScale,
    },
  ]
  return (
    <>
      <ambientLight intensity={0.5 * intensityScale} />
      {eveningLights.map((light, index) => (
        <directionalLight key={index} {...light} {...shadowProps} />
      ))}
      {VISUALIZE_LIGHTS && (
        <>
          {eveningLights.map((light, index) => (
            <Line key={index} to={light.position} from={[0, 0, 0]} />
          ))}
          <Line to={[30, -10, 0]} from={[0, 0, 0]} />
        </>
      )}
    </>
  )
}

export default Lighting
