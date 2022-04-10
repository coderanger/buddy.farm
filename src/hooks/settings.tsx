import { useEffect, useState } from "react"

const LOCAL_STORAGE_KEY = "buddyFarmSettings"

export type Settings = { [key: string]: string }
export type SetSettings = React.Dispatch<React.SetStateAction<Settings>>
export type SetSetting = (key: string, value: any) => void

export const useSettings = (): [Settings, SetSettings, SetSetting] => {
  const inBrowser = typeof document !== 'undefined'
  const [settings, setSettings] = useState((): Settings => {
    if (!inBrowser) {
      return {}
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      // Update from the old stuff.
      for (const key in data) {
        if (data[key] === "on") {
          data[key] = true
        }
      }
      return data
    } else {
      return {}
    }
  })

  useEffect(() => {
    if (inBrowser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
    }
  }, inBrowser ? [LOCAL_STORAGE_KEY, settings] : [])

  const setSetting = (key: string, value: any) => setSettings(mergeSettings(key, value))

  return [settings, setSettings, setSetting]
}

export const mergeSettings = (key: string, value: any) => (
  (state: Settings) => {
    if (value === undefined) {
      const newState = { ...state }
      delete newState[key]
      return newState
    } else {
      return { ...state, [key]: value }
    }
  }
)
