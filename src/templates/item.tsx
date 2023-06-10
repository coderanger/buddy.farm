import { graphql, PageProps } from "gatsby"
import { DateTime } from "luxon"
import React, { useContext, useEffect, useState } from "react"

import Layout from "../components/layout"
import List, { ListItem } from "../components/list"
import { QuickSettings } from "../components/quick-settings"
import { Settings } from "../hooks/settings"
import { TRADE_LAST_SEEN_THRESHOLD } from "../pages/exchange-center"
import { GlobalContext } from "../utils/context"
import { formatDropRate } from "../utils/format"
import linkFor from "../utils/links"

type Item = Queries.ItemTemplateQuery["farmrpg"]["items"][0]
type DropRates = Item["dropRatesItems"]
type Quest = Item["requiredForQuests"][0] & Item["rewardForQuests"][0]
type RecipeItem = Item["recipeItems"][0] | Item["recipeIngredientItems"][0]

interface QuestListProps {
  label: string
  quests: readonly Quest[]
  oldQuests: boolean
}

const QuestList = ({ label, quests, oldQuests }: QuestListProps) => {
  const now = DateTime.now()
  let parsedQuests = quests.map((q) => ({
    ...q,
    expired: q.quest.endDate !== null && DateTime.fromISO(q.quest.endDate) < now,
  }))
  if (!oldQuests) {
    // Filter anything we don't need.
    const filteredQuests = parsedQuests.filter((q) => !q.expired)
    if (filteredQuests.length !== 0) {
      parsedQuests = filteredQuests
    }
  }
  const listItems = parsedQuests
    .sort((a, b) => a.quest.id - b.quest.id)
    .map((q) => ({
      image: q.quest.image,
      lineOne: q.quest.name,
      href: linkFor(q.quest),
      value: q.quantity.toLocaleString(),
      alert: q.expired ? "Quest no longer available" : null,
    }))
  const itemTotal = parsedQuests.reduce((total, q) => (q.quantity || 0) + total, 0)
  return <List label={`${label} (${itemTotal} total)`} items={listItems} bigLine={true} />
}

interface WellListProps {
  label: string
  item: Item
}

const WellList = ({ label, item }: WellListProps) => {
  const listItems = item.wishingWellInputItems
    .slice()
    .sort((a, b) => a.outputItem.name.localeCompare(b.outputItem.name))
    .map((it) => ({
      image: it.outputItem.image,
      lineOne: it.outputItem.name,
      href: linkFor(it.outputItem),
      value:
        (it.chance * 100).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 1,
        }) + "%",
    }))
  return <List label={label} items={listItems} bigLine={true} />
}

const formatLocksmithQuantity = ({
  quantityMin,
  quantityMax,
}: {
  quantityMin: number | null
  quantityMax: number | null
}) => {
  if (quantityMin === null) {
    return "?"
  } else if (quantityMin === quantityMax) {
    return quantityMin.toLocaleString()
  } else {
    return `${quantityMin.toLocaleString()}-${quantityMax?.toLocaleString() || "?"}`
  }
}

interface LocksmithListProps {
  label: string
  item: Item
}

const LocksmithList = ({ label, item }: LocksmithListProps) => {
  const listItems: ListItem[] = item.locksmithItems
    .slice()
    .sort((a, b) => a.outputItem.name.localeCompare(b.outputItem.name))
    .map((it) => ({
      image: it.outputItem.image,
      lineOne: it.outputItem.name,
      href: linkFor(it.outputItem),
      value: formatLocksmithQuantity(it),
    }))
  if (item.locksmithGold) {
    listItems.unshift({
      image: "/img/items/gold.png",
      lineOne: "Gold",
      value: item.locksmithGold.toLocaleString(),
    })
  }
  return <List label={label} items={listItems} bigLine={true} />
}

interface RecipeListProps {
  label: string
  labelAnchor: string | undefined
  recipeItems: readonly RecipeItem[]
}

