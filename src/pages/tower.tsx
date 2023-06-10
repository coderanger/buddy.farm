import React from "react"
import { graphql, PageProps, Link } from "gatsby"

import Layout from "../components/layout"
import List, { ListItem } from "../components/list"
import linkFor from "../utils/links"

const towerCostString = (level: number) => {
  const cost = level * 50 * Math.ceil(level / 100)
  if (cost >= 1000) {
    return `${(cost / 1000).toLocaleString()}B`
  } else {
    return `${cost.toLocaleString()}M`
  }
}

const towerRewardToListItem = (
  ti: Queries.TowerPageQuery["farmrpg"]["towerRewards"][0]
): ListItem => {
  if (ti.silver) {
    return {
      image: "/img/items/silver.png",
      lineOne: "Silver",
      value: ti.silver.toLocaleString(),
    }
  }
  if (ti.gold) {
    return {
      image: "/img/items/gold.png",
      lineOne: "Gold",
      value: ti.gold.toLocaleString(),
    }
  }
  if (ti.item !== null && ti.itemQuantity) {
    return {
      image: ti.item.image,
      lineOne: ti.item.name,
      value: ti.itemQuantity.toLocaleString(),
      href: linkFor(ti.item),
    }
  }
  throw `Invalid tower item ${ti}`
}

const TowerPage = ({
  data: {
    farmrpg: { towerRewards },
  },
}: PageProps<Queries.TowerPageQuery>) => {
  const byLevel: [number, (typeof towerRewards)[0][]][] = [[1, []]]
  for (const t of towerRewards) {
    if (byLevel[byLevel.length - 1][0] !== t.level) {
      byLevel.push([t.level, []])
    }
    byLevel[byLevel.length - 1][1].push(t)
  }

  const content = byLevel.map(([level, ti]) => (
    <div className="mb-3" key={level}>
      <h3 id={`level${level}`}>Level {level}</h3>
      <p className="mb-2">Costs {towerCostString(level)} silver and 100 Ascension Knowledge.</p>
      {level > 100 && (
        <p className="mb-2">
          Requires at least {Math.ceil((level - 100) / 4)} Mega-Master
          {Math.ceil((level - 100) / 4) == 1 ? "y" : "ies"}.
        </p>
      )}
      <List items={ti.map(towerRewardToListItem)} bigLine={true} />
    </div>
  ))

  return (
    <Layout title="The Tower">
      <p>
        Want to see how far you can get in the tower? Try our{" "}
        <Link to="/towercalc/">Tower calculator</Link>.
      </p>
      {content}
    </Layout>
  )
}

export default TowerPage

export const query = graphql`
  query TowerPage {
    farmrpg {
      towerRewards(order: { level: ASC, order: ASC }) {
        level
        order
        silver
        gold
        item {
          __typename
          name
          image
        }
        itemQuantity
      }
    }
  }
`
