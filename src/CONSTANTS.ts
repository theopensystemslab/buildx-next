// Layer :

export enum CameraLayer {
  visible = 0,
  invisible = 1,
}

export enum RaycasterLayer {
  clickable = 3,
  non_clickable = 4,
}

export const BUILDX_LOCAL_STORAGE_HOUSES_KEY = "BUILDX_LOCAL_STORAGE_HOUSES_KEY"
export const BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY =
  "BUILDX_LOCAL_STORAGE_MAP_POLYGON_KEY"

// type SetTypes = {
//   [key: string]: string[][][]
// }

type SetTypeOption = Record<string, string[][]>

type SetTypeSpec = {
  target: string[][]
  options: SetTypeOption
}

type SetTypeSpecs = Record<string, SetTypeSpec>

export const setTypeSpecs: SetTypeSpecs = {
  ST: {
    target: [["S1-MID-G1"], ["S1-MID-M1"]],
    options: {
      ST0: [["S1-MID-G1-ST0"], ["S1-MID-M1-ST0"]],
      ST2: [["S1-MID-G1-ST2"], ["S1-MID-M1-ST2"]],
    },
  },
}

// export const setTypes: = {
// }
