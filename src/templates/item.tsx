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
    }
    locationItem: {
      jsonId: string
      name: string
      image: string
    }
    rate: number
    mode: string
    hits: number
  }[]
}

interface Item {
  name: string
  jsonId: string
  image: string
  manualFishingOnly: boolean
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
  }
}

const MODES: { [key: string]: string } = {
  "harvests": "Plot harvests/drop",
  "fishes": "Fishes/drop",
}

interface ItemListProps {
  item: Item
  drops: DropRates
}

const ItemList = ({ item, drops }: ItemListProps) => {
  // const dropsMap = Object.fromEntries(drops.nodes.map(n => [n.location?.name || n.locationItem?.name, n]))
  const listItems = []
  for (const rate of drops.nodes) {
    let jsonId: string, image: string, lineOne: string, lineTwo: string
    if (rate.location) {
      // A drop from a normal location.
      jsonId = "l" + rate.location.jsonId
      image = rate.location.image
      lineOne = rate.location.name
      lineTwo = rate.location.type === "fishing" ? "Fishes/drop" : "Explores/drop"
    } else if (rate.locationItem) {
      jsonId = "h" + rate.locationItem.jsonId
      image = rate.locationItem.image
      lineOne = rate.locationItem.name
      lineTwo = "Plot harvests/drop"
    } else {
      console.error(`Unknown rate type`, rate)
      continue
    }
    listItems.push({
      jsonId,
      image,
      lineOne,
      lineTwo,
      hrefSlugify: lineOne,
      value: rate.rate.toFixed(2),
      _sortValue: rate.rate,
    })
  }
  listItems.sort((a, b) => a._sortValue - b._sortValue)
  return <List items={listItems} />
}

export default ({ data: { item, normalDrops, ironDepotDrops, manualFishingDrops } }: ItemProps) => {
  // const items = useItems()
  // const locations = useLocations()
  // const normalDropsMap = Object.fromEntries(normalDrops.nodes.map(n => [n.location, n]))
  // const ironDepotDropsMap = Object.fromEntries(ironDepotDrops.nodes.map(n => [n.location, n]))
  // const manualFishingDropsMap = Object.fromEntries(manualFishingDrops.nodes.map(n => [n.location, n]))

  // const allLocationKeys: { [key: string]: boolean } = {}
  // for (const key in normalDropsMap) {
  //   allLocationKeys[key] = true
  // }
  // for (const key in ironDepotDropsMap) {
  //   allLocationKeys[key] = true
  // }
  // for (const key in manualFishingDropsMap) {
  //   allLocationKeys[key] = true
  // }

  // const listItems = Object.keys(allLocationKeys).map(location => ({
  //   image: normalDropsMap[location]?.mode === "harvests" ? items[location].image : locations[location]?.image,
  //   hrefSlugify: normalDropsMap[location]?.mode !== "harvests" && location,
  //   lineOne: location,
  //   lineTwo: MODES[normalDropsMap[location]?.mode] || "Explores/drop",
  //   value: normalDropsMap[location]?.rate.toFixed(2) || "?",
  //   _sortValue: normalDropsMap[location]?.rate || 100000000,
  // }))
  // listItems.sort((a, b) => a._sortValue - b._sortValue)
  const settings = useSettings()[0]
  const [drops, setDrops] = useState(normalDrops)

  useEffect(() => {
    if (item.dropMode.dropMode === "explores" && !!settings.ironDepot) {
      setDrops(ironDepotDrops)
    } else if (item.dropMode.dropMode === "fishes" && (!!settings.manualFishing || item.manualFishingOnly)) {
      setDrops(manualFishingDrops)
    }
  }, [item.dropMode.dropMode, settings.ironDepot, settings.manualFishing])

  return <Layout pageTitle={item.name}>
    <h1>
      <img src={"https://farmrpg.com" + item.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {item.name}
    </h1>
    <ItemList item={item} drops={drops} />
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    item: itemsJson(name: {eq: $name}) {
      name
      jsonId
      image
      manualFishingOnly
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
        }
        locationItem {
          jsonId
          name
          image
        }
        rate
        mode
        hits
      }
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type:{eq:"iron_depot"}}) {
      nodes {
        location {
          jsonId
          name
          image
          type
        }
        locationItem {
          jsonId
          name
          image
        }
        rate
        mode
        hits
      }
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {item: {name: {eq: $name}}, rate_type:{eq:"manual_fishing"}}) {
      nodes {
        location {
          jsonId
          name
          image
          type
        }
        locationItem {
          jsonId
          name
          image
        }
        rate
        mode
        hits
      }
    }
  }
`
