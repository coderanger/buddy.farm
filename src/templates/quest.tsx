import { graphql } from 'gatsby'
import { DateTime } from 'luxon'
import { useContext } from 'react'

import { CopyButton } from '../components/clipboard'
import Layout from '../components/layout'
import List from '../components/list'
import { GlobalContext } from '../utils/context'

interface ItemQuantity {
  quantity: number
  item: {
    name: string
    image: string
    fields: {
      path: string
    }
  }
}

interface QuestLink {
  name: string
  fromImage: string
  fields: {
    path: string
  }
}

interface QuestItemListProps {
  label: string
  silver: number | null
  gold?: number | null
  items: ItemQuantity[]
  copyText?: string
}

export const QuestItemList = ({ label, silver, gold, items, copyText }: QuestItemListProps) => {
  const listItems = []
  if (silver) {
    listItems.push({
      image: "/img/items/silver.png",
      lineOne: "Silver",
      value: silver.toLocaleString(),
    })
  }
  if (gold) {
    listItems.push({
      image: "/img/items/gold.png",
      lineOne: "Gold",
      value: gold.toLocaleString(),
    })
  }
  listItems.push(...items.map(it => ({
    image: it.item.image,
    lineOne: it.item.name,
    value: it.quantity.toLocaleString(),
    href: it.item.fields.path,
  })))
  return <List label={label} items={listItems} bigLine={true} copyText={copyText} />
}

const questToChatText = (name: string, silver: number | null, items: ItemQuantity[]) => {
  let chatText = name
  if (silver) {
    chatText = chatText.concat(` 🪙x${silver.toLocaleString()}`)
  }
  chatText = chatText.concat(...items.map(i =>
    ` ((${i.item.name}${i.item.name.endsWith(")") ? " " : ""}))x${i.quantity.toLocaleString()}`
  ))
  return chatText
}

interface QuestProps {
  data: {
    quest: {
      name: string
      from: string
      fromImage: string
      requiresFarming: number | null
      requiresFishing: number | null
      requiresCrafting: number | null
      requiresExploring: number | null
      silverRequest: number | null
      itemRequests: ItemQuantity[]
      silverReward: number | null
      goldReward: number | null
      itemRewards: ItemQuantity[]
      extra: {
        prev: QuestLink | null
        next: QuestLink | null
        availableFrom: number | null
        availableTo: number | null
      } | null
      fields: {
        path: string
      }
    }
  }
}

export default ({ data: { quest } }: QuestProps) => {
  const ctx = useContext(GlobalContext)
  const settings = ctx.settings
  const questData = []
  // Levels.
  if (quest.requiresFarming) {
    questData.push({
      image: "/img/items/6137.png?1",
      lineOne: "Farming Level",
      value: quest.requiresFarming.toLocaleString(),
    })
  }
  if (quest.requiresFishing) {
    questData.push({
      image: "/img/items/7783.png",
      lineOne: "Fishing Level",
      value: quest.requiresFishing.toLocaleString(),
    })
  }
  if (quest.requiresCrafting) {
    questData.push({
      image: "/img/items/5868.png",
      lineOne: "Crafting Level",
      value: quest.requiresCrafting.toLocaleString(),
    })
  }
  if (quest.requiresExploring) {
    questData.push({
      image: "/img/items/6075.png",
      lineOne: "Exploring Level",
      value: quest.requiresExploring.toLocaleString(),
    })
  }

  // Temporary quest stuff.
  if (quest.extra?.availableFrom) {
    const availableFrom = DateTime.fromMillis(quest.extra.availableFrom, { zone: "America/Chicago" })
    questData.push({
      image: "/img/items/4887.png",
      lineOne: "Available From",
      value: availableFrom.toLocaleString(DateTime.DATE_FULL),
    })
  }
  if (quest.extra?.availableTo) {
    const availableTo = DateTime.fromMillis(quest.extra.availableTo, { zone: "America/Chicago" })
    questData.push({
      image: "/img/items/4887.png",
      lineOne: "Available To",
      value: availableTo.toLocaleString(DateTime.DATE_FULL),
    })
  }

  // Prev/next.
  if (quest.extra?.prev) {
    questData.push({
      image: quest.extra.prev.fromImage,
      lineOne: "Previous",
      value: quest.extra.prev.name,
      href: quest.extra.prev.fields.path,
    })
  }
  if (quest.extra?.next) {
    questData.push({
      image: quest.extra.next.fromImage,
      lineOne: "Next",
      value: quest.extra.next.name,
      href: quest.extra.next.fields.path,
    })
  }

  return <Layout pageTitle={quest.name}>
    <h1>
      <img src={"https://farmrpg.com" + quest.fromImage} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {quest.name}
      <CopyButton path={quest.fields.path} />
    </h1>
    <List items={questData} bigLine={true} />
    <QuestItemList label="Request" silver={quest.silverRequest} items={quest.itemRequests} copyText={questToChatText(quest.name, quest.silverRequest, quest.itemRequests)} />
    <QuestItemList label="Reward" silver={quest.silverReward} gold={quest.goldReward} items={quest.itemRewards} />
  </Layout>
}

export const pageQuery = graphql`
  query($name: String!) {
    quest: questsJson(name: {eq: $name}) {
      name
      from
      fromImage
      requiresFarming
      requiresFishing
      requiresCrafting
      requiresExploring
      silverRequest
      itemRequests {
        quantity
        item {
          name
          image
          fields {
            path
          }
        }
      }
      silverReward
      goldReward
      itemRewards {
        quantity
        item {
          name
          image
          fields {
            path
          }
        }
      }
      extra {
        prev {
          name
          fromImage
          fields {
						path
          }
        }
        next {
          name
          fromImage
          fields {
						path
          }
        }
        availableFrom
        availableTo
      }
      fields {
        path
      }
    }
  }
`
