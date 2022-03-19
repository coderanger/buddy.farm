
import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"
import { useSettings, Settings } from '../hooks/settings'
import { useEffect, useState } from "react"
import { ListItem } from "../components/list"
import { formatDropRate } from "../utils/format"

interface DropRates {
  nodes: {
    item: {
      jsonId: string
      name: string
      image: string
      manualFishingOnly: boolean
      fields: {
        path: string
      }
    }
    rate: number
    mode: string
    drops: number
  }[]
}

interface Location {
  name: string
  jsonId: string
  image: string
  type: string
  items: string[]
  extra: {
    baseDropRate: number | null
  }
}

interface LocationListProps {
  location: Location
  drops: DropRates
  settings: Settings
}

interface SortableListItem extends ListItem {
  _sortValue: number
}

const LocationList = ({ location, drops, settings }: LocationListProps) => {
  const dropsMap = Object.fromEntries(drops.nodes.map(n => [n.item.name, n]))
  const listItems = []
  for (const item of location.items) {
    if (!dropsMap[item]) {
      continue
    }
    const [value, lineTwo] = formatDropRate(settings, location.type, dropsMap[item].rate, dropsMap[item].item.manualFishingOnly, location.extra.baseDropRate)
    const listItem: SortableListItem = {
      key: dropsMap[item].item.jsonId,
      image: dropsMap[item].item.image,
      href: dropsMap[item].item.fields.path,
      lineOne: item,
      lineTwo,
      value,
      _sortValue: dropsMap[item].rate,
    }
    if (dropsMap[item].drops < 50) {
      listItem.alert = `Low data available (${dropsMap[item].drops} drops)`
      listItem.alertIcon = dropsMap[item].drops < 10 ? "error" : "warning"
    }
    listItems.push(listItem)
  }
  listItems.sort((a, b) => a._sortValue - b._sortValue)
  return <List items={listItems} />
}

interface LocationProps {
  data: {
    location: Location
    normalDrops: DropRates
    ironDepotDrops: DropRates
    manualFishingDrops: DropRates
  }
}

export default ({ data: { location, normalDrops, ironDepotDrops, manualFishingDrops } }: LocationProps) => {
  const settings = useSettings()[0]
  const [drops, setDrops] = useState(normalDrops)

  useEffect(() => {
    if (location.type === "explore" && !!settings.ironDepot) {
      setDrops(ironDepotDrops)
    } else if (location.type === "fishing" && !!settings.manualFishing) {
      setDrops(manualFishingDrops)
    }
  }, [location.type, settings.ironDepot, settings.manualFishing])

  return <Layout pageTitle={location.name}>
    <h1>
      <img src={"https://farmrpg.com" + location.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {location.name}
    </h1>
    <LocationList location={location} drops={drops} settings={settings} />
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    location: locationsJson(name: {eq: $name}) {
      name
      jsonId
      image
      type
      items
      extra {
        baseDropRate
      }
    }
    normalDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type:{eq:"normal"}}) {
      nodes {
        item {
          jsonId
          name
          image
          manualFishingOnly
          fields {
            path
          }
        }
        rate
        mode
        drops
      }
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type:{eq:"iron_depot"}}) {
      nodes {
        item {
          jsonId
          name
          image
          manualFishingOnly
          fields {
            path
          }
        }
        rate
        mode
        drops
      }
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type:{eq:"manual_fishing"}}) {
      nodes {
        item {
          jsonId
          name
          image
          manualFishingOnly
          fields {
            path
          }
        }
        rate
        mode
        drops
      }
    }
  }
`