const RecipeList = ({ label, labelAnchor, recipeItems }: RecipeListProps) => {
  const listItems: ListItem[] = recipeItems.map((r) => ({
    image: r.item.image,
    lineOne: r.item.name,
    href: linkFor(r.item),
    value: r.quantity.toLocaleString(),
  }))
  return <List label={label} labelAnchor={labelAnchor} items={listItems} bigLine={true} />
}

interface TradeListProps {
  item: Item
}

const TradeList = ({ item }: TradeListProps) => {
  const listItems: ListItem[] = item.exchangeCenterInputs
    .filter(
      (t) =>
        DateTime.fromISO(t.lastSeen).diffNow("seconds").seconds * -1 < TRADE_LAST_SEEN_THRESHOLD &&
        !t.oneshot
    )
    .map((t) => ({
      image: t.outputItem.image,
      lineOne: `${t.outputItem.name} x${t.outputQuantity}`,
      href: linkFor(t.outputItem),
      value: t.inputQuantity.toLocaleString(),
    }))
  return <List label="Trade In At The Exchange Center" items={listItems} bigLine={true} />
}

interface NPCListProps {
  item: Item
}

const ADJECTIVE_ORDER: Record<string, number> = {
  loves: 0,
  likes: 1,
  hates: 2,
}

const ADJECTIVE_VALUE: Record<string, string> = {
  loves: "Loves (150 XP)",
  likes: "Likes (25 XP)",
  hates: "Hates (-50 XP)",
}

const NPCList = ({ item }: NPCListProps) => {
  const listItems: ListItem[] = item.npcItems
    .slice()
    .sort((a, b) =>
      a.relationship === b.relationship
        ? a.npc.name.localeCompare(b.npc.name)
        : ADJECTIVE_ORDER[a.relationship] - ADJECTIVE_ORDER[b.relationship]
    )
    .map((n) => ({
      image: n.npc.image,
      lineOne: n.npc.name,
      href: linkFor(n.npc),
      value: ADJECTIVE_VALUE[n.relationship],
    }))
  return <List label="Townsfolk" items={listItems} bigLine={true} />
}

interface CookingRecipeListProps {
  item: Item
}

const CookingRecipeList = ({ item }: CookingRecipeListProps) => {
  if (!item.canCook) {
    return <></>
  }
  let cookingTime = item.baseYieldMinutes
  let cookingTimeSuffix = "m"
  if (cookingTime >= 60) {
    cookingTime = cookingTime / 60
    cookingTimeSuffix = "h"
  }
  const listItems: ListItem[] = [
    {
      lineOne: "Cooking Level",
      image: "/img/items/2473.png",
      value: (item.cookingLevel || 1).toString(),
    },
    {
      lineOne: "Base Time",
      image: "/img/items/4887.png",
      value: `${cookingTime.toLocaleString(undefined, {
        maximumFractionDigits: 1,
      })}${cookingTimeSuffix}`,
    },
  ].concat(
    item.recipeItems
      .slice()
      .sort((a, b) =>
        a.quantity === b.quantity ? a.item.name.localeCompare(b.item.name) : b.quantity - a.quantity
      )
      .map((r) => ({
        lineOne: r.item.name,
        image: r.item.image,
        href: linkFor(r.item),
        value: r.quantity.toLocaleString(),
      }))
  )
  if (item.cookingRecipeItem !== null) {
    listItems.unshift({
      lineOne: item.cookingRecipeItem.name,
      image: item.cookingRecipeItem.image,
      href: linkFor(item.cookingRecipeItem),
      value: "Recipe",
    })
  }

  return <List label="Cooking Recipe" labelAnchor="cooking" items={listItems} bigLine={true} />
}

interface CookingReverseListProps {
  item: Item
}

