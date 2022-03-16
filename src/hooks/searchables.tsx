import { useStaticQuery, graphql } from "gatsby"

interface Node {
  name: string
  image: string
  fields: {
    path: string
  }
}

interface SearchablesQuery {
  locations: {
    nodes: Node[]
  }
  items: {
    nodes: Node[]
  }
  pets: {
    nodes: Node[]
  }
  quests: {
    nodes: Node[]
  }
}

interface Searchable {
  name: string
  image: string
  href: string
  searchText: string
}

const nodeToSearchable = (node: Node) => {
  const searchName = node.name.toLowerCase()
  return { name: node.name, image: node.image, searchText: searchName, href: node.fields.path }
}

export const useSearchables = () => {
  const { locations, items, pets, quests }: SearchablesQuery = useStaticQuery(
    graphql`
    query {
      locations: allLocationsJson {
        nodes {
          name
          image
          fields {
            path
          }
        }
      }
      items: allItemsJson {
        nodes {
          name
          image
          fields {
            path
          }
        }
      }
      pets: allPetsJson {
        nodes {
          name
          image
          fields {
            path
          }
        }
      }
      quests: allQuestsJson {
        nodes {
          name
          image: fromImage
          fields {
            path
          }
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
  for (const node of pets.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  for (const node of quests.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  return searchables
}
