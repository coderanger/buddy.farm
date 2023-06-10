import { graphql, Link, PageProps } from "gatsby"
import { useContext, useEffect, useState } from "react"

import Layout from "../components/layout"
import List, { ListItem } from "../components/list"
import { QuickSettings } from "../components/quick-settings"
import { Settings } from "../hooks/settings"
import { GlobalContext } from "../utils/context"
import { formatDropRate } from "../utils/format"
import linkFor from "../utils/links"

const LOCATION_TYPE_TO_DROP_MODE: Record<string, string> = {
  explore: "explores",
  fishing: "fishes",
}

type Location = Queries.LocationTemplateQuery["farmrpg"]["locations"][0]
type DropRates = Location["dropRates"][0]

interface LocationListProps {
  location: Location
  drops: DropRates
  settings: Settings
}

const LocationList = ({ location, drops, settings }: LocationListProps) => {
  const listItems: ListItem[] = drops.items
    .slice()
    .sort((a, b) => a.rate - b.rate)
    .map((itemRate) => {
      const [value, lineTwo] = formatDropRate(
        settings,
        location.type,
        itemRate.rate,
        itemRate.item.manualFishingOnly,
        location.baseDropRate
      )
      return {
        key: itemRate.item.id.toString(),
        image: itemRate.item.image,
        href: linkFor(itemRate.item),
        lineOne: itemRate.item.name,
        lineTwo,
        value,
      }
    })
  return <List items={listItems} />
}

export default ({
  data: {
    farmrpg: {
      locations: [location],
    },
  },
}: PageProps<Queries.LocationTemplateQuery>) => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const [drops, setDrops] = useState(
    () => location.dropRates.filter((dr) => !(dr.ironDepot || dr.manualFishing || dr.runecube))[0]
  )
  const breadcrumbLink = location.type === "explore" ? "/exploring/" : "/fishing/"

  useEffect(() => {
    let drops = location.dropRates.filter((dr) => dr.runecube === !!settings.runecube)
    switch (location.type) {
      case "explore":
        drops = drops.filter((dr) => !!dr.ironDepot === !!settings.ironDepot)
        break
      case "fishing":
        drops = drops.filter((dr) => !!dr.manualFishing === !!settings.manualFishing)
        break
    }
    if (drops.length > 0) {
      setDrops(drops[0])
    }
  }, [location.type, settings.ironDepot, settings.manualFishing, settings.runecube])

  return (
    <Layout
      headerFrom={location}
      headerRight={<QuickSettings dropMode={LOCATION_TYPE_TO_DROP_MODE[location.type]} />}
    >
      <p>
        <Link to={breadcrumbLink}>
          Back to all {location.type === "explore" ? "exploring" : "fishing"} locations
        </Link>
      </p>
      <LocationList location={location} drops={drops} settings={settings} />
    </Layout>
  )
}

export const pageQuery = graphql`
  query LocationTemplate($name: String!) {
    farmrpg {
      locations(filters: { name: $name }) {
        __typename
        name
        image
        type
        baseDropRate
        dropRates {
          ironDepot
          manualFishing
          runecube
          silverPerHit
          xpPerHit
          items {
            rate
            item {
              __typename
              id
              name
              image
              manualFishingOnly
            }
          }
        }
      }
    }
  }
`
