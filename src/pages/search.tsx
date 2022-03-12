import { navigate } from 'gatsby'
import { useEffect, useState } from 'react'
import ListGroup from 'react-bootstrap/ListGroup'

import Layout from '../components/layout'
import { useSearchables } from '../hooks/searchables'

interface ScoredResult {
  name: string
  image: string
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

export default () => {
  const searchables = useSearchables()
  const [inputFocus, setInputFocus] = useState(false)
  const [query, setQuery] = useState<string | undefined>(undefined)
  const inBrowser = typeof document !== 'undefined'

  // Get the search query from the URL.
  // Based on https://github.com/akash-joshi/gatsby-query-params/blob/f997c33cdee82d053c6591ff3b71b7d54cce07d3/src/index.js
  useEffect(() => {
    if (inBrowser && !inputFocus) {
      const params = new URLSearchParams(document.location.search)
      const q = params.get("q")
      if (q !== null) {
        setQuery(q)
      }
    }
  }, inBrowser ? [document.location.search] : [])

  const onSearch = (query: string) => {
    setQuery(query)
    history.replaceState(null, "", `?q=${encodeURIComponent(query)}`)
  }

  const onSearchFocus = (focus: boolean) => {
    setInputFocus(focus)
  }

  // Filter and sort the results.
  const [results, setResults] = useState<ScoredResult[]>([])
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    // Setup for scoring.
    const queryLower = query.toLowerCase()
    const queryRegexp = prepScoring(queryLower)

    // Transform to a scored list.
    const scored: ScoredResult[] = []
    for (const { name, image, searchText, href } of searchables) {
      const score = scoreSearchable(searchText, queryLower, queryRegexp)
      if (score <= 500) {
        scored.push({ name, image, href, score })
      }
    }
    scored.sort((a, b) => a.score - b.score)
    setResults(scored)
  }, [query])

  return <Layout pageTitle="Buddy's Almanac" query={query} onSearch={onSearch} onSearchFocus={onSearchFocus}>
    <div>Search results</div>
    <ListGroup variant="flush">
      {results.map(result => (
        <ListGroup.Item className="d-flex w-100 justify-flex-start" onClick={evt => { evt.preventDefault(); navigate(result.href) }}>
          <img src={"https://farmrpg.com" + result.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
          <span css={{ fontSize: 32 }}>{result.name}</span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Layout>
}
