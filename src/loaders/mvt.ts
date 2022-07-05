import { load } from "@loaders.gl/core"
import { MVTLoader as _MVTLoader } from "@loaders.gl/mvt"
import { Loader, LoadingManager } from "three"

class MVTLoader extends Loader {
  constructor(manager: LoadingManager) {
    super(manager)
  }

  load(url: string, onLoad: (data: any) => void) {
    let geometryData: any
    ;(async () => {
      geometryData = await load(url, _MVTLoader)

      onLoad(geometryData)
    })()
  }
}

export default MVTLoader
