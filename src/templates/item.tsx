import * as React from "react"
import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"
import { ListItem } from "../components/list"
import { useItems } from "../hooks/items"
import { useLocations } from "../hooks/locations"
import { useSettings } from '../hooks/settings'
import { useEffect, useState } from "react"

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
}

interface Item {
  name: string
  jsonId: string
  image: string
  manualFishingOnly: boolean
  buyPrice: number | null
  fleaMarket: number | null
  dropMode: {
    dropMode: string
  }
}

interface ItemProps {
  data: {
    item: Item
    normalDrops: DropRates
    ironDepotDrops: DropRates
    manualFishingDrops: DropRates
    level1Pets: Pets
    level3Pets: Pets
    level6Pets: Pets
    questRequests: { nodes: Quest[] }
    questRewards: { nodes: Quest[] }
  }
}

interface ItemListProps {
  item: Item
  drops: DropRates
  level1Pets: Pets
  level3Pets: Pets
  level6Pets: Pets
}

interface SortableListItem extends ListItem {
  _sortValue: number
}

interface QuestListProps {
  label: string
  item: string
  quests: Quest[]
}

const QuestList = ({ label, item, quests }: QuestListProps) => {
  const listItems = quests.sort((a, b) => parseInt(a.jsonId, 10) - parseInt(b.jsonId, 10)).map(q => ({
    image: q.fromImage,
    lineOne: q.name,
    href: q.fields.path,
    value: q.items.find(it => it.item.name === item)?.quantity.toLocaleString(),
  }))
  return <List label={label} items={listItems} />
}

const ItemList = ({ item, drops, level1Pets, level3Pets, level6Pets }: ItemListProps) => {
  // const dropsMap = Object.fromEntries(drops.nodes.map(n => [n.location?.name || n.locationItem?.name, n]))
  const listItems = []
  for (const rate of drops.nodes) {
    let jsonId: string, image: string, lineOne: string, lineTwo: string, href: string
    if (rate.location) {
      // A drop from a normal location.
      jsonId = "l" + rate.location.jsonId
      image = rate.location.image
      lineOne = rate.location.name
      lineTwo = rate.location.type === "fishing" ? "Fishes/drop" : "Explores/drop"
      href = rate.location.fields.path
    } else if (rate.locationItem) {
      jsonId = "h" + rate.locationItem.jsonId
      image = rate.locationItem.image
      lineOne = rate.locationItem.name
      lineTwo = "Plot harvests/drop"
      href = rate.locationItem.fields.path
    } else {
      console.error(`Unknown rate type`, rate)
      continue
    }
    const listItem: SortableListItem = {
      key: jsonId,
      image,
      lineOne,
      lineTwo,
      href,
      value: rate.rate.toFixed(2),
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
    jsonId: pet.id,
    image: pet.image,
    lineOne: pet.name,
    lineTwo: "Pet",
    value: "Level 1",
    href: pet.fields.path,
  })))
  listItems.push(...level3Pets.nodes.map(pet => ({
    jsonId: pet.id,
    image: pet.image,
    lineOne: pet.name,
    lineTwo: "Pet",
    value: "Level 3",
    href: pet.fields.path,
  })))
  listItems.push(...level6Pets.nodes.map(pet => ({
    jsonId: pet.id,
    image: pet.image,
    lineOne: pet.name,
    lineTwo: "Pet",
    value: "Level 6",
    href: pet.fields.path,
  })))

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

export default ({ data: { item, normalDrops, ironDepotDrops, manualFishingDrops, level1Pets, level3Pets, level6Pets, questRequests, questRewards } }: ItemProps) => {
  const settings = useSettings()[0]
  const [drops, setDrops] = useState(normalDrops)

  useEffect(() => {
    if (item.dropMode?.dropMode === "explores" && !!settings.ironDepot) {
      setDrops(ironDepotDrops)
    } else if (item.dropMode?.dropMode === "fishes" && (!!settings.manualFishing || item.manualFishingOnly)) {
      setDrops(manualFishingDrops)
    }
  }, [item.dropMode?.dropMode, settings.ironDepot, settings.manualFishing])

  return <Layout pageTitle={item.name}>
    <h1>
      <img src={"https://farmrpg.com" + item.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {item.name}
    </h1>
    <ItemList item={item} drops={drops} level1Pets={level1Pets} level3Pets={level3Pets} level6Pets={level6Pets} />
    <QuestList label="Needed For Quests" item={item.name} quests={questRequests.nodes} />
    <QuestList label="Received From Quests" item={item.name} quests={questRewards.nodes} />
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    item: itemsJson(name: {eq: $name}) {
      name
      jsonId
      image
      manualFishingOnly
      buyPrice
      fleaMarket
      dropMode {
        dropMode
      }
    }
    normalDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type:{eq:"normal"}}) {
      nodes {
        location {
          jsonId
          name
          image
          type
          fields {
            path
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
    ironDepotDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type:{eq:"iron_depot"}}) {
      nodes {
        location {
          jsonId
          name
          image
          type
          fields {
            path
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
    manualFishingDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type:{eq:"manual_fishing"}}) {
      nodes {
        location {
          jsonId
          name
          image
          type
          fields {
            path
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
      }
    }

  }
`
