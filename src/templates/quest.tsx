import { graphql, PageProps } from "gatsby"
import { DateTime } from "luxon"

import Layout from "../components/layout"
import List, { ListItem } from "../components/list"
import linkFor from "../utils/links"

const SECRET_TEXT = "??????"

type ItemQuantity =
  | Queries.QuestTemplateRequiredItemFragment
  | Queries.QuestTemplateRewardItemFragment

interface QuestItemListProps {
  label: string
  silver: number | null
  gold?: number | null
  items: readonly ItemQuantity[]
  copyText?: string
  isHidden: boolean
}

export const QuestItemList = ({
  label,
  silver,
  gold,
  items,
  copyText,
  isHidden,
}: QuestItemListProps) => {
  const listItems: ListItem[] = []
  if (isHidden) {
    listItems.push({
      image: "/img/items/item.png",
      lineOne: SECRET_TEXT,
      value: "?",
    })
  } else {
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
    listItems.push(
      ...items.map((it) => ({
        image: it.item.image,
        lineOne: it.item.name,
        value: it.quantity.toLocaleString(),
        href: linkFor(it.item),
      }))
    )
  }
  return (
    <List
      label={label}
      items={listItems}
      bigLine={true}
      copyText={isHidden ? undefined : copyText}
    />
  )
}

const questToChatText = (name: string, silver: number | null, items: readonly ItemQuantity[]) => {
  let chatText = name
  if (silver) {
    chatText = chatText.concat(` 🪙x${silver.toLocaleString()}`)
  }
  chatText = chatText.concat(
    ...items.map(
      (i) =>
        ` ((${i.item.name}${i.item.name.endsWith(")") ? " " : ""}))x${i.quantity.toLocaleString()}`
    )
  )
  return chatText
}

export default ({
  data: {
    farmrpg: {
      quests: [quest],
    },
  },
}: PageProps<Queries.QuestTemplateQuery>) => {
  const questData: ListItem[] = []
  // Levels.
  if (quest.requiredFarmingLevel) {
    questData.push({
      image: "/img/items/6137.png?1",
      lineOne: "Farming Level",
      value: quest.requiredFarmingLevel.toLocaleString(),
    })
  }
  if (quest.requiredFishingLevel && quest.requiredFishingLevel !== 1) {
    questData.push({
      image: "/img/items/7783.png",
      lineOne: "Fishing Level",
      value: quest.requiredFishingLevel.toLocaleString(),
    })
  }
  if (quest.requiredCraftingLevel && quest.requiredCraftingLevel !== 1) {
    questData.push({
      image: "/img/items/5868.png",
      lineOne: "Crafting Level",
      value: quest.requiredCraftingLevel.toLocaleString(),
    })
  }
  if (quest.requiredExploringLevel && quest.requiredExploringLevel !== 1) {
    questData.push({
      image: "/img/items/6075.PNG",
      lineOne: "Exploring Level",
      value: quest.requiredExploringLevel.toLocaleString(),
    })
  }
  if (quest.requiredCookingLevel && quest.requiredCookingLevel !== 1) {
    questData.push({
      image: "/img/items/2473.png",
      lineOne: "Cooking Level",
      value: quest.requiredCookingLevel.toLocaleString(),
    })
  }
  if (quest.requiredTowerLevel) {
    questData.push({
      image: "/img/items/tower.png",
      lineOne: "Tower Level",
      value: quest.requiredTowerLevel.toLocaleString(),
    })
  }
  if (quest.requiredNpc) {
    questData.push({
      image: quest.requiredNpc.image,
      lineOne: `${quest.requiredNpc.name} Friendship`,
      value: quest.requiredNpcLevel.toLocaleString(),
      href: linkFor(quest.requiredNpc),
    })
  }

  // Temporary quest stuff.
  if (quest.startDate) {
    const availableFrom = DateTime.fromISO(quest.startDate, {
      zone: "America/Chicago",
    })
    questData.push({
      image: "/img/items/4887.png",
      lineOne: "Available From",
      value: availableFrom.toLocaleString(DateTime.DATE_FULL),
    })
  }
  if (quest.endDate) {
    const availableTo = DateTime.fromISO(quest.endDate, { zone: "America/Chicago" })
    questData.push({
      image: "/img/items/4887.png",
      lineOne: "Available To",
      value: availableTo.toLocaleString(DateTime.DATE_FULL),
    })
  }

  // Prev/next.
  const now = DateTime.now()
  if (quest.pred) {
    questData.push({
      image: quest.pred.npcImg,
      lineOne: "Previous",
      value: quest.pred.name,
      href: linkFor(quest.pred),
      alert:
        quest.pred.endDate && DateTime.fromISO(quest.pred.endDate) < now
          ? "Quest no longer available"
          : null,
    })
  }
  if (quest.dependentQuests && quest.dependentQuests.length > 0) {
    questData.push(
      ...quest.dependentQuests
        .slice()
        .sort((a, b) => a.id - b.id)
        .map((d) => ({
          image: d.npcImg,
          lineOne: "Next",
          value: d.name,
          href: linkFor(d),
          alert:
            d.endDate && DateTime.fromISO(d.endDate) < now ? "Quest no longer available" : null,
        }))
    )
  }

  let { cleanDescription } = quest
  if (quest.isHidden) {
    cleanDescription = cleanDescription.replace(/\S/g, "?")
  }

  return (
    <Layout headerFrom={quest}>
      <div className="mb-3" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
      <List items={questData} bigLine={true} />
      <QuestItemList
        label="Request"
        silver={quest.requiredSilver}
        items={quest.requiredItems}
        copyText={questToChatText(quest.name, quest.requiredSilver, quest.requiredItems)}
        isHidden={quest.isHidden}
      />
      <QuestItemList
        label="Reward"
        silver={quest.rewardSilver}
        gold={quest.rewardGold}
        items={quest.rewardItems}
        isHidden={quest.isHidden}
      />
    </Layout>
  )
}

export const pageQuery = graphql`
  fragment QuestTemplateLinkedQuest on FarmRPG_Quest {
    __typename
    id
    name: cleanTitle
    npcImg
    endDate
  }

  # These can't be combined even though they are identical because they are different underlying types.
  fragment QuestTemplateRequiredItem on FarmRPG_QuestItemRequired {
    item {
      __typename
      name
      image
    }
    quantity
  }

  fragment QuestTemplateRewardItem on FarmRPG_QuestItemReward {
    item {
      __typename
      name
      image
    }
    quantity
  }

  query QuestTemplate($id: ID) {
    farmrpg {
      quests(filters: { id: $id }) {
        __typename
        name: cleanTitle
        image: npcImg
        npc
        author
        cleanDescription
        completedCount
        isHidden
        startDate
        endDate

        pred {
          ...QuestTemplateLinkedQuest
        }
        dependentQuests {
          ...QuestTemplateLinkedQuest
        }

        requiredFarmingLevel
        requiredFishingLevel
        requiredCraftingLevel
        requiredExploringLevel
        requiredCookingLevel
        requiredTowerLevel
        requiredNpc {
          __typename
          name
          image
        }
        requiredNpcLevel

        requiredSilver
        requiredItems(order: { order: ASC }) {
          ...QuestTemplateRequiredItem
        }

        rewardSilver
        rewardGold
        rewardItems(order: { order: ASC }) {
          ...QuestTemplateRewardItem
        }
      }
    }
  }
`
