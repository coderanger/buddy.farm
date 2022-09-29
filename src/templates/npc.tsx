import { graphql, PageProps, Link } from "gatsby"

import Layout from "../components/layout"
import List from "../components/list"

export default ({ data: { maybeNpc } }: PageProps<Queries.NpcTemplateQuery>) => {
  const npc = maybeNpc!

  const loves = npc.items.filter((i) => i.adjective === "loves")
  const likes = npc.items.filter((i) => i.adjective === "likes")
  const hates = npc.items.filter((i) => i.adjective === "hates")

  const npcItemsToList = (items: typeof npc.items) =>
    items.map((i) => ({
      lineOne: i.item.name,
      image: i.item.image,
      href: i.item.fields.path,
    }))

  return (
    <Layout headerFrom={npc}>
      <p>
        <Link to="/townsfolk/">Back to all townsfolk</Link>
      </p>
      <List label="Loves (150 XP)" items={npcItemsToList(loves)} bigLine={true} />
      <List label="Likes (25 XP)" items={npcItemsToList(likes)} bigLine={true} />
      <List label="Hates (-50 XP)" items={npcItemsToList(hates)} bigLine={true} />
      <p className="mt-2">All other items provide 1 XP.</p>
      {npc.level_rewards.map((l) => (
        <List
          key={l.level}
          label={`Friendship Level ${l.level}`}
          items={l.items
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((i) => ({
              lineOne: i.item.name,
              image: i.item.image,
              href: i.item.fields.path,
              value: i.quantity.toLocaleString(),
            }))}
          bigLine={true}
        />
      ))}
    </Layout>
  )
}

export const pageQuery = graphql`
  query NpcTemplate($name: String!) {
    maybeNpc: npcsJson(name: { eq: $name }) {
      name
      image
      fields {
        path
      }

      items {
        adjective
        item {
          name
          image
          fields {
            path
          }
        }
      }

      level_rewards {
        level
        items {
          quantity
          order
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
  }
`
