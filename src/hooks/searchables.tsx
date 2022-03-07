import { useStaticQuery, graphql } from "gatsby"

interface SearchablesQuery {
  locations: {
    nodes: {
      name: string
      image: string
    }[]
  }
  items: {
    nodes: {
      name: string
      image: string
    }[]
  }
}

interface Searchable {
  name: string
  image: string
  href: string
  searchText: string
}

const nodeToSearchable = (node: { name: string, image: string }) => {
  const searchName = node.name.toLowerCase()
  return { name: node.name, image: node.image, searchText: searchName, href: `/${searchName.replace(/\s+/g, '-')}/` }
}

export const useSearchables = () => {
  const { locations, items }: SearchablesQuery = useStaticQuery(
    graphql`
    query {
      locations: allLocationsJson {
        nodes {
          name
          image
        }
      }
      items: allItemsJson {
        nodes {
          name
          image
        }
      }
    }
    `
  )
  const searchables: Searchable[] = []
  for (const node of locations.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  for (const node of items.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  return searchables
}
