
import React from "react"
import { Link, graphql } from "gatsby"
import Layout from '../components/layout'

interface DropRates {
  nodes: {
    item: string
    rate: number
  }[]
}

interface LocationProps {
  data: {
    locationsJson: {
      name: string
      jsonId: string
      items: string[]
    }
    normalDrops: DropRates
    ironDepotDrops: DropRates
    manualFishingDrops: DropRates
  }
}

export default ({ data: { locationsJson, normalDrops, ironDepotDrops, manualFishingDrops } }: LocationProps) => {
  const normalDropsMap = Object.fromEntries(normalDrops.nodes.map(n => [n.item, n.rate]))
  const ironDepotDropsMap = Object.fromEntries(ironDepotDrops.nodes.map(n => [n.item, n.rate]))
  const manualFishingDropsMap = Object.fromEntries(manualFishingDrops.nodes.map(n => [n.item, n.rate]))

  return <Layout pageTitle={locationsJson.name}>
    <ul>
      {locationsJson.items.map(item => (
        <li key={item}>
          {item} {normalDropsMap[item]} {ironDepotDropsMap[item]} {manualFishingDropsMap[item]}
        </li>
      ))}
    </ul>
    <Link to="/">Back to Index</Link>
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    locationsJson(name: {eq: $name}) {
      name
      items
      jsonId
    }
    normalDrops: allDropRatesGqlJson(filter: {location: {eq: $name}, type:{eq:"normal"}}) {
      nodes {
        item
        rate
      }
    }
    ironDepotDrops: allDropRatesGqlJson(filter: {location: {eq: $name}, type:{eq:"iron_depot"}}) {
      nodes {
        item
        rate
      }
    }
    manualFishingDrops: allDropRatesGqlJson(filter: {location: {eq: $name}, type:{eq:"manual_fishing"}}) {
      nodes {
        item
        rate
      }
    }
  }
`
