import { graphql, PageProps } from "gatsby"
import Layout from "../components/layout"
import List from "../components/list"
import type { ListItem } from "../components/list"

interface SkillLevelRewards {
  level: number
  listItems: ListItem[]
}

const SKILL_ORDER = ["Farming", "Fishing", "Crafting", "Exploring"]

const LevelRewardsPage = ({ data: { levelRewards } }: PageProps<Queries.LevelRewardsPageQuery>) => {
  const rewardsBySkill = levelRewards.nodes.reduce((p, c) => {
    const levelRewards: ListItem[] = c.items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((i) => ({
        image: i.item.image,
        lineOne: i.item.name,
        href: i.item.fields.path,
        value: i.quantity.toLocaleString(),
      }))
    levelRewards.push({
      image: "/img/items/silver.png",
      lineOne: "Silver",
      value: c.silver.toLocaleString(),
    })
    if (c.ak !== 0) {
      levelRewards.push({
        image: "/img/items/tower.png",
        lineOne: "Ascension Knowledge",
        value: c.ak.toLocaleString(),
      })
    }
    if (p[c.skill] === undefined) {
      p[c.skill] = []
    }
    p[c.skill].push({ level: c.level, listItems: levelRewards })
    return p
  }, {} as Record<string, SkillLevelRewards[]>)

  return (
    <Layout title="Level Rewards">
      {SKILL_ORDER.map((skill) => (
        <div key={skill}>
          <h2 id={skill.toLowerCase()}>{skill}</h2>
          <div className="mb-5">
            {rewardsBySkill[skill].map((r) => (
              <List key={r.level} items={r.listItems} label={`Level ${r.level}`} bigLine={true} />
            ))}
          </div>
        </div>
      ))}
    </Layout>
  )
}

export default LevelRewardsPage

export const query = graphql`
  query LevelRewardsPage {
    levelRewards: allLevelRewardsJson(sort: { fields: level }) {
      nodes {
        skill
        level
        silver
        ak
        items {
          item {
            name
            image
            fields {
              path
            }
          }
          quantity
          order
        }
      }
    }
  }
`
