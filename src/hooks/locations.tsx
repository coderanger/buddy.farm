import { useStaticQuery, graphql } from "gatsby"

interface LocationsQuery {
  locations: {
    nodes: {
      jsonId: string
      name: string
      image: string
      type: string
      extra: {
        baseDropRate: number
      }
      fields: {
        path: string
      }
    }[]
  }
}

export const useLocations = (type: string | undefined) => {
  const { locations }: LocationsQuery = useStaticQuery(
    graphql`
    query {
      locations: allLocationsJson {
        nodes {
          jsonId
          image
          name
          type
          extra {
            baseDropRate
          }
          fields {
            path
          }
        }
      }
    }
    `
  )
  if (type !== undefined) {
    locations.nodes = locations.nodes.filter(l => l.type === type)
  }
  return Object.fromEntries(locations.nodes.map(n => [n.name, n]))
}
