import context from "@/stores/context"
import { useRoute } from "@/utils/wouter"
import { useEffect } from "react"
import { subscribe } from "valtio"
import { useLocation } from "wouter"

export const useRouting = () => {
  const [, setLocation] = useLocation()
  const [, params] =
    useRoute<{ buildingId: string; levelIndex?: string }>("/site:rest*")

  subscribe(context, () => {
    let path = "/site"
    if (context.buildingId) {
      path += `?buildingId=${context.buildingId}`
      if (context.levelIndex) {
        path += `&levelIndex=${context.levelIndex}`
      }
    }
    if (path !== window.location.pathname + window.location.search) {
      setLocation(path)
    }
  })

  useEffect(() => {
    if (params === null || typeof params === "boolean") return
    switch (true) {
      case "buildingId" in params && context.buildingId !== params.buildingId: {
        context.buildingId === params.buildingId
      }
      case "levelIndex" in params: {
        const levelIndex = Number(params.levelIndex)
        if (context.levelIndex === levelIndex || isNaN(levelIndex)) break
        context.levelIndex = levelIndex
      }
    }
  }, [params])
}
