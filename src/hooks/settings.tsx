import { useEffect, useState } from "react"

const LOCAL_STORAGE_KEY = "buddyFarmSettings"

export type Settings = { [key: string]: string }

export const useSettings = (): [Settings, React.Dispatch<React.SetStateAction<Settings>>] => {
  const inBrowser = typeof document !== 'undefined'
  const [settings, setSettings] = useState((): Settings => {
    if (!inBrowser) {
      return {}
    }
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    } else {
      return {}
    }
  })

  useEffect(() => {
    if (inBrowser) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings))
    }
  }, inBrowser ? [LOCAL_STORAGE_KEY, settings] : [])

  return [settings, setSettings]
}

export const mergeSettings = (key: string, value: any) => (
  (state: Settings) => {
    if (value === undefined) {
      const newState = { ...state }
      delete newState[key]
      return newState
    } else {
      return { ...state, [key]: value.toString() }
    }
  }
)
