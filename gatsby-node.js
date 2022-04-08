// @ts-check
const fs = require("fs")

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

    type QuestReward {
      id: String!
      quantity: Int!
      item: ItemsJson! @link(from: "id", by: "jsonId")
    }

    type QuestsJson implements Node {
      extra: QuestExtraJson @link(from: "jsonId", by: "jsonId")
      itemRequests: [QuestReward!]!
      itemRewards: [QuestReward!]!
    }

    type QuestlinesJson implements Node {
      quests: [QuestsJson!]! @link(by: "jsonId")
    }

    type QuestExtraJson implements Node {
      prev: QuestsJson @link(by: "jsonId")
      next: QuestsJson @link(by: "jsonId")
    }

    type WishingWellJson implements Node {
      input: ItemsJson! @link(by: "jsonId")
      output: ItemsJson! @link(by: "jsonId")
    }

    type LocksmithItemsJson implements Node {
      box: LocksmithBoxesJson! @link(by: "box")
      boxItem: ItemsJson! @link(by: "jsonId", from: "box")
      item: ItemsJson! @link(by: "jsonId")
    }

    type LocksmithBoxesJson implements Node {
      box: ItemsJson! @link(by: "jsonId")
      items: [LocksmithItemsJson!] @link(by: "boxItem.jsonId", from: "box")
    }

    type BuildingProductionJson implements Node {
      item: ItemsJson! @link(by: "jsonId")
    }

    type LocationsJson implements Node {
      extra: LocationExtraJson! @link(from: "name", by: "name")
    }

    type TowerJson implements Node {
      item: ItemsJson @link(from: "itemName", by: "name")
    }
  `
  createTypes(typeDefs)
}

const pathPrefixes = {
  "ItemsJson": { short: "i", long: "items" },
  "LocationsJson": { short: "l", long: "locations" },
  "PetsJson": { short: "p", long: "pets" },
  "QuestlinesJson": { short: "ql", long: "questlines" },
  "QuestsJson": { short: "q", long: "quests" },
}

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions
  const pathPrefix = pathPrefixes[node.internal.type]
  /** @type {string | any} */
  const name = node.name
  if (pathPrefix && typeof name === "string") {
    const slug = name.toLowerCase().replace(/\W+/g, '-')
    createNodeField({ node, name: "path", value: `/${pathPrefix.short}/${slug}/` })
    createNodeField({ node, name: "longPath", value: `/${pathPrefix.long}/${slug}/` })
    createNodeField({ node, name: "unprefixedPath", value: `/${slug}/` })
  }
}

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async ({ actions, graphql }) => {
  /**
   * @type {
      {
        data?: {
          allLocationsJson: {
            nodes: {
             name: string
             fields: {
               path: string
               longPath: string
               unprefixedPath: string
             }
            }[]
          }
          allItemsJson: {
            nodes: {
              name: string
             fields: {
               path: string
               longPath: string
               unprefixedPath: string
             }
            }[]
          }
          allPetsJson: {
            nodes: {
              name: string
             fields: {
               path: string
               longPath: string
               unprefixedPath: string
             }
            }[]
          }
          allQuestsJson: {
            nodes: {
              name: string
             fields: {
               path: string
               longPath: string
               unprefixedPath: string
             }
            }[]
          }
          allQuestlinesJson: {
            nodes: {
              name: string
             fields: {
               path: string
               longPath: string
               unprefixedPath: string
             }
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
            fields {
              path
              longPath
              unprefixedPath
            }
          }
        }
        allItemsJson {
          nodes {
            name
            fields {
              path
              longPath
              unprefixedPath
            }
          }
        }
        allPetsJson {
          nodes {
            name
            fields {
              path
              longPath
              unprefixedPath
            }
          }
        }
        allQuestsJson {
          nodes {
            name
            fields {
              path
              longPath
              unprefixedPath
            }
          }
        }
        allQuestlinesJson {
          nodes {
            name
            fields {
              path
              longPath
              unprefixedPath
            }
          }
        }
      }
    `)
  /** @type {[{nodes: {name: string, fields: {path: string, longPath: string, unprefixedPath: string}}[]}, string][]} */
  const types = [
    [data.allItemsJson, "item"],
    [data.allLocationsJson, "location"],
    [data.allPetsJson, "pet"],
    [data.allQuestsJson, "quest"],
    [data.allQuestlinesJson, "questline"],
  ]
  types.forEach(([typeData, template]) => {
    typeData.nodes.forEach(node => {
      [node.fields.path, node.fields.unprefixedPath].forEach(path => {
        actions.createPage({
          path: path,
          component: require.resolve(`./src/templates/${template}.tsx`),
          context: { name: node.name },
        })
      })
    })
  })

  // Write out the search index.
  /**
   * @typedef {{name: string, image: string, fields: {path: string}}} SearchNode
   * @typedef {{nodes: SearchNode[]}} SearchType
   * @typedef {{name: string, image: string, href: string, type: string | null, searchText: string}} Searchable
   */

  /**
   * @type {{
   *  data?: {
   *    locations: SearchType,
   *    items: SearchType,
   *    pets: SearchType,
   *    quests: SearchType,
   *    questlines: SearchType,
   * }}}
   */
  const { data: searchData } = await graphql(`
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
      questlines: allQuestlinesJson {
        nodes {
          name
          image
          fields {
            path
          }
        }
      }
    }
    `)
  /**
   * @param {SearchNode} node
   * @param {string | null} type
   * @returns {Searchable}
   */
  const nodeToSearchable = (node, type = null) => {
    const searchName = node.name.toLowerCase()
    return { name: node.name, image: node.image, searchText: searchName, href: node.fields.path, type }
  }
  /**
   * @type {Searchable[]}
   */
  const searchables = [
    {
      name: "The Tower",
      image: "/img/items/tower.png",
      searchText: "the tower",
      type: null,
      href: "/tower/",
    },
    {
      name: "XP Calculator",
      image: "/img/items/7210.png",
      searchText: "xp calculator",
      type: null,
      href: "/xpcalc/",
    },
    {
      name: "Orchard Calculator",
      image: "/img/items/7210.png",
      searchText: "orchard calculator",
      type: null,
      href: "/orchardcalc/",
    },
    {
      name: "Tower Calculator",
      image: "/img/items/7210.png",
      searchText: "Tower calculator",
      type: null,
      href: "/towercalc/",
    },
  ]
  for (const node of searchData.locations.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  for (const node of searchData.items.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  for (const node of searchData.pets.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  for (const node of searchData.quests.nodes) {
    searchables.push(nodeToSearchable(node))
  }
  for (const node of searchData.questlines.nodes) {
    searchables.push(nodeToSearchable(node, "Questline"))
  }
  // Write the index to a file.
  try {
    await fs.promises.access("public")
  } catch (error) {
    // Not really sure how this could happen but just in case.
    await fs.promises.mkdir("public")
  }
  await fs.promises.writeFile("public/search.json", JSON.stringify(searchables))
}
