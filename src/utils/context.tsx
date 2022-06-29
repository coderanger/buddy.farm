import React, { useEffect, useState } from 'react'

import { Settings, SetSettings, SetSetting, useSettings } from '../hooks/settings'
import { useToasts } from '../hooks/toasts'

export interface Searchable {
  name: string
  image: string
  href: string
  searchText: string
  type: string | null
}

interface ContextProps {
  searchables: Searchable[] | null
  setSearchables: React.Dispatch<React.SetStateAction<Searchable[] | null>>
  query: string | null
  setQuery: React.Dispatch<React.SetStateAction<string | null>>
  settings: Settings
  setSettings: SetSettings
  setSetting: SetSetting
  toasts: ReturnType<typeof useToasts>[0]
  addToast: ReturnType<typeof useToasts>[1]
  removeToast: ReturnType<typeof useToasts>[2]
}

export const GlobalContext = React.createContext<ContextProps>({
  searchables: null,
  setSearchables: () => null,
  query: null,
  setQuery: () => null,
  settings: {},
  setSettings: () => null,
  setSetting: () => null,
  toasts: [],
  addToast: () => null,
  removeToast: () => null,
})

interface ProviderProps {
  children: JSX.Element[] | JSX.Element
}

const Provider = ({ children }: ProviderProps) => {
  const [searchables, setSearchables] = useState<Searchable[] | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [settings, setSettings, setSetting] = useSettings()
  const [toasts, addToast, removeToast] = useToasts()

  useEffect(() => {
    if (typeof document !== undefined) {
      if (new URLSearchParams(document.location.search).get("dark") === null) {
        document.documentElement.classList[settings.darkMode ? "add" : "remove"]("dark")
      }
      // @ts-ignore
      typeof window !== "undefined" && window.gtag && window.gtag("set", "user_properties", { dark_mode: settings.darkMode ? "true" : "false" })
    }
  }, [settings.darkMode])

  return (
    <GlobalContext.Provider value={{ searchables, setSearchables, query, setQuery, settings, setSettings, setSetting, toasts, addToast, removeToast }}>
      {children}
    </GlobalContext.Provider>
  )
}

interface WrapProps {
  element: JSX.Element[] | JSX.Element
}

export default ({ element }: WrapProps) => (
  <Provider>
    {element}
  </Provider>
)
