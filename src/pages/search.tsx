import { navigate } from 'gatsby'
import { useEffect, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup'
import { keyframes } from '@emotion/react'
import { CgSpinner } from "@react-icons/all-files/cg/CgSpinner"


import Layout from '../components/layout'
import List from '../components/list'
import { useSearchables, Searchable } from '../hooks/searchables'

declare global {
  interface Window { _farmSearchables?: Searchable[] | undefined }
}

interface ScoredResult {
  name: string
  image: string
  type: string | null
  href: string
  score: number
}

const prepScoring = (query: string) => {
  const pattern = ["(.*?)"]
  for (const letter of query) {
    pattern.push(letter, "(.*?)")
  }
  return new RegExp(pattern.join(""))
}

const scoreSearchable = (name: string, query: string, queryRegex: RegExp) => {
  // The scoring algorithm:
  // * An exact match is always at the top.
  // * If the letters of the query do not appear anywhere in the name, return a
  //   score high enough to always exclude from results.
  // * If there is a match, look at how many extra letters there are. Sequences at the
  //   front and back count linearly, sequences between letters get squared so they "hurt" more.
  //
  // Example: name=stone query=sn => StoNe, the "to" is squared for 4 points and the "e" is 1 point, 5 points total.
  if (name === query) {
    return 0
  }
  const match = name.match(queryRegex)
  if (match === null) {
    return 1000
  }
  let total = match[1].length
  for (let i = 2; i < match.length - 1; i++) {
    total += Math.pow(match[i].length, 2)
  }
  total += match[match.length - 1].length
  return total
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

interface SearchProps {
  location?: {
    state?: {
      typing: boolean
      query: string
    }
  }
}

export default ({ location }: SearchProps) => {
  const [searchables, setSearchables] = useState<Searchable[] | null>(null)
  const [inputFocus, setInputFocus] = useState(false)
  const [query, setQuery] = useState<string | undefined>(location?.state?.query)
  const [results, setResults] = useState<ScoredResult[] | null>(null)
  const inBrowser = typeof document !== 'undefined'

  // Get the search query from the URL.
  // Based on https://github.com/akash-joshi/gatsby-query-params/blob/f997c33cdee82d053c6591ff3b71b7d54cce07d3/src/index.js
  useEffect(() => {
    if (inBrowser) {
      if (!inputFocus && !location?.state?.typing) {
        const params = new URLSearchParams(document.location.search)
        const q = params.get("q")
        if (q !== null) {
          setQuery(q)
        }
      }
      if (searchables === null) {
        // Check if we have the index loaded.
        if (window._farmSearchables) {
          setSearchables(window._farmSearchables)
        } else {
          // Start loading the searchables.
          fetch("/search.json").then(resp => resp.json()).then(data => {
            window._farmSearchables = data
            setSearchables(data)
          })
        }
      }
    }
  }, [])

  const onSearch = (query: string) => {
    setQuery(query)
    history.replaceState(null, "", `?q=${encodeURIComponent(query)}`)
  }

  const onSearchFocus = (focus: boolean) => {
    setInputFocus(focus)
  }

  useEffect(() => {
    if (searchables !== null) {
      // Filter and sort the results.
      if (!query) {
        setResults([])
        return
      }

      // Setup for scoring.
      const queryLower = query.toLowerCase()
      const queryRegexp = prepScoring(queryLower)

      // Transform to a scored list.
      const scored: ScoredResult[] = []
      for (const { name, image, searchText, type, href } of searchables) {
        const score = scoreSearchable(searchText, queryLower, queryRegexp)
        if (score <= 500) {
          scored.push({ name, image, href, type, score })
        }
      }
      scored.sort((a, b) => a.score - b.score)
      setResults(scored)
    }
  }, [query, searchables])

  return <Layout pageTitle="Buddy's Almanac" query={query} searchAutoFocus={!!location?.state?.typing} onSearch={onSearch} onSearchFocus={onSearchFocus}>
    <div>Search results</div>
    {results !== null ?
      <List items={results.map(r => ({ image: r.image, lineOne: r.name, lineTwo: r.type, href: r.href }))} bigLine={true} /> :
      <div className="w-100 d-flex justify-content-center">
        <CgSpinner
          css={{
            animation: `${spin} infinite 1s linear`,
            width: 100,
            height: 100,
          }}
          title="Loading"
          aria-description="Search results are loading" />
      </div>}
  </Layout>
}
