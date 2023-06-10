import { graphql, PageProps } from "gatsby"
import Layout from "../components/layout"
import List from "../components/list"
import type { ListItem } from "../components/list"
import linkFor from "../utils/links"

interface SkillLevelRewards {
  level: number
  listItems: ListItem[]
}

const SKILL_ORDER = [
  ["farming", "Farming"],
  ["fishing", "Fishing"],
  ["crafting", "Crafting"],
  ["exploring", "Exploring"],
  ["cooking", "Cooking"],
]

const LevelRewardsPage = ({
  data: {
    farmrpg: { skillLevelRewards },
  },
}: PageProps<Queries.LevelRewardsPageQuery>) => {
  const rewardsBySkill = skillLevelRewards.reduce((p, c) => {
    let listItem: ListItem
    if (c.silver !== null) {
      listItem = {
        image: "/img/items/silver.png",
        lineOne: "Silver",
        value: c.silver.toLocaleString(),
      }
    } else if (c.gold !== null) {
      listItem = {
        image: "/img/items/gold.png",
        lineOne: "Gold",
        value: c.gold.toLocaleString(),
      }
    } else if (c.ak !== null) {
      listItem = {
        image: "/img/items/tower.png",
        lineOne: "Ascension Knowledge",
        value: c.ak.toLocaleString(),
      }
    } else if (c.item !== null && c.itemQuantity !== null) {
      listItem = {
        image: c.item.image,
        lineOne: c.item.name,
        href: linkFor(c.item),
        value: c.itemQuantity.toLocaleString(),
      }
    } else {
      throw `Unknown skill reward ${c}`
    }

    if (p[c.skill] === undefined) {
      p[c.skill] = []
    }
    const pSkill = p[c.skill]
    if (pSkill.length > 0 && pSkill[pSkill.length - 1].level === c.level) {
      pSkill[pSkill.length - 1].listItems.push(listItem)
    } else {
      pSkill.push({ level: c.level, listItems: [listItem] })
    }
    return p
  }, {} as Record<string, SkillLevelRewards[]>)

  return (
    <Layout title="Level Rewards">
      {SKILL_ORDER.map(([skill, label]) => (
        <div key={skill}>
          <h2 id={skill}>{label}</h2>
          <div className="mb-5">
            {rewardsBySkill[skill].map((r) => (
              <div id={`${skill}-${r.level}`}>
                <List key={r.level} items={r.listItems} label={`Level ${r.level}`} bigLine={true} />
              </div>
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
    farmrpg {
      skillLevelRewards(order: { level: ASC, skill: ASC, order: ASC }) {
        skill
        level
        silver
        gold
        ak
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
