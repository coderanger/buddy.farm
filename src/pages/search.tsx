import { useContext, useEffect, useState } from "react"

import { keyframes } from "@emotion/react"
import { CgSpinner } from "@react-icons/all-files/cg/CgSpinner"

import Layout from "../components/layout"
import List from "../components/list"
import { GlobalContext } from "../utils/context"

import { useDebouncedValue } from "../hooks/debounce"

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
    pattern.push(letter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "(.*?)")
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

export default () => {
  const ctx = useContext(GlobalContext)
  const [results, setResults] = useState<ScoredResult[] | null>(null)
  const inBrowser = typeof document !== "undefined"

  // Debounce the query to reduce number of searches
  const query = useDebouncedValue(ctx.query, 150)

  // Initialize query from URL on mount
  useEffect(() => {
    if (inBrowser) {
      const params = new URLSearchParams(document.location.search)
      const q = params.get("q")
      if (q !== null) {
        ctx.setQuery(q)
      }
      if (ctx.searchables === null) {
        // Start loading the searchables.
        void fetch("/search.json")
          .then((resp) => resp.json())
          .then((data) => {
            ctx.setSearchables(data)
          })
      }
    }
  }, [])

  // Run search when debounced deferred query or searchables change
  useEffect(() => {
    if (ctx.searchables !== null) {
      // Filter and sort the results.
      if (!query) {
        setResults([])
        ctx.setFirstResultHref(null)
        return
      }

      // Setup for scoring.
      const queryLower = query.toLowerCase().trim()
      const queryClean = queryLower.replace(/[()[\]]/g, "")
      if (queryClean.length < 2) {
        setResults([])
        ctx.setFirstResultHref(null)
        return
      }
      const queryRegexp = prepScoring(queryClean)

      // Transform to a scored list.
      const scored: ScoredResult[] = []
      for (const { name, image, searchText, type, href } of ctx.searchables) {
        const score = scoreSearchable(searchText, queryLower, queryRegexp)
        if (score <= 500) {
          scored.push({ name, image, href, type, score })
        }
      }
      scored.sort((a, b) => a.score - b.score)
      setResults(scored)
      // Update first result href for Enter key navigation
      ctx.setFirstResultHref(scored.length > 0 ? scored[0].href : null)
    }
  }, [query, ctx.searchables])

  return (
    <Layout pageTitle="Buddy's Almanac">
      <div>Search results</div>
      {results !== null ? (
        <List
          items={results.map((r) => ({
            key: `${r.name}-${r.type}-${r.href}`,
            image: r.image,
            lineOne: r.name,
            lineTwo: r.type,
            href: r.href,
          }))}
          bigLine={true}
        />
      ) : (
        <div className="w-100 d-flex justify-content-center">
          <CgSpinner
            css={{
              animation: `${spin} infinite 1s linear`,
              width: 100,
              height: 100,
            }}
            title="Loading"
            role="img"
            aria-label="Search results are loading"
          />
        </div>
      )}
    </Layout>
  )
};
