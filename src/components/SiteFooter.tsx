import { Link } from 'react-router-dom'
import heroCharacterImage from '../assets/images/hero-character.svg'

const footTextClass = 'text-base text-neutral-600 [font-family:var(--font-sans)]'
const footLinkClass = `${footTextClass} w-fit no-underline underline-offset-2 hover:underline`

export function SiteFooter() {
  return (
    <footer className="w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-neutral-100/90 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-8">
            <div
              className={[
                'flex min-w-0 flex-col justify-between self-stretch',
                'min-h-[14rem] sm:min-h-[16rem] lg:min-h-[18rem]',
              ].join(' ')}
            >
              <h2
                className="m-0 self-start text-left text-[clamp(1.75rem,1rem+2.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.02em] text-neutral-900 [font-family:var(--font-serif)]"
              >
                ¿Me ayudas a mejorar?
              </h2>
              <div className="flex w-full min-w-0 max-w-md flex-col gap-2 self-start">
                <nav className="flex flex-col gap-2" aria-label="Contacto e información">
                  <Link to="/calculos" className={footLinkClass}>
                    Cálculos y fórmulas
                  </Link>
                  <a
                    href="https://x.com/imandresochoa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footLinkClass}
                  >
                    Pasarme a saludar
                  </a>
                  <a
                    href="https://x.com/Jongonzlz/status/2047638381501313508"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footLinkClass}
                  >
                    Sobre el origen del proyecto
                  </a>
                </nav>
                <p className={['m-0', footTextClass].join(' ')}>
                  © {new Date().getFullYear()} — Comparador de sueldo neto
                </p>
              </div>
            </div>
            <div className="relative flex min-h-[14rem] justify-end sm:min-h-[16rem] lg:min-h-[18rem]">
              <img
                src={heroCharacterImage}
                alt=""
                className="max-h-72 w-auto max-w-full object-contain object-bottom [image-rendering:-webkit-optimize-contrast] lg:max-h-80"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
