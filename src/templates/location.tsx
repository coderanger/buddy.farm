
import React from "react"
import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"
import { useItems } from "../hooks/items"

interface DropRates {
  nodes: {
    item: string
    rate: number
    mode: string
  }[]
}

interface LocationProps {
  data: {
    location: {
      name: string
      jsonId: string
      image: string
      type: string
      items: string[]
    }
    normalDrops: DropRates
    ironDepotDrops: DropRates
    manualFishingDrops: DropRates
  }
}

export default ({ data: { location, normalDrops, ironDepotDrops, manualFishingDrops } }: LocationProps) => {
  const items = useItems()
  const normalDropsMap = Object.fromEntries(normalDrops.nodes.map(n => [n.item, n.rate]))
  const ironDepotDropsMap = Object.fromEntries(ironDepotDrops.nodes.map(n => [n.item, n.rate]))
  const manualFishingDropsMap = Object.fromEntries(manualFishingDrops.nodes.map(n => [n.item, n.rate]))

  const listItems = location.items.map(item => ({
    image: items[item].image,
    hrefSlugify: item,
    lineOne: item,
    lineTwo: location.type === "fishing" ? "Fishes/drop" : "Explores/drop",
    value: normalDropsMap[item]?.toFixed(2) || "?",
    _sortValue: normalDropsMap[item] || 100000000
  }))
  listItems.sort((a, b) => a._sortValue - b._sortValue)

  return <Layout pageTitle={location.name}>
    <h1>
      <img src={"https://farmrpg.com" + location.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {location.name}
    </h1>
    <List items={listItems} />
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
    }
    normalDrops: allDropRatesGqlJson(filter: {location: {eq: $name}, type:{eq:"normal"}}) {
      nodes {
        item
        rate
        mode
      }
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {location: {eq: $name}, type:{eq:"iron_depot"}}) {
      nodes {
        item
        rate
        mode
      }
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {location: {eq: $name}, type:{eq:"manual_fishing"}}) {
      nodes {
        item
        rate
        mode
      }
    }
  }
`
