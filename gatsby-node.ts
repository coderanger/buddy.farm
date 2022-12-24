import fs from "fs"
import path from "path"

import type { GatsbyNode } from "gatsby"
import type { Searchable } from "./src/utils/context"

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type BFFields {
      path: String!
    }

    type DropRatesGqlJson implements Node {
      rate: Float!
      mode: String!
      drops: Int!
      hits: Int!
      runecube: Boolean!
      item: ItemsJson! @link(by: "name")
      location: LocationsJson @link(by: "name")
      locationItem: ItemsJson @link(from: "location", by: "name")
    }

    type ItemsJson implements Node {
      jsonId: String!
      name: String!
      image: String!
      fields: BFFields!
      manualFishingOnly: Boolean
      dropMode: ItemDropModeJson @link(from: "jsonId", by: "jsonId")
      api: ItemApiJson! @link(from: "jsonId", by: "jsonId")
      locksmithItems: [LocksmithItemsJson!]! @link(from: "jsonId", by: "itemId")
      recipe: [ItemsJsonRecipe!]
      inputRecipes: [RecipesJson!]! @link(from: "jsonId", by: "inputId")
      outputRecipes: [RecipesJson!]! @link(from: "jsonId", by: "outputId")
      giveTrades: [TradesJson!]! @link(from: "name", by: "giveItemName")
      receiveTrades: [TradesJson!]! @link(from: "name", by: "receiveItemName")
      quizRewards: [QuizRewardsJson!]! @link(from: "name", by: "reward")
      npcs: [NpcItemsJson!]! @link(from: "name", by: "item_name")
      levelRewards: [LevelRewardItemsJson!]! @link(from: "name", by: "item_name")
      npcLevelRewards: [NpcLevelRewardItemsJson!]! @link(from: "name", by: "item_name")
      cookingRecipe: CookingRecipesJson @link(from: "name", by: "item_name")
      cookingRecipeUnlocker: CookingRecipesJson @link(from: "name", by: "recipe_item_name")
      cookingRecipeItems: [CookingRecipeItemsJson!]! @link(from: "name", by: "input_name")
      buildingProductions: [BuildingProductionJson!]! @link(from: "jsonId", by: "item")
    }

    type ItemsJsonRecipe {
      jsonId: String!
      name: String!
      quantity: Int!
    }

    type ItemDropModeJson implements Node {
      dropMode: String!
      jsonId: String!
    }

    type ItemApiJson implements Node {
      base_yield_minutes: Int!
      buy_price: Int!
      can_buy: Int!
      can_sell: Int!
      craftable: Int!
      crafting_level: Int!
      description: String!
      jsonId: String!
      img: String!
      mailable: Int!
      masterable: Int!
      min_mailable_level: Int!
      name: String!
      sell_price: Int!
      type: String!
      xp: Int!
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
      extra: QuestExtraJson! @link(from: "jsonId", by: "jsonId")
      itemRequests: [QuestReward!]!
      itemRewards: [QuestReward!]!
      preqreq: String
      prereqQuest: QuestsJson @link(by: "jsonId", from: "prereq")
      dependents: [QuestsJson!] @link(by: "prereq", from: "jsonId")
    }

    type QuestlinesJson implements Node {
      name: String!
      image: String!
      fields: BFFields!
      quests: [QuestsJson!]! @link(by: "jsonId")
    }

    type QuestExtraJson implements Node {
      id: String!
      # These are technically not floats, but Int is 32-bit only.
      availableFrom: Float
      availableTo: Float
      prev: QuestsJson @link(by: "jsonId")
      next: QuestsJson @link(by: "jsonId")
    }

    type WishingWellJson implements Node {
      chance: Float!
      input: ItemsJson! @link(by: "jsonId")
      output: ItemsJson! @link(by: "jsonId")
    }

    type LocksmithItemsJson implements Node {
      boxId: String!
      group: Int!
      itemId: String!
      quantityHigh: Int
      quantityLow: Int!
      box: LocksmithBoxesJson! @link(by: "boxId")
      boxItem: ItemsJson! @link(by: "jsonId", from: "boxId")
      item: ItemsJson! @link(by: "jsonId", from: "itemId")
    }

    type LocksmithBoxesJson implements Node {
      boxId: String!
      gold: Int
      mode: String!
      box: ItemsJson! @link(by: "jsonId", from: "boxId")
      items: [LocksmithItemsJson!]! @link(by: "boxId", from: "boxId")
    }

    type BuildingProductionJson implements Node {
      building: String!
      image: String!
      frequency: String!
      sort: Int!
      item: ItemsJson! @link(by: "jsonId")
    }

    type LocationsJson implements Node {
      jsonId: String!
      name: String!
      image: String!
      fields: BFFields!
      type: String!
      extra: LocationExtraJson! @link(from: "name", by: "name")
    }

    type TowerJson implements Node {
      itemName: String!
      level: Int!
      order: Int!
      quantity: Int!
      item: ItemsJson @link(from: "itemName", by: "name")
    }

    type CommunityCenterJson implements Node {
      date: String!
      goalQuantity: Int!
      rewardQuantity: Int!
      progress: Int
      goalItem: ItemsJson! @link(by: "name")
      rewardItem: ItemsJson! @link(by: "name")
    }

    type PbgsJson implements Node {
      costItem: ItemsJson @link(by: "name")
    }

    type PasswordsJson implements Node {
      jsonId: Int!
      group: String!
      password: String!
      clue1: String!
      clue2: String!
      clue3: String!
      silver: Int
      gold: Int
      items: [PasswordItemsJson!] @link(by: "password.jsonId", from: "jsonId")
    }

    type PasswordItemsJson implements Node {
      quantity: Int!
      password: PasswordsJson! @link(by: "jsonId")
      item: ItemsJson! @link(by: "jsonId")
    }

    type RecipesJson implements Node {
      inputId: String!
      outputId: String!
      quantity: Int!
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

    type QuizzesJson implements Node {
      jsonId: Int!
      name: String!
      fields: BFFields!
      description: String!
      rewards: [QuizRewardsJson!]! @link(by: "quiz_id" from: "jsonId")
      answers: [QuizAnswersJson!]! @link(by: "quiz_id" from: "jsonId")
    }

    type QuizRewardsJson implements Node {
      amount: Int!
      score: Int!
      reward: String!
      quiz: QuizzesJson! @link(by: "jsonId", from: "quiz_id")
      item: ItemsJson! @link(by: "name", from: "reward")
    }

    type QuizAnswersJson implements Node {
      question: String!
      display_order: Int!
      answer1: String!
      answer2: String!
      answer3: String!
      answer4: String!
      correct: Int!
      quiz: QuizzesJson! @link(by: "jsonId", from: "quiz_id")
    }

    type NpcsJson implements Node {
      name: String!
      short_name: String
      image: String!
      fields: BFFields!
      items: [NpcItemsJson!]! @link(by: "npc_name" from: "name")
      level_rewards: [NpcLevelRewardsJson!]!  @link(by: "npc_name" from: "name")
    }

    type NpcItemsJson implements Node {
      adjective: String!
      item_name: String!
      npc_name: String!
      item: ItemsJson! @link(by: "name", from: "item_name")
      npc: NpcsJson! @link(by: "name", from: "npc_name")
    }

    type LevelRewardsJson implements Node {
      id: String!
      skill: String!
      level: Int!
      silver: Int!
      ak: Int!
      items: [LevelRewardItemsJson!]! @link(by: "level_reward_id", from: "jsonId")
    }

    type LevelRewardItemsJson implements Node {
      level_reward_id: String!
      item_name: String!
      quantity: Int!
      order: Int!
      level_reward: LevelRewardsJson! @link(by: "jsonId", from: "level_reward_id")
      item: ItemsJson! @link(by: "name", from: "item_name")
    }

    type NpcLevelRewardsJson implements Node {
      id: String!
      npc_name: String!
      level: Int!
      npc: NpcsJson! @link(by: "name", from: "npc_name")
      items: [NpcLevelRewardItemsJson!]! @link(by: "npc_reward_id", from: "jsonId")
    }

    type NpcLevelRewardItemsJson implements Node {
      npc_reward_id: String!
      item_name: String!
      quantity: Int!
      order: Int!
      level_reward: NpcLevelRewardsJson! @link(by: "jsonId", from: "npc_reward_id")
      item: ItemsJson! @link(by: "name", from: "item_name")
    }

    type CookingRecipesJson implements Node {
      item_name: String!
      recipe_item_name: String
      time: Int!
      level: Int!
      item: ItemsJson! @link(by: "name", from: "item_name")
      recipe_item: ItemsJson @link(by: "name", from: "recipe_item_name")
      inputs: [CookingRecipeItemsJson!]! @link(by: "recipe_name", from: "item_name")
    }

    type CookingRecipeItemsJson implements Node {
      recipe_name: String!
      input_name: String!
      quantity: Int!
      order: Int!
      recipe: CookingRecipesJson! @link(by: "item_name", from: "recipe_name")
      input: ItemsJson! @link(by: "name", from: "input_name")
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
]

export const createPages: GatsbyNode["createPages"] = async ({ actions, graphql }) => {
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
      quizzes: allQuizzesJson {
        nodes {
          name
          fields {
            path
          }
        }
      }
      npcs: allNpcsJson {
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
    {
      nodes: data!.quizzes,
      template: "quiz",
      image: "/img/items/schoolhouse.png",
      searchType: "Schoolhouse Quiz",
    },
    {
      nodes: data!.npcs,
      template: "npc",
      searchType: "Townsfolk",
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
        image: node.image || typeData.image,
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
