import { navigate } from 'gatsby';
import { useEffect, useState } from 'react';

import Layout from '../components/layout';

export default () => {
  const [query, setQuery] = useState<string | undefined>(undefined)
  const inBrowser = typeof document !== 'undefined'

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

  return <Layout pageTitle="Buddy's Almanac" query={query} onSearch={onSearch}>
    <div>Search results</div>
  </Layout>
}
