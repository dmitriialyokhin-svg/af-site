import { useRef, useEffect } from 'react'
import { useSideRaysTilt } from './SideRaysContext'
import './SpotlightCard.css'

const SpotlightCard = ({
  children,
  className      = '',
  spotlightColor = 'rgba(255, 255, 255, 0.12)',
}) => {
  const divRef = useRef(null)

  // ── Active mouse spotlight ────────────────────────────────────────────────
  const handleMouseMove = e => {
    const rect = divRef.current.getBoundingClientRect()
    divRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    divRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
    divRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  // ── Passive SideRays tilt effect ─────────────────────────────────────────
  const sideRaysCtx = useSideRaysTilt()

  useEffect(() => {
    if (!sideRaysCtx) return
    const unsubscribe = sideRaysCtx.subscribe((tilt) => {
      const el = divRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const normX = (rect.left + w / 2) / window.innerWidth  // 0..1
      const lateralFactor = 1 - normX * 0.5
      const shiftX = w * 0.5 + tilt * lateralFactor * (w / 12)
      const shiftY = h * 0.12 + Math.abs(tilt) * (h / 60)
      el.style.setProperty('--passive-x', `${shiftX.toFixed(1)}px`)
      el.style.setProperty('--passive-y', `${shiftY.toFixed(1)}px`)
    })
    return unsubscribe
  }, [sideRaysCtx])

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`card-spotlight ${className}`}
    >
      {children}
    </div>
  )
}

export default SpotlightCard
