import { useStaticQuery, graphql } from "gatsby"

interface ItemsQuery {
  allItemsJson: {
    nodes: {
      jsonId: string
      name: string
      image: string
    }[]
  }
}

export const useItems = () => {
  const { allItemsJson }: ItemsQuery = useStaticQuery(
    graphql`
    query {
      allItemsJson {
        nodes {
          jsonId
          image
          name
        }
      }
    }
    `
  )
  return Object.fromEntries(allItemsJson.nodes.map(n => [n.name, n]))
}
