import { notFound } from 'next/navigation'

// Any path under a locale that no route matches lands here and is sent to
// app/[locale]/not-found.tsx, so an unknown address gets the site's own page,
// in the visitor's language, inside the header and footer.
export default function CatchAll() {
  notFound()
}
