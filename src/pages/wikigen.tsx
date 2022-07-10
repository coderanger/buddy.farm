import { graphql, useStaticQuery } from 'gatsby'
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'

import { Input } from '../components/input'
import Layout from '../components/layout'

interface Item {
  name: string
  event: boolean
  api: {
    type: string
  }
}

interface WikiGenQuery {
  items: {
    nodes: Item[]
  }
}

const wikiLink = (item: Item) => `((${item.name}${item.name.endsWith(")") ? " " : ""}))`

const genMuseumCompletion = (items: Item[]) => {
  const itemCount = items.filter(it => !it.event).length
  const eventCount = items.filter(it => it.event).length
  const sections = [
    { type: "crop", label: "Crops" },
    { type: "fish", label: "Fish" },
    { type: "item", label: "Items" },
    { type: "seeds", label: "Seeds" },
    { type: "bait", label: "Bait" },
  ]

  let museumString = `This is the current list of museum completion items, there are currently ${itemCount} items in the game plus ${eventCount} Event items.

[center]Warning [hl=Orangered]SPOILERS AHEAD[/hl]. Just because something is listed in here doesn't mean it's been released into the game yet. Please keep all conversation about these items in Spoilers Chat, including "Where do I find..."[/center]`

  for (const section of sections) {
    const sectionItems = items.filter(it => it.api.type === section.type).sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }))
    museumString += `

[line]
[b][size=20][color=red]${section.label}[/color][/size][/b] Count = ${sectionItems.length}
`
    for (const [i, item] of sectionItems.entries()) {
      // I don't know why Jessica's script has a double space between the 2nd and 3rd item but I'll reproduce it to keep the diff smaller.
      museumString += `${i % 4 === 0 ? "\n" : i % 2 === 0 ? "  " : " "}${wikiLink(item)} ${item.name}`
    }

  }

  return museumString
}

export default () => {
  const [page, setPage] = useState("museumCompletion")
  const { items }: WikiGenQuery = useStaticQuery(graphql`
    query {
      items: allItemsJson {
        nodes {
          name
          event
          api {
            type
          }
        }
      }
    }
  `)

  let pageText = ""
  switch (page) {
    case "museumCompletion":
      pageText = genMuseumCompletion(items.nodes)
      break
  }

  return <Layout title="Wiki Generator">
    <Input.Select id="page" label="Page" defaultValue={page} onChange={setPage}>
      <option value="museumCompletion">Museum Completion</option>
    </Input.Select>
    <Button className="btn-primary clipboard mb-2" css={{ width: "100%" }} data-clipboard-target="#pageText">Copy</Button>
    <textarea id="pageText" css={{ width: '100%', height: '80vh' }}>{pageText}</textarea>
  </Layout>
}
