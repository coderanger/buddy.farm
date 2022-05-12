import React from "react"
import { graphql, useStaticQuery, Link } from 'gatsby'
import Layout from '../components/layout'
import List from '../components/list'

interface TowerItem {
  level: number
  order: number
  quantity: number
  itemName: string
  item: null | {
    name: string
    image: string
    fields: {
      path: string
    }
  }
}

interface TowerQuery {
  tower: {
    nodes: TowerItem[]
  }
}

const SPECIAL_IMAGES: { [key: string]: string } = {
  Silver: "/img/items/silver.png",
  Gold: "/img/items/gold.png",
}

const towerCostString = (level: number) => {
  const cost = level * 50
  if (cost >= 1000) {
    return `${(cost / 1000).toLocaleString()}B`
  } else {
    return `${cost.toLocaleString()}M`
  }
}

export default () => {
  const { tower }: TowerQuery = useStaticQuery(graphql`
    query {
      tower: allTowerJson {
        nodes {
          level
          order
          itemName
          quantity
          item {
            name
            image
            fields {
              path
            }
          }
        }
      }
    }
  `)

  const byLevel: { [key: string]: TowerItem[] } = {}
  for (const t of tower.nodes) {
    if (byLevel[t.level.toString()] === undefined) {
      byLevel[t.level.toString()] = []
    }
    byLevel[t.level.toString()].push(t)
  }
  const content = Object.values(byLevel).sort((a, b) => a[0].level - b[0].level).map(ti => (
    <div className="mb-3" key={ti[0].level}>
      <h3 id={`level${ti[0].level}`}>Level {ti[0].level}</h3>
      <p className="mb-2">Costs {towerCostString(ti[0].level)} silver and 100 Ascension Knowledge.</p>
      <List items={ti.sort((a, b) => a.order - b.order).map(i => ({
        image: i.item?.image || SPECIAL_IMAGES[i.itemName] || "/img/items/item.png",
        lineOne: i.itemName,
        value: i.quantity.toLocaleString(),
        href: i.item?.fields.path,
      }))} bigLine={true} />
    </div>
  ))

  return <Layout pageTitle="The Tower">
    <h1>The Tower</h1>
    <p>Want to see how far you can get in the tower? Try our <Link to="/towercalc/">Tower calculator</Link>.</p>
    {content}
  </Layout>
}