const CookingReverseList = ({ item }: CookingReverseListProps) => {
  const listItems: ListItem[] = item.recipeIngredientItems
    .slice()
    .filter((i) => i.item.canCook)
    .sort((a, b) =>
      a.item.cookingLevel === b.item.cookingLevel
        ? a.item.name.localeCompare(b.item.name)
        : (a.item.cookingLevel || 0) - (b.item.cookingLevel || 0)
    )
    .map((i) => ({
      lineOne: i.item.name,
      image: i.item.image,
      href: linkFor(i.item),
      value: i.quantity.toLocaleString(),
    }))
  return <List label="Used In Cooking" items={listItems} bigLine={true} />
}

interface SeedDropsListProps {
  item: Item
  settings: Settings
}

const SeedDropsList = ({ item, settings }: SeedDropsListProps) => {
  const listItems: ListItem[] = []
  const seedDrops = item.dropRates.find((r) => r.runecube === !!settings.runecube)
  if (seedDrops !== undefined) {
    for (const rate of seedDrops.items.slice().sort((a, b) => a.rate - b.rate)) {
      const [value, lineTwo] = formatDropRate(settings, "farming", rate.rate, false, 1)
      listItems.push({
        key: `seed${rate.item.id}`,
        image: rate.item.image,
        lineOne: rate.item.name,
        lineTwo,
        value,
        href: linkFor(rate.item),
      })
    }
  }
  return <List label="Seed Drops" items={listItems} />
}

interface ItemListProps {
  item: Item
  drops: DropRates
  settings: Settings
}

