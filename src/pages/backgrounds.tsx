import { graphql, useStaticQuery } from 'gatsby'
import React, { useState, useEffect } from 'react'

import Layout from '../components/layout'

interface ProfileBackground {
  id: string
  name: string
  image: string
  costGold: number | null
  costSilver: number | null
  costQuantity: number | null
  costItem: {
    name: string
    image: string
    fields: {
      path: string
    }
  } | null
}

interface ProfileBackgroundCostProps {
  text: string
  image?: string
  href?: string
}

const ProfileBackgroundCost = ({ text, image, href }: ProfileBackgroundCostProps) => {
  let elm = <>
    {text}
    {image && <img
      src={`https://farmrpg.com${image}`}
      css={{
        height: 16,
        marginLeft: 4,
        verticalAlign: "baseline",
      }}
    />}
  </>
  if (href !== undefined) {
    elm = <a href={href}
      css={{
        color: "black",
        textDecoration: "none",
        "&:hover": {
          color: "black",
          textDecoration: "underline",
        },
      }}>
      {elm}
    </a>
  }
  return elm
}

interface ProfileBackgroundProps {
  pbg: ProfileBackground
  darkMode: boolean
}

const ProfileBackground = ({ pbg, darkMode }: ProfileBackgroundProps) => {
  let costText: React.ReactNode = "Free"
  if (pbg.costSilver !== null) {
    const silverString = pbg.costSilver >= 1_000_000_000 ? `${pbg.costSilver / 1_000_000_000}B` : `${pbg.costSilver / 1_000_000}M`
    costText = <ProfileBackgroundCost text={`${silverString} Silver`} image="/img/items/silver.png" />
  } else if (pbg.costGold !== null) {
    costText = <ProfileBackgroundCost text={`${pbg.costGold} Gold`} image="/img/items/gold.png" />
  } else if (pbg.costItem !== null) {
    // Special case this for now, but I should probably work out how to do this globally or something.
    const href = `${pbg.costItem.fields.path}${document ? document.location.search : ""}`
    costText = <ProfileBackgroundCost
      text={`${pbg.costQuantity} ${pbg.costItem.name}`}
      image={pbg.costItem.image}
      href={href}
    />
  }
  return <div className="d-flex flex-column align-items-center">
    <img
      src={`https://farmrpg.com/img/pbgs/${darkMode ? 'dark' : 'light'}/${pbg.image}`}
      alt={`Profile Background - ${pbg.name}`}
      css={{
        display: "block",
        width: 400,
        maxWidth: "95%",
        aspectRatio: "1",
      }}
    />
    <div>{pbg.name}</div>
    <div>{costText}</div>
  </div>
}

interface BackgroundsQuery {
  pbgs: {
    nodes: ProfileBackground[]
  }
}

export default () => {
  const { pbgs }: BackgroundsQuery = useStaticQuery(graphql`
    query {
      pbgs: allPbgsJson(sort: {fields: order}) {
        nodes {
          id
          name
          image
          costGold
          costItem {
            name
            image
            fields {
              path
            }
          }
          costQuantity
          costSilver
        }
      }
    }
  `)
  const [darkMode, setDarkMode] = useState<boolean | null>(null)

  useEffect(() => {
    // Check this rather than the setting so that it works with the force query arg.
    if (document) {
      setDarkMode(document.documentElement.classList.contains("dark"))
    }
  }, [])

  return <Layout pageTitle="Profile Backgrounds">
    <h1 css={{ "html.iframe &": { display: "none" } }}>Profile Backgrounds</h1>
    <div className="d-flex flex-wrap gap-5 justify-content-center">
      {darkMode !== null && pbgs.nodes.map(pbg => <ProfileBackground key={pbg.id} pbg={pbg} darkMode={darkMode} />)}
    </div>
  </Layout>
}
