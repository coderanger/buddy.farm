import React, { useState, useEffect } from "react"
import Layout from '../components/layout'
import { DateTime } from "luxon"

const getServerTime = () => DateTime.now().setZone("America/Chicago").toLocaleString(DateTime.TIME_SIMPLE)

const getRollover = () => {
  const rollover = DateTime.fromObject({}, { zone: "America/Chicago" }).startOf("day").plus({ day: 1 })
  let delta = rollover.diffNow().shiftTo("hours", "minutes", "seconds").normalize()
  if (delta.hours == 0) {
    delta = delta.shiftTo("minutes", "seconds").normalize()
  }
  if (delta.minutes == 0) {
    delta = delta.shiftTo("seconds").normalize()
  }
  return delta.toHuman({ maximumFractionDigits: 0 })
}

export default () => {
  const [time, setTime] = useState(getServerTime())
  const [rollover, setRollover] = useState(getRollover())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(getServerTime())
      setRollover(getRollover())
    }, 100)
    return () => window.clearInterval(timer)
  }, [])

  return <Layout pageTitle="Server Time">
    <div className="w-100 d-flex flex-column gap-4 align-items-center">
      <div className="display-3">Server Time is <strong>{time}</strong></div>
      <div className="display-5">Daily Reset in <strong>{rollover}</strong></div>
    </div>
  </Layout>
}
