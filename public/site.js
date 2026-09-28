/*!
 * JACKX — progressive enhancement (~1.3 kB, no dependencies).
 *
 * Everything here is optional: the site is fully readable and navigable with
 * JavaScript disabled (the inline head script tags <html> as .js purely so that
 * scroll-reveal styling is only applied when it can be undone).
 *
 * Design notes
 *  - No scroll event listeners at all. The sticky-header state is driven by a
 *    single IntersectionObserver on a 1px sentinel, which costs nothing per frame.
 *  - Reveals un-observe after firing, so the observer's work is O(1) per section
 *    and animations stop entirely once the page has been scrolled through.
 *  - Only class toggles are written, never layout properties, so INP stays low.
 */
;(function () {
  'use strict'

  var doc = document
  // Tells the inline head script that enhancement is alive, cancelling its
  // "reveal everything" safety net.
  window.jackx = true

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---------------------------------------------------------------- reveals */
  var revealTargets = doc.querySelectorAll('[data-reveal]')

  if (reduced || typeof IntersectionObserver !== 'function') {
    for (var r = 0; r < revealTargets.length; r++) revealTargets[r].classList.add('is-visible')
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            entries[i].target.classList.add('is-visible')
            revealObserver.unobserve(entries[i].target)
          }
        }
      },
      // Start the fade slightly before the element reaches the fold.
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    )
    for (var j = 0; j < revealTargets.length; j++) revealObserver.observe(revealTargets[j])
  }

  /* --------------------------------------------------------- sticky header */
  var header = doc.querySelector('[data-header]')
  var sentinel = doc.querySelector('.scroll-sentinel')

  if (header && sentinel && typeof IntersectionObserver === 'function') {
    new IntersectionObserver(
      function (entries) {
        header.classList.toggle('is-scrolled', !entries[0].isIntersecting)
      },
      { rootMargin: '-24px 0px 0px 0px', threshold: 0 },
    ).observe(sentinel)
  }

  /* ----------------------------------------------------------- mobile menu */
  var toggle = doc.querySelector('[data-nav-toggle]')
  var nav = doc.querySelector('[data-nav]')

  if (toggle && nav) {
    var label = toggle.querySelector('[data-nav-toggle-label]')

    function setOpen(open) {
      nav.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', String(open))
      if (label) label.textContent = open ? 'Close menu' : 'Open menu'
    }

    function close(returnFocus) {
      if (!nav.classList.contains('is-open')) return
      setOpen(false)
      if (returnFocus) toggle.focus()
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'))
    })

    // Close after choosing a destination.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close(false)
    })

    doc.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return
      close(true)
    })

    doc.addEventListener('click', function (event) {
      if (!header.contains(event.target)) close(false)
    })

    // Returning to a wide viewport must not leave a focusable overlay open.
    matchMedia('(min-width: 701px)').addEventListener('change', function (event) {
      if (event.matches) close(false)
    })

    setOpen(false)
  }
})()
