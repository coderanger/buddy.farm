import { graphql, navigate, PageProps } from "gatsby"
import { useEffect } from "react"

const RandomPage = ({ data: { pages } }: PageProps<Queries.RandomPageQuery>) => {
  useEffect(() => {
    const pick = pages.nodes[Math.floor(Math.random() * pages.nodes.length)]
    void navigate(pick.path, { replace: true })
  }, [])

  return []
}

export default RandomPage

export const query = graphql`
  query RandomPage {
    pages: allSitePage(
      filter: { component: { regex: "/.*/src/templates/.*/" }, path: { regex: "//.*/.*//" } }
    ) {
      nodes {
        path
      }
    }
  }
`
