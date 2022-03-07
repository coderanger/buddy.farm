import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"
import { useItems } from "../hooks/items"
import { useLocations } from "../hooks/locations"

interface DropRates {
  nodes: {
    location: string
    rate: number
    mode: string
  }[]
}

interface ItemProps {
  data: {
    item: {
      name: string
      jsonId: string
      image: string
    }
    normalDrops: DropRates
    ironDepotDrops: DropRates
    manualFishingDrops: DropRates
  }
}

const MODES: { [key: string]: string } = {
  "harvests": "Plot harvests/drop",
  "fishes": "Fishes/drop",
}

export default ({ data: { item, normalDrops, ironDepotDrops, manualFishingDrops } }: ItemProps) => {
  const items = useItems()
  const locations = useLocations()
  const normalDropsMap = Object.fromEntries(normalDrops.nodes.map(n => [n.location, n]))
  const ironDepotDropsMap = Object.fromEntries(ironDepotDrops.nodes.map(n => [n.location, n]))
  const manualFishingDropsMap = Object.fromEntries(manualFishingDrops.nodes.map(n => [n.location, n]))

  const allLocationKeys: { [key: string]: boolean } = {}
  for (const key in normalDropsMap) {
    allLocationKeys[key] = true
  }
  for (const key in ironDepotDropsMap) {
    allLocationKeys[key] = true
  }
  for (const key in manualFishingDropsMap) {
    allLocationKeys[key] = true
  }

  const listItems = Object.keys(allLocationKeys).map(location => ({
    image: normalDropsMap[location]?.mode === "harvests" ? items[location].image : locations[location]?.image,
    hrefSlugify: normalDropsMap[location]?.mode !== "harvests" && location,
    lineOne: location,
    lineTwo: MODES[normalDropsMap[location]?.mode] || "Explores/drop",
    value: normalDropsMap[location]?.rate.toFixed(2) || "?",
  }))

  return <Layout pageTitle={item.name}>
    <h1>
      <img src={"https://farmrpg.com" + item.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {item.name}
    </h1>
    <List items={listItems} />
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    item: itemsJson(name: {eq: $name}) {
      name
      jsonId
      image
    }
    normalDrops: allDropRatesGqlJson(filter: {item: {eq: $name}, type:{eq:"normal"}}) {
      nodes {
        location
        rate
        mode
      }
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {item: {eq: $name}, type:{eq:"iron_depot"}}) {
      nodes {
        location
        rate
        mode
      }
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {item: {eq: $name}, type:{eq:"manual_fishing"}}) {
      nodes {
        location
        rate
        mode
      }
    }
  }
`
