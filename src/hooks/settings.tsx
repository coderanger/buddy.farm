import { useEffect, useState } from "react"

const LOCAL_STORAGE_KEY = "buddyFarmSettings"

export type Settings = { [key: string]: any }
export type SetSettings = React.Dispatch<React.SetStateAction<Settings>>
export type SetSetting = (key: string, value: any) => void

export const useSettings = (localStorageKey: string = LOCAL_STORAGE_KEY): [Settings, SetSettings, SetSetting] => {
  const inBrowser = typeof document !== 'undefined'
  const [settings, setSettings] = useState((): Settings => {
    if (!inBrowser) {
      return {}
    }
    const raw = localStorage.getItem(localStorageKey)
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
      localStorage.setItem(localStorageKey, JSON.stringify(settings))
    }
  }, inBrowser ? [localStorageKey, settings] : [])

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
