import { graphql, PageProps, Link } from "gatsby"

import Layout from "../components/layout"
import List from "../components/list"
import linkFor from "../utils/links"

export default ({
  data: {
    farmrpg: {
      npcs: [npc],
    },
  },
}: PageProps<Queries.NpcTemplateQuery>) => {
  const loves = npc.npcItems.filter((i) => i.relationship === "loves")
  const likes = npc.npcItems.filter((i) => i.relationship === "likes")
  const hates = npc.npcItems.filter((i) => i.relationship === "hates")

  const npcItemsToList = (items: typeof npc.npcItems) =>
    items.map((i) => ({
      lineOne: i.item.name,
      image: i.item.image,
      href: linkFor(i.item),
    }))

  const npcRewards = npc.npcRewards
    .slice()
    .sort((a, b) => (a.level === b.level ? a.order - b.order : a.level - b.level))
  const rewardsByLevel: { level: number; rewards: (typeof npc.npcRewards)[0][] }[] = [
    { level: npcRewards[0]?.level, rewards: [] },
  ]
  for (const reward of npcRewards) {
    if (rewardsByLevel[rewardsByLevel.length - 1].level === reward.level) {
      rewardsByLevel[rewardsByLevel.length - 1].rewards.push(reward)
    } else {
      rewardsByLevel.push({ level: reward.level, rewards: [reward] })
    }
  }
  return (
    <Layout headerFrom={npc}>
      <p>
        <Link to="/townsfolk/">Back to all townsfolk</Link>
      </p>
      <List label="Loves (150 XP)" items={npcItemsToList(loves)} bigLine={true} />
      <List label="Likes (25 XP)" items={npcItemsToList(likes)} bigLine={true} />
      <List label="Hates (-50 XP)" items={npcItemsToList(hates)} bigLine={true} />
      <p className="mt-2">
        <Link to="/i/heart-container/">Heart Containers</Link> provide {(10_000_000).toLocaleString()}{" "}
        XP, all other items provide 1 XP.
      </p>
      {rewardsByLevel.map((l) => (
        <List
          key={l.level}
          label={`Friendship Level ${l.level}`}
          items={l.rewards.map((i) => ({
            lineOne: i.item.name,
            image: i.item.image,
            href: linkFor(i.item),
            value: i.quantity.toLocaleString(),
          }))}
          bigLine={true}
        />
      ))}
      <List
        label="Friendship Level Quests"
        items={npc.quests.map((q) => ({
          lineOne: q.name,
          image: q.image,
          href: linkFor(q),
          value: q.requiredNpcLevel.toLocaleString(),
        }))}
        bigLine={true}
      />
    </Layout>
  )
}

export const pageQuery = graphql`
  query NpcTemplate($id: ID!) {
    farmrpg {
      npcs(filters: { id: $id }) {
        __typename
        name
        image
        npcItems(filters: { item: { canMail: true } }) {
          relationship
          item {
            __typename
            name
            image
          }
        }
        npcRewards {
          level
          order
          quantity
          item {
            __typename
            name
            image
          }
        }
        quests(order: { id: ASC }) {
          __typename
          name: title
          image: npcImg
          requiredNpcLevel
        }
      }
    }
  }
`
