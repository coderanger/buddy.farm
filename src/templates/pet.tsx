import * as React from "react"
import { graphql } from "gatsby"
import Layout from '../components/layout'
import List from "../components/list"

interface PetItem {
  name: string
  image: string
}

interface PetItemsListProps {
  label: string
  items: PetItem[]
}

const PetItemsList = ({ label, items }: PetItemsListProps) => {
  const listItems = items.map(it => ({
    jsonId: it.name,
    image: it.image,
    lineOne: it.name,
    hrefSlugify: it.name,
  }))
  return <>
    <h3 css={{ marginTop: 20 }}>{label}</h3>
    <List items={listItems} />
  </>
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
    jsonId: "cost",
    image: "/img/items/silver.png",
    lineOne: "Cost",
    value: pet.extra.cost.toLocaleString(),
  })
  if (pet.extra.farmingLevel) {
    petData.push({
      jsonId: "farmingLevel",
      image: "/img/items/6137.png?1",
      lineOne: "Farming Level",
      value: pet.extra.farmingLevel.toString(),
    })
  }
  if (pet.extra.fishingLevel) {
    petData.push({
      jsonId: "fishingLevel",
      image: "/img/items/7783.png",
      lineOne: "Fishing Level",
      value: pet.extra.fishingLevel.toString(),
    })
  }
  if (pet.extra.craftingLevel) {
    petData.push({
      jsonId: "craftingLevel",
      image: "/img/items/5868.png",
      lineOne: "Crafting Level",
      value: pet.extra.craftingLevel.toString(),
    })
  }
  if (pet.extra.exploringLevel) {
    petData.push({
      jsonId: "exploringLevel",
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
      }
      level3Items {
        name
        image
      }
      level6Items {
        name
        image
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
