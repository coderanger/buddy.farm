import { navigate } from 'gatsby';
import ListGroup from "react-bootstrap/ListGroup"
import { useEffect, useState } from 'react';

import Layout from '../components/layout';
import { useSearchables } from '../hooks/searchables';

interface ScoredResult {
  name: string
  image: string
  href: string
  score: number
}

export default () => {
  const searchables = useSearchables()
  const [query, setQuery] = useState<string | undefined>(undefined)
  const inBrowser = typeof document !== 'undefined'

  // Get the search query from the URL.
  // Based on https://github.com/akash-joshi/gatsby-query-params/blob/f997c33cdee82d053c6591ff3b71b7d54cce07d3/src/index.js
  useEffect(() => {
    if (inBrowser) {
      const params = new URLSearchParams(document.location.search)
      const q = params.get("q")
      if (q !== null) {
        setQuery(q)
      }
      // Side feature, focus the search input on load since the user is probably typing.
      document.getElementById("nav-search")?.focus()
    }
  }, inBrowser ? [document.location.search] : [])

  const onSearch = (query: string) => {
    setQuery(query)
    navigate(`/search/?q=${encodeURIComponent(query)}`, { replace: true })
  }

  // Filter and sort the results.
  const [results, setResults] = useState<ScoredResult[]>([])
  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    // Transform to a scored list.
    const scored: ScoredResult[] = []
    for (const { name, image, href } of searchables) {
      // TODO better search
      const score = name.includes(query.toLowerCase()) ? 1 : 0
      if (score > 0) {
        scored.push({ name, image, href, score })
      }
    }
    scored.sort((a, b) => a.score - b.score)
    setResults(scored)
  }, [query])

  return <Layout pageTitle="Buddy's Almanac" query={query} onSearch={onSearch}>
    <div>Search results</div>
    <ListGroup variant="flush">
      {results.map(result => (
        <ListGroup.Item className="d-flex w-100 justify-content-between" onClick={evt => { evt.preventDefault(); navigate(result.href) }}>
          <img src={"https://farmrpg.com" + result.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
          <span css={{ fontSize: 32 }}>{result.name}</span>
        </ListGroup.Item>
      ))}
    </ListGroup>
  </Layout>
}
