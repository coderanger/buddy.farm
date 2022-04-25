import React, { useEffect, useState } from 'react'

import { Searchable } from '../hooks/searchables'
import { Settings, SetSettings, SetSetting, useSettings } from '../hooks/settings'

interface ContextProps {
  searchables: Searchable[] | null
  setSearchables: React.Dispatch<React.SetStateAction<Searchable[] | null>>
  query: string | null
  setQuery: React.Dispatch<React.SetStateAction<string | null>>
  settings: Settings
  setSettings: SetSettings
  setSetting: SetSetting
}

export const GlobalContext = React.createContext<ContextProps>({
  searchables: null,
  setSearchables: () => null,
  query: null,
  setQuery: () => null,
  settings: {},
  setSettings: () => null,
  setSetting: () => null,
})

interface ProviderProps {
  children: JSX.Element[] | JSX.Element
}

const Provider = ({ children }: ProviderProps) => {
  const [searchables, setSearchables] = useState<Searchable[] | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [settings, setSettings, setSetting] = useSettings()

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
    <GlobalContext.Provider value={{ searchables, setSearchables, query, setQuery, settings, setSettings, setSetting }}>
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
