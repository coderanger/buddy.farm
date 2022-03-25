import React, { useState } from 'react'

import { Searchable } from '../hooks/searchables'

interface ContextProps {
  searchables: Searchable[] | null
  setSearchables: (arg0: Searchable[] | null) => void
  query: string | null
  setQuery: (arg0: string | null) => void
}

export const GlobalContext = React.createContext<ContextProps>({
  searchables: null,
  setSearchables: () => null,
  query: null,
  setQuery: () => null,
})

interface ProviderProps {
  children: JSX.Element[] | JSX.Element
}

const Provider = ({ children }: ProviderProps) => {
  const [searchables, setSearchables] = useState<Searchable[] | null>(null)
  const [query, setQuery] = useState<string | null>(null)

  return (
    <GlobalContext.Provider value={{ searchables, setSearchables, query, setQuery }}>
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
