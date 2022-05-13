type classNameInput = string | undefined | null | { [className: string]: boolean | null | undefined | (() => boolean) }

export const classNames = (...args: classNameInput[] | classNameInput[][]) => {
  const classes: string[] = []
  for (const arg of args) {
    if (arg === undefined || arg === null) {
      continue
    } else if (Array.isArray(arg)) {
      // Mild hack since this will have multiple classes but since it's all just combined, it works.
      classes.push(classNames(arg))
    } else if (typeof arg === "string") {
      classes.push(arg)
    } else {
      // Assume it's an object.
      for (const key in arg) {
        let val = arg[key]
        if (typeof val === "function") {
          val = val()
        }
        if (val) {
          classes.push(key)
        }
      }
    }
  }
  return classes.join(" ")
}
