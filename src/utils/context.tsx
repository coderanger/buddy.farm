import React, { useEffect, useState } from 'react'

import { Searchable } from '../hooks/searchables'
import { Settings, useSettings } from '../hooks/settings'

interface ContextProps {
  searchables: Searchable[] | null
  setSearchables: (arg0: Searchable[] | null) => void
  query: string | null
  setQuery: (arg0: string | null) => void
  settings: Settings
  setSettings: (settings: Settings) => void
}

export const GlobalContext = React.createContext<ContextProps>({
  searchables: null,
  setSearchables: () => null,
  query: null,
  setQuery: () => null,
  settings: {},
  setSettings: () => null,
})

interface ProviderProps {
  children: JSX.Element[] | JSX.Element
}

const Provider = ({ children }: ProviderProps) => {
  const [searchables, setSearchables] = useState<Searchable[] | null>(null)
  const [query, setQuery] = useState<string | null>(null)
  const [settings, setSettings] = useSettings()

  useEffect(() => {
    if (typeof document !== undefined) {
      document.documentElement.classList[settings.darkMode ? "add" : "remove"]("dark")
      // @ts-ignore
      typeof window !== "undefined" && window.gtag && window.gtag("set", "user_properties", { dark_mode: settings.darkMode ? "true" : "false" })
    }
  }, [settings.darkMode])

  return (
    <GlobalContext.Provider value={{ searchables, setSearchables, query, setQuery, settings, setSettings }}>
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
