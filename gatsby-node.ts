import fs from 'fs'
import path from 'path'

import type { GatsbyNode } from "gatsby"
import type { Searchable } from "./src/utils/context"

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type BFFields {
      path: String!
    }

    type DropRatesGqlJson implements Node {
      item: ItemsJson! @link(by: "name")
      location: LocationsJson @link(by: "name")
      locationItem: ItemsJson @link(from: "location", by: "name")
    }

    type ItemsJson implements Node {
      jsonId: String!
      name: String!
      image: String!
      fields: BFFields!
      dropMode: ItemDropModeJson @link(from: "jsonId", by: "jsonId")
      api: ItemApiJson! @link(from: "jsonId", by: "jsonId")
      locksmithItems: [LocksmithItemsJson!] @link(from: "jsonId", by: "itemId")
      inputRecipes: [RecipesJson!] @link(from: "jsonId", by: "inputId")
      outputRecipes: [RecipesJson!] @link(from: "jsonId", by: "outputId")
      giveTrades: [TradesJson!] @link(from: "name", by: "giveItemName")
      receiveTrades: [TradesJson!] @link(from: "name", by: "receiveItemName")
    }

    type PetsJson implements Node {
      jsonId: String!
      name: String!
      image: String!
      fields: BFFields!
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
      jsonId: String!
      name: String!
      fromImage: String!
      fields: BFFields!
      extra: QuestExtraJson @link(from: "jsonId", by: "jsonId")
      itemRequests: [QuestReward!]!
      itemRewards: [QuestReward!]!
    }

    type QuestlinesJson implements Node {
      name: String!
      image: String!
      fields: BFFields!
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
      box: LocksmithBoxesJson! @link(by: "boxId")
      boxItem: ItemsJson! @link(by: "jsonId", from: "boxId")
      item: ItemsJson! @link(by: "jsonId", from: "itemId")
    }

    type LocksmithBoxesJson implements Node {
      box: ItemsJson! @link(by: "jsonId", from: "boxId")
      items: [LocksmithItemsJson!] @link(by: "boxId", from: "boxId")
    }

    type BuildingProductionJson implements Node {
      item: ItemsJson! @link(by: "jsonId")
    }

    type LocationsJson implements Node {
      jsonId: String!
      name: String!
      image: String!
      fields: BFFields!
      extra: LocationExtraJson! @link(from: "name", by: "name")
    }

    type TowerJson implements Node {
      item: ItemsJson @link(from: "itemName", by: "name")
    }

    type CommunityCenterJson implements Node {
      goalItem: ItemsJson! @link(by: "name")
      rewardItem: ItemsJson! @link(by: "name")
    }

    type PbgsJson implements Node {
      costItem: ItemsJson @link(by: "name")
    }

    type PasswordsJson implements Node {
      items: [PasswordItemsJson!] @link(by: "password.jsonId", from: "jsonId")
    }

    type PasswordItemsJson implements Node {
      password: PasswordsJson! @link(by: "jsonId")
      item: ItemsJson! @link(by: "jsonId")
    }

    type RecipesJson implements Node {
      input: ItemsJson! @link(by: "jsonId", from: "inputId")
      output: ItemsJson! @link(by: "jsonId", from: "outputId")
    }

    type TradesJson implements Node {
      jsonId: String!
      firstSeen: Float!
      giveItem: ItemsJson! @link(by: "name", from: "giveItemName")
      giveItemName: String!
      giveQuantity: Int!
      lastSeen: Float!
      lastSeenRelative: Int!
      oneShot: Boolean!
      order: Int!
      receiveItem: ItemsJson! @link(by: "name", from: "receiveItemName")
      receiveItemName: String!
      receiveQuantity: Int!
    }
  `
  createTypes(typeDefs)
}

interface PathInfo {
  short: string
  long: string
}

const pathPrefixes: Record<string, PathInfo> = {
  "ItemsJson": { short: "i", long: "items" },
  "LocationsJson": { short: "l", long: "locations" },
  "PetsJson": { short: "p", long: "pets" },
  "QuestlinesJson": { short: "ql", long: "questlines" },
  "QuestsJson": { short: "q", long: "quests" },
  "TradesJson": { short: "t", long: "trades" },
}

export const onCreateNode: GatsbyNode['onCreateNode'] = ({ node, actions }) => {
  const { createNodeField } = actions
  const pathPrefix = pathPrefixes[node.internal.type]
  /** @type {string | any} */
  const name = node.name || node.jsonId
  if (pathPrefix && typeof name === "string") {
    const slug = name.toLowerCase().replace(/\W+/g, '-')
    createNodeField({ node, name: "path", value: `/${pathPrefix.short}/${slug}/` })
  }
}

const STATIC_SEARCHABLES: Searchable[] = [
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
  {
    name: "Farm Animal Calculator",
    image: "/img/items/7210.png",
    searchText: "farm animal calculator",
    type: null,
    href: "/animalcalc/",
  },
  {
    name: "Emblems",
    image: "/img/emblems/def.png",
    searchText: "emblems",
    type: null,
    href: "/emblems/",
  },
  {
    name: "Profile Backgrounds",
    image: "/img/emblems/def.png",
    searchText: "profile backgrounds",
    type: null,
    href: "/backgrounds/",
  },
  {
    name: "Mailbox Passwords",
    image: "/img/items/postoffice.png",
    searchText: "mailbox passwords",
    type: null,
    href: "/passwords/",
  },
  {
    name: "Wine Calculator",
    image: "/img/items/7210.png",
    searchText: "wine cellar calculator",
    type: null,
    href: "/winecalc/",
  },
  {
    name: "Exchange Center",
    image: "/img/items/exchange.png?1",
    searchText: "exchange center trades",
    type: null,
    href: "/exchange-center/",
  },
  {
    name: "Farmhouse Calculator",
    image: "/img/items/farmhouse_sm.png",
    searchText: "farmhouse stamina calculator",
    type: null,
    href: "/farmhousecalc/",
  },
  {
    name: "Wheel Calculator",
    image: "/img/items/spinner.png?2",
    searchText: "wheel spin calculator",
    type: null,
    href: "/wheelcalc/",
  },
]

export const createPages: GatsbyNode['createPages'] = async ({ actions, graphql }) => {
  const { data } = await graphql<Queries.GatsbyNodeCreatePagesQuery>(`
    query GatsbyNodeCreatePages {
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
  const types = [
    {
      nodes: data!.items,
      template: "item",
    },
    {
      nodes: data!.locations,
      template: "location",
    },
    {
      nodes: data!.pets,
      template: "pet",
    },
    {
      nodes: data!.quests,
      template: "quest",
    },
    {
      nodes: data!.questlines,
      template: "questline",
      searchType: "Questline",
    },

  ]
  for (const typeData of types) {
    for (const node of typeData.nodes.nodes) {
      for (const nodePath of [node.fields.path]) {
        actions.createPage({
          path: nodePath,
          component: path.resolve(`src/templates/${typeData.template}.tsx`),
          context: { name: node.name },
        })
      }
    }
  }

  const searchables: Searchable[] = []
  searchables.push(...STATIC_SEARCHABLES)
  for (const typeData of types) {
    for (const node of typeData.nodes.nodes) {
      const searchName = node.name.toLowerCase()
      searchables.push({
        name: node.name,
        image: node.image,
        searchText: searchName,
        href: node.fields.path,
        type: typeData.searchType || null,
      })
    }
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
