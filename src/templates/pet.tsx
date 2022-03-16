import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"

interface PetItem {
  name: string
  image: string
  fields: {
    path: string
  }
}

interface PetItemsListProps {
  label: string
  items: PetItem[]
}

const PetItemsList = ({ label, items }: PetItemsListProps) => {
  const listItems = items.map(it => ({
    image: it.image,
    lineOne: it.name,
    href: it.fields.path,
  }))
  return <List label={label} items={listItems} bigLine={true} />
}

interface PetProps {
  data: {
    pet: {
      image: string
      name: string
      level1Items: PetItem[]
      level3Items: PetItem[]
      level6Items: PetItem[]
      extra: {
        cost: number,
        exploringLevel: number | null,
        farmingLevel: number | null,
        fishingLevel: number | null,
        craftingLevel: number | null,
      }
    }
  }
}

export default ({ data: { pet } }: PetProps) => {
  const petData = []
  petData.push({
    key: "cost",
    image: "/img/items/silver.png",
    lineOne: "Cost",
    value: pet.extra.cost.toLocaleString(),
  })
  if (pet.extra.farmingLevel) {
    petData.push({
      key: "farmingLevel",
      image: "/img/items/6137.png?1",
      lineOne: "Farming Level",
      value: pet.extra.farmingLevel.toString(),
    })
  }
  if (pet.extra.fishingLevel) {
    petData.push({
      key: "fishingLevel",
      image: "/img/items/7783.png",
      lineOne: "Fishing Level",
      value: pet.extra.fishingLevel.toString(),
    })
  }
  if (pet.extra.craftingLevel) {
    petData.push({
      key: "craftingLevel",
      image: "/img/items/5868.png",
      lineOne: "Crafting Level",
      value: pet.extra.craftingLevel.toString(),
    })
  }
  if (pet.extra.exploringLevel) {
    petData.push({
      key: "exploringLevel",
      image: "/img/items/6075.png",
      lineOne: "Exploring Level",
      value: pet.extra.exploringLevel.toString(),
    })
  }

  return < Layout pageTitle={pet.name} >
    <h1>
      <img src={"https://farmrpg.com" + pet.image} className="d-inline-block align-text-top" width="48" height="48" css={{ marginRight: 10, boxSizing: "border-box" }} />
      {pet.name}
    </h1>
    <List items={petData} />
    <PetItemsList label="Level 1" items={pet.level1Items} />
    <PetItemsList label="Level 3" items={pet.level3Items} />
    <PetItemsList label="Level 6" items={pet.level6Items} />
  </Layout >
}

export const pageQuery = graphql`
  query($name: String!) {
    pet: petsJson(name: {eq: $name}) {
      image
      name
      level1Items {
        name
        image
        fields {
          path
        }
      }
      level3Items {
        name
        image
        fields {
          path
        }
      }
      level6Items {
        name
        image
        fields {
          path
        }
      }
      extra {
        cost
        exploringLevel
        farmingLevel
        fishingLevel
        craftingLevel
      }
    }
  }
`
