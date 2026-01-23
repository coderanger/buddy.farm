import { useEffect, useState } from 'react'

export const useDebounce = <T extends (...args: any[]) => void,>(func: T, wait: number) => {
  const [timeout, setTimeout_] = useState<number | undefined>(undefined)
  return <T,>(...args: any[]) => {
    const context = this
    const later = () => {
      setTimeout_(undefined)
      func.apply(context, args)
    }
    clearTimeout(timeout)
    setTimeout_(window.setTimeout(later, wait))
  }
}

export const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export const useDebounceAfter = <T extends (...args: any[]) => void,>(func: T, wait: number) => {
  const [timeout, setTimeout_] = useState<number | undefined>(undefined)
  return <T,>(...args: any[]) => {
    if (timeout !== undefined) {
      return
    }
    const later = () => {
      setTimeout_(undefined)
    }
    setTimeout_(window.setTimeout(later, wait))
    func.apply(this, args)
  }
}
