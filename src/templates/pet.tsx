import { PageProps, graphql } from "gatsby"

import Layout from "../components/layout"
import List from "../components/list"
import linkFor from "../utils/links"

interface PetItemsListProps {
  label: string
  items: Queries.PetTemplateQuery["farmrpg"]["pets"][0]["petItems"]
}

const PetItemsList = ({ label, items }: PetItemsListProps) => {
  const listItems = items
    .slice()
    .sort((a, b) => a.item.id - b.item.id)
    .map((it) => ({
      image: it.item.image,
      lineOne: it.item.name,
      href: linkFor(it.item),
    }))
  return <List label={label} items={listItems} bigLine={true} />
}

export default ({
  data: {
    farmrpg: {
      pets: [pet],
    },
  },
}: PageProps<Queries.PetTemplateQuery>) => {
  const petData = []
  petData.push({
    key: "cost",
    image: "/img/items/silver.png",
    lineOne: "Cost",
    value: pet.cost.toLocaleString(),
  })
  if (pet.requiredFarmingLevel) {
    petData.push({
      key: "farmingLevel",
      image: "/img/items/6137.png?1",
      lineOne: "Farming Level",
      value: pet.requiredFarmingLevel.toString(),
    })
  }
  if (pet.requiredFishingLevel) {
    petData.push({
      key: "fishingLevel",
      image: "/img/items/7783.png",
      lineOne: "Fishing Level",
      value: pet.requiredFishingLevel.toString(),
    })
  }
  if (pet.requiredCraftingLevel) {
    petData.push({
      key: "craftingLevel",
      image: "/img/items/5868.png",
      lineOne: "Crafting Level",
      value: pet.requiredCraftingLevel.toString(),
    })
  }
  if (pet.requiredExploringLevel) {
    petData.push({
      key: "exploringLevel",
      image: "/img/items/6075.png",
      lineOne: "Exploring Level",
      value: pet.requiredExploringLevel.toString(),
    })
  }

  return (
    <Layout headerFrom={pet}>
      <List items={petData} bigLine={true} />
      <PetItemsList label="Level 1" items={pet.petItems.filter((pi) => pi.level === 1)} />
      <PetItemsList label="Level 3" items={pet.petItems.filter((pi) => pi.level === 3)} />
      <PetItemsList label="Level 6" items={pet.petItems.filter((pi) => pi.level === 6)} />
    </Layout>
  )
}

export const pageQuery = graphql`
  query PetTemplate($name: String!) {
    farmrpg {
      pets(filters: { name: $name }) {
        __typename
        name
        image
        cost
        requiredFarmingLevel
        requiredFishingLevel
        requiredCraftingLevel
        requiredExploringLevel
        petItems {
          level
          item {
            __typename
            id
            name
            image
          }
        }
      }
    }
  }
`
