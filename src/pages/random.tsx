import { graphql, navigate, useStaticQuery } from 'gatsby'
import { useEffect } from 'react'

interface RandomQuery {
  pages: {
    nodes: {
      path: string
    }[]
  }
}

export default () => {
  const { pages }: RandomQuery = useStaticQuery(graphql`
    query {
      pages: allSitePage(
        filter: {component: {regex: "/.*/src/templates/.*/"}, path: {regex: "//.*/.*//"}}
      ) {
        nodes {
          path
        }
      }
    }
  `)

  useEffect(() => {
    const pick = pages.nodes[Math.floor(Math.random() * pages.nodes.length)]
    navigate(pick.path, { replace: true })
  }, [])

  return []
}
