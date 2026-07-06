import { useRef, useCallback, useEffect } from 'react'
import { useSideRaysTilt } from './SideRaysContext'
import './BorderGlow.css'

function parseHSL(hslStr) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/)
  if (!match) return { h: 40, s: 80, l: 80 }
  return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) }
}

function buildGlowVars(glowColor, intensity) {
  const { h, s, l } = parseHSL(glowColor)
  const base = `${h}deg ${s}% ${l}%`
  const opacities = [100, 60, 50, 40, 30, 20, 10]
  const keys = ['', '-60', '-50', '-40', '-30', '-20', '-10']
  const vars = {}
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] = `hsl(${base} / ${Math.min(opacities[i] * intensity, 100)}%)`
  }
  return vars
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%']
const GRADIENT_KEYS = ['--gradient-one', '--gradient-two', '--gradient-three', '--gradient-four', '--gradient-five', '--gradient-six', '--gradient-seven']
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1]

function buildGradientVars(colors) {
  const vars = {}
  for (let i = 0; i < 7; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)]
    vars[GRADIENT_KEYS[i]] = `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`
  return vars
}

function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3) }
function easeInCubic(x)  { return x * x * x }

function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }) {
  const t0 = performance.now() + delay
  let rafId = null
  let timerId = null
  function tick() {
    const elapsed = performance.now() - t0
    const t = Math.min(elapsed / duration, 1)
    onUpdate(start + (end - start) * ease(t))
    if (t < 1) rafId = requestAnimationFrame(tick)
    else if (onEnd) onEnd()
  }
  timerId = setTimeout(() => { rafId = requestAnimationFrame(tick) }, delay)
  // Return cancel function
  return () => {
    clearTimeout(timerId)
    if (rafId) cancelAnimationFrame(rafId)
  }
}

const BorderGlow = ({
  children,
  className       = '',
  edgeSensitivity = 0,
  glowColor       = '40 80 80',
  backgroundColor = '#120F17',
  borderRadius    = 28,
  glowRadius      = 120,
  glowIntensity   = 2.0,
  coneSpread      = 45,
  animated        = true,
  colors          = ['#c084fc', '#f472b6', '#38bdf8'],
  fillOpacity     = 0.5,
}) => {
  const cardRef = useRef(null)
  const rectCacheRef = useRef({ left: 0, top: 0, width: 0, height: 0 })

  // Update rect cache on mount + resize
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const updateRect = () => {
      const rect = card.getBoundingClientRect()
      rectCacheRef.current = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }
    }
    updateRect()

    const ro = new ResizeObserver(updateRect)
    ro.observe(card)
    window.addEventListener('scroll', updateRect, { passive: true })

    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', updateRect)
    }
  }, [])

  // ── Passive SideRays tilt effect ──────────────────────────────────────────
  // Subscriber fires every RAF frame from SideRays. Writes directly to DOM —
  // no setState, no re-render. The passive-light span uses --passive-angle.
  const sideRaysCtx = useSideRaysTilt()

  useEffect(() => {
    if (!sideRaysCtx) return

    const card = cardRef.current
    if (!card) return

    // rectCacheRef is already kept fresh by the ResizeObserver above —
    // just read from it directly in the hot RAF callback, zero BoundingClientRect calls.
    const unsubscribe = sideRaysCtx.subscribe((tilt) => {
      const { left, width } = rectCacheRef.current
      const centerX = left + width / 2
      const distanceFactor = 1 - (centerX / window.innerWidth) * 0.4
      // Math.round to avoid float string allocation on every frame
      const angle = Math.round((315 - tilt * distanceFactor * 3) * 100) / 100
      card.style.setProperty('--passive-angle', `${angle}deg`)
    })

    return unsubscribe
  }, [sideRaysCtx])

  const getCenterOfElement = useCallback(() => {
    const { width, height } = rectCacheRef.current
    return [width / 2, height / 2]
  }, [])

  const getEdgeProximity = useCallback((x, y) => {
    const [cx, cy] = getCenterOfElement()
    const dx = x - cx
    const dy = y - cy
    let kx = Infinity
    let ky = Infinity
    if (dx !== 0) kx = cx / Math.abs(dx)
    if (dy !== 0) ky = cy / Math.abs(dy)
    return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1)
  }, [getCenterOfElement])

  const getCursorAngle = useCallback((x, y) => {
    const [cx, cy] = getCenterOfElement()
    const dx = x - cx
    const dy = y - cy
    if (dx === 0 && dy === 0) return 0
    let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90
    if (degrees < 0) degrees += 360
    return degrees
  }, [getCenterOfElement])

  const handlePointerMove = useCallback(e => {
    const card = cardRef.current
    if (!card) return
    const rect = rectCacheRef.current
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const proximity = (getEdgeProximity(x, y) * 100).toFixed(3)
    const angle = getCursorAngle(x, y).toFixed(3)
    card.style.setProperty('--edge-proximity', proximity)
    card.style.setProperty('--cursor-angle', `${angle}deg`)
  }, [getEdgeProximity, getCursorAngle])

  useEffect(() => {
    if (!animated || !cardRef.current) return
    const card = cardRef.current
    card.classList.add('sweep-active')
    card.style.setProperty('--cursor-angle', '110deg')
    const cancels = [
      animateValue({ duration: 500, onUpdate: v => card.style.setProperty('--edge-proximity', v) }),
      animateValue({ ease: easeInCubic, duration: 1500, end: 50, onUpdate: v => card.style.setProperty('--cursor-angle', `${355 * (v / 100) + 110}deg`) }),
      animateValue({ ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100, onUpdate: v => card.style.setProperty('--cursor-angle', `${355 * (v / 100) + 110}deg`) }),
      animateValue({ ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0, onUpdate: v => card.style.setProperty('--edge-proximity', v), onEnd: () => card.classList.remove('sweep-active') }),
    ]
    return () => cancels.forEach(c => c())
  }, [animated])

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card ${className}`}
      style={{
        '--card-bg':          backgroundColor,
        '--edge-sensitivity': edgeSensitivity,
        '--border-radius':    `${borderRadius}px`,
        '--glow-padding':     `${glowRadius}px`,
        '--cone-spread':      coneSpread,
        '--fill-opacity':     fillOpacity,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
      }}
    >
      <span className="edge-light" />
      <div className="border-glow-inner">
        {children}
      </div>
      <span className="passive-light" />
    </div>
  )
}

export default BorderGlow
