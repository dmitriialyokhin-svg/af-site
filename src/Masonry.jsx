import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import BorderGlow from './BorderGlow'
import TiltedCard from './TiltedCard'
import SpotlightCard from './SpotlightCard'
import ShinyText from './ShinyText'
import tagsInfo from './tags-info'
import t from './i18n'
import './Masonry.css'

/* ── helpers ──────────────────────────────────────────────────────────── */

const useMeasure = () => {
  const ref = useRef(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, size]
}

// ~260px per column, min 2
const widthToColumns = w => Math.max(2, Math.floor(w / 260))

// lookup map: tag id → tag config (icon, label)
const tagMap = Object.fromEntries(tagsInfo.map(tag => [tag.id, tag]))

/* ── component ────────────────────────────────────────────────────────── */

const Masonry = ({
  items,
  lang              = 'en',
  ease              = 'power3.out',
  duration          = 0.6,
  blurToFocus       = true,
}) => {
  const [containerRef, { width }] = useMeasure()
  const columns = width ? widthToColumns(width) : 2
  const i18n = t[lang]

  /* ── layout grid ──────────────────────────────────────────────────── */
  const grid = useMemo(() => {
    if (!width || !items.length) return []
    const colHeights = new Array(columns).fill(0)
    const colWidth   = width / columns

    return items.map(item => {
      const aspect = item.aspect || 16 / 9
      const span   = columns > 1 && aspect >= 1.2 ? 2 : 1
      const w      = colWidth * span
      const h      = w / aspect

      let bestCol = 0
      let bestMax = Infinity
      for (let c = 0; c <= columns - span; c++) {
        const maxH = Math.max(...colHeights.slice(c, c + span))
        if (maxH < bestMax) { bestMax = maxH; bestCol = c }
      }

      const x = colWidth * bestCol
      const y = bestMax

      for (let c = bestCol; c < bestCol + span; c++) {
        colHeights[c] = y + h
      }

      return { ...item, x, y, w, h, span }
    })
  }, [columns, items, width])

  const containerHeight = useMemo(() => {
    if (!grid.length) return 0
    return Math.max(...grid.map(i => i.y + i.h))
  }, [grid])

  /* ── animation ────────────────────────────────────────────────────── */
  // tracks which ids have already done their entrance animation
  const seenIds = useRef(new Set())
  const prevItemIds = useRef(new Set())
  const hasWidth = !!width

  useLayoutEffect(() => {
    if (!grid.length || !hasWidth) return

    // detect if the item set has changed (filter switch) — reset seen ids
    // Reset only when items were removed (filter change), not when new ones are added (progressive loading)
    const currentIdSet = new Set(items.map(i => i.id || i.src))
    const prevIds = prevItemIds.current
    const hadItemsRemoved = prevIds.size > 0 && [...prevIds].some(id => !currentIdSet.has(id))
    if (hadItemsRemoved) {
      seenIds.current.clear()
    }
    prevItemIds.current = currentIdSet

    // sort grid items by visual order: top-to-bottom, left-to-right
    const ordered = [...grid].sort((a, b) => {
      const rowDiff = a.y - b.y
      return Math.abs(rowDiff) < 10 ? a.x - b.x : rowDiff
    })

    // Step 1: snap ALL new items to their final position immediately (no flash)
    // Step 2: then stagger-animate opacity/blur in
    const newItems = ordered.filter(item => !seenIds.current.has(item.id))
    const oldItems = ordered.filter(item =>  seenIds.current.has(item.id))

    // Step 1: instantly place all new items at their SIZE and X, but 40px below final Y
    // This ensures layout is correct from frame 1, no jumping around
    newItems.forEach(item => {
      const sel = `[data-key="${item.id}"]`
      gsap.set(sel, {
        x: item.x,
        y: item.y + 40,  // start 40px below
        width:  item.w,
        height: item.h,
        opacity: 0,
        visibility: 'hidden',
        ...(blurToFocus && { filter: 'blur(8px)' }),
      })
    })

    // Step 2: animate old items to new positions (reflow on resize/column change)
    oldItems.forEach(item => {
      const sel = `[data-key="${item.id}"]`
      gsap.to(sel, {
        x: item.x,
        y: item.y,
        width:  item.w,
        height: item.h,
        duration,
        ease,
        overwrite: 'auto',
      })
    })

    // Step 3: stagger in the new items one by one (slide up + fade in)
    newItems.forEach((item, entranceIndex) => {
      seenIds.current.add(item.id)
      const sel   = `[data-key="${item.id}"]`
      const delay = entranceIndex * 0.08

      gsap.to(sel, {
        y: item.y,  // slide up to final position
        opacity: 1,
        visibility: 'visible',
        ...(blurToFocus && { filter: 'blur(0px)' }),
        duration: 0.55,
        ease: 'power3.out',
        delay,
        overwrite: false,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, hasWidth])

  /* ── hover ────────────────────────────────────────────────────────── */
  // hover effects handled by TiltedCard and BorderGlow

  /* ── render ───────────────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="masonry-list"
      style={{ height: containerHeight }}
    >
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="masonry-item"
        >
          <TiltedCard
            rotateAmplitude={10}
            scaleOnHover={1}
            showMobileWarning={false}
            showTooltip={false}
          >
            <BorderGlow
              className="masonry-glow"
              backgroundColor="#111113"
              borderRadius={12}
              glowRadius={28}
              glowColor="220 10 70"
              colors={['#d4d2cc', '#b0aea8', '#6a6a6e']}
              edgeSensitivity={20}
              glowIntensity={0.8}
              coneSpread={20}
              fillOpacity={0.15}
            >
              <SpotlightCard spotlightColor="rgba(212, 210, 204, 0.08)">
                <video
                  className="masonry-video"
                  src={item.src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  tabIndex={-1}
                />

                <div className="masonry-overlay">
                  <div className="masonry-overlay__content">
                    <span className="masonry-title">{item.title}</span>
                    {item.tags && item.tags.length > 0 && (
                      <div className="masonry-tags">
                        {item.tags.map((tagId, i) => {
                          const tag = tagMap[tagId]
                          return (
                            <span key={tagId} className="masonry-tag">
                              {tag?.icon && (
                                <span className="masonry-tag-icon" aria-hidden="true">
                                  {tag.icon}
                                </span>
                              )}
                              <ShinyText
                                text={i18n.tags?.[tagId] ?? tag?.label ?? tagId}
                                color="#b0aea8"
                                shineColor="#e8e4dc"
                                speed={3.5}
                                delay={i * 0.3}
                                spread={100}
                                direction="left"
                                pauseOnHover={true}
                                className="masonry-tag-text"
                              />
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </SpotlightCard>
            </BorderGlow>
          </TiltedCard>
        </div>
      ))}
    </div>
  )
}

export default Masonry
