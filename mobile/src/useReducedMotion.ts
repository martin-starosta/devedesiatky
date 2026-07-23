import { AccessibilityInfo } from 'react-native'
import { useEffect, useState } from 'react'

/** Prefer system reduced-motion; default false until probed. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false)

  useEffect(() => {
    let mounted = true
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduce(value)
    })
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce)
    return () => {
      mounted = false
      sub.remove()
    }
  }, [])

  return reduce
}
