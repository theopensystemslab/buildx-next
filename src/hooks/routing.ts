import context from "@/stores/context"
import { subscribe } from "valtio"
import { useLocation } from "wouter"

export const useRouting = () => {
  const [, setLocation] = useLocation()

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
}