const ItemList = ({ item, drops, settings }: ItemListProps) => {
  // Enable some extra sources not usually present if the drop doesn't have normal sources.
  // No location drops, no pet sources, isn't craftable.
  const unusualDropMode =
    drops.length === 0 && item.petItems.length === 0 && item.recipeItems.length === 0

  const listItems: ListItem[] = []
  for (const rate of drops.slice().sort((a, b) => a.rate - b.rate)) {
    let key: string,
      image: string,
      lineOne: string,
      href: string,
      locationType: string,
      baseDropRate: number | null
    if (rate.dropRates.location !== null) {
      // A drop from a normal location.
      key = "l" + rate.dropRates.location.name
      image = rate.dropRates.location.image
      lineOne = rate.dropRates.location.name
      locationType = rate.dropRates.location.type
      href = linkFor(rate.dropRates.location)
      baseDropRate = rate.dropRates.location.baseDropRate
    } else if (rate.dropRates.seed !== null) {
      key = "h" + rate.dropRates.seed.name
      image = rate.dropRates.seed.image
      lineOne = rate.dropRates.seed.name
      locationType = "farming"
      href = linkFor(rate.dropRates.seed)
      baseDropRate = null
    } else {
      console.error(`Unknown rate type`, rate)
      continue
    }
    const [value, lineTwo] = formatDropRate(
      settings,
      locationType,
      rate.rate,
      item.manualFishingOnly || false,
      baseDropRate
    )
    listItems.push({
      key: key,
      image,
      lineOne,
      lineTwo,
      href,
      value,
    })
  }

  // Items from pets.
  listItems.push(
    ...item.petItems
      .slice()
      .sort((a, b) =>
        a.level === b.level ? a.pet.name.localeCompare(a.pet.name) : a.level - b.level
      )
      .map((pi) => ({
        key: `p${pi.pet.name}`,
        image: pi.pet.image,
        lineOne: pi.pet.name,
        lineTwo: "Pet",
        value: `Level ${pi.level}`,
        href: linkFor(pi.pet),
      }))
  )

  // Locksmith sources.
  listItems.push(
    ...item.locksmithOutputItems.map((li) => ({
      key: `s${li.item.name}`,
      image: li.item.image,
      lineOne: li.item.name,
      lineTwo: "Locksmith",
      value: formatLocksmithQuantity(li),
      href: linkFor(li.item),
    }))
  )

  // Wishing well sources.
  listItems.push(
    ...item.wishingWellOutputItems
      .slice()
      .sort((a, b) => b.chance - a.chance)
      .map((ww) => ({
        key: `w${ww.inputItem.name}`,
        image: ww.inputItem.image,
        lineOne: ww.inputItem.name,
        lineTwo: "Wishing Well",
        value:
          (ww.chance * 100).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1,
          }) + "%",
        href: linkFor(ww.inputItem),
      }))
  )

  // Manual sources.
  listItems.push(
    ...item.manualProductions
      .slice()
      .sort((a, b) => a.sort - b.sort)
      .map((b) => ({
        key: `b${b.lineOne}`,
        image: b.image,
        lineOne: b.lineOne,
        lineTwo: b.lineTwo,
        value: b.value,
      }))
  )

  // Exchange center sources.
  listItems.push(
    ...item.exchangeCenterOutputs
      .filter(
        (t) =>
          DateTime.fromISO(t.lastSeen).diffNow("seconds").seconds * -1 <=
            TRADE_LAST_SEEN_THRESHOLD &&
          (unusualDropMode || !t.oneshot)
      )
      .map((t) => ({
        key: `ec${t.inputItem.name}`,
        image: t.inputItem.image,
        lineOne: `${t.inputItem.name} x${t.inputQuantity}`,
        lineTwo: `Exchange Center${t.oneshot ? " - One Shot" : ""}`,
        value: t.outputQuantity.toLocaleString(),
        href: linkFor(t.inputItem),
      }))
  )

  // Quiz sources.
  listItems.push(
    ...item.quizRewards.map((q) => ({
      key: `qz${q.quiz.name}`,
      image: "/img/items/schoolhouse.png",
      lineOne: `${q.quiz.name} Quiz`,
      lineTwo: `Score ${q.score}%${q.score < 100 ? " or better" : ""}`,
      value: q.quantity.toLocaleString(),
      href: linkFor(q.quiz),
    }))
  )

  // Passwords sources.
  listItems.push(
    ...item.passwordItems
      .slice()
      .sort((a, b) => a.password.id - b.password.id)
      .map((pw) => ({
        key: `p${pw.password.id}`,
        image: "/img/items/postoffice.png",
        lineOne: `Mailbox Password ${pw.password.id}`,
        lineTwo: settings.showPasswords ? `x${pw.quantity}` : "Click for password clues",
        value: settings.showPasswords ? pw.password.password : pw.quantity.toLocaleString(),
        href: `/passwords/#${pw.password.id}`,
      }))
  )

  // Tower sources.
  listItems.push(
    ...item.towerRewards
      .slice()
      .sort((a, b) => a.level - b.level)
      .map((t) => ({
        key: `t${t.level}`,
        image: "/img/items/tower.png",
        lineOne: "Tower",
        lineTwo: `x${t.itemQuantity?.toLocaleString()}`,
        value: `Level ${t.level}`,
        href: `/tower/#level${t.level}`,
      }))
  )

  if (unusualDropMode) {
    // Community center sources. Only shows if there's no drop sources and isn't craftable.
    listItems.push(
      ...item.communityCenterOutputs.map((cc) => ({
        key: `cc${cc.date}`,
        image: "/img/items/comm.png",
        lineOne: "Community Center",
        lineTwo: `${cc.inputItem.name} x${cc.inputQuantity.toLocaleString()}`,
        value: DateTime.fromFormat(cc.date, "yyyy-MM-dd").toLocaleString(DateTime.DATE_FULL),
        alert:
          cc.progress !== null && cc.progress < cc.inputQuantity ? "Mission failed" : undefined,
        alertIcon: "error",
      }))
    )

    listItems.push(
      ...item.npcRewards
        .slice()
        .sort((a, b) =>
          a.npc.name === b.npc.name ? a.level - b.level : a.npc.name.localeCompare(b.npc.name)
        )
        .map((i) => ({
          key: `npcreward${i.npc.name}-${i.level}`,
          image: i.npc.image,
          lineOne: i.npc.name,
          lineTwo: `Friendship Level ${i.level}`,
          value: i.quantity.toLocaleString(),
          href: linkFor(i.npc),
        }))
    )
  }

  // Crafting.
  if (item.recipeItems.length !== 0 && item.canCraft) {
    listItems.push({
      image: "/img/items/workshop_sm.png",
      lineOne: "Workshop",
      lineTwo: item.craftingLevel ? `Requires Crafting Level ${item.craftingLevel}` : "See below",
      href: "#recipe",
      value: "Craftable",
    })
  }

  // Cooking.
  if (item.recipeItems.length !== 0 && item.canCook) {
    listItems.push({
      image: "/img/items/2473.png",
      lineOne: "Kitchen",
      lineTwo: "See below",
      href: "#cooking",
      value: "Cookable",
    })
  }

  if (item.cookingRecipeCookable !== null) {
    listItems.push({
      image: item.cookingRecipeCookable.image,
      lineOne: item.cookingRecipeCookable.name,
      lineTwo: "Cooking Recipe",
      href: linkFor(item.cookingRecipeCookable),
      value: "Unlocks",
    })
  }

  // Trading.
  if (item.canMail) {
    listItems.push({
      key: "trading",
      image: "/img/items/2392.png",
      lineOne: "Trading",
      lineTwo: "Ask in Trade or Giveaways chat",
      value: "Mailable",
    })
  }

  // Shop sources.
  if (item.buyPrice) {
    listItems.push({
      key: "countryStore",
      image: "/img/items/store.png",
      lineOne: "Country Store",
      lineTwo: "Silver",
      value: item.buyPrice.toLocaleString(),
    })
  }
  if (item.fleaMarketPrice) {
    listItems.push({
      key: "fleaMarket",
      image: "/img/items/streetmarket.png",
      lineOne: "Flea Market",
      lineTwo: "Gold",
      value: item.fleaMarketPrice.toLocaleString(),
      alert: "Spending gold should be done carefully",
      alertIcon: "error",
    })
  }

  return <List items={listItems} />
}

