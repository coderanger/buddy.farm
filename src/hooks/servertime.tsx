import React, { useState, useEffect } from "react"
import { DateTime } from "luxon"

export interface UseServerTimeProps {
  exchangeCenter?: boolean
}

const getServerTime = () => DateTime.now().setZone("America/Chicago").toLocaleString(DateTime.TIME_SIMPLE)

const getRollover = (opts: UseServerTimeProps | null = null) => {
  const rollover = DateTime.fromObject({}, { zone: "America/Chicago" }).startOf("day").plus({ day: 1 })
  let delta = rollover.diffNow().shiftTo("hours", "minutes", "seconds").normalize()
  if (delta.hours === 0) {
    delta = delta.shiftTo("minutes", "seconds").normalize()
  }
  if (delta.minutes === 0) {
    delta = delta.shiftTo("seconds").normalize()
  }
  // Round down seconds. Otherwise things like seconds=59.9 shows as 60 and it looks silly.
  delta = delta.set({ seconds: delta.seconds - (delta.seconds % 1) })
  if (opts?.exchangeCenter && delta.hours >= 12) {
    delta = delta.set({ hours: delta.hours - 12 })
  }
  return delta.toHuman({ maximumFractionDigits: 0 })
}

const Spinner = () => {
  return <span className="d-inline-block spinner-border spinner-border-sm" role="status">
    <span className="visually-hidden">Loading...</span>
  </span>
}

export const useServerTime = (opts: UseServerTimeProps | null = null): [React.ReactFragment, React.ReactFragment] => {
  const [time, setTime] = useState("")
  const [rollover, setRollover] = useState("")

  useEffect(() => {
    setTime(getServerTime())
    setRollover(getRollover(opts))
    const timer = window.setInterval(() => {
      setTime(getServerTime())
      setRollover(getRollover(opts))
    }, 100)
    return () => window.clearInterval(timer)
  }, [])

  if (time === "" && rollover === "") {
    return [<Spinner />, <Spinner />]
  }

  return [time, rollover]
}
