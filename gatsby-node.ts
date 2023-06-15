import fs from "fs"
import path from "path"

import type { GatsbyNode } from "gatsby"
import type { Searchable } from "./src/utils/context"
import linkFor from "./src/utils/links"

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type XpJson implements Node {
      level: Int!
      xp: Int!
    }
  `
  createTypes(typeDefs)
}

interface PathInfo {
  short: string
  long: string
}

const pathPrefixes: Record<string, PathInfo> = {
  ItemsJson: { short: "i", long: "items" },
  LocationsJson: { short: "l", long: "locations" },
  PetsJson: { short: "p", long: "pets" },
  QuestlinesJson: { short: "ql", long: "questlines" },
  QuestsJson: { short: "q", long: "quests" },
  TradesJson: { short: "t", long: "trades" },
  QuizzesJson: { short: "qz", long: "quizzes" },
  NpcsJson: { short: "t", long: "townsfolk" },
}

export const onCreateNode: GatsbyNode["onCreateNode"] = ({ node, actions }) => {
  const { createNodeField } = actions
  const pathPrefix = pathPrefixes[node.internal.type]
  /** @type {string | any} */
  const name = node.name || node.jsonId
  if (pathPrefix && typeof name === "string") {
    const slug = name.trim().toLowerCase().replace(/\W+/g, "-")
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
  {
    name: "Schoolhouse Quizzes",
    image: "/img/items/schoolhouse.png",
    searchText: "schoolhouse quizzes",
    type: null,
    href: "/quizzes/",
  },
  {
    name: "Townsfolk",
    image: "/img/items/town_sm.png",
    searchText: "townsfolk npcs",
    type: null,
    href: "/townsfolk/",
  },
  {
    name: "Level Rewards",
    image: "/img/items/7447.png",
    searchText: "level rewards",
    type: null,
    href: "/level-rewards/",
  },
  {
    name: "Drop Pain Chart Creator",
    image: "/img/items/7447.png",
    searchText: "drop pain chart creator",
    type: null,
    href: "/drop-pain/",
  },
  {
    name: "House of Cards",
    image: "/img/items/joker.png",
    searchText: "house of cards",
    type: null,
    href: "/cards/",
  },
]

export const createPages: GatsbyNode["createPages"] = async ({ actions, graphql }) => {
  const { data } = await graphql<Queries.GatsbyNodeCreatePagesQuery>(`
    query GatsbyNodeCreatePages {
      farmrpg {
        items {
          __typename
          id
          name
          image
        }
        locations {
          __typename
          id: gameId
          name
          image
        }
        quests(order: { id: ASC }) {
          __typename
          id
          name: title
          image: npcImg
        }
        questlines {
          __typename
          id
          name: title
          image
        }
        pets {
          __typename
          id
          name
          image
        }
        quizzes {
          __typename
          id
          name
        }
        npcs {
          __typename
          id
          name
          image
        }
      }
    }
  `)
  if (data === undefined) {
    throw `gatsby-node query failed`
  }
  const types = [
    {
      nodes: data.farmrpg.items,
      template: "item",
    },
    {
      nodes: data.farmrpg.locations,
      template: "location",
    },
    {
      nodes: data.farmrpg.pets,
      template: "pet",
    },
    {
      nodes: data.farmrpg.quests,
      template: "quest",
    },
    {
      nodes: data.farmrpg.questlines,
      template: "questline",
      searchType: "Questline",
    },
    {
      nodes: data.farmrpg.quizzes,
      template: "quiz",
      image: "/img/items/schoolhouse.png",
      searchType: "Schoolhouse Quiz",
    },
    {
      nodes: data.farmrpg.npcs,
      template: "npc",
      searchType: "Townsfolk",
    },
  ]
  for (const typeData of types) {
    for (const node of typeData.nodes) {
      actions.createPage({
        path: linkFor(node),
        component: path.resolve(`src/templates/${typeData.template}.tsx`),
        context: { id: node.id, name: node.name },
      })
    }
  }

  const searchables: Searchable[] = []
  searchables.push(...STATIC_SEARCHABLES)
  for (const typeData of types) {
    for (const node of typeData.nodes) {
      const searchName = node.name.toLowerCase()
      searchables.push({
        name: node.name,
        image: "image" in node ? node.image : typeData.image!,
        searchText: searchName,
        href: linkFor(node),
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