export default ({
  data: {
    farmrpg: {
      items: [item],
    },
  },
}: PageProps<Queries.ItemTemplateQuery>) => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [drops, setDrops] = useState(() =>
    item.dropRatesItems.filter(
      (dr) => !(dr.dropRates.ironDepot || dr.dropRates.manualFishing || dr.dropRates.runecube)
    )
  )

  useEffect(() => {
    const drops = item.dropRatesItems.filter(
      (dr) =>
        !!dr.dropRates.runecube === !!settings.runecube &&
        (dr.dropRates.ironDepot === null || !!dr.dropRates.ironDepot === !!settings.ironDepot) &&
        (dr.dropRates.manualFishing === null ||
          !!dr.dropRates.manualFishing === (!!settings.manualFishing || item.manualFishingOnly))
    )
    setDrops(drops)
  }, [
    item.dropRatesItems,
    ctx.settings.ironDepot,
    ctx.settings.manualFishing,
    ctx.settings.runecube,
  ])

  let dropMode = undefined
  if (drops.find((dr) => dr.dropRates.location?.type === "explore")) {
    dropMode = "explores"
  } else if (drops.find((dr) => dr.dropRates.location?.type === "fishing")) {
    dropMode = "fishes"
  } else if (drops.find((dr) => dr.dropRates.seed !== undefined) || item.dropRates.length !== 0) {
    dropMode = "harvests"
  }

  return (
    <Layout
      headerFrom={item}
      headerImageCopy={item.name.endsWith(")") ? `((${item.name} ))` : `((${item.name}))`}
      headerRight={
        <QuickSettings dropMode={dropMode} manualFishingOnly={item.manualFishingOnly || false} />
      }
    >
      {item.type === "meal" && item.description.split(/<br\/?>/).map((d) => <p>{d}</p>)}
      <ItemList item={item} drops={drops} settings={settings} />
      <SeedDropsList item={item} settings={settings} />
      {item.canCraft && (
        <RecipeList label="Recipe" labelAnchor="recipe" recipeItems={item.recipeItems} />
      )}
      <RecipeList
        label="Used In"
        labelAnchor={undefined}
        recipeItems={item.recipeIngredientItems.filter((i) => i.item.canCraft)}
      />
      <CookingRecipeList item={item} />
      <CookingReverseList item={item} />
      <LocksmithList
        label={item.locksmithGrabBag ? "Open At Locksmith For (One Of)" : "Open At Locksmith For"}
        item={item}
      />
      <WellList label="Throw In The Wishing Well For" item={item} />
      <TradeList item={item} />
      <QuestList
        label="Needed For Quests"
        quests={item.requiredForQuests}
        oldQuests={!!settings.oldQuests}
      />
      <QuestList
        label="Received From Quests"
        quests={item.rewardForQuests}
        oldQuests={!!settings.oldQuests}
      />
      <NPCList item={item} />
    </Layout>
  )
}

