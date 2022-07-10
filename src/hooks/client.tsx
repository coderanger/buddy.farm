import React, { useState, useEffect } from "react"

export const useOnClient = () => {
  const [onClient, setOnClient] = useState(false)
  useEffect(() => setOnClient(true))
  return onClient
}
