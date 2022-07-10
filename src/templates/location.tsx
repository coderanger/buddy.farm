
import { graphql } from 'gatsby'
import { useContext, useEffect, useState } from 'react'

import { CopyButton } from '../components/clipboard'
import Layout from '../components/layout'
import List, { ListItem } from '../components/list'
import { Settings } from '../hooks/settings'
import { GlobalContext } from '../utils/context'
import { formatDropRate } from '../utils/format'

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
  fields: {
    path: string
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
    runecubeNormalDrops: DropRates
    runecubeIronDepotDrops: DropRates
    runecubeManualFishingDrops: DropRates
  }
}

export default ({ data: { location, normalDrops, ironDepotDrops, manualFishingDrops, runecubeNormalDrops, runecubeIronDepotDrops, runecubeManualFishingDrops } }: LocationProps) => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [drops, setDrops] = useState(normalDrops)

  useEffect(() => {
    if (location.type === "explore" && !!settings.ironDepot) {
      setDrops(settings.runecube ? runecubeIronDepotDrops : ironDepotDrops)
    } else if (location.type === "fishing" && !!settings.manualFishing) {
      setDrops(settings.runecube ? runecubeManualFishingDrops : manualFishingDrops)
    } else if (settings.runecube) {
      setDrops(runecubeNormalDrops)
    }
  }, [location.type, settings.ironDepot, settings.manualFishing, settings.runecube])

  return <Layout headerFrom={location}>
    <LocationList location={location} drops={drops} settings={settings} />
  </Layout>
}

export const pageQuery = graphql`
  fragment LocationTemplateDrops on DropRatesGqlJsonConnection {
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

  query LocationTemplate($name: String!) {
    location: locationsJson(name: {eq: $name}) {
      name
      jsonId
      image
      type
      items
      extra {
        baseDropRate
      }
      fields {
        path
      }
    }

    normalDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type: {eq: "normal"}, runecube: {eq: false}}) {
      ...LocationTemplateDrops
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type: {eq: "iron_depot"}, runecube: {eq: false}}) {
      ...LocationTemplateDrops
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type: {eq: "manual_fishing"}, runecube: {eq: false}}) {
      ...LocationTemplateDrops
    }
    runecubeNormalDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type: {eq: "normal"}, runecube: {eq: true}}) {
      ...LocationTemplateDrops
    }
    runecubeIronDepotDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type: {eq: "iron_depot"}, runecube: {eq: true}}) {
      ...LocationTemplateDrops
    }
    runecubeManualFishingDrops: allDropRatesGqlJson(filter: {location: {name: {eq: $name}}, rate_type: {eq: "manual_fishing"}, runecube: {eq: true}}) {
      ...LocationTemplateDrops
    }
  }
`
