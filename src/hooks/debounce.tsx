import { useState } from 'react'

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
