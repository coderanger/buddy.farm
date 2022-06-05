import { graphql } from 'gatsby'
import React, { useEffect, useState, useContext } from 'react'
import { DateTime } from 'luxon'

import Layout from '../components/layout'
import List, { ListItem } from '../components/list'
import { Settings } from '../hooks/settings'
import { formatDropRate } from '../utils/format'
import { CopyButton } from '../components/clipboard'
import { GlobalContext } from '../utils/context'

interface DropRates {
  nodes: {
    location: {
      jsonId: string
      name: string
      image: string
      type: string
      fields: {
        path: string
      }
      extra: {
        baseDropRate: number | null
      }
    }
    locationItem: {
      jsonId: string
      name: string
      image: string
      fields: {
        path: string
      }
    }
    rate: number
    mode: string
    drops: number
  }[]
}

interface Pets {
  nodes: {
    id: string
    name: string
    image: string
    fields: {
      path: string
    }
  }[]
}

interface Quest {
  jsonId: string
  name: string
  fromImage: string
  fields: {
    path: string
  }
  items: {
    quantity: number
    item: {
      name: string
    }
  }[]
  extra: {
    availableTo: number | null
  }
}

interface WishingWell {
  chance: number
  item: {
    jsonId: string
    name: string
    image: string
    fields: {
      path: string
    }
  }
}

interface LocksmithBox {
  gold: number | null
  mode: string
  items: {
    quantityLow: number
    quantityHigh: number | null
    item: {
      jsonId: string
      name: string
      image: string
      fields: {
        path: string
      }
    }
  }[]
}

interface LocksmithItems {
  quantityLow: number
  quantityHigh: number | null
  boxItem: {
    jsonId: string
    name: string
    image: string
    fields: {
      path: string
    }
  }
}

interface Building {
  building: string
  image: string
  frequency: string
  sort: number
}

interface Tower {
  level: number
  order: number
  quantity: number
}

interface CommunityCenter {
  date: string
  goalItem: {
    name: string
  }
  goalQuantity: number
  progress: number | null
}

interface Password {
  password: {
    jsonId: number
    password: string
  }
  quantity: number
}

interface RecipeItem {
  item: {
    jsonId: string
    name: string
    image: string
    fields: {
      path: string
    }
  }
  quantity: number
}

interface Item {
  name: string
  jsonId: string
  image: string
  manualFishingOnly: boolean
  givable: boolean
  buyPrice: number | null
  fleaMarket: number | null
  dropMode: {
    dropMode: string
  }
  fields: {
    path: string
  }
  inputRecipes: RecipeItem[]
  outputRecipes: RecipeItem[]
}

interface SortableListItem extends ListItem {
  _sortValue: number
}

interface QuestListProps {
  label: string
  item: string
  quests: Quest[]
  oldQuests: boolean
}

const QuestList = ({ label, item, quests, oldQuests }: QuestListProps) => {
  const now = Date.now()
  if (!oldQuests) {
    // Filter anything we don't need.
    const filteredQuests = quests.filter(q => !(q.extra.availableTo && q.extra.availableTo < now))
    if (filteredQuests.length !== 0) {
      quests = filteredQuests
    }
  }
  const listItems = quests.sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(q => ({
    image: q.fromImage,
    lineOne: q.name,
    href: q.fields.path,
    value: q.items.find(it => it.item.name === item)?.quantity.toLocaleString(),
    alert: (q.extra.availableTo && q.extra.availableTo < now) ? "Quest no longer available" : null,
  }))
  const itemTotal = quests.reduce((total, q) => (q.items.find(it => it.item.name === item)?.quantity || 0) + total, 0)
  return <List label={`${label} (${itemTotal} total)`} items={listItems} bigLine={true} />
}

interface WellListProps {
  label: string
  items: WishingWell[]
}

