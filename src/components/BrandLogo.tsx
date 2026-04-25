import type { ImgHTMLAttributes } from 'react'
import logoMenuSrc from '../assets/images/logo-menu.svg'
import logoFullSrc from '../assets/images/logo.svg'

type BrandLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  /** Versión recortada para el menú (viewBox 554×540). Por defecto, logo completo (554×778). */
  menu?: boolean
}

export function BrandLogo({ className, menu, ...rest }: BrandLogoProps) {
  const src = menu ? logoMenuSrc : logoFullSrc
  const w = 554
  const h = menu ? 540 : 778
  return (
    <img
      src={src}
      alt=""
      width={w}
      height={h}
      decoding="async"
      className={className}
      {...rest}
    />
  )
}
