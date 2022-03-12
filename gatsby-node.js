// @ts-check

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type DropRatesGqlJson implements Node {
      item: ItemsJson! @link(by: "name")
      location: LocationsJson @link(by: "name")
      locationItem: ItemsJson @link(from: "location", by: "name")
    }

    type ItemsJson implements Node {
      dropMode: ItemDropModeJson @link(from: "jsonId", by: "jsonId")
    }

    type PetsJson implements Node {
      extra: PetExtraJson @link(from: "name", by: "name")
      level1Items: [ItemsJson] @link(by: "name")
      level3Items: [ItemsJson] @link(by: "name")
      level6Items: [ItemsJson] @link(by: "name")
    }
  `
  createTypes(typeDefs)
}

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async function ({ actions, graphql }) {
  /**
   * @type {
      {
        data?: {
          allLocationsJson: {
            nodes: {
             name: string
            }[]
          }
          allItemsJson: {
            nodes: {
              name: string
            }[]
          }
          allPetsJson: {
            nodes: {
              name: string
            }[]
          }
        }
      }
    }
   */
  const { data } = await graphql(`
      query {
        allLocationsJson {
          nodes {
            name
          }
        }
        allItemsJson {
          nodes {
            name
          }
        }
        allPetsJson {
          nodes {
            name
          }
        }
      }
    `)
  data.allItemsJson.nodes.forEach(node => {
    actions.createPage({
      path: `/${node.name.toLowerCase().replace(/\s+/g, '-')}/`,
      component: require.resolve(`./src/templates/item.tsx`),
      context: { name: node.name },
    })
  })
  data.allLocationsJson.nodes.forEach(node => {
    actions.createPage({
      path: `/${node.name.toLowerCase().replace(/\s+/g, '-')}/`,
      component: require.resolve(`./src/templates/location.tsx`),
      context: { name: node.name },
    })
  })
  data.allPetsJson.nodes.forEach(node => {
    actions.createPage({
      path: `/${node.name.toLowerCase().replace(/\s+/g, '-')}/`,
      component: require.resolve(`./src/templates/pet.tsx`),
      context: { name: node.name },
    })
  })
}
