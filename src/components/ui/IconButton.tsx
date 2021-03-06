import React, { FC, SyntheticEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/router"
// import { Link, useLocation } from "react-router-dom";

export interface Props {
  onClick?: any
  href?: string
}

export const iconButtonStyles =
  "w-12 inline-block h-12 hover:bg-[rgba(0,0,0,0.1)] transition-colors duration-200 ease-in-out focus:outline-none focus:shadow-[0 0 0 3px rgba(0,0,0,0.2))]"

const IconButton: FC<Props> = (props) => {
  const { href, children, onClick, ...restProps } = props
  const router = useRouter()
  // const location = useLocation();
  if (href) {
    const isActive = router.pathname.startsWith(href)
    return (
      <Link href={href}>
        <a
          className={`${iconButtonStyles} ${isActive ? "" : "opacity-50"}`}
          {...restProps}
        >
          <div>{children}</div>
        </a>
      </Link>
    )
  }
  return (
    <button className={iconButtonStyles} onClick={onClick} {...restProps}>
      {children}
    </button>
  )
}

export default IconButton
