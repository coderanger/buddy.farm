export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: number | undefined
  return (...args: any[]) => {
    const context = this
    const later = () => {
      timeout = undefined
      func.apply(context, args)
    }
    clearTimeout(timeout)
    timeout = window.setTimeout(later, wait)
  }
}
