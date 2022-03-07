import { useEffect, useState } from "react"

const LOCAL_STORAGE_KEY = "buddyFarmSettings"

type Settings = { [key: string]: string }

export const useSettings = (): [Settings, (value: Settings) => void] => {
  const [settings, setSettings] = useState((): Settings => {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    } else {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  }, [LOCAL_STORAGE_KEY, settings])

  return [settings, setSettings]
}