const WellList = ({ label, items }: WellListProps) => {
  const listItems = items.sort((a, b) => parseInt(a.item.jsonId, 10) - parseInt(b.item.jsonId, 10)).map(it => ({
    image: it.item.image,
    lineOne: it.item.name,
    href: it.item.fields.path,
    value: (it.chance * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + "%",
  }))
  return <List label={label} items={listItems} bigLine={true} />
}

const formatLocksmithQuantity = ({ quantityLow, quantityHigh }: { quantityLow: number, quantityHigh: number | null }) => {
  if (quantityLow === quantityHigh) {
    return quantityLow.toLocaleString()
  } else {
    return `${quantityLow.toLocaleString()}-${quantityHigh?.toLocaleString() || "?"}`
  }
}

interface LocksmithListProps {
  label: string
  box: LocksmithBox | null
}

const LocksmithList = ({ label, box }: LocksmithListProps) => {
  if (box === null) {
    return null
  }
  const listItems: ListItem[] = box.items.sort((a, b) => parseInt(a.item.jsonId, 10) - parseInt(b.item.jsonId, 10)).map(it => ({
    image: it.item.image,
    lineOne: it.item.name,
    href: it.item.fields.path,
    value: formatLocksmithQuantity(it),
  }))
  if (box.gold) {
    listItems.unshift({
      image: "/img/items/gold.png",
      lineOne: "Gold",
      value: box.gold.toLocaleString(),
    })
  }
  return <List label={label} items={listItems} bigLine={true} />
}

interface RecipeListProps {
  label: string
  labelAnchor: string | undefined
  recipeItems: RecipeItem[]
}

const RecipeList = ({ label, labelAnchor, recipeItems }: RecipeListProps) => {
  const listItems: ListItem[] = recipeItems.map(r => ({
    image: r.item.image,
    lineOne: r.item.name,
    href: r.item.fields.path,
    value: r.quantity.toLocaleString(),
  }))
  return <List label={label} labelAnchor={labelAnchor} items={listItems} bigLine={true} />
}

interface ItemListProps {
  item: Item
  drops: DropRates
  level1Pets: Pets
  level3Pets: Pets
  level6Pets: Pets
  locksmithItems: LocksmithItems[]
  wishingWell: WishingWell[]
  buildings: Building[]
  tower: Tower[]
  communityCenter: CommunityCenter[]
  passwords: Password[]
  settings: Settings
}

const ItemList = ({ item, drops, level1Pets, level3Pets, level6Pets, locksmithItems, wishingWell, buildings, tower, communityCenter, passwords, settings }: ItemListProps) => {
  // const dropsMap = Object.fromEntries(drops.nodes.map(n => [n.location?.name || n.locationItem?.name, n]))
  const listItems = []
  for (const rate of drops.nodes) {
    let key: string, image: string, lineOne: string, href: string, locationType: string, baseDropRate: number | null
    if (rate.location) {
      // A drop from a normal location.
      key = "l" + rate.location.jsonId
      image = rate.location.image
      lineOne = rate.location.name
      locationType = rate.location.type
      href = rate.location.fields.path
      baseDropRate = rate.location.extra.baseDropRate
    } else if (rate.locationItem) {
      key = "h" + rate.locationItem.jsonId
      image = rate.locationItem.image
      lineOne = rate.locationItem.name
      locationType = "farming"
      href = rate.locationItem.fields.path
      baseDropRate = null
    } else {
      console.error(`Unknown rate type`, rate)
      continue
    }
    const [value, lineTwo] = formatDropRate(settings, locationType, rate.rate, item.manualFishingOnly, baseDropRate)
    const listItem: SortableListItem = {
      key: key,
      image,
      lineOne,
      lineTwo,
      href,
      value,
      _sortValue: rate.rate,
    }
    if (rate.drops < 50) {
      listItem.alert = `Low data available (${rate.drops} drops)`
      listItem.alertIcon = rate.drops < 10 ? "error" : "warning"
    }
    listItems.push(listItem)
  }
  listItems.sort((a, b) => a._sortValue - b._sortValue)

  // Items from pets.
  listItems.push(...level1Pets.nodes.map(pet => ({
    key: "p" + pet.id,
    image: pet.image,
    lineOne: pet.name,
    lineTwo: "Pet",
    value: "Level 1",
    href: pet.fields.path,
  })))
  listItems.push(...level3Pets.nodes.map(pet => ({
    key: "p" + pet.id,
    image: pet.image,
    lineOne: pet.name,
    lineTwo: "Pet",
    value: "Level 3",
    href: pet.fields.path,
  })))
  listItems.push(...level6Pets.nodes.map(pet => ({
    key: "p" + pet.id,
    image: pet.image,
    lineOne: pet.name,
    lineTwo: "Pet",
    value: "Level 6",
    href: pet.fields.path,
  })))

  // Locksmith sources.
  listItems.push(...locksmithItems.sort((a, b) => parseInt(a.boxItem.jsonId, 10) - parseInt(b.boxItem.jsonId, 10)).map(li => ({
    key: "s" + li.boxItem.jsonId,
    image: li.boxItem.image,
    lineOne: li.boxItem.name,
    lineTwo: "Locksmith",
    value: formatLocksmithQuantity(li),
    href: li.boxItem.fields.path,
  })))

  // Wishing well sources.
  listItems.push(...wishingWell.sort((a, b) => parseInt(a.item.jsonId, 10) - parseInt(b.item.jsonId, 10)).sort((a, b) => b.chance - a.chance).map(ww => ({
    key: "w" + ww.item.jsonId,
    image: ww.item.image,
    lineOne: ww.item.name,
    lineTwo: "Wishing Well",
    value: (ww.chance * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + "%",
    href: ww.item.fields.path,
  })))

  // Building sources.
  listItems.push(...buildings.sort((a, b) => a.sort - b.sort).map(b => ({
    key: "b" + b.building,
    image: b.image,
    lineOne: b.building,
    lineTwo: "Building",
    value: b.frequency,
  })))

  // Tower sources.
  listItems.push(...tower.sort((a, b) => a.level === b.level ? a.order - b.order : a.level - b.level).map(t => ({
    key: `t${t.level}${t.order}`,
    image: "/img/items/tower.png",
    lineOne: "Tower",
    lineTwo: `x${t.quantity.toLocaleString()}`,
    value: `Level ${t.level}`,
    href: `/tower/#level${t.level}`,
  })))

  // Passwords sources.
  listItems.push(...passwords.sort((a, b) => a.password.jsonId - b.password.jsonId).map(pw => ({
    key: `p${pw.password.jsonId}`,
    image: "/img/items/postoffice.png",
    lineOne: `Mailbox Password ${pw.password.jsonId}`,
    lineTwo: settings.showPasswords ? `x${pw.quantity}` : "Click for password clues",
    value: settings.showPasswords ? pw.password.password : pw.quantity.toLocaleString(),
    href: `/passwords/#${pw.password.jsonId}`,
  })))

  // Community center sources. Only shows if there's no drop sources and isn't craftable.
  if (drops.nodes.length === 0 &&
    level1Pets.nodes.length === 0 &&
    level3Pets.nodes.length === 0 &&
    level6Pets.nodes.length === 0 &&
    item.outputRecipes.length === 0) {
    listItems.push(...communityCenter.map(cc => ({
      key: `cc${cc.date}`,
      image: "/img/items/comm.png",
      lineOne: "Community Center",
      lineTwo: `${cc.goalItem.name} x${cc.goalQuantity.toLocaleString()}`,
      value: DateTime.fromFormat(cc.date, "yyyy-MM-dd").toLocaleString(DateTime.DATE_FULL),
      alert: cc.progress !== null && cc.progress < cc.goalQuantity ? "Mission failed" : undefined,
      alertIcon: "error",
    })))
  }

  // Crafting.
  if (item.outputRecipes.length !== 0) {
    listItems.push({
      image: "/img/items/workshop_sm.png",
      lineOne: "Workshop",
      lineTwo: "See below",
      href: "#recipe",
      value: "Craftable",
    })
  }

  // Trading.
  if (item.givable) {
    listItems.push({
      jsonId: "trading",
      image: "/img/items/2392.png",
      lineOne: "Trading",
      lineTwo: "Ask in Trade or Giveaways chat",
      value: "Mailable"
    })
  }

  // Shop sources.
  if (item.buyPrice) {
    listItems.push({
      jsonId: "countryStore",
      image: "/img/items/store.png",
      lineOne: "Country Store",
      lineTwo: "Silver",
      value: item.buyPrice.toLocaleString(),
    })
  }
  if (item.fleaMarket) {
    listItems.push({
      jsonId: "fleaMarket",
      image: "/img/items/streetmarket.png",
      lineOne: "Flea Market",
      lineTwo: "Gold",
      value: item.fleaMarket.toLocaleString(),
      alert: "Probably don't use the Flea Market",
      alertIcon: "error",
    })
  }

  return <List items={listItems} />
}

interface ItemProps {
  data: {
    item: Item
    normalDrops: DropRates
    ironDepotDrops: DropRates
    manualFishingDrops: DropRates
    runecubeNormalDrops: DropRates
    runecubeIronDepotDrops: DropRates
    runecubeManualFishingDrops: DropRates
    level1Pets: Pets
    level3Pets: Pets
    level6Pets: Pets
    questRequests: { nodes: Quest[] }
    questRewards: { nodes: Quest[] }
    wellInput: { nodes: WishingWell[] }
    wellOutput: { nodes: WishingWell[] }
    locksmithBox: LocksmithBox | null
    locksmithItems: { nodes: LocksmithItems[] }
    buildings: { nodes: Building[] }
    tower: { nodes: Tower[] }
    communityCenter: { nodes: CommunityCenter[] },
    passwords: { nodes: Password[] },
  }
}

export default ({ data: { item, normalDrops, ironDepotDrops, manualFishingDrops, runecubeNormalDrops, runecubeIronDepotDrops, runecubeManualFishingDrops, level1Pets, level3Pets, level6Pets, questRequests, questRewards, wellInput, wellOutput, locksmithBox, locksmithItems, buildings, tower, communityCenter, passwords } }: ItemProps) => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [drops, setDrops] = useState(normalDrops)

  useEffect(() => {
    if (item.dropMode?.dropMode === "explores" && !!settings.ironDepot) {
      setDrops(settings.runecube ? runecubeIronDepotDrops : ironDepotDrops)
    } else if (item.dropMode?.dropMode === "fishes" && (!!settings.manualFishing || item.manualFishingOnly)) {
      setDrops(settings.runecube ? runecubeManualFishingDrops : manualFishingDrops)
    } else if (settings.runecube) {
      setDrops(runecubeNormalDrops)
    }
  }, [item.dropMode?.dropMode, settings.ironDepot, settings.manualFishing, settings.runecube])

  return <Layout pageTitle={item.name}>
    <h1>
      <img
        src={"https://farmrpg.com" + item.image}
        className="d-inline-block align-text-top clipboard"
        width="48" height="48"
        css={{ marginRight: 10, boxSizing: "border-box" }}
        data-clipboard-text={item.name.endsWith(")") ? `((${item.name} ))` : `((${item.name}))`}
      />
      {item.name}
      <CopyButton path={item.fields.path} />
    </h1>
    <ItemList item={item} drops={drops} level1Pets={level1Pets} level3Pets={level3Pets} level6Pets={level6Pets} locksmithItems={locksmithItems.nodes} wishingWell={wellOutput.nodes} buildings={buildings.nodes} tower={tower.nodes} communityCenter={communityCenter.nodes} passwords={passwords.nodes} settings={settings} />
    <RecipeList label="Recipe" labelAnchor="recipe" recipeItems={item.outputRecipes} />
    <RecipeList label="Used In" labelAnchor={undefined} recipeItems={item.inputRecipes} />
    <LocksmithList label={locksmithBox?.mode === "single" ? "Open At Locksmith For (One Of)" : "Open At Locksmith For"} box={locksmithBox} />
    <WellList label="Throw In The Wishing Well For" items={wellInput.nodes} />
    <QuestList label="Needed For Quests" item={item.name} quests={questRequests.nodes} oldQuests={!!settings.oldQuests} />
    <QuestList label="Received From Quests" item={item.name} quests={questRewards.nodes} oldQuests={!!settings.oldQuests} />
  </Layout >
}

export const pageQuery = graphql`
  fragment ItemTemplateDrops on DropRatesGqlJsonConnection {
    nodes {
      location {
        jsonId
        name
        image
        type
        fields {
          path
        }
        extra {
          baseDropRate
        }
      }
      locationItem {
        jsonId
        name
        image
        fields {
          path
        }
      }
      rate
      mode
      drops
    }
  }

  query ItemTemplate($name: String!) {
    item: itemsJson(name: {eq: $name}) {
      name
      jsonId
      image
      manualFishingOnly
      givable
      buyPrice
      fleaMarket
      dropMode {
        dropMode
      }
      fields {
        path
      }
      # This is not used right now, it's backup for future corruption debugging because I'm seeing data desync.
      # Also I should probably do more of this using this kind of query, sigh.
      locksmithItems {
        quantityLow
        quantityHigh
        boxItem {
          jsonId
          name
          image
          fields {
            path
          }
        }
      }

      inputRecipes {
        item: output {
          jsonId
          name
          image
          fields {
            path
          }
        }
        quantity
      }
      outputRecipes {
        item: input {
          jsonId
          name
          image
          fields {
            path
          }
        }
        quantity
      }
    }

    # Item drops stuff.
    normalDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type: {eq: "normal"}, runecube: {eq: false}}) {
      ...ItemTemplateDrops
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type: {eq: "iron_depot"}, runecube: {eq: false}}) {
      ...ItemTemplateDrops
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type: {eq: "manual_fishing"}, runecube: {eq: false}}) {
      ...ItemTemplateDrops
    }
    runecubeNormalDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type: {eq: "normal"}, runecube: {eq: true}}) {
      ...ItemTemplateDrops
    }
    runecubeIronDepotDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type: {eq: "iron_depot"}, runecube: {eq: true}}) {
      ...ItemTemplateDrops
    }
    runecubeManualFishingDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type: {eq: "manual_fishing"}, runecube: {eq: true}}) {
      ...ItemTemplateDrops
    }

    # Check each level of pet items, since Gatsby appears to lack an "or" query mode.
    level1Pets: allPetsJson(filter: {level1Items: {elemMatch: {name: {eq: $name}}}}) {
      nodes {
        id
        name
        image
        fields {
          path
        }
      }
    }
    level3Pets: allPetsJson(filter: {level3Items: {elemMatch: {name: {eq: $name}}}}) {
      nodes {
        id
        name
        image
        fields {
          path
        }
      }
    }
    level6Pets: allPetsJson(filter: {level6Items: {elemMatch: {name: {eq: $name}}}}) {
      nodes {
        id
        name
        image
        fields {
          path
        }
      }
    }

    # Quest requests and rewards. Separate again because no OR.
    questRequests: allQuestsJson(filter: {itemRequests: {elemMatch: {item: {name: {eq: $name}}}}}) {
      nodes {
        jsonId
        name
        fromImage
        fields {
          path
        }
        items: itemRequests {
          quantity
          item {
            name
          }
        }
        extra {
          availableTo
        }
      }
    }
    questRewards: allQuestsJson(filter: {itemRewards: {elemMatch: {item: {name: {eq: $name}}}}}) {
      nodes {
        jsonId
        name
        fromImage
        fields {
          path
        }
        items: itemRewards {
          quantity
          item {
            name
          }
        }
        extra {
          availableTo
        }
      }
    }

    # Wishing well, both sides.
    wellInput: allWishingWellJson(filter: {input: {name: {eq: $name}}}) {
      nodes {
        chance
        item: output {
          jsonId
          name
          image
          fields {
            path
          }
        }
      }
    }
    wellOutput: allWishingWellJson(filter: {output: {name: {eq: $name}}}) {
      nodes {
        chance
        item: input {
          jsonId
          name
          image
          fields {
            path
          }
        }
      }
    }

    # Locksmith, again input and output sides.
    locksmithBox: locksmithBoxesJson(box: {name: {eq: $name}}) {
      gold
      mode
      items {
        quantityLow
        quantityHigh
        item {
          jsonId
          name
          image
          fields {
            path
          }
        }
      }
    }
    locksmithItems: allLocksmithItemsJson(filter: {item: {name: {eq: $name}}}) {
      nodes {
        quantityLow
        quantityHigh
        boxItem {
          jsonId
          name
          image
          fields {
            path
          }
        }
      }
    }

    # Production from buildings.
    buildings: allBuildingProductionJson(filter: {item: {name: {eq: $name}}}) {
      nodes {
        building
        image
        frequency
        sort
      }
    }

    # The Tower.
    tower: allTowerJson(filter: {item: {name: {eq: $name}}}) {
      nodes {
        level
        order
        quantity
      }
    }

    # Community center (reward items).
    communityCenter: allCommunityCenterJson(filter: {rewardItem: {name: {eq: $name}}}) {
      nodes {
        date
        goalItem {
          name
        }
        goalQuantity
        progress
      }
    }

    # Mailbox passwords.
    passwords: allPasswordItemsJson(filter: {item: {name: {eq: $name}}}) {
      nodes {
        password {
          jsonId
          password
        }
        quantity
      }
    }
  }
`
