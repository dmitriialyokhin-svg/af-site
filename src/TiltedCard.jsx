import { useRef, useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useSideRaysTilt } from './SideRaysContext'
import './TiltedCard.css'

const springValues = { damping: 30, stiffness: 100, mass: 2 }

export default function TiltedCard({
  children,
  containerHeight    = '100%',
  containerWidth     = '100%',
  scaleOnHover       = 1.03,
  rotateAmplitude    = 10,
  showMobileWarning  = false,
  showTooltip        = false,
  captionText        = '',
}) {
  const ref = useRef(null)

  const x              = useMotionValue(0)
  const y              = useMotionValue(0)
  const rotateX        = useSpring(useMotionValue(0), springValues)
  const rotateY        = useSpring(useMotionValue(0), springValues)
  const scale          = useSpring(1, springValues)
  const opacity        = useSpring(0)
  const rotateFigcaption = useSpring(0, { stiffness: 350, damping: 30, mass: 1 })

  const [lastY, setLastY] = useState(0)

  // ── Passive shadow driven by SideRays tilt ────────────────────────────────
  const sideRaysCtx = useSideRaysTilt()

  useEffect(() => {
    if (!sideRaysCtx) return
    const unsubscribe = sideRaysCtx.subscribe((tilt) => {
      if (!ref.current) return
      // tilt < 0 → rays lean left  → shadow shifts right
      // tilt > 0 → rays lean right → shadow shifts left
      // Base offset: light from top-left → shadow goes bottom-right
      const shadowX = 8 - tilt * 0.6   // px, inverted
      const shadowY = 12               // always downward
      ref.current.style.setProperty('--shadow-x', `${shadowX.toFixed(1)}px`)
      ref.current.style.setProperty('--shadow-y', `${shadowY}px`)
    })
    return unsubscribe
  }, [sideRaysCtx])

  function handleMouse(e) {
    if (!ref.current) return
    const rect    = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left  - rect.width  / 2
    const offsetY = e.clientY - rect.top   - rect.height / 2
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude)
    rotateY.set((offsetX / (rect.width  / 2)) *  rotateAmplitude)
    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)
    rotateFigcaption.set(-(offsetY - lastY) * 0.6)
    setLastY(offsetY)
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover)
    opacity.set(1)
  }

  function handleMouseLeave() {
    opacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    rotateFigcaption.set(0)
  }

  return (
    <figure
      ref={ref}
      className="tilted-card-figure"
      style={{ height: containerHeight, width: containerWidth }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="tilted-card-mobile-alert">
          This effect is not optimized for mobile.
        </div>
      )}

      <motion.div
        className="tilted-card-inner"
        style={{ width: '100%', height: '100%', rotateX, rotateY, scale }}
      >
        {children}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="tilted-card-caption"
          style={{ x, y, opacity, rotate: rotateFigcaption }}
        >
          {captionText}
        </motion.figcaption>
      )}
    </figure>
  )
}
