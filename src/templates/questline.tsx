import { graphql, PageProps } from "gatsby"
import { useContext, useState } from "react"

import { CopyButton } from "../components/clipboard"
import { Input } from "../components/input"
import Layout from "../components/layout"
import List from "../components/list"
import { GlobalContext } from "../utils/context"

import { QuestItemList } from "./quest"

type Quest = NonNullable<Queries.QuestlineTemplateQuery["questline"]>["quests"][number]

const questText = (q: Quest, showText: boolean, showLevels: boolean) => {
  if (!showText && !showLevels) {
    return undefined
  }
  const text = []
  if (showLevels) {
    const levelsText: JSX.Element[] = []
    if (q.requiresFarming) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Farming:</b>
          {q.requiresFarming}
        </span>
      )
    }
    if (q.requiresFishing) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Fishing:</b>
          {q.requiresFishing}
        </span>
      )
    }
    if (q.requiresCrafting) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Crafting:</b>
          {q.requiresCrafting}
        </span>
      )
    }
    if (q.requiresExploring) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Exploring:</b>
          {q.requiresExploring}
        </span>
      )
    }
    text.push(<div>{levelsText}</div>)
  }
  if (showText) {
    text.push(<div>{q.text}</div>)
  }
  return text
}

export default ({ data: { questline } }: PageProps<Queries.QuestlineTemplateQuery>) => {
  // const ctx = useContext(GlobalContext)
  const [showText, setShowText] = useState(false)
  const [showLevels, setShowLevels] = useState(false)
  if (questline === null) {
    throw `Unable to load questline`
  }

  // Collect info on line-wide requests and rewards. Negative rolling count is a request, positive is a reward.
  const itemCounts: { [itemId: string]: number } = {}
  const items: { [itemId: string]: Quest["itemRequests"][0]["item"] } = {}
  let silverCount = 0
  let goldCount = 0
  for (const quest of questline.quests) {
    silverCount -= quest.silverRequest || 0
    silverCount += quest.silverReward || 0
    goldCount += quest.goldReward || 0
    for (const iq of quest.itemRequests) {
      items[iq.item.jsonId] = iq.item
      itemCounts[iq.item.jsonId] = (itemCounts[iq.item.jsonId] || 0) - iq.quantity
    }
    for (const iq of quest.itemRewards) {
      items[iq.item.jsonId] = iq.item
      itemCounts[iq.item.jsonId] = (itemCounts[iq.item.jsonId] || 0) + iq.quantity
    }
  }

  // Build up the lists based on the totals.
  const lineRequestItems: Quest["itemRequests"][0][] = []
  const lineRewardItems: Quest["itemRewards"][0][] = []
  for (const itemId in itemCounts) {
    const quantity = itemCounts[itemId]
    if (quantity === 0) {
      continue
    }
    ;(quantity > 0 ? lineRewardItems : lineRequestItems).push({
      item: items[itemId],
      quantity: Math.abs(quantity),
    })
  }

  // Sort the two item lists, first on rarity then quantity, then alpha.
  const sortItems = (a: Quest["itemRequests"][0], b: Quest["itemRequests"][0]) => {
    if (a.quantity !== b.quantity) {
      return b.quantity - a.quantity
    }
    return a.item.name.localeCompare(b.item.name)
  }
  lineRequestItems.sort(sortItems)
  lineRewardItems.sort(sortItems)

  return (
    <Layout headerFrom={questline}>
      <p>
        {/* <Input.Switch
          id="showText"
          label="Show Quest Text"
          defaultChecked={showText}
          onChange={setShowText}
        />
        <Input.Switch
          id="showLevels"
          label="Show Quest Levels"
          defaultChecked={showLevels}
          onChange={setShowLevels}
        /> */}
      </p>
      <List
        key="quests"
        items={questline.quests.map((q) => ({
          image: q.fromImage,
          lineOne: q.name,
          lineTwo: questText(q, showText, showLevels),
          href: q.fields.path,
        }))}
        bigLine={true}
      />
      <QuestItemList
        key="reqs"
        label="Total Request"
        silver={silverCount < 0 ? -silverCount : null}
        items={lineRequestItems}
      />
      <QuestItemList
        key="rewards"
        label="Total Reward"
        silver={silverCount > 0 ? silverCount : null}
        gold={goldCount > 0 ? goldCount : null}
        items={lineRewardItems}
      />
    </Layout>
  )
}

export const pageQuery = graphql`
  query QuestlineTemplate($name: String!) {
    questline: questlinesJson(name: { eq: $name }) {
      name
      image
      quests {
        name
        fromImage
        requiresFarming
        requiresFishing
        requiresCrafting
        requiresExploring
        text
        fields {
          path
        }
        silverRequest
        itemRequests {
          quantity
          item {
            jsonId
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
            jsonId
            name
            image
            fields {
              path
            }
          }
        }
      }
      fields {
        path
      }
    }
  }
`