export const pageQuery = graphql`
  fragment ItemTemplateItem on FarmRPG_Item {
    __typename
    id
    name
    image
  }

  query ItemTemplate($id: ID!) {
    farmrpg {
      items(filters: { id: $id }) {
        ...ItemTemplateItem
        type
        description
        manualFishingOnly
        canMail
        canCraft
        canCook
        craftingLevel
        cookingLevel
        buyPrice
        fleaMarketPrice
        baseYieldMinutes
        locksmithGrabBag
        locksmithGold
        requiredForQuests {
          quantity
          quest {
            __typename
            id
            name: title
            image: npcImg
            endDate
          }
        }
        rewardForQuests {
          quantity
          quest {
            __typename
            id
            name: title
            image: npcImg
            endDate
          }
        }
        petItems {
          level
          pet {
            __typename
            name
            image
          }
        }
        dropRates {
          runecube
          items {
            item {
              ...ItemTemplateItem
            }
            rate
          }
        }
        dropRatesItems {
          rate
          dropRates {
            ironDepot
            manualFishing
            runecube
            location {
              __typename
              name
              image
              type
              baseDropRate
            }
            seed {
              __typename
              name
              image
            }
          }
        }
        quizRewards {
          quantity
          score
          quiz {
            __typename
            name
          }
        }
        npcItems {
          relationship
          npc {
            __typename
            name
            image
          }
        }
        npcRewards {
          level
          quantity
          npc {
            __typename
            name
            image
          }
        }
        passwordItems {
          quantity
          password {
            id
            password
          }
        }
        wishingWellInputItems {
          chance
          outputItem {
            ...ItemTemplateItem
          }
        }
        wishingWellOutputItems {
          chance
          inputItem {
            ...ItemTemplateItem
          }
        }
        recipeItems {
          quantity
          item: ingredientItem {
            ...ItemTemplateItem
          }
        }
        recipeIngredientItems {
          quantity
          item {
            ...ItemTemplateItem
            cookingLevel
            canCraft
            canCook
          }
        }
        locksmithItems {
          quantityMax
          quantityMin
          outputItem {
            ...ItemTemplateItem
          }
        }
        locksmithOutputItems {
          quantityMax
          quantityMin
          item {
            ...ItemTemplateItem
          }
        }
        cookingRecipeItem {
          ...ItemTemplateItem
        }
        cookingRecipeCookable {
          ...ItemTemplateItem
        }
        locksmithKey {
          ...ItemTemplateItem
        }
        locksmithKeyItems {
          ...ItemTemplateItem
        }
        manualProductions {
          image
          lineOne
          lineTwo
          value
          sort
        }
        exchangeCenterInputs {
          lastSeen
          oneshot
          inputQuantity
          outputQuantity
          outputItem {
            ...ItemTemplateItem
          }
        }
        exchangeCenterOutputs {
          lastSeen
          oneshot
          inputQuantity
          outputQuantity
          inputItem {
            ...ItemTemplateItem
          }
        }
        towerRewards {
          level
          itemQuantity
        }
        skillLevelRewards {
          skill
          level
          itemQuantity
        }
        communityCenterOutputs(order: { date: DESC }, pagination: { limit: 5 }) {
          date
          inputItem {
            ...ItemTemplateItem
          }
          inputQuantity
          progress
          outputQuantity
        }
      }
    }
  }
`
