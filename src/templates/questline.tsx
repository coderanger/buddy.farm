import { graphql, PageProps } from "gatsby"
import { useState } from "react"

import { Input } from "../components/input"
import Layout from "../components/layout"
import List from "../components/list"

import { QuestItemList } from "./quest"
import linkFor from "../utils/links"

type Quest =
  Queries.QuestlineTemplateQuery["farmrpg"]["questlines"][number]["steps"][number]["quest"]

const questText = (q: Quest, showText: boolean, showLevels: boolean) => {
  if (!showText && !showLevels) {
    return undefined
  }
  const text = []
  if (showLevels) {
    const levelsText: JSX.Element[] = []
    if (q.requiredFarmingLevel) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Farming:</b>
          {q.requiredFarmingLevel}
        </span>
      )
    }
    if (q.requiredFishingLevel) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Fishing:</b>
          {q.requiredFishingLevel}
        </span>
      )
    }
    if (q.requiredCraftingLevel) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Crafting:</b>
          {q.requiredCraftingLevel}
        </span>
      )
    }
    if (q.requiredExploringLevel) {
      levelsText.push(
        <span className="me-2">
          <b className="me-1">Exploring:</b>
          {q.requiredExploringLevel}
        </span>
      )
    }
    text.push(<div>{levelsText}</div>)
  }
  if (showText && !q.isHidden) {
    text.push(<div>{q.description}</div>)
  }
  return text
}

export default ({
  data: {
    farmrpg: {
      questlines: [questline],
    },
  },
}: PageProps<Queries.QuestlineTemplateQuery>) => {
  // const ctx = useContext(GlobalContext)
  const [showText, setShowText] = useState(false)
  const [showLevels, setShowLevels] = useState(false)
  if (questline === null) {
    throw `Unable to load questline`
  }

  // Collect info on line-wide requests and rewards. Negative rolling count is a request, positive is a reward.
  const itemCounts: { [name: string]: number } = {}
  const items: { [name: string]: Queries.QuestTemplateRequiredItemFragment["item"] } = {}
  let silverCount = 0
  let goldCount = 0
  for (const step of questline.steps) {
    if (step.quest.isHidden) {
      continue
    }
    silverCount -= step.quest.requiredSilver || 0
    silverCount += step.quest.rewardSilver || 0
    goldCount += step.quest.rewardGold || 0
    for (const iq of step.quest.requiredItems) {
      items[iq.item.name] = iq.item
      itemCounts[iq.item.name] = (itemCounts[iq.item.name] || 0) - iq.quantity
    }
    for (const iq of step.quest.rewardItems) {
      items[iq.item.name] = iq.item
      itemCounts[iq.item.name] = (itemCounts[iq.item.name] || 0) + iq.quantity
    }
  }

  // Build up the lists based on the totals.
  const lineRequestItems: Queries.QuestTemplateRequiredItemFragment[] = []
  const lineRewardItems: Queries.QuestTemplateRewardItemFragment[] = []
  for (const name in itemCounts) {
    const quantity = itemCounts[name]
    if (quantity === 0) {
      continue
    }
    const itemList = quantity > 0 ? lineRewardItems : lineRequestItems
    itemList.push({
      item: items[name],
      quantity: Math.abs(quantity),
    })
  }

  // Sort the two item lists, first on rarity then quantity, then alpha.
  const sortItems = (
    a: Queries.QuestTemplateRequiredItemFragment | Queries.QuestTemplateRewardItemFragment,
    b: Queries.QuestTemplateRequiredItemFragment | Queries.QuestTemplateRewardItemFragment
  ) => {
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
        items={questline.steps
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((q) => ({
            image: q.quest.image,
            lineOne: q.quest.name,
            lineTwo: questText(q.quest, showText, showLevels),
            href: linkFor(q.quest),
          }))}
        bigLine={true}
      />
      <QuestItemList
        key="reqs"
        label="Total Request"
        silver={silverCount < 0 ? -silverCount : null}
        items={lineRequestItems}
        isHidden={false}
      />
      <QuestItemList
        key="rewards"
        label="Total Reward"
        silver={silverCount > 0 ? silverCount : null}
        gold={goldCount > 0 ? goldCount : null}
        items={lineRewardItems}
        isHidden={false}
      />
    </Layout>
  )
}

export const pageQuery = graphql`
  query QuestlineTemplate($name: String!) {
    farmrpg {
      questlines(filters: { title: $name }) {
        __typename
        name: title
        image
        steps {
          order
          quest {
            __typename
            name: title
            image: npcImg
            description
            isHidden

            requiredFarmingLevel
            requiredFishingLevel
            requiredCraftingLevel
            requiredExploringLevel
            requiredCookingLevel
            requiredTowerLevel
            requiredNpcId
            requiredNpcLevel

            requiredSilver
            requiredItems {
              ...QuestTemplateRequiredItem
            }

            rewardSilver
            rewardGold
            rewardItems {
              ...QuestTemplateRewardItem
            }
          }
        }
      }
    }
  }
`
