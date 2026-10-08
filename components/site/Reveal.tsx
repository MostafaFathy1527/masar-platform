'use client'

import { useEffect } from 'react'

// Scroll-entry reveal for anything marked data-reveal. Mounted once in the
// layout. The server renders every element visible; this code marks an element
// "wait" only once it is observing it, and "in" when it enters the viewport —
// so nothing is ever hidden unless the code that will show it again is
// running. Page content streams in after the layout hydrates and changes on
// client navigation, so new elements are picked up by a MutationObserver
// rather than a one-time query. Reduced-motion visitors are never marked at
// all and see the final state immediately.
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!('IntersectionObserver' in window)) return

    const show = (el: HTMLElement) => {
      el.dataset.reveal = 'in'
      io.unobserve(el)
    }
    // The root extends far above the viewport: an element the reader has
    // already scrolled past counts as seen. Without that, one fast flick or a
    // jump to an anchor can carry an element from below the fold to above it
    // between two observer reports, and it would stay hidden.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target as HTMLElement)
      },
      { rootMargin: '10000px 0px -8% 0px', threshold: 0.05 },
    )

    // Every element not yet shown is (re)observed — observe() is idempotent,
    // and re-observing is what keeps an element from being stranded when the
    // effect is cleaned up and run again, as React does in development. The
    // timer is insurance against anything else: an element the observer never
    // reports is shown after a few seconds rather than never. It is armed per
    // effect run, so a cleanup cannot leave an element without one.
    const timed = new WeakSet<HTMLElement>()
    const timers: number[] = []
    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="in"])').forEach((el) => {
        el.dataset.reveal = 'wait'
        io.observe(el)
        if (!timed.has(el)) {
          timed.add(el)
          timers.push(window.setTimeout(() => el.dataset.reveal === 'wait' && show(el), 4000))
        }
      })
    }
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      mo.disconnect()
      io.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])
  return null
}
