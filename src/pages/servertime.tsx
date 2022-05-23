import React from 'react'

import Layout from '../components/layout'
import { useServerTime } from '../hooks/servertime'

export default () => {
  const [time, rollover] = useServerTime()

  return <Layout pageTitle="Server Time">
    {typeof document !== "undefined" && <div className="w-100 d-flex flex-column gap-4 align-items-center">
      <div className="display-3">Server Time is <strong>{time}</strong></div>
      <div className="display-5">Daily Reset in <strong>{rollover}</strong></div>
    </div>}
  </Layout>
}
