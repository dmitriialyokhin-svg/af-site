import { createContext, useContext, useRef, useMemo } from 'react'

const SideRaysContext = createContext(null)

/**
 * useSideRaysProvider — call once in App.jsx.
 * The contextValue is stable (memo'd), so subscribers never re-run useEffect
 * due to context identity change.
 */
export function useSideRaysProvider() {
  const subscribersRef = useRef(new Set())

  // publishRef.current(tilt) — called by SideRays every RAF frame
  const publishRef = useRef(null)
  if (!publishRef.current) {
    publishRef.current = (tilt) => {
      subscribersRef.current.forEach(cb => cb(tilt))
    }
  }

  // stable subscribe function — identity never changes
  const subscribeRef = useRef(null)
  if (!subscribeRef.current) {
    subscribeRef.current = (cb) => {
      subscribersRef.current.add(cb)
      return () => subscribersRef.current.delete(cb)
    }
  }

  // stable context value — useMemo with empty deps so it's created once
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextValue = useMemo(() => ({ subscribe: subscribeRef.current }), [])

  return { Provider: SideRaysContext.Provider, publishRef, contextValue }
}

/**
 * useSideRaysTilt — returns { subscribe } or null if outside a provider.
 */
export function useSideRaysTilt() {
  return useContext(SideRaysContext)
}

export default SideRaysContext
