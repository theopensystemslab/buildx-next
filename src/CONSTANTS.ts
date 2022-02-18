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

type SetTypes = {
  [key: string]: string[][]
}

export const setTypes: SetTypes = {
  ST2: [
    ["S1-MID-G1-ST2-L2-GRID2-SIDE0-SIDE0-SIDE0-SIDE0"],
    ["S1-MID-M1-ST2-L2-GRID2-SIDE0-SIDE0-SIDE0-SIDE0"],
  ],
}
