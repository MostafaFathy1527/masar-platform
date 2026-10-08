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
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Intersecting, or already scrolled past: a jump to an anchor or one
          // fast flick can carry an element from below the viewport to above
          // it between two observer reports, and it must not stay hidden.
          if (e.isIntersecting || e.boundingClientRect.bottom < 0) show(e.target as HTMLElement)
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    // Every element not yet shown is (re)observed — observe() is idempotent,
    // and re-observing is what keeps an element from being stranded in "wait"
    // when the effect is cleaned up and run again, as React does in development.
    // The timer is insurance against anything else: an element the observer
    // never reports is shown anyway after a few seconds rather than never.
    const timers: number[] = []
    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="in"])').forEach((el) => {
        if (el.dataset.reveal !== 'wait') {
          el.dataset.reveal = 'wait'
          timers.push(window.setTimeout(() => el.dataset.reveal === 'wait' && show(el), 4000))
        }
        io.observe(el)
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
