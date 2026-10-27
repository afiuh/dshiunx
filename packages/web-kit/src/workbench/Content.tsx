import type { ReactNode } from 'react'

/** A：内容。 */
export function Content({ children }: { children: ReactNode }) {
  return <section className="wb-content">{children}</section>
}
