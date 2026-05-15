import { useEffect } from 'react'
import type { RefObject } from 'react'

export function useClickOutside<T extends HTMLElement = HTMLElement>(ref: RefObject<T>, handler: (ev: Event) => void) {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current
      if (!el) return
      if (event.target && el.contains(event.target as Node)) return
      handler(event)
    }
    document.addEventListener('click', listener)
    return () => document.removeEventListener('click', listener)
  }, [ref, handler])
}

export default useClickOutside
