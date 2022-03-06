import { useStaticQuery, graphql } from "gatsby"

interface LocationsQuery {
  allLocationsJson: {
    nodes: {
      jsonId: string
      name: string
      image: string
    }[]
  }
}

export const useLocations = () => {
  const { allLocationsJson }: LocationsQuery = useStaticQuery(
    graphql`
    query {
      allLocationsJson {
        nodes {
          jsonId
          image
          name
        }
      }
    }
    `
  )
  return Object.fromEntries(allLocationsJson.nodes.map(n => [n.name, n]))
}
