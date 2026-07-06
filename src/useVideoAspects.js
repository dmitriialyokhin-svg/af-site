import { useEffect, useState } from 'react'

/**
 * Probes all videos in parallel via detached <video> elements and returns
 * an array of resolved items with aspect ratios.
 */
export function useVideoAspects(cards) {
  const [resolved, setResolved] = useState([])

  useEffect(() => {
    if (!cards.length) {
      setResolved([])
      return
    }

    let cancelled = false

    const probes = cards.map((card, i) =>
      probeVideo(card.src).then(dims => ({ i, card, dims }))
    )

    Promise.all(probes).then(results => {
      if (cancelled) return
      const items = results
        .sort((a, b) => a.i - b.i)
        .map(({ card, dims }) => ({
          ...card,
          ...dims,
          aspect: dims.width / dims.height,
          id: card.src.replace(/[^a-zA-Z0-9]/g, '_'),
        }))
      setResolved(items)
    })

    return () => { cancelled = true }
  }, [cards])

  return resolved
}

function probeVideo(src) {
  return new Promise(resolve => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const cleanup = () => {
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
    }

    const timer = setTimeout(() => {
      cleanup()
      resolve({ width: 16, height: 9 })
    }, 8000)

    video.onloadedmetadata = () => {
      clearTimeout(timer)
      const w = video.videoWidth
      const h = video.videoHeight
      cleanup()
      resolve(w && h ? { width: w, height: h } : { width: 16, height: 9 })
    }

    video.onerror = () => {
      clearTimeout(timer)
      cleanup()
      resolve({ width: 16, height: 9 })
    }

    video.src = src
  })
}
