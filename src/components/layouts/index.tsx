import { IconButton } from "@/components/ui"
import { Build, Data, Site } from "@/components/ui/icons"
import React, { PropsWithChildren } from "react"
import css from "./index.module.css"

const Layout = ({ children }: PropsWithChildren<{}>) => {
  return (
    <div className={`${css.layoutRoot} fixed flex h-full w-full flex-col`}>
      <div className="absolute top-0 left-1/2 z-10 flex -translate-x-1/2 transform justify-center bg-white shadow">
        <IconButton href="/map">
          <Site />
        </IconButton>
        <IconButton href="/site">
          <Build />
        </IconButton>
        <IconButton href="/dashboard">
          <Data />
        </IconButton>
      </div>
      {children}
    </div>
  )
}

export default Layout
