'use client';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useRef } from 'react';
import './Dock.css';

function DockItem({ children, className = '', onClick, mouseX, spring, distance, magnification, baseItemSize, label }) {
  const ref = useRef(null);

  const mouseDistance = useTransform(mouseX, val => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize }
    return val - rect.x - rect.width / 2
  })

  // scale: 1 → magnification/baseItemSize at center
  const targetScale = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, magnification / baseItemSize, 1]
  )
  const scale = useSpring(targetScale, spring)

  // extra margin pushes neighbours away proportional to how much item grew
  // at center: extra = (magnification - baseItemSize) / 2 px on each side
  const extraMargin = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [0, (magnification - baseItemSize) , 0]
  )
  const margin = useSpring(extraMargin, spring)

  const handleKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <motion.div
      ref={ref}
      style={{ scale, marginLeft: margin, marginRight: margin }}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-label={label}
      onKeyDown={handleKeyDown}
    >
      {children}
    </motion.div>
  )
}

export default function Dock({
  items,
  className     = '',
  spring        = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance      = 200,
  baseItemSize  = 50,
}) {
  const mouseX = useMotionValue(Infinity)

  return (
    <div className={`dock-panel ${className}`}>
      <motion.div
        className="dock-track"
        onMouseMove={({ pageX }) => mouseX.set(pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        role="toolbar"
        aria-label="Tags"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className ?? ''}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            label={item.label}
          >
            {item.icon}
          </DockItem>
        ))}
      </motion.div>
    </div>
  )
}
