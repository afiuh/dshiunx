import type { ReactNode } from 'react'

/** A：内容。 */
export function Content({ children, onFocus, onBlur }: { children: ReactNode; onFocus?: () => void; onBlur?: () => void }) {
  return <section className="wb-content" onMouseEnter={onFocus} onMouseLeave={onBlur}>{children}</section>
}
